import { ElMessage } from 'element-plus'
import * as jianmuAPI from './api'
import { io } from 'socket.io-client'
import { Ref, ref, watch } from 'vue'

const socket = io('ws://localhost:19020')

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

const convert_file_object = (file: { raw: File }) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve({
        ...file,
        raw: {
          type: 'File',
          data: {
            lastModified: file.raw.lastModified.toString(),
            name: file.raw.name,
            base64: reader.result,
            path: file.raw.path,
            size: file.raw.size,
            type: file.raw.type,
            webkitRelativePath: file.raw.webkitRelativePath
          }
        }
      })
    }
    reader.onerror = (error) => {
      reject(error)
    }
    reader.readAsDataURL(file.raw)
  })

const pyfunc =
  <T = any>(command: string) =>
  (...args: any[]) =>
    invokePython<T>(command, ...args)

const syncStatusTable = new Map<Ref, Ref>()

const pystat = (variable: Ref) => {
  const stat = syncStatusTable.get(variable)
  if (stat) {
    return stat
  }
  throw new Error('Variable is not associated with a status ref.')
}

const pyvar = <T = any>(name: string, deep = false) => {
  const variable = ref<T>()
  const isSyncing = ref(false)
  syncStatusTable.set(variable, isSyncing)
  const eventName = `pyvar_${name}`
  socket.on(eventName, ({ data }: { data: T }) => {
    variable.value = data
  })
  socket.on(`${eventName}__synced`, () => {
    isSyncing.value = false
  })
  watch(
    variable,
    (val) => {
      if (!isSyncing.value) {
        if (Array.isArray(val) && val.every((v) => v.raw instanceof File)) {
          const lst = []
          for (const v of val) {
            lst.push(convert_file_object(v))
          }
          Promise.all(lst)
            .then((res) => {
              socket.emit(eventName, { data: res })
            })
            .finally(() => {
              isSyncing.value = true
            })
          return
        }
        socket.emit(eventName, { data: val })
        isSyncing.value = true
      }
    },
    { deep }
  )
  setTimeout(() => {
    socket.emit(`${eventName}__get`)
  }, 0)

  return variable
}

const pyvars = new Proxy(
  {},
  {
    get: (target, name) => {
      return pyvar(name as string)
    }
  }
)

const pyfuncs = new Proxy(
  {},
  {
    get: (target, name) => {
      return pyfunc(name as string)
    }
  }
)

/**
 * Alias for invokePython
 */
const ipy = invokePython

export {
  api,
  invokePython,
  ipy,
  JianmuAPI,
  pyfunc,
  pyvar,
  pyvars,
  pyfuncs,
  pystat
}

export default { api }
