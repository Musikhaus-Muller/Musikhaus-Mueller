const preservationMessage = bundle => bundle
  ? 'previous valid bundle price preserved'
  : 'previous valid price preserved';
const hasPreservationMessage = message =>
  /previous valid (?:bundle )?price preserved/.test(message);

export function formatResultLogMessage(result, { bundle = false } = {}) {
  const message = String(result?.error || result?.status || 'unknown result');
  if (hasPreservationMessage(message)) return message;
  return `${message}; ${preservationMessage(bundle)}`;
}
