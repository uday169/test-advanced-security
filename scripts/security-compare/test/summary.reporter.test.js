const test = require('node:test');
const assert = require('node:assert/strict');
const { buildOverlapSummary, buildDetailedMarkdownReport } = require('../reporters/summary.reporter');

test('buildOverlapSummary builds markdown with overlap counts', () => {
  const summary = buildOverlapSummary({ both: 3, snykOnly: 2, ghasOnly: 1 });

  assert.match(summary, /## 🔍 Findings Overlap Breakdown/);
  assert.match(summary, /\| Found by both tools \| 3 \|/);
  assert.match(summary, /\| Snyk only \| 2 \|/);
  assert.match(summary, /\| GHAS only \| 1 \|/);
});

test('buildDetailedMarkdownReport includes score and overlap sections', () => {
  const detailed = buildDetailedMarkdownReport(
    {
      sast: { snyk: { detectionRate: 0.5 }, codeql: { detectionRate: 0.4 } },
      sca: { snyk: { detectionRate: 0.75 }, dependabot: { detectionRate: 0.5 } },
      overall: { snyk: { detectionRate: 0.6 }, ghas: { detectionRate: 0.45 } },
    },
    { snyk: 10, codeql: 7, dependabot: 6 },
    { both: 4, snykOnly: 3, ghasOnly: 2 },
  );

  assert.match(detailed, /# 🔒 Security Comparison Detailed Report/);
  assert.match(detailed, /## 🔒 Security Findings Comparator/);
  assert.match(detailed, /## 🔍 Findings Overlap Breakdown/);
  assert.match(detailed, /\| Overall detection rate \| 60.0% \| 45.0% \|/);
});
