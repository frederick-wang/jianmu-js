import { ElMessage } from 'element-plus'
import { requestPython } from '../api'

/**
 * Invoke a Python Function in app.py
 *
 * @param command Python function name in app.py
 * @param args The arguments to pass to the function
 * @returns The return value of the function
 */
const invokePython = async <T = any>(command: string, ...args: any[]) => {
  const { error, message, data } = await requestPython<T>(command, ...args)
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

const pyfuncCache = new Map<string, (...args: any[]) => Promise<any>>()

const pyfunc = <T = any>(command: string) => {
  if (!pyfuncCache.has(command)) {
    const func = (...args: any[]) => invokePython<T>(command, ...args)
    pyfuncCache.set(command, func)
  }
  return pyfuncCache.get(command) as (...args: any[]) => Promise<T>
}

type PyfuncsType = Record<string, (...args: any[]) => Promise<any>> &
  ((moduleName?: string) => PyfuncsType)

const genGetHandler =
  (moduleName: string) => (target: PyfuncsType, name: string | symbol) => {
    if (typeof name !== 'string') {
      throw new Error('The name of python variable should be a string!')
    }
    return pyfunc(`${moduleName}.${name}`)
  }

const rawPyfuncs = (moduleName = 'app') =>
  new Proxy(rawPyfuncs as PyfuncsType, {
    get: genGetHandler(moduleName)
  })

const pyfuncs = new Proxy(rawPyfuncs as PyfuncsType, {
  get: genGetHandler('app')
})

export { pyfunc, pyfuncs }
