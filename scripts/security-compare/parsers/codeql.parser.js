const { Octokit } = require('@octokit/rest');
const { normaliseSeverity, SEVERITY_SCORE } = require('../engine/normalise');

async function fetchCodeQLFindings(owner, repo, token) {
  const octokit = new Octokit({ auth: token });
  const alerts = [];

  for await (const response of octokit.paginate.iterator(
    octokit.rest.codeScanning.listAlertsForRepo,
    { owner, repo, state: 'open', per_page: 100 }
  )) {
    alerts.push(...response.data);
  }

  return alerts.map((alert) => {
    const rule = alert.rule || {};
    const location = alert.most_recent_instance?.location || {};
    const severity = normaliseSeverity(rule.security_severity_level || rule.severity || 'medium');
    const cweTags = (rule.tags || []).filter((t) => /^CWE-\d+$/i.test(t));
    const cwe = cweTags[0]?.toUpperCase() || '';

    const filePath = String(location.path || '').replace(/^\//, '');
    const workspace = filePath.startsWith('packages/client')
      ? 'packages/client'
      : filePath.startsWith('packages/api')
      ? 'packages/api'
      : '';

    return {
      id: `codeql:${alert.number}`,
      tool: 'codeql',
      type: 'sast',
      title: rule.description || rule.name || `CodeQL Alert #${alert.number}`,
      severity,
      severityScore: SEVERITY_SCORE[severity],
      cwe,
      cve: '',
      packageName: '',
      packageVersion: '',
      fixedIn: '',
      filePath,
      lineStart: location.start_line || 0,
      ruleId: rule.id || '',
      description: rule.full_description || rule.description || '',
      remediationText: rule.help || '',
      url: alert.html_url || '',
      workspace,
      rawSource: JSON.stringify(alert),
    };
  });
}

module.exports = { fetchCodeQLFindings };
