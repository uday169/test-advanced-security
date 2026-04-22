const fs = require('fs');
const csv = require('csv-parse/sync');
const { normaliseSeverity, SEVERITY_SCORE } = require('../engine/normalise');
const MAX_SLUG_LENGTH = 40;

function parseSnykCSV(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const records = csv.parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });

  if (!records.length) return [];

  const headers = Object.keys(records[0]).map((h) => h.toLowerCase());
  const isSastCSV = headers.some((h) => h.includes('file') || h.includes('line'));

  return records.map((row, idx) => {
    const severity = normaliseSeverity(pick(row, ['Severity', 'severity']));
    const cwe = extractCWE(pick(row, ['CWE', 'cwe']));
    const cve = String(pick(row, ['CVE', 'cve'])).trim();
    const packageName = String(pick(row, ['Package Name', 'package name', 'module'])).trim();
    const version = String(pick(row, ['Version', 'version', 'installed version'])).trim();
    const fixedIn = String(pick(row, ['Fixed In', 'fixed in', 'remediation'])).trim();
    const findingFilePath = String(pick(row, ['File', 'file', 'path'])).trim();
    const lineStart = parseInt(String(pick(row, ['Line', 'line'], '0')), 10) || 0;
    const title = String(pick(row, ['Title', 'title', 'issue'], `Finding ${idx + 1}`)).trim();
    const description = String(pick(row, ['Description', 'description'])).trim();
    const remediation = String(pick(row, ['Fix Guidance', 'fix guidance', 'remediation advice'])).trim();
    const url = String(pick(row, ['URL', 'url', 'link'])).trim();
    const project = String(pick(row, ['Project', 'project'])).trim();

    const workspace = inferWorkspace(findingFilePath || project);

    return {
      id: `snyk:${idx}-${slugify(title)}`,
      tool: 'snyk',
      type: isSastCSV ? 'sast' : 'sca',
      title,
      severity,
      severityScore: SEVERITY_SCORE[severity],
      cwe,
      cve,
      packageName,
      packageVersion: version,
      fixedIn,
      filePath: findingFilePath,
      lineStart,
      ruleId: cwe || title,
      description,
      remediationText: remediation,
      url,
      workspace,
      rawSource: JSON.stringify(row),
    };
  });
}

function pick(row, keys, fallback = '') {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(row, key) && row[key] !== undefined && row[key] !== null) {
      return row[key];
    }
  }
  return fallback;
}

function extractCWE(raw) {
  const match = String(raw || '').match(/CWE-\d+/i);
  return match ? match[0].toUpperCase() : '';
}

function inferWorkspace(text) {
  const value = String(text || '');
  if (!value) return '';
  if (value.includes('packages/api') || value.includes('api')) return 'packages/api';
  if (value.includes('packages/client') || value.includes('client')) return 'packages/client';
  return '';
}

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, MAX_SLUG_LENGTH);
}

module.exports = { parseSnykCSV };
