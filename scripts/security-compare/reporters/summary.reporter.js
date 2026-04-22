const fs = require('fs');
const path = require('path');

function buildSummary(scores, counts) {
  const lines = [
    '## 🔒 Security Findings Comparator',
    '',
    '| Metric | Snyk | GHAS |',
    '|---|---:|---:|',
    `| SAST detection rate | ${scores.sast.snyk.detectionRate} | ${scores.sast.codeql.detectionRate} |`,
    `| SCA detection rate | ${scores.sca.snyk.detectionRate} | ${scores.sca.dependabot.detectionRate} |`,
    `| Overall detection rate | ${scores.overall.snyk.detectionRate} | ${scores.overall.ghas.detectionRate} |`,
    '',
    `- Snyk findings parsed: ${counts.snyk}`,
    `- CodeQL findings fetched: ${counts.codeql}`,
    `- Dependabot findings fetched: ${counts.dependabot}`,
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

module.exports = { buildSummary, writeSummary, appendToGithubStepSummary };
