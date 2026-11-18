const $ = selector => document.querySelector(selector);
const login = $('#login'), dashboard = $('#dashboard'), status = $('#status'), start = $('#start');
function showDashboard(user) { login.hidden = true; dashboard.hidden = false; $('#user').textContent = `${user.email} (${user.role})`; }
function showError(error) { $('#auth-error').textContent = error?.message || 'Anmeldung fehlgeschlagen'; }
function renderState(state) {
  start.disabled = Boolean(state.running);
  status.textContent = ({ idle: 'Bereit', ready: 'Bereit', authenticating: 'Anmeldung…', collecting_hotsound: 'Hot Sound wird geprüft…', collecting_thomann: 'Thomann wird geprüft…', building_plan: 'Preise werden validiert…', preflight: 'Sicherer Preflight…', writing: 'Verifizierte Preise werden gespeichert…', auditing: 'Ergebnis wird geprüft…', completed: 'Aktualisierung abgeschlossen', completed_with_warnings: 'Abgeschlossen – einzelne Preise wurden konserviert', failed: 'Aktualisierung fehlgeschlagen' })[state.phase] || 'Aktualisierung…';
  if (state.summary) { $('#result').hidden = false; $('#result').textContent = state.summary.dry_run ? `Modo prueba — no se modificaron precios. Preparados: ${state.summary.planned ?? 0} · Conservados: ${state.summary.preserved ?? 0}` : `Aktualisiert: ${state.summary.updated ?? 0} · Konserviert: ${state.summary.preserved ?? 0} · Prüfung: ${state.summary.manual_review ?? 0} · Fehler: ${state.summary.failures ?? 0}`; }
}
$('#sign-in').addEventListener('click', async () => { try { showDashboard(await window.priceUpdater.login($('#email').value, $('#password').value)); renderState(await window.priceUpdater.state()); } catch (error) { showError(error); } });
$('#sign-out').addEventListener('click', async () => { await window.priceUpdater.logout(); dashboard.hidden = true; login.hidden = false; });
start.addEventListener('click', async () => { try { const result = await window.priceUpdater.start($('#dry-run').checked); if (!result?.cancelled) renderState(await window.priceUpdater.state()); } catch (error) { status.textContent = 'Aktualisierung fehlgeschlagen'; } });
window.priceUpdater.onState(renderState); renderState(await window.priceUpdater.state());
