import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import {
  applyPreparedBrowserWrites,
  idempotencyKey,
  prepareBrowserProductionApply,
  sha256,
  validatePlannedWrite,
  verifyApplyChecksums
} from '../collector/browser/browser-production-writer.mjs';

function planned(reference = 'r1', overrides = {}) {
  return {
    reference,
    shop: 'Thomann',
    decision: 'planned',
    proposed_observation: {
      offer_match: { configuration_legacy_id: reference, shop_slug: 'thomann' },
      price_observation: {
        price: 100, currency: 'EUR', availability: null, status: 'success', source_method: 'browser', http_status: 200,
        verified: true, raw_product_name: 'Exact product', evidence: 'exact', observed_at: '2026-11-18T09:00:00Z',
        metadata: { reference, shop: 'thomann', collector_method: 'browser_shadow_self_hosted', pricing_kind: 'direct_price', source_url: 'https://shop.example/item', final_url: 'https://shop.example/item', identity_valid: true, manual_review_required: false, challenge_detected: false, ambiguity_detected: false, component_evidence: [] }
      }
    },
    ...overrides
  };
}
function preflight(reference = 'r1', overrides = {}) {
  return { reference, shop: 'Thomann', configuration_legacy_id: reference, shop_slug: 'thomann', configuration_id: `config-${reference}`, shop_id: 'shop-thomann', offer_id: `offer-${reference}`, status: 'resolved', ...overrides };
}
function artifacts(rows = [planned()], preflightRows = [preflight()]) {
  return { writePlan: { writes: false, mode: 'plan', shops: [{ rows }] }, preflight: { writes: false, rows: preflightRows } };
}

test('writer prepares only mutually consistent planned and resolved rows', () => {
  const { writePlan, preflight: preflightArtifact } = artifacts();
  const out = prepareBrowserProductionApply(writePlan, preflightArtifact);
  assert.equal(out.totals.ready, 1);
  assert.equal(out.rows[0].observation.offer_id, 'offer-r1');
  assert.equal(out.rows[0].observation.metadata.idempotency_key.length, 64);
});

test('checksum confirmation is exact and rejects before any database connection', () => {
  const planBytes = Buffer.from('plan');
  const preflightBytes = Buffer.from('preflight');
  assert.deepEqual(verifyApplyChecksums({ planBytes, preflightBytes, confirmPlanSha256: sha256(planBytes), confirmPreflightSha256: sha256(preflightBytes) }), { planSha256: sha256(planBytes), preflightSha256: sha256(preflightBytes) });
  assert.throws(() => verifyApplyChecksums({ planBytes, preflightBytes, confirmPlanSha256: 'wrong', confirmPreflightSha256: sha256(preflightBytes) }), /before any database connection/);
});

test('writer rejects unresolved preflight, preserve-only, non-positive price, and invalid identity', () => {
  const planRow = planned();
  assert.equal(validatePlannedWrite(planRow, preflight('r1', { status: 'missing_offer', offer_id: null })).valid, false);
  assert.equal(validatePlannedWrite({ ...planRow, decision: 'skipped' }, preflight()).valid, false);
  assert.equal(validatePlannedWrite(planned('r1', { proposed_observation: { ...planRow.proposed_observation, price_observation: { ...planRow.proposed_observation.price_observation, price: 0 } } }), preflight()).valid, false);
  assert.equal(validatePlannedWrite(planned('r1', { proposed_observation: { ...planRow.proposed_observation, price_observation: { ...planRow.proposed_observation.price_observation, metadata: { ...planRow.proposed_observation.price_observation.metadata, identity_valid: false } } } }), preflight()).valid, false);
});

test('Thomann preserve-only references never become writer-ready', () => {
  const rows = ['r2', 'r3', 'r4', 'r12'].map(reference => ({ reference, shop: 'Thomann', decision: 'skipped', proposed_observation: null }));
  const { writePlan, preflight: preflightArtifact } = artifacts(rows, []);
  const out = prepareBrowserProductionApply(writePlan, preflightArtifact);
  assert.deepEqual(out.totals, { ready: 0, rejected: 0, skipped: 4 });
});

test('component carts need complete verified evidence before becoming ready', () => {
  const row = planned();
  row.proposed_observation.price_observation.source_method = 'component_calc';
  row.proposed_observation.price_observation.metadata.pricing_kind = 'component_cart';
  row.proposed_observation.price_observation.metadata.component_evidence = [];
  assert.equal(prepareBrowserProductionApply(artifacts([row]).writePlan, artifacts([row]).preflight).totals.rejected, 1);
});

test('apply reports already_applied from the deterministic key without inserting', async () => {
  const prepared = prepareBrowserProductionApply(...Object.values(artifacts()));
  const observation = prepared.rows[0].observation;
  let inserts = 0;
  const out = await applyPreparedBrowserWrites(prepared, { findExisting: async () => [{ id: 'old', metadata: { idempotency_key: observation.metadata.idempotency_key } }], insertObservation: async () => { inserts += 1; } });
  assert.equal(out.rows[0].result, 'already_applied');
  assert.equal(inserts, 0);
});

test('apply uses insert only and isolates a failed reference', async () => {
  const { writePlan, preflight: preflightArtifact } = artifacts([planned('r1'), planned('r6')], [preflight('r1'), preflight('r6')]);
  const prepared = prepareBrowserProductionApply(writePlan, preflightArtifact);
  const out = await applyPreparedBrowserWrites(prepared, {
    findExisting: async () => [],
    insertObservation: async observation => {
      if (observation.offer_id === 'offer-r1') return { id: 'insert-r1' };
      const error = new Error('safe'); error.status = 500; throw error;
    }
  });
  assert.deepEqual(out.rows.map(row => row.result), ['inserted', 'failed']);
  assert.equal(out.totals.inserted, 1);
  assert.equal(out.totals.failed, 1);
});

test('idempotency key changes when the source evidence changes', () => {
  const observation = { observed_at: '2026-11-18T09:00:00Z', price: 100, source_method: 'browser', metadata: { source_url: 'https://shop.example/a', collector_method: 'browser_shadow_self_hosted' } };
  assert.notEqual(idempotencyKey({ offerId: 'offer-1', observation }), idempotencyKey({ offerId: 'offer-1', observation: { ...observation, price: 101 } }));
});

test('writer CLI defaults to dry-run, requires both confirmations for apply, and has no mutation route beyond price-observation POST', async () => {
  const source = await fs.readFile('scripts/apply-browser-production-writes.mjs', 'utf8');
  assert.match(source, /const apply = args\.includes\('--apply'\)/);
  assert.match(source, /confirm-plan-sha256/);
  assert.match(source, /confirm-preflight-sha256/);
  assert.match(source, /method: 'POST'/);
  assert.match(source, /price_observations/);
  assert.doesNotMatch(source, /method:\s*['"](?:PUT|PATCH|DELETE)['"]/);
  assert.doesNotMatch(source, /\/rpc\//);
});

test('--apply without both artifact confirmations aborts before credentials or writes are used', () => {
  const run = spawnSync(process.execPath, ['scripts/apply-browser-production-writes.mjs', '--apply'], { encoding: 'utf8' });
  assert.notEqual(run.status, 0);
  assert.match(run.stderr, /Artifact checksum confirmation failed before any database connection/);
  assert.doesNotMatch(run.stderr, /SUPABASE_URL and SUPABASE_SECRET_KEY/);
});
