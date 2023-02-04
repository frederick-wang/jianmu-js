import { Socket } from 'socket.io-client'
import { nextTick, Ref, ref, watch } from 'vue'
import { initStatus } from '../pystat'
import { jsToSyncObject, syncObjectToJs } from '../sync'

let socket: Socket | null = null

const initPyvarSocket = (s: Socket) => {
  socket = s
}

const variableCache = new Map<string, Ref>()

const pyvar = <T = any>(name: string, deep = true) => {
  if (!socket) {
    throw new Error('Socket is not initialized!')
  }
  if (!variableCache.has(name)) {
    const variable = ref<T>()
    variableCache.set(name, variable)
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
        if (!socket) {
          throw new Error('Socket is not initialized!')
        }
        setSyncStatusToSynced()
        socket.emit(JS_SYNCED_WITH_PY)
      })
    }

    const push_js_to_py = () => {
      if (!socket) {
        throw new Error('Socket is not initialized!')
      }
      console.log(
        name,
        'push_js_to_py',
        'isSynced.value:',
        isSynced.value,
        'variable.value:',
        variable.value
      )
      if (isSynced.value) {
        if (variable.value === undefined) {
          setSyncStatusToSyncing()
          socket.emit(PUSH_JS_TO_PY, { data: null })
          return
        }
        jsToSyncObject(variable.value as any).then((data) => {
          if (!socket) {
            throw new Error('Socket is not initialized!')
          }
          setSyncStatusToSyncing()
          socket.emit(PUSH_JS_TO_PY, { data })
        })
      }
    }

    socket.on(PUSH_PY_TO_JS, syncJsWithPy)
    socket.on(PY_SYNCED_WITH_JS, setSyncStatusToSynced)

    setTimeout(() => {
      /**
       * NOTE: 用同步语句创建的侦听器，会自动绑定到宿主组件实例上，并且会在宿主组件卸载时自动停止。
       * 我们希望始终保持同步，因此不需要自动停止侦听器。
       * 不必担心内存泄露，因为所有 Python 中的响应式变量都是单例的，不会被重复创建。
       * @see https://cn.vuejs.org/guide/essentials/watchers.html#stopping-a-watcher
       */
      watch(variable, push_js_to_py, { deep })
    }, 0)

    socket.emit(GET_PY_VALUE)
  }

  return variableCache.get(name) as Ref<T>
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

export { pyvar, pyvars, initPyvarSocket }
