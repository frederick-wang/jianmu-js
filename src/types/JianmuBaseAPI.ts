import {
  OpenDialogOptions,
  OpenDialogReturnValue,
  SaveDialogOptions,
  SaveDialogReturnValue
} from 'electron'
import PythonResponse from './PythonResponse'

type JianmuBaseAPI = {
  minimize: () => void
  isMaximized: () => Promise<boolean>
  toggleMaximize: () => void
  close: () => void
  toggleDevtools: () => void
  reload: () => void
  forceReload: () => void
  quit: () => void
  invokePython: <T = any>(
    method: string,
    ...args: any[]
  ) => Promise<PythonResponse<T>>
  showOpenDialog: (options: OpenDialogOptions) => Promise<OpenDialogReturnValue>
  showSaveDialog: (options: SaveDialogOptions) => Promise<SaveDialogReturnValue>
}

export default JianmuBaseAPI
