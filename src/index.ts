import { ElMessage } from 'element-plus'
import { io } from 'socket.io-client'
import { nextTick, Ref, ref, watch } from 'vue'
import * as jianmuAPI from './api'
import { jsToSyncObject, syncObjectToJs } from './sync'

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

const pyvar = <T = any>(name: string, deep = true) => {
  const variable = ref<T>()
  const isSyncing = ref(false)
  syncStatusTable.set(variable, isSyncing)
  const eventName = `pyvar_${name}`
  socket.on(eventName, ({ data }: { data: T }) => {
    isSyncing.value = false
    variable.value = syncObjectToJs(data as any) as any
    nextTick(() => {
      isSyncing.value = true
    })
  })
  socket.on(`${eventName}__synced`, () => {
    isSyncing.value = false
  })
  watch(
    variable,
    (val) => {
      if (!isSyncing.value) {
        if (val === undefined) {
          isSyncing.value = true
          socket.emit(eventName, { data: null })
        }
        jsToSyncObject(val as any).then((data) => {
          isSyncing.value = true
          socket.emit(eventName, { data })
        })
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
  {} as {
    [key: string]: Ref
  },
  {
    get: (target, name) => {
      return pyvar(name as string)
    }
  }
)

const pyfuncs = new Proxy(
  {} as {
    [key: string]: (...args: any[]) => Promise<any>
  },
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
