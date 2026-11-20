import fs from 'node:fs/promises';
const url = process.env.DESKTOP_SUPABASE_URL, anonKey = process.env.DESKTOP_SUPABASE_ANON_KEY;
if (!url || !anonKey) throw new Error('DESKTOP_SUPABASE_URL and DESKTOP_SUPABASE_ANON_KEY are required for a distributable build');
if (/service|secret/i.test(anonKey)) throw new Error('Only the public Supabase anon/publishable key may be packaged');
await fs.writeFile('desktop/public-config.json', JSON.stringify({ supabaseUrl: url, supabaseAnonKey: anonKey }, null, 2) + '\n');
