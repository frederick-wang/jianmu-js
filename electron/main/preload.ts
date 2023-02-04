import {
  contextBridge,
  ipcRenderer,
  MessageBoxOptions,
  MessageBoxReturnValue,
  OpenDialogOptions,
  OpenDialogReturnValue,
  OpenExternalOptions,
  SaveDialogOptions,
  SaveDialogReturnValue
} from 'electron'
import PythonResponse from './types/PythonResponse'

const platform = () => ipcRenderer.invoke('platform') as Promise<string>
// platform.isMac = async () => (await platform()) === 'darwin'
// platform.isWindows = async () => (await platform()) === 'win32'
// platform.isLinux = async () => (await platform()) === 'linux'

const api = {
  os: { platform },
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
  showMessageBox: (options: MessageBoxOptions) =>
    ipcRenderer.invoke(
      'show-message-box',
      options
    ) as Promise<MessageBoxReturnValue>,
  showErrorBox: (title: string, content: string) =>
    ipcRenderer.invoke('show-error-box', title, content) as Promise<void>,
  showItemInFolder: (fullPath: string) =>
    ipcRenderer.invoke('show-item-in-folder', fullPath) as Promise<void>,
  openPath: (path: string) =>
    ipcRenderer.invoke('open-path', path) as Promise<string>,
  openExternal: (url: string, options?: OpenExternalOptions) =>
    ipcRenderer.invoke('open-external', url, options) as Promise<void>,
  trashItem: (path: string) =>
    ipcRenderer.invoke('trash-item', path) as Promise<void>,
  beep: () => ipcRenderer.invoke('beep') as Promise<void>,
  checkHeartbeat: () =>
    ipcRenderer.invoke('check-heartbeat') as Promise<boolean>
}

contextBridge.exposeInMainWorld('api', api)

export { api }
