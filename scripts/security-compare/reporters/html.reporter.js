const fs = require('fs');
const path = require('path');
const { renderReportTemplate } = require('../templates/report.html');

function generateHTML(sastGroups, scaGroups, scores, outputPath) {
  const allGroups = [...sastGroups, ...scaGroups];
  const overlap = {
    both: allGroups.filter((g) => g.tools.length > 1).length,
    snykOnly: allGroups.filter((g) => g.overlapType === 'snyk_only').length,
    ghasOnly: allGroups.filter((g) => g.overlapType === 'codeql_only' || g.overlapType === 'dependabot_only').length,
  };

  const payload = {
    generatedAt: new Date().toISOString(),
    scores,
    overlap,
    verdict: {
      sast: scores.sast.snyk.detectionRate >= scores.sast.codeql.detectionRate ? 'Snyk Code' : 'CodeQL',
      sca: scores.sca.snyk.detectionRate >= scores.sca.dependabot.detectionRate ? 'Snyk OSS' : 'Dependabot',
      overall: scores.overall.snyk.detectionRate >= scores.overall.ghas.detectionRate ? 'Snyk' : 'GHAS',
    },
  };

  const html = renderReportTemplate(payload);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html, 'utf8');
  return outputPath;
}

module.exports = { generateHTML };
