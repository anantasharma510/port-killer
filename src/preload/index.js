import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getPorts: () => ipcRenderer.invoke('get-ports'),
  getPorts: () => ipcRenderer.invoke('get-ports'),
  killPort: (pid) => ipcRenderer.invoke('kill-port', pid),
  getParentPid: (pid) => ipcRenderer.invoke('get-parent-pid', pid),
  restartAsAdmin: () => ipcRenderer.send('restart-as-admin')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
