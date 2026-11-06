import { pathToFileURL } from 'node:url';

export async function reconcileManualRuns({ env = process.env, fetcher = fetch } = {}) {
  const SUPABASE_URL = env.SUPABASE_URL;
  const SUPABASE_KEY = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  const GITHUB_TOKEN = env.GITHUB_TOKEN;

  if (!SUPABASE_URL || !SUPABASE_KEY || !GITHUB_TOKEN) {
    throw new Error('SUPABASE_URL, SUPABASE_SECRET_KEY, and GITHUB_TOKEN are required');
  }
  const workflowRunsResponse = await fetcher(
    'https://api.github.com/repos/Musikhaus-Muller/Musikhaus-Mueller/actions/workflows/collect-prices.yml/runs?per_page=100',
    {
      headers: {
        Authorization: 'Bearer '.concat(GITHUB_TOKEN),
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  );
  if (!workflowRunsResponse.ok) {
    throw new Error(`Failed to inspect GitHub Actions runs: HTTP ${workflowRunsResponse.status}`);
  }
  const workflowRuns = await workflowRunsResponse.json();
  const activeRunIds = (workflowRuns.workflow_runs || [])
    .filter(run => ['queued', 'in_progress'].includes(run.status))
    .map(run => run.display_title?.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0])
    .filter(Boolean);

  const response = await fetcher(`${SUPABASE_URL}/rest/v1/rpc/reconcile_manual_collection_runs`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      'Content-Type': 'application/json',
      ...(SUPABASE_KEY.startsWith('eyJ') ? { Authorization: 'Bearer '.concat(SUPABASE_KEY) } : {})
    },
    body: JSON.stringify({ p_active_run_ids: activeRunIds })
  });
  if (!response.ok) throw new Error(`Failed to reconcile manual collection runs: HTTP ${response.status}`);
  return response.json();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(`Reconciled ${await reconcileManualRuns()} expired manual collection run(s).`);
}
