const test = require('node:test');
const assert = require('node:assert/strict');
const { normaliseSeverity, SEVERITY_SCORE } = require('../engine/normalise');
const { matchSAST, matchSCA } = require('../engine/matcher');
const { score } = require('../engine/scorer');

test('normaliseSeverity maps warning/error/note into canonical severities', () => {
  assert.equal(normaliseSeverity('warning'), 'medium');
  assert.equal(normaliseSeverity('error'), 'high');
  assert.equal(normaliseSeverity('note'), 'low');
  assert.equal(SEVERITY_SCORE.high, 7.5);
});

test('matchSAST groups by matching CWE and file path tail', () => {
  const snyk = [{ id: 's1', type: 'sast', cwe: 'CWE-89', filePath: 'packages/api/src/routes/vuln.js', title: 'SQL injection', ruleId: 'CWE-89' }];
  const codeql = [{ id: 'c1', type: 'sast', cwe: 'CWE-89', filePath: 'src/routes/vuln.js', title: 'Potential SQL injection', ruleId: 'js/sql-injection' }];
  const groups = matchSAST(snyk, codeql);

  assert.equal(groups.length, 1);
  assert.equal(groups[0].overlapType, 'snyk_codeql');
});

test('matchSCA groups by CVE first and leaves unmatched findings', () => {
  const snyk = [{ id: 's1', type: 'sca', cve: 'CVE-2021-3749', packageName: 'axios', cwe: '', ruleId: 'CVE-2021-3749' }];
  const dep = [
    { id: 'd1', type: 'sca', cve: 'CVE-2021-3749', packageName: 'axios', cwe: '', ruleId: 'GHSA-1' },
    { id: 'd2', type: 'sca', cve: 'CVE-0000-0000', packageName: 'lodash', cwe: '', ruleId: 'GHSA-2' },
  ];
  const groups = matchSCA(snyk, dep);

  assert.equal(groups.length, 2);
  assert.equal(groups[0].overlapType, 'snyk_dependabot');
  assert.equal(groups[1].overlapType, 'dependabot_only');
});

test('score computes category and overall rates', () => {
  const sastGroups = [
    {
      findings: {
        snyk: { severity: 'high', remediationText: 'Apply fix now' },
        codeql: { severity: 'medium', remediationText: 'Use parameterized query in this codepath' },
      },
      overlapType: 'snyk_codeql',
    },
  ];

  const scaGroups = [
    {
      findings: {
        snyk: { severity: 'medium', remediationText: 'Update package to fixed version' },
      },
      overlapType: 'snyk_only',
    },
  ];

  const result = score(sastGroups, scaGroups);
  assert.equal(result.sast.snyk.detectionRate, 1);
  assert.equal(result.sca.dependabot.detectionRate, 0);
  assert.equal(result.overall.ghas.detectionRate, 0.5);
});
