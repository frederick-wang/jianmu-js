import * as jianmuAPI from './api'
import { invokePython, pyfunc, pyfuncs } from './pyfunc'
import { pystat } from './pystat'
import { pyvar, pyvars, initPyvarSocket } from './pyvar'
import { initActionSocket } from './action'
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

export default {
  api,
  invokePython,
  ipy,
  pyfunc,
  pyvar,
  pyvars,
  pyfuncs,
  pystat
}
