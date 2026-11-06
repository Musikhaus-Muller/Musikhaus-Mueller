const PRESERVED_HEALTH = {
  blocked: 'preserved_blocked',
  captcha: 'preserved_captcha',
  not_found: 'preserved_not_found',
  parse_error: 'preserved_parse_error'
};

export function classifyResultHealth(sourceStatus) {
  if (sourceStatus === 'success') return 'updated';
  return Object.hasOwn(PRESERVED_HEALTH, sourceStatus) ? PRESERVED_HEALTH[sourceStatus] : 'hard_failed';
}

export function summarizeResultHealth(results = []) {
  const counts = {
    checked: 0,
    updated: 0,
    preserved: 0,
    hardFailed: 0,
    preservedBlocked: 0,
    preservedCaptcha: 0,
    preservedNotFound: 0,
    preservedParseError: 0,
    networkErrors: 0,
    unknownFailures: 0
  };

  for (const result of results) {
    counts.checked++;
    const health = classifyResultHealth(result?.status);
    if (health === 'updated') {
      counts.updated++;
    } else if (health === 'hard_failed') {
      counts.hardFailed++;
      if (result?.status === 'network_error') counts.networkErrors++;
      else counts.unknownFailures++;
    } else {
      counts.preserved++;
      if (health === 'preserved_blocked') counts.preservedBlocked++;
      else if (health === 'preserved_captcha') counts.preservedCaptcha++;
      else if (health === 'preserved_not_found') counts.preservedNotFound++;
      else counts.preservedParseError++;
    }
  }

  return counts;
}

export function deriveRunHealth(results = [], { fatalError = null } = {}) {
  const counts = summarizeResultHealth(results);
  if (fatalError !== null) {
    counts.hardFailed++;
    counts.unknownFailures++;
  }
  const hasUsefulResults = counts.updated + counts.preserved > 0;
  const status = counts.hardFailed === 0
    ? 'success'
    : hasUsefulResults ? 'partial' : 'failed';
  const healthStatus = status === 'success'
    ? counts.preserved > 0 ? 'success_with_preserved' : 'success'
    : status;

  return {
    ...counts,
    status,
    healthStatus,
    resultCounts: {
      checked: counts.checked,
      updated: counts.updated,
      preserved: counts.preserved,
      hard_failed: counts.hardFailed,
      preserved_blocked: counts.preservedBlocked,
      preserved_captcha: counts.preservedCaptcha,
      preserved_not_found: counts.preservedNotFound,
      preserved_parse_error: counts.preservedParseError,
      network_error: counts.networkErrors,
      unknown_failure: counts.unknownFailures
    }
  };
}
