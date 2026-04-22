const SEVERITY_WEIGHTS = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
const MIN_REMEDIATION_LENGTH = 10;

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
    return acc + (SEVERITY_WEIGHTS[f.severity] || 0);
  }, 0);

  const withRemediation = findings.filter(
    (f) => f.remediationText && f.remediationText.trim().length > MIN_REMEDIATION_LENGTH
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
    (f) => f.remediationText && f.remediationText.trim().length > MIN_REMEDIATION_LENGTH
  ).length;

  return {
    detected,
    total,
    detectionRate: total > 0 ? +(detected / total).toFixed(3) : 0,
    uniqueOnly: groups.filter((g) => tools.some((t) => g.overlapType === `${t}_only`)).length,
    severityScore: findings.reduce((a, f) => {
      return a + (SEVERITY_WEIGHTS[f.severity] || 0);
    }, 0),
    remediationRate: detected > 0 ? +(withRemediation / detected).toFixed(3) : 0,
  };
}

module.exports = { score };
