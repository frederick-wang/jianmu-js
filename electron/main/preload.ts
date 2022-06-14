import {
  contextBridge,
  ipcRenderer,
  OpenDialogOptions,
  OpenDialogReturnValue,
  OpenExternalOptions,
  SaveDialogOptions,
  SaveDialogReturnValue
} from 'electron'
import PythonResponse from './types/PythonResponse'

const api = {
  minimize: () => ipcRenderer.send('minimize'),
  isMaximized: () => ipcRenderer.invoke('is-maximized') as Promise<boolean>,
  toggleMaximize: () => ipcRenderer.send('toggle-maximize'),
  close: () => ipcRenderer.send('close'),
  toggleDevtools: () => ipcRenderer.send('toggle-devtools'),
  reload: () => ipcRenderer.send('reload'),
  forceReload: () => ipcRenderer.send('force-reload'),
  quit: () => ipcRenderer.send('quit'),
  requestPython: <T = any>(method: string, ...args: any[]) =>
    ipcRenderer.invoke('request-python', method, ...args) as Promise<
      PythonResponse<T>
    >,
  showOpenDialog: (options: OpenDialogOptions) =>
    ipcRenderer.invoke(
      'show-open-dialog',
      options
    ) as Promise<OpenDialogReturnValue>,
  showSaveDialog: (options: SaveDialogOptions) =>
    ipcRenderer.invoke(
      'show-save-dialog',
      options
    ) as Promise<SaveDialogReturnValue>,
  openExternal: (url: string, options?: OpenExternalOptions) =>
    ipcRenderer.invoke('open-external', url, options) as Promise<void>
}

contextBridge.exposeInMainWorld('api', api)

export { api }
