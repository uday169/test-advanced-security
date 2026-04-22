const test = require('node:test');
const assert = require('node:assert/strict');
const { buildOverlapSummary } = require('../reporters/summary.reporter');

test('buildOverlapSummary builds markdown with overlap counts', () => {
  const summary = buildOverlapSummary({ both: 3, snykOnly: 2, ghasOnly: 1 });

  assert.match(summary, /## 🔍 Findings Overlap Breakdown/);
  assert.match(summary, /\| Found by both tools \| 3 \|/);
  assert.match(summary, /\| Snyk only \| 2 \|/);
  assert.match(summary, /\| GHAS only \| 1 \|/);
});
