#!/usr/bin/env node
const path = require('path');
const { parseSnykCSV } = require('./parsers/snyk.parser');
const { fetchCodeQLFindings } = require('./parsers/codeql.parser');
const { fetchDependabotFindings } = require('./parsers/dependabot.parser');
const { matchSAST, matchSCA } = require('./engine/matcher');
const { score } = require('./engine/scorer');
const { generateHTML } = require('./reporters/html.reporter');
const { generateJSON } = require('./reporters/json.reporter');
const {
  buildSummary,
  buildOverlapSummary,
  buildDetailedMarkdownReport,
  writeSummary,
  appendToGithubStepSummary,
} = require('./reporters/summary.reporter');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : 'true';
    args[key] = value;
    if (value !== 'true') i += 1;
  }
  return args;
}

function countOverlap(groups) {
  const overlap = { both: 0, snykOnly: 0, ghasOnly: 0 };

  for (const group of groups) {
    if (group.tools.length > 1) {
      overlap.both += 1;
    } else if (group.overlapType === 'snyk_only') {
      overlap.snykOnly += 1;
    } else if (group.overlapType === 'codeql_only' || group.overlapType === 'dependabot_only') {
      overlap.ghasOnly += 1;
    } else if (group.tools.length === 1) {
      throw new Error(`Unexpected overlap type for single-tool group: ${group.overlapType || 'unknown'}`);
    }
  }

  return overlap;
}

async function main() {
  const args = parseArgs(process.argv);
  const repository = args.repository || process.env.GITHUB_REPOSITORY || '';
  const [repoOwner, repoName] = repository.includes('/') ? repository.split('/') : [args.owner, args.repo];

  const owner = args.owner || repoOwner;
  const repo = args.repo || repoName;
  const token = args.token || process.env.GITHUB_TOKEN;
  const snykCsv = args['snyk-csv'];
  const outDir = path.resolve(args['out-dir'] || path.join(process.cwd(), 'scripts/security-compare/output'));

  if (!snykCsv) {
    throw new Error('Missing required argument: --snyk-csv <absolute-or-relative-path>');
  }
  if (!owner || !repo) {
    throw new Error('Missing GitHub repository context. Provide --owner and --repo (or GITHUB_REPOSITORY).');
  }
  if (!token) {
    throw new Error('Missing GitHub token. Provide --token or GITHUB_TOKEN.');
  }

  const snykFindings = parseSnykCSV(path.resolve(snykCsv));
  const [codeqlFindings, dependabotFindings] = await Promise.all([
    fetchCodeQLFindings(owner, repo, token),
    fetchDependabotFindings(owner, repo, token),
  ]);

  const sastGroups = matchSAST(snykFindings, codeqlFindings);
  const scaGroups = matchSCA(snykFindings, dependabotFindings);
  const scores = score(sastGroups, scaGroups);

  const report = {
    generatedAt: new Date().toISOString(),
    repository: `${owner}/${repo}`,
    counts: {
      snyk: snykFindings.length,
      codeql: codeqlFindings.length,
      dependabot: dependabotFindings.length,
      sastGroups: sastGroups.length,
      scaGroups: scaGroups.length,
    },
    scores,
    sastGroups,
    scaGroups,
  };

  const jsonPath = path.join(outDir, 'security-compare.json');
  const htmlPath = path.join(outDir, 'security-compare.html');
  const summaryPath = path.join(outDir, 'security-compare-summary.md');
  const overlapSummaryPath = path.join(outDir, 'security-compare-overlap.md');
  const detailedSummaryPath = path.join(outDir, 'security-compare-detailed.md');

  generateJSON(report, jsonPath);
  generateHTML(sastGroups, scaGroups, scores, htmlPath);

  const sastOverlap = countOverlap(sastGroups);
  const scaOverlap = countOverlap(scaGroups);
  const overlap = {
    both: sastOverlap.both + scaOverlap.both,
    snykOnly: sastOverlap.snykOnly + scaOverlap.snykOnly,
    ghasOnly: sastOverlap.ghasOnly + scaOverlap.ghasOnly,
  };

  const summary = buildSummary(scores, report.counts);
  const overlapSummary = buildOverlapSummary(overlap);
  const detailedSummary = buildDetailedMarkdownReport(scores, report.counts, overlap);
  writeSummary(summary, summaryPath);
  writeSummary(overlapSummary, overlapSummaryPath);
  writeSummary(detailedSummary, detailedSummaryPath);
  appendToGithubStepSummary(detailedSummary);

  process.stdout.write(`Generated report:\n- ${jsonPath}\n- ${htmlPath}\n- ${summaryPath}\n- ${overlapSummaryPath}\n- ${detailedSummaryPath}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
