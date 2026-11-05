import { pathToFileURL } from 'node:url';

export async function claimManualRun({ env = process.env, fetcher = fetch } = {}) {
  const SUPABASE_URL = env.SUPABASE_URL;
  const SUPABASE_KEY = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  const runId = env.COLLECT_RUN_ID;

  if (!runId) return { claimed: false, skipped: true };
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY are required');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(runId)) {
    throw new Error('COLLECT_RUN_ID must be a UUID');
  }

  const response = await fetcher(`${SUPABASE_URL}/rest/v1/rpc/claim_manual_collection_run`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      'Content-Type': 'application/json',
      ...(SUPABASE_KEY.startsWith('eyJ') ? { Authorization: 'Bearer '.concat(SUPABASE_KEY) } : {})
    },
    body: JSON.stringify({ p_run_id: runId })
  });
  if (!response.ok) throw new Error(`Failed to claim collection run: HTTP ${response.status}`);

  const result = (await response.json())?.[0];
  if (!result?.claimed) throw new Error(`Reserved collection run cannot be claimed: ${result?.reason || 'unknown reason'}`);
  return { claimed: true, runId };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await claimManualRun();
  console.log(result.claimed ? `Claimed reserved collection run ${result.runId}.` : 'No website-reserved collection run to claim.');
}
