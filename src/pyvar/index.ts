import { io } from 'socket.io-client'
import { nextTick, Ref, ref, watch } from 'vue'
import { jsToSyncObject, syncObjectToJs } from '../sync'
import { initStatus } from '../pystat'

const socket = io('ws://localhost:19020')

const pyvar = <T = any>(name: string, deep = true) => {
  const variable = ref<T>()
  const eventName = `pyvar_${name}`
  const GET_PY_VALUE = `${eventName}__get_py_value`
  const PUSH_PY_TO_JS = `${eventName}__push_py_to_js`
  const PUSH_JS_TO_PY = `${eventName}__push_js_to_py`
  const PY_SYNCED_WITH_JS = `${eventName}__py_synced_with_js`
  const JS_SYNCED_WITH_PY = `${eventName}__js_synced_with_py`

  const { isSynced, setSyncStatusToSynced, setSyncStatusToSyncing } =
    initStatus(variable)

  const syncJsWithPy = ({ data }: { data: T }) => {
    setSyncStatusToSyncing()
    variable.value = syncObjectToJs(data as any) as any
    nextTick(() => {
      setSyncStatusToSynced()
      socket.emit(JS_SYNCED_WITH_PY)
    })
  }

  const push_js_to_py = () => {
    if (isSynced.value) {
      if (variable.value === undefined) {
        setSyncStatusToSyncing()
        socket.emit(PUSH_JS_TO_PY, { data: null })
        return
      }
      jsToSyncObject(variable.value as any).then((data) => {
        setSyncStatusToSyncing()
        socket.emit(PUSH_JS_TO_PY, { data })
      })
    }
  }

  socket.on(PUSH_PY_TO_JS, syncJsWithPy)
  socket.on(PY_SYNCED_WITH_JS, setSyncStatusToSynced)

  watch(variable, push_js_to_py, { deep })

  socket.emit(GET_PY_VALUE)

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

export { pyvar, pyvars }
