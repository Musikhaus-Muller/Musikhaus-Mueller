const TRANSITIONS = Object.freeze({
  idle: ['authenticating', 'ready'], authenticating: ['ready', 'failed'], ready: ['collecting_hotsound', 'idle'],
  collecting_hotsound: ['collecting_thomann', 'failed'], collecting_thomann: ['building_plan', 'failed'],
  building_plan: ['preflight', 'failed'], preflight: ['writing', 'failed'], writing: ['auditing', 'failed'],
  auditing: ['completed', 'completed_with_warnings', 'failed'], completed: ['ready'], completed_with_warnings: ['ready'], failed: ['ready']
});

export function createUpdateState(onChange = () => {}) {
  let state = { phase: 'idle', running: false, detail: null, summary: null };
  const set = patch => { state = { ...state, ...patch }; onChange(state); return state; };
  return {
    get: () => state,
    move(phase, detail = null) {
      if (!TRANSITIONS[state.phase]?.includes(phase)) throw new Error(`Invalid updater transition ${state.phase} -> ${phase}`);
      return set({ phase, running: !['idle', 'ready', 'completed', 'completed_with_warnings', 'failed'].includes(phase), detail });
    },
    ready: () => set({ phase: 'ready', running: false, detail: null }),
    fail: error => set({ phase: 'failed', running: false, detail: 'Update could not be completed', error: String(error?.message || error) }),
    complete: (summary, warnings = false) => set({ phase: warnings ? 'completed_with_warnings' : 'completed', running: false, detail: null, summary })
  };
}
