import { io } from 'socket.io-client'
import { nextTick, Ref, ref, watch } from 'vue'
import { jsToSyncObject, syncObjectToJs } from '../sync'

const socket = io('ws://localhost:19020')

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

export { pystat, pyvar, pyvars }
