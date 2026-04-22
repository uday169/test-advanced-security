const SEVERITY_SCORE = {
  critical: 9.5,
  high: 7.5,
  medium: 5.0,
  low: 2.5,
  info: 0.5,
};

function normaliseSeverity(raw) {
  const s = String(raw || '').toLowerCase().trim();
  if (['critical', 'high', 'medium', 'low', 'info'].includes(s)) return s;
  if (s === 'error') return 'high';
  if (s === 'warning') return 'medium';
  if (s === 'note') return 'low';
  return 'info';
}

module.exports = { SEVERITY_SCORE, normaliseSeverity };
