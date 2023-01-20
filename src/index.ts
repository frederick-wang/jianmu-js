import * as jianmuAPI from './api'
import { invokePython, pyfunc, pyfuncs } from './pyfunc'
import { pyvar, pyvars } from './pyvar'
import { pystat } from './pystat'

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

export default { api }
