import http from 'node:http';
import fs from 'node:fs/promises';

async function loadDotEnv() {
  try {
    const text = await fs.readFile('.env', 'utf8');
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const idx = line.indexOf('=');
      if (idx <= 0) continue;
      const key = line.slice(0, idx).trim();
      let value = line.slice(idx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
}

await loadDotEnv();

const code = await fs.readFile('dist/server/index.js', 'utf8');
const { default: worker } = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));

const env = {
  BUCKET: { get: async () => null },
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
};

http.createServer(async (req, res) => {
  try {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const request = new Request('http://127.0.0.1:8767' + req.url, {
      method: req.method,
      headers: req.headers,
      ...(chunks.length ? { body: Buffer.concat(chunks) } : {})
    });
    const out = await worker.fetch(request, env);
    res.writeHead(out.status, Object.fromEntries(out.headers));
    res.end(Buffer.from(await out.arrayBuffer()));
  } catch {
    res.writeHead(500);
    res.end('preview error');
  }
}).listen(8767, '127.0.0.1', () => {
  const source = env.SUPABASE_URL && (env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY)
    ? 'Supabase enabled'
    : 'snapshot fallback';
  console.log(`http://127.0.0.1:8767 · ${source}`);
});
