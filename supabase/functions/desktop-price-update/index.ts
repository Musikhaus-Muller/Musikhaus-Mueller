// Restricted desktop updater endpoint. Deploy separately; never ship its service key.
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const allowedShops = new Set(['hotsound', 'thomann']);
const allowedRoles = new Set(['root', 'admin']);

function plannedRows(plan: any) { return (plan?.shops || []).flatMap((shop: any) => shop.rows || []).filter((row: any) => row.decision === 'planned'); }
function validObservation(row: any, preflight: any) {
  const o = row?.proposed_observation?.price_observation, match = row?.proposed_observation?.offer_match;
  if (!o || !match || preflight?.status !== 'resolved' || !preflight.offer_id) return false;
  if (!allowedShops.has(match.shop_slug) || o.status !== 'success' || o.verified !== true || o.currency !== 'EUR' || !(Number(o.price) > 0)) return false;
  if (!['browser', 'component_calc'].includes(o.source_method) || !o.metadata?.source_url || o.metadata?.collector_method !== 'browser_shadow_self_hosted') return false;
  if (o.metadata.identity_valid !== true || o.metadata.manual_review_required || o.metadata.challenge_detected || o.metadata.ambiguity_detected) return false;
  if (o.metadata.pricing_kind === 'component_cart' && (!Array.isArray(o.metadata.component_evidence) || !o.metadata.component_evidence.length || !o.metadata.component_evidence.every((c: any) => c.identity_valid === true && c.verified === true && Number(c.observed_price) > 0 && Number(c.quantity) > 0))) return false;
  return preflight.reference === row.reference && preflight.shop === row.shop && preflight.shop_slug === match.shop_slug && preflight.configuration_legacy_id === match.configuration_legacy_id;
}

Deno.serve(async request => {
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const url = Deno.env.get('SUPABASE_URL') || '', anon = Deno.env.get('SUPABASE_ANON_KEY') || '', service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') || '';
  const userResponse = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` } });
  const user = userResponse.ok ? await userResponse.json() : null;
  if (!user || !allowedRoles.has(String(user.app_metadata?.role || '').toLowerCase())) return json({ error: 'unauthorized' }, 403);
  const body = await request.json();
  const plan = body.write_plan, preflightRows = body.preflight?.rows || [];
  if (!plan || plan.writes !== false) return json({ error: 'invalid_plan' }, 400);
  const rows = plannedRows(plan);
  const rest = async (path: string, options: RequestInit = {}) => {
    const response = await fetch(`${url}/rest/v1/${path}`, { ...options, headers: { apikey: service, Authorization: `Bearer ${service}`, ...(options.headers || {}) } });
    if (!response.ok) throw new Error(`database_${response.status}`);
    return response.json();
  };
  let resolved = new Map(preflightRows.filter((row: any) => row.status === 'resolved').map((row: any) => [`${row.reference}|${row.shop}`, row]));
  if (body.action === 'preflight') {
    const preflight = [];
    for (const row of rows) {
      const match = row.proposed_observation?.offer_match;
      const configs = await rest(`configurations?select=id,legacy_id,active&legacy_id=eq.${encodeURIComponent(match.configuration_legacy_id)}`);
      const shops = await rest(`shops?select=id,slug,enabled&slug=eq.${encodeURIComponent(match.shop_slug)}`);
      const config = configs.length === 1 ? configs[0] : null, shop = shops.length === 1 ? shops[0] : null;
      const offers = config && shop ? await rest(`offers?select=id,active,product_url,source_url&configuration_id=eq.${encodeURIComponent(config.id)}&shop_id=eq.${encodeURIComponent(shop.id)}`) : [];
      const offer = offers.length === 1 ? offers[0] : null;
      const status = config?.active && shop?.enabled && offer?.active ? 'resolved' : 'missing_offer';
      preflight.push({ reference: row.reference, shop: row.shop, configuration_legacy_id: match.configuration_legacy_id, shop_slug: match.shop_slug, configuration_id: config?.id || null, shop_id: shop?.id || null, offer_id: offer?.id || null, status });
    }
    return json({ preflight: { writes: false, totals: { planned: rows.length, resolved: preflight.filter(row => row.status === 'resolved').length }, rows: preflight } });
  }
  if (body.action === 'apply') {
    if (!body.plan_sha256 || !body.preflight_sha256) return json({ error: 'checksum_confirmation_required' }, 400);
    const result: any[] = [];
    for (const row of rows) {
      const preflight = resolved.get(`${row.reference}|${row.shop}`);
      if (!validObservation(row, preflight)) { result.push({ reference: row.reference, result: 'failed', reason: 'validation_rejected' }); continue; }
      const observation = { ...row.proposed_observation.price_observation, offer_id: preflight.offer_id };
      const insert = await fetch(`${url}/rest/v1/price_observations`, { method: 'POST', headers: { apikey: service, Authorization: `Bearer ${service}`, 'Content-Type': 'application/json', Prefer: 'resolution=ignore-duplicates,return=representation' }, body: JSON.stringify(observation) });
      if (!insert.ok) { result.push({ reference: row.reference, offer_id: preflight.offer_id, result: 'failed', reason: `insert_${insert.status}` }); continue; }
      const inserted = await insert.json();
      result.push({ reference: row.reference, offer_id: preflight.offer_id, result: inserted[0] ? 'inserted' : 'already_applied', observation_id: inserted[0]?.id || null });
    }
    return json({ result: { writes: true, rows: result, totals: { inserted: result.filter(r => r.result === 'inserted').length, already_applied: result.filter(r => r.result === 'already_applied').length, failed: result.filter(r => r.result === 'failed').length } } });
  }
  if (body.action === 'audit') {
    const applied = (body.apply_result?.rows || []).filter((row: any) => ['inserted', 'already_applied'].includes(row.result) && row.observation_id);
    const ids = applied.map((row: any) => encodeURIComponent(row.observation_id)).join(',');
    const offerIds = [...new Set(applied.map((row: any) => row.offer_id).filter(Boolean))];
    const observations = ids ? await rest(`price_observations?select=id,offer_id,price,currency,status,source_method,verified,observed_at,metadata&id=in.(${ids})`) : [];
    const current = offerIds.length ? await rest(`current_offer_status?select=offer_id,price,currency,price_source_method,price_observed_at&offer_id=in.(${offerIds.map(encodeURIComponent).join(',')})`) : [];
    const byId = new Map(observations.map((row: any) => [row.id, row]));
    const byOffer = new Map(current.map((row: any) => [row.offer_id, row]));
    const valid = applied.filter((row: any) => { const o = byId.get(row.observation_id); return o?.offer_id === row.offer_id && o.status === 'success' && o.verified === true && Number(o.price) > 0 && o.currency === 'EUR' && ['browser', 'component_calc'].includes(o.source_method) && o.metadata?.collector_method === 'browser_shadow_self_hosted' && o.metadata?.idempotency_key; });
    const currentMatches = valid.filter((row: any) => { const o = byId.get(row.observation_id), c = byOffer.get(row.offer_id); return c && Number(c.price) === Number(o.price) && c.currency === 'EUR' && c.price_source_method === o.source_method && new Date(c.price_observed_at).getTime() === new Date(o.observed_at).getTime(); });
    const preserved = (plan?.shops || []).flatMap((shop: any) => shop.rows || []).filter((row: any) => row.decision === 'skipped').length;
    return json({ summary: { updated: valid.length, preserved, manual_review: 0, failures: applied.length - valid.length + (valid.length - currentMatches.length) } });
  }
  return json({ error: 'unsupported_action' }, 400);
});
