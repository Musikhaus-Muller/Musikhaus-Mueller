const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const runId = process.env.COLLECT_RUN_ID;

if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY are required');
if (!runId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(runId)) {
  throw new Error('COLLECT_RUN_ID must be a UUID');
}

const response = await fetch(
  `${SUPABASE_URL}/rest/v1/collection_runs?id=eq.${encodeURIComponent(runId)}&status=in.(running,success,partial)&metadata->>source=eq.web`,
  {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
      ...(SUPABASE_KEY.startsWith('eyJ') ? { Authorization: `Bearer ${SUPABASE_KEY}` } : {})
    },
    body: JSON.stringify({
      status: 'failed',
      finished_at: new Date().toISOString(),
      metadata: {
        source: 'web',
        lifecycle: 'failed',
        error: 'GitHub Actions collection job did not complete successfully'
      }
    })
  }
);

if (!response.ok) throw new Error(`Failed to finalize collection run: HTTP ${response.status}`);
