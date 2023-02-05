import { ElMessage } from 'element-plus'
import { Socket } from 'socket.io-client'

const initActionSocket = (socket: Socket) => {
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
      window.api.showErrorBox(title, content).then(callback)
    }
  )

  socket.on(
    'Action:show-item-in-folder',
    ({ args: [fullPath] }: { args: [string] }, callback) => {
      window.api.showItemInFolder(fullPath).then(callback)
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
      window.api.openExternal(url, options).then(callback)
    }
  )

  socket.on(
    'Action:trash-item',
    ({ args: [path] }: { args: [string] }, callback) => {
      window.api.trashItem(path).then(callback)
    }
  )

  socket.on('Action:beep', (_: { args: [] }, callback) => {
    window.api.beep().then(callback)
  })

  initElMessageActions(socket)
}

const initElMessageActions = (socket: Socket) => {
  const TITLEBAR_HEIGHT = 30
  const DEFAULT_OFFSET = TITLEBAR_HEIGHT + 20

  socket.on(
    'Action:el-message',
    ({ args: [params] }: { args: [Record<any, any> | string] }, callback) => {
      // params is string
      if (typeof params === 'string') {
        ElMessage({
          message: params,
          offset: DEFAULT_OFFSET,
          onClose() {
            callback()
          }
        })
        return
      }
      ElMessage({
        ...params,
        offset: params.offset
          ? params.offset + TITLEBAR_HEIGHT
          : DEFAULT_OFFSET,
        onClose() {
          callback()
        }
      })
    }
  )

  socket.on(
    'Action:el-message.success',
    ({ args: [params] }: { args: [Record<any, any> | string] }, callback) => {
      // params is string
      if (typeof params === 'string') {
        ElMessage.success({
          message: params,
          offset: DEFAULT_OFFSET,
          onClose() {
            callback()
          }
        })
        return
      }
      ElMessage.success({
        ...params,
        offset: params.offset
          ? params.offset + TITLEBAR_HEIGHT
          : DEFAULT_OFFSET,
        onClose() {
          callback()
        }
      })
    }
  )

  socket.on(
    'Action:el-message.warning',
    ({ args: [params] }: { args: [Record<any, any> | string] }, callback) => {
      // params is string
      if (typeof params === 'string') {
        ElMessage.warning({
          message: params,
          offset: DEFAULT_OFFSET,
          onClose() {
            callback()
          }
        })
        return
      }
      ElMessage.warning({
        ...params,
        offset: params.offset
          ? params.offset + TITLEBAR_HEIGHT
          : DEFAULT_OFFSET,
        onClose() {
          callback()
        }
      })
    }
  )

  socket.on(
    'Action:el-message.info',
    ({ args: [params] }: { args: [Record<any, any> | string] }, callback) => {
      // params is string
      if (typeof params === 'string') {
        ElMessage.info({
          message: params,
          offset: DEFAULT_OFFSET,
          onClose() {
            callback()
          }
        })
        return
      }
      ElMessage.info({
        ...params,
        offset: params.offset
          ? params.offset + TITLEBAR_HEIGHT
          : DEFAULT_OFFSET,
        onClose() {
          callback()
        }
      })
    }
  )

  socket.on(
    'Action:el-message.error',
    ({ args: [params] }: { args: [Record<any, any> | string] }, callback) => {
      // params is string
      if (typeof params === 'string') {
        ElMessage.error({
          message: params,
          offset: DEFAULT_OFFSET,
          onClose() {
            callback()
          }
        })
        return
      }
      ElMessage.error({
        ...params,
        offset: params.offset
          ? params.offset + TITLEBAR_HEIGHT
          : DEFAULT_OFFSET,
        onClose() {
          callback()
        }
      })
    }
  )

  socket.on(
    'Action:el-message.close-all',
    ({
      args: [type_param]
    }: {
      args: ['success' | 'warning' | 'info' | 'error' | null]
    }) => {
      if (!type_param) {
        ElMessage.closeAll()
        return
      }
      ElMessage.closeAll(type_param)
    }
  )
}

export { initActionSocket }
