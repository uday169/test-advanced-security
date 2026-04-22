const crypto = require('crypto');

function matchSAST(snykFindings, codeqlFindings) {
  const groups = [];
  const usedCodeQL = new Set();

  for (const sf of snykFindings.filter((f) => f.type === 'sast')) {
    let matched = null;

    matched = codeqlFindings.find((cf) =>
      !usedCodeQL.has(cf.id) &&
      sf.cwe &&
      cf.cwe &&
      sf.cwe === cf.cwe &&
      normaliseFilePath(sf.filePath) === normaliseFilePath(cf.filePath)
    );

    if (!matched) {
      matched = codeqlFindings.find((cf) =>
        !usedCodeQL.has(cf.id) &&
        sf.cwe &&
        cf.cwe &&
        sf.cwe === cf.cwe &&
        pathTail(sf.filePath, 2) === pathTail(cf.filePath, 2)
      );
    }

    if (!matched) {
      matched = codeqlFindings.find((cf) =>
        !usedCodeQL.has(cf.id) &&
        titleSimilarity(sf.title, cf.title) > 0.6
      );
    }

    if (matched) {
      usedCodeQL.add(matched.id);
      groups.push(buildGroup('sast', sf, matched, 'snyk', 'codeql'));
    } else {
      groups.push(buildUnmatched('sast', sf, 'snyk'));
    }
  }

  for (const cf of codeqlFindings.filter((f) => !usedCodeQL.has(f.id))) {
    groups.push(buildUnmatched('sast', cf, 'codeql'));
  }

  return groups;
}

function matchSCA(snykFindings, dependabotFindings) {
  const groups = [];
  const usedDep = new Set();

  for (const sf of snykFindings.filter((f) => f.type === 'sca')) {
    let matched = null;

    if (sf.cve) {
      matched = dependabotFindings.find((df) => !usedDep.has(df.id) && df.cve === sf.cve);
    }

    if (!matched && sf.packageName && sf.cwe) {
      matched = dependabotFindings.find(
        (df) =>
          !usedDep.has(df.id) &&
          normalisePackageName(df.packageName) === normalisePackageName(sf.packageName) &&
          df.cwe.includes(sf.cwe)
      );
    }

    if (!matched && sf.packageName) {
      matched = dependabotFindings.find(
        (df) =>
          !usedDep.has(df.id) &&
          normalisePackageName(df.packageName) === normalisePackageName(sf.packageName)
      );
    }

    if (matched) {
      usedDep.add(matched.id);
      groups.push(buildGroup('sca', sf, matched, 'snyk', 'dependabot'));
    } else {
      groups.push(buildUnmatched('sca', sf, 'snyk'));
    }
  }

  for (const df of dependabotFindings.filter((f) => !usedDep.has(f.id))) {
    groups.push(buildUnmatched('sca', df, 'dependabot'));
  }

  return groups;
}

function buildGroup(type, findingA, findingB, toolA, toolB) {
  const key = `${type}:${findingA.cwe || findingA.packageName}:${findingA.ruleId}`;
  return {
    matchId: hash(key),
    matchType: type,
    canonicalKey: key,
    tools: [toolA, toolB],
    findings: { [toolA]: findingA, [toolB]: findingB },
    overlapType: `${toolA}_${toolB}`,
  };
}

function buildUnmatched(type, finding, tool) {
  const key = `${type}:${finding.id}`;
  return {
    matchId: hash(key),
    matchType: type,
    canonicalKey: key,
    tools: [tool],
    findings: { [tool]: finding },
    overlapType: `${tool}_only`,
  };
}

function normaliseFilePath(p) {
  return String(p || '')
    .replace(/\\/g, '/')
    .toLowerCase()
    .trim();
}

function pathTail(p, n) {
  const parts = normaliseFilePath(p).split('/').filter(Boolean);
  return parts.slice(-n).join('/');
}

function normalisePackageName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[@/]/g, '')
    .trim();
}

function titleSimilarity(a, b) {
  const na = String(a || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .trim();
  const nb = String(b || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .trim();

  const wordsA = new Set(na.split(/\s+/).filter(Boolean));
  const wordsB = new Set(nb.split(/\s+/).filter(Boolean));
  if (!wordsA.size || !wordsB.size) return 0;

  const intersection = [...wordsA].filter((w) => wordsB.has(w) && w.length > 3);
  return intersection.length / Math.max(wordsA.size, wordsB.size);
}

function hash(str) {
  return crypto.createHash('md5').update(str).digest('hex').substring(0, 8);
}

module.exports = { matchSAST, matchSCA };
