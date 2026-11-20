import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAuthService, isAuthorized } from '../desktop/services/auth.mjs';

test('desktop auth accepts only root/admin app_metadata roles and persists no password', async () => {
  assert.equal(isAuthorized({ app_metadata: { role: 'ROOT' } }), true);
  assert.equal(isAuthorized({ app_metadata: { role: 'viewer' } }), false);
  let stored = null, signedOut = false;
  const client = { auth: {
    signInWithPassword: async () => ({ data: { session: { access_token: 'token', refresh_token: 'refresh' }, user: { email: 'admin@example.test', app_metadata: { role: 'admin' } } } }),
    signOut: async () => { signedOut = true; }, getUser: async () => ({ data: { user: { email: 'admin@example.test', app_metadata: { role: 'admin' } } } })
  } };
  const auth = createAuthService({ url: 'https://example.test', anonKey: 'public', client, sessionStore: { save: async value => { stored = value; }, clear: async () => {} } });
  assert.equal((await auth.signIn('admin@example.test', 'not-recorded')).role, 'admin');
  assert.equal(stored.access_token, 'token');
  await auth.signOut(); assert.equal(signedOut, true);
});

test('desktop auth signs unauthorized users out', async () => {
  let signedOut = false;
  const client = { auth: { signInWithPassword: async () => ({ data: { session: { access_token: 'x' }, user: { app_metadata: { role: 'viewer' } } } }), signOut: async () => { signedOut = true; } } };
  const auth = createAuthService({ url: 'https://example.test', anonKey: 'public', client });
  await assert.rejects(() => auth.signIn('x', 'y'), /not authorized/);
  assert.equal(signedOut, true);
});
