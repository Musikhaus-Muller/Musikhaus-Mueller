import { app, BrowserWindow, dialog, ipcMain, safeStorage } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAuthService } from './services/auth.mjs';
import { createLocalPipeline } from './services/local-pipeline.mjs';
import { runPriceUpdate } from './services/price-update-runner.mjs';
import { createUpdateState } from './services/update-state.mjs';
import { locateChromium } from './services/browser-runtime.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = app.isPackaged ? path.join(process.resourcesPath, 'app.asar.unpacked') : path.resolve(here, '..');
let mainWindow;
const sanitize = value => String(value || '').replace(/Bearer\s+[^\s]+|eyJ[a-zA-Z0-9._-]+/g, '[redacted]').slice(0, 500);
const logPath = () => path.join(app.getPath('userData'), 'price-updater.log');
async function log(event) { await fs.appendFile(logPath(), `${new Date().toISOString()} ${JSON.stringify({ ...event, error: sanitize(event.error) })}\n`).catch(() => {}); }
function sessionStore() {
  const file = () => path.join(app.getPath('userData'), 'session.bin');
  return {
    async load() { try { const encrypted = await fs.readFile(file()); return JSON.parse(safeStorage.decryptString(encrypted)); } catch { return null; } },
    async save(session) { if (!safeStorage.isEncryptionAvailable()) { await log({ phase: 'session', outcome: 'temporary_session', warning: 'safe_storage_unavailable' }); return; } await fs.writeFile(file(), safeStorage.encryptString(JSON.stringify({ access_token: session.access_token, refresh_token: session.refresh_token }))); },
    async clear() { await fs.rm(file(), { force: true }); }
  };
}
async function publicConfig() {
  let url = process.env.DESKTOP_SUPABASE_URL;
  let anonKey = process.env.DESKTOP_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    const configPath = app.isPackaged ? path.join(process.resourcesPath, 'app.asar', 'desktop', 'public-config.json') : path.join(root, 'desktop', 'public-config.json');
    const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
    url = config.supabaseUrl; anonKey = config.supabaseAnonKey;
  }
  if (!url || !anonKey) throw new Error('Set DESKTOP_SUPABASE_URL and DESKTOP_SUPABASE_ANON_KEY (public key only)');
  return { url, anonKey };
}

await app.whenReady();
const auth = createAuthService({ ...await publicConfig(), sessionStore: sessionStore() });
const state = createUpdateState(next => mainWindow?.webContents.send('updater:state', next));
const pipeline = createLocalPipeline({ root, auth, browserRuntime: () => locateChromium({ packaged: app.isPackaged, resourcesPath: process.resourcesPath, projectRoot: root }) });
mainWindow = new BrowserWindow({ width: 760, height: 600, webPreferences: { preload: path.join(here, 'preload.mjs'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
await mainWindow.loadFile(path.join(here, 'renderer', 'index.html'));
await auth.restore().then(user => { if (user) state.ready(); });
if (process.env.DESKTOP_SMOKE_EXIT === '1') {
  try {
    const preloadReady = await mainWindow.webContents.executeJavaScript('Boolean(window.priceUpdater && window.priceUpdater.state)');
    if (!preloadReady || !safeStorage.isEncryptionAvailable()) throw new Error('packaged_smoke_failed');
    console.log(JSON.stringify({ packaged_smoke: 'ok' }));
    app.exit(0);
  } catch (error) { console.error('packaged_smoke_failed'); app.exit(1); }
}

ipcMain.handle('auth:login', async (_event, { email, password }) => { state.move('authenticating'); const user = await auth.signIn(email, password); state.ready(); await log({ phase: 'login', outcome: 'ok' }); return user; });
ipcMain.handle('auth:logout', async () => { await auth.signOut(); state.ready(); return true; });
ipcMain.handle('updater:state', () => state.get());
ipcMain.handle('updater:start', async () => {
  if (!await auth.currentUser()) throw new Error('Please sign in with an authorized account');
  if (state.get().running) throw new Error('An update is already running');
  const confirmation = await dialog.showMessageBox(mainWindow, { type: 'question', buttons: ['Cancel', 'Run dry-run'], defaultId: 0, message: 'Run a test update without changing prices?' });
  if (confirmation.response !== 1) return { cancelled: true };
  const result = await runPriceUpdate({ state, ...pipeline });
  await log({ phase: 'completed', outcome: 'ok', updated: result.updated, preserved: result.preserved });
  return result;
});
app.on('window-all-closed', () => app.quit());
