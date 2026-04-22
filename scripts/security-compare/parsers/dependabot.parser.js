const { Octokit } = require('@octokit/rest');
const { normaliseSeverity, SEVERITY_SCORE } = require('../engine/normalise');

async function fetchDependabotFindings(owner, repo, token) {
  const octokit = new Octokit({ auth: token });
  const alerts = [];

  for await (const response of octokit.paginate.iterator(
    octokit.rest.dependabot.listAlertsForRepo,
    { owner, repo, state: 'open', per_page: 100 }
  )) {
    alerts.push(...response.data);
  }

  return alerts.map((alert) => {
    const advisory = alert.security_advisory || {};
    const vuln = alert.security_vulnerability || {};
    const pkg = vuln.package || {};
    const severity = normaliseSeverity(advisory.severity || 'medium');

    const cve = String(advisory.cve_id || '').trim();
    const cwe = (advisory.cwes || [])
      .map((c) => c.cwe_id)
      .filter(Boolean)
      .join(', ');

    const manifestPath = alert.dependency?.manifest_path || '';
    const workspace = manifestPath.includes('packages/client')
      ? 'packages/client'
      : manifestPath.includes('packages/api')
      ? 'packages/api'
      : '';

    const cvssScore = advisory.cvss?.score ?? SEVERITY_SCORE[severity];

    return {
      id: `dependabot:${alert.number}`,
      tool: 'dependabot',
      type: 'sca',
      title: advisory.summary || `Dependabot Alert #${alert.number}`,
      severity,
      severityScore: cvssScore,
      cwe,
      cve,
      packageName: pkg.name || '',
      packageVersion: vuln.vulnerable_version_range || '',
      fixedIn: vuln.first_patched_version?.identifier || '',
      filePath: manifestPath,
      lineStart: 0,
      ruleId: advisory.ghsa_id || cve || '',
      description: advisory.description || '',
      remediationText: vuln.first_patched_version
        ? `Upgrade to ${pkg.name}@${vuln.first_patched_version.identifier}`
        : 'No patch available yet — consider alternative package',
      url: advisory.html_url || alert.html_url || '',
      workspace,
      rawSource: JSON.stringify(alert),
    };
  });
}

module.exports = { fetchDependabotFindings };
