import { createClient } from '@supabase/supabase-js';

const ALLOWED_ROLES = new Set(['root', 'admin']);
export function roleFor(user) { return String(user?.app_metadata?.role || '').trim().toLowerCase(); }
export function isAuthorized(user) { return ALLOWED_ROLES.has(roleFor(user)); }

export function createAuthService({ url, anonKey, client = null, sessionStore = null }) {
  if (!url || !anonKey) throw new Error('Desktop Supabase public configuration is missing');
  const supabase = client || createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: true, detectSessionInUrl: false } });
  let session = null;
  return {
    async signIn(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session) throw new Error('Invalid email or password');
      if (!isAuthorized(data.user)) { await supabase.auth.signOut(); throw new Error('Your account is not authorized to update prices'); }
      session = data.session;
      await sessionStore?.save?.(session);
      return { email: data.user.email, role: roleFor(data.user) };
    },
    async signOut() { session = null; await sessionStore?.clear?.(); await supabase.auth.signOut(); },
    async restore() {
      const stored = await sessionStore?.load?.();
      if (!stored?.access_token || !stored?.refresh_token) return null;
      const { data, error } = await supabase.auth.setSession(stored);
      if (error || !data.session || !isAuthorized(data.user)) { await sessionStore?.clear?.(); return null; }
      session = data.session;
      return { email: data.user.email, role: roleFor(data.user) };
    },
    async currentUser() {
      if (!session) return null;
      const { data } = await supabase.auth.getUser(session.access_token);
      return data.user && isAuthorized(data.user) ? { email: data.user.email, role: roleFor(data.user) } : null;
    },
    accessToken: () => session?.access_token || null,
    invoke: (name, body) => supabase.functions.invoke(name, { body, headers: { Authorization: `Bearer ${session?.access_token || ''}` } })
  };
}
