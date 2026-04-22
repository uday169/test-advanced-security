const fs = require('fs');
const path = require('path');

function buildSummary(scores, counts) {
  const asPercent = (value) => `${(value * 100).toFixed(1)}%`;
  const lines = [
    '## 🔒 Security Findings Comparator',
    '',
    '| Metric | Snyk | GHAS |',
    '|---|---:|---:|',
    `| SAST detection rate | ${asPercent(scores.sast.snyk.detectionRate)} | ${asPercent(scores.sast.codeql.detectionRate)} |`,
    `| SCA detection rate | ${asPercent(scores.sca.snyk.detectionRate)} | ${asPercent(scores.sca.dependabot.detectionRate)} |`,
    `| Overall detection rate | ${asPercent(scores.overall.snyk.detectionRate)} | ${asPercent(scores.overall.ghas.detectionRate)} |`,
    '',
    `- Snyk findings parsed: ${counts.snyk}`,
    `- CodeQL findings fetched: ${counts.codeql}`,
    `- Dependabot findings fetched: ${counts.dependabot}`,
  ];

  return `${lines.join('\n')}\n`;
}

function buildOverlapSummary(overlap) {
  const lines = [
    '## 🔍 Findings Overlap Breakdown',
    '',
    '| Category | Count |',
    '|---|---:|',
    `| Found by both tools | ${overlap.both} |`,
    `| Snyk only | ${overlap.snykOnly} |`,
    `| GHAS only | ${overlap.ghasOnly} |`,
  ];

  return `${lines.join('\n')}\n`;
}

function buildDetailedMarkdownReport(scores, counts, overlap) {
  const lines = [
    '# 🔒 Security Comparison Detailed Report',
    '',
    buildSummary(scores, counts).trimEnd(),
    '',
    buildOverlapSummary(overlap).trimEnd(),
    '',
    '## 📌 Notes',
    '',
    '- Snyk = Snyk Code + Snyk OSS',
    '- GHAS = CodeQL + Dependabot',
    '- Rates are computed from matched finding groups.',
  ];

  return `${lines.join('\n')}\n`;
}

function writeSummary(summary, outputPath) {
  if (!outputPath) return '';
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, summary, 'utf8');
  return outputPath;
}

function appendToGithubStepSummary(summary) {
  const filePath = process.env.GITHUB_STEP_SUMMARY;
  if (!filePath) return '';
  fs.appendFileSync(filePath, `\n${summary}\n`, 'utf8');
  return filePath;
}

module.exports = {
  buildSummary,
  buildOverlapSummary,
  buildDetailedMarkdownReport,
  writeSummary,
  appendToGithubStepSummary,
};
