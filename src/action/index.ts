import { Socket } from 'socket.io-client'

let socket: Socket | null = null

const initActionSocket = (s: Socket) => {
  socket = s
  socket.on(
    'Action:show-open-dialog',
    ({ args: [options] }: { args: [Electron.OpenDialogOptions] }, callback) => {
      window.api.showOpenDialog(options).then(callback)
    }
  )

  socket.on(
    'Action:show-save-dialog',
    ({ args: [options] }: { args: [Electron.SaveDialogOptions] }, callback) => {
      window.api.showSaveDialog(options).then(callback)
    }
  )

  socket.on(
    'Action:show-message-box',
    ({ args: [options] }: { args: [Electron.MessageBoxOptions] }, callback) => {
      window.api.showMessageBox(options).then(callback)
    }
  )

  socket.on(
    'Action:show-error-box',
    ({ args: [title, content] }: { args: [string, string] }, callback) => {
      /**
       * NOTE: 对于 Promise<void>，会返回一个为 undefined 的参数，但还是有一个参数。
       * 所以要将其屏蔽掉。
       *
       * —— Wang Zhaoji 2023-02-04
       */
      window.api.showErrorBox(title, content).then(() => callback())
    }
  )

  socket.on(
    'Action:show-item-in-folder',
    ({ args: [fullPath] }: { args: [string] }, callback) => {
      window.api.showItemInFolder(fullPath).then(() => callback())
    }
  )

  socket.on(
    'Action:open-path',
    ({ args: [path] }: { args: [string] }, callback) => {
      window.api.openPath(path).then(callback)
    }
  )

  socket.on(
    'Action:open-external',
    (
      {
        args: [url, options]
      }: { args: [string, Electron.OpenExternalOptions] },
      callback
    ) => {
      window.api.openExternal(url, options).then(() => callback())
    }
  )

  socket.on(
    'Action:trash-item',
    ({ args: [path] }: { args: [string] }, callback) => {
      window.api.trashItem(path).then(() => callback())
    }
  )

  socket.on('Action:beep', (_: { args: [] }, callback) => {
    window.api.beep().then(() => callback())
  })
}

export { initActionSocket }
