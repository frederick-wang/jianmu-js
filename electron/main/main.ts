import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  MessageBoxOptions,
  OpenDialogOptions,
  OpenExternalOptions,
  SaveDialogOptions,
  shell
} from 'electron'
import { join } from 'path'
import got from 'got'
import { dialog } from 'electron'
import os from 'os'

// Menu.setApplicationMenu(null)

let mainWindow: BrowserWindow | null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    frame: false,
    icon: join(__dirname, 'static/icon.png'),
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  if (process.env.NODE_ENV === 'development') {
    const rendererPort = process.argv[2]
    mainWindow.loadURL(`http://localhost:${rendererPort}`)
  } else {
    mainWindow.loadFile(join(app.getAppPath(), 'renderer', 'index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', function () {
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }
  app.quit()
})

ipcMain.on('minimize', () => {
  mainWindow?.minimize()
})

ipcMain.handle('is-maximized', () => mainWindow?.isMaximized())

ipcMain.on('toggle-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.on('close', () => {
  mainWindow?.close()
})

ipcMain.on('toggle-devtools', () => {
  if (process.env.NODE_ENV === 'development') {
    mainWindow?.webContents.toggleDevTools()
  }
})

ipcMain.on('reload', () => {
  mainWindow?.reload()
})

ipcMain.on('force-reload', () => {
  mainWindow?.webContents.reloadIgnoringCache()
})

ipcMain.on('quit', () => {
  app.quit()
})

ipcMain.handle('request-python', async (_, method: string, ...args: any[]) => {
  if (!method) {
    throw new Error('No method provided')
  }
  const url = `http://localhost:19020/api/${method}`
  try {
    const res = await got
      .post(url, {
        json: args
      })
      .json()
    return res
  } catch (e: any) {
    return {
      error: 1,
      message: e.message,
      data: null
    }
  }
})

ipcMain.handle('show-open-dialog', (_, options: OpenDialogOptions) => {
  if (mainWindow) {
    return dialog.showOpenDialog(mainWindow, options)
  }
})

ipcMain.handle('show-save-dialog', (_, options: SaveDialogOptions) => {
  if (mainWindow) {
    return dialog.showSaveDialog(mainWindow, options)
  }
})

ipcMain.handle('show-message-box', (_, options: MessageBoxOptions) => {
  if (mainWindow) {
    return dialog.showMessageBox(mainWindow, options)
  }
})

ipcMain.handle('show-error-box', (_, title: string, content: string) => {
  if (mainWindow) {
    return dialog.showErrorBox(title, content)
  }
})

ipcMain.handle('show-item-in-folder', (_, fullPath: string) =>
  shell.showItemInFolder(fullPath)
)

ipcMain.handle('open-path', (_, path: string) => shell.openPath(path))

ipcMain.handle(
  'open-external',
  (_, url: string, options?: OpenExternalOptions) =>
    shell.openExternal(url, options)
)

ipcMain.handle('trash-item', (_, path: string) => shell.trashItem(path))

ipcMain.handle('beep', () => shell.beep())

ipcMain.handle('platform', () => os.platform())

ipcMain.handle('check-heartbeat', async () => {
  try {
    const res = await got.get(
      'http://localhost:19020/__jianmu_api__/heartbeat',
      {
        timeout: 1000
      }
    )
    return res.statusCode === 200
  } catch {
    return false
  }
})
