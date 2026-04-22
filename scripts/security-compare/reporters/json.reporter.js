const fs = require('fs');
const path = require('path');

function generateJSON(report, outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8');
  return outputPath;
}

module.exports = { generateJSON };
