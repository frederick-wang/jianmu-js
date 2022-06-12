import { isMaximized, isMenuActive } from './composables/useAppState'
import { ElMessage } from 'element-plus'

const {
  close,
  minimize,
  toggleDevtools: openDevtools,
  toggleMaximize,
  reload,
  forceReload,
  quit,
  invokePython: invokePythonHandler,
  showOpenDialog,
  showSaveDialog
} = window.api

const invokePython = async <T = any>(command: string, ...args: any[]) => {
  const { error, message, data } = await invokePythonHandler<T>(
    command,
    ...args
  )
  const type = error ? 'error' : 'success'
  if (message) {
    ElMessage({ message, type })
  } else {
    const messageText = error
      ? `Run ${command} failed`
      : `Run ${command} success`
    console.log(messageText)
  }
  return data
}

export {
  isMaximized,
  isMenuActive,
  invokePython,
  close,
  minimize,
  openDevtools,
  toggleMaximize,
  reload,
  forceReload,
  quit,
  showOpenDialog,
  showSaveDialog
}
