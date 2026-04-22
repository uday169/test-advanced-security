function renderReportTemplate(payload) {
  const json = JSON.stringify(payload, null, 2)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Security Tool Comparison</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #1f2937; }
    h1, h2 { margin: 0 0 12px; }
    .meta { margin-bottom: 16px; color: #4b5563; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; background: #f9fafb; }
    .label { color: #6b7280; font-size: 12px; text-transform: uppercase; }
    .value { font-size: 20px; font-weight: 700; margin-top: 6px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
    th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 13px; }
    th { background: #f3f4f6; text-align: left; }
    pre { background: #111827; color: #f9fafb; padding: 12px; border-radius: 8px; overflow: auto; font-size: 12px; }
  </style>
</head>
<body>
  <h1>🔒 Security Tool Comparison</h1>
  <p class="meta">Snyk (Code + OSS) vs GHAS (CodeQL + Dependabot) · ${payload.generatedAt}</p>

  <div class="cards">
    <div class="card"><div class="label">SAST winner</div><div class="value">${payload.verdict.sast}</div></div>
    <div class="card"><div class="label">SCA winner</div><div class="value">${payload.verdict.sca}</div></div>
    <div class="card"><div class="label">Overall winner</div><div class="value">${payload.verdict.overall}</div></div>
  </div>

  <h2>Overlap</h2>
  <table>
    <tr><th>Category</th><th>Count</th></tr>
    <tr><td>Found by both</td><td>${payload.overlap.both}</td></tr>
    <tr><td>Snyk only</td><td>${payload.overlap.snykOnly}</td></tr>
    <tr><td>GHAS only</td><td>${payload.overlap.ghasOnly}</td></tr>
  </table>

  <h2>Scores</h2>
  <pre>${json}</pre>
</body>
</html>`;
}

module.exports = { renderReportTemplate };
