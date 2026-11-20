// Desktop pilot endpoint: deliberately preflight-only. It has no production write route.
const allowedShops = new Set(['hotsound', 'thomann']);
const allowedRoles = new Set(['root', 'admin']);
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
});
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const string = (value: unknown) => typeof value === 'string' && value.length > 0 ? value : null;

function plannedRows(plan: unknown) {
  if (!isRecord(plan) || plan.writes !== false || !Array.isArray(plan.shops)) throw new Error('invalid_plan');
  const rows: Record<string, unknown>[] = [];
  for (const shop of plan.shops) {
    if (!isRecord(shop) || !Array.isArray(shop.rows)) throw new Error('invalid_plan');
    for (const row of shop.rows) if (isRecord(row) && row.decision === 'planned') rows.push(row);
  }
  return rows.map(row => {
    const observation = isRecord(row.proposed_observation) ? row.proposed_observation : null;
    const match = observation && isRecord(observation.offer_match) ? observation.offer_match : null;
    const reference = string(row.reference), shop = string(row.shop), shopSlug = match && string(match.shop_slug), configurationLegacyId = match && string(match.configuration_legacy_id);
    if (!reference || !/^r\d+$/.test(reference) || !shop || !shopSlug || !allowedShops.has(shopSlug) || configurationLegacyId !== reference) throw new Error('invalid_plan');
    return { reference, shop, shopSlug, configurationLegacyId };
  });
}

async function authenticatedUser(request: Request, url: string, anon: string) {
  const token = request.headers.get('Authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;
  const response = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` } });
  return response.ok ? { user: await response.json(), token } : null;
}

Deno.serve(async request => {
  try {
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
    const url = Deno.env.get('SUPABASE_URL') || '';
    const anon = Deno.env.get('SUPABASE_ANON_KEY') || '';
    if (!url || !anon) return json({ error: 'service_unavailable' }, 503);
    const authenticated = await authenticatedUser(request, url, anon);
    if (!authenticated || !allowedRoles.has(String(authenticated.user.app_metadata?.role || '').toLowerCase())) return json({ error: 'unauthorized' }, 403);
    const body: unknown = await request.json().catch(() => null);
    if (!isRecord(body) || body.action !== 'preflight' || Object.keys(body).some(key => !['action', 'write_plan'].includes(key))) return json({ error: 'unsupported_action' }, 400);
    const rows = plannedRows(body.write_plan);
    const rest = async (query: string) => {
      const response = await fetch(`${url}/rest/v1/${query}`, { headers: { apikey: anon, Authorization: `Bearer ${authenticated.token}` } });
      if (!response.ok) throw new Error('database_unavailable');
      return response.json();
    };
    const preflight = [];
    for (const row of rows) {
      const configs = await rest(`configurations?select=id,legacy_id,active&legacy_id=eq.${encodeURIComponent(row.configurationLegacyId)}`);
      if (configs.length === 0) { preflight.push({ ...row, configuration_id: null, shop_id: null, offer_id: null, status: 'missing_configuration' }); continue; }
      if (configs.length !== 1) { preflight.push({ ...row, configuration_id: null, shop_id: null, offer_id: null, status: 'ambiguous_configuration' }); continue; }
      const shops = await rest(`shops?select=id,slug,enabled&slug=eq.${encodeURIComponent(row.shopSlug)}`);
      if (shops.length === 0) { preflight.push({ ...row, configuration_id: configs[0].id, shop_id: null, offer_id: null, status: 'missing_shop' }); continue; }
      if (shops.length !== 1) { preflight.push({ ...row, configuration_id: configs[0].id, shop_id: null, offer_id: null, status: 'ambiguous_shop' }); continue; }
      if (!configs[0].active || !shops[0].enabled) { preflight.push({ ...row, configuration_id: configs[0].id, shop_id: shops[0].id, offer_id: null, status: 'mismatch' }); continue; }
      const offers = await rest(`offers?select=id,active&configuration_id=eq.${encodeURIComponent(configs[0].id)}&shop_id=eq.${encodeURIComponent(shops[0].id)}`);
      if (offers.length === 0) { preflight.push({ ...row, configuration_id: configs[0].id, shop_id: shops[0].id, offer_id: null, status: 'missing_offer' }); continue; }
      if (offers.length !== 1) { preflight.push({ ...row, configuration_id: configs[0].id, shop_id: shops[0].id, offer_id: null, status: 'ambiguous_offer' }); continue; }
      preflight.push({ ...row, configuration_id: configs[0].id, shop_id: shops[0].id, offer_id: offers[0].id, status: offers[0].active ? 'resolved' : 'mismatch' });
    }
    return json({ preflight: { writes: false, totals: { planned: rows.length, resolved: preflight.filter(row => row.status === 'resolved').length }, rows: preflight } });
  } catch (error) {
    const code = error instanceof Error && error.message === 'invalid_plan' ? 'invalid_plan' : 'service_unavailable';
    return json({ error: code }, code === 'invalid_plan' ? 400 : 503);
  }
});
