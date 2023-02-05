import { initActionSocket } from './action'
import * as jianmuAPI from './api'
import { pyfunc, pyfuncs } from './pyfunc'
import { pystat } from './pystat'
import { initPyvarSocket, pyvar, pyvars } from './pyvar'
import { getSocket } from './sock'

/**
 * Warning: This function is only for internal use.
 * If you want to use it, please make sure you know what you are doing.
 */
const __initJianmu = () => {
  const s = getSocket()
  initActionSocket(s)
  initPyvarSocket(s)
}

__initJianmu()

type JianmuAPI = typeof jianmuAPI

const api: JianmuAPI = jianmuAPI

export { api, JianmuAPI, pyfunc, pyvar, pyvars, pyfuncs, pystat }

export default {
  api,
  pyfunc,
  pyvar,
  pyvars,
  pyfuncs,
  pystat
}
