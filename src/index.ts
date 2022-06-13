import { ElMessage } from 'element-plus'
import * as jianmuAPI from './api'

type JianmuAPI = typeof jianmuAPI

const api: JianmuAPI = jianmuAPI

/**
 * Invoke a Python Function in app.py
 *
 * @param command Python function name in app.py
 * @param args The arguments to pass to the function
 * @returns The return value of the function
 */
const invokePython = async <T = any>(command: string, ...args: any[]) => {
  const { error, message, data } = await api.requestPython<T>(command, ...args)
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

/**
 * Alias for invokePython
 */
const ipy = invokePython

export { api, invokePython, ipy, JianmuAPI }

export default { api }
