import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('priceUpdater', {
  login: (email, password) => ipcRenderer.invoke('auth:login', { email, password }),
  logout: () => ipcRenderer.invoke('auth:logout'),
  state: () => ipcRenderer.invoke('updater:state'),
  start: () => ipcRenderer.invoke('updater:start'),
  onState: listener => { const handler = (_event, state) => listener(state); ipcRenderer.on('updater:state', handler); return () => ipcRenderer.removeListener('updater:state', handler); }
});
