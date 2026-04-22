function score(sastGroups, scaGroups) {
  const sast = {
    snyk: scoreCategory(sastGroups, 'snyk'),
    codeql: scoreCategory(sastGroups, 'codeql'),
  };

  const sca = {
    snyk: scoreCategory(scaGroups, 'snyk'),
    dependabot: scoreCategory(scaGroups, 'dependabot'),
  };

  const allGroups = [...sastGroups, ...scaGroups];
  const overall = {
    snyk: scoreCategory(allGroups, 'snyk'),
    ghas: scoreCombined(allGroups, ['codeql', 'dependabot']),
  };

  return { sast, sca, overall };
}

function scoreCategory(groups, tool) {
  const total = groups.length;
  const detected = groups.filter((g) => g.findings[tool]).length;
  const findings = groups.map((g) => g.findings[tool]).filter(Boolean);

  const severityScore = findings.reduce((acc, f) => {
    const weights = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
    return acc + (weights[f.severity] || 0);
  }, 0);

  const withRemediation = findings.filter(
    (f) => f.remediationText && f.remediationText.trim().length > 10
  ).length;

  return {
    detected,
    total,
    detectionRate: total > 0 ? +(detected / total).toFixed(3) : 0,
    uniqueOnly: groups.filter((g) => g.overlapType === `${tool}_only`).length,
    severityScore,
    remediationRate: detected > 0 ? +(withRemediation / detected).toFixed(3) : 0,
  };
}

function scoreCombined(groups, tools) {
  const total = groups.length;
  const detected = groups.filter((g) => tools.some((t) => g.findings[t])).length;
  const findings = groups.flatMap((g) => tools.map((t) => g.findings[t]).filter(Boolean));

  const withRemediation = findings.filter(
    (f) => f.remediationText && f.remediationText.trim().length > 10
  ).length;

  return {
    detected,
    total,
    detectionRate: total > 0 ? +(detected / total).toFixed(3) : 0,
    uniqueOnly: groups.filter((g) => tools.some((t) => g.overlapType === `${t}_only`)).length,
    severityScore: findings.reduce((a, f) => {
      const weights = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
      return a + (weights[f.severity] || 0);
    }, 0),
    remediationRate: detected > 0 ? +(withRemediation / detected).toFixed(3) : 0,
  };
}

module.exports = { score };
