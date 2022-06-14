import { isMaximized, isMenuActive } from './composables/useAppState'

const {
  close,
  minimize,
  toggleDevtools,
  toggleMaximize,
  reload,
  forceReload,
  quit,
  requestPython,
  showOpenDialog,
  showSaveDialog
} = window.api

/**
 * Open the given external protocol URL in the desktop's default manner. (For
 * example, mailto: URLs in the user's default mail agent).
 *
 * @param url Max 2081 characters on windows.
 * @param options OpenExternalOptions
 *
 * @see {@link https://www.electronjs.org/docs/latest/api/shell#shellopenexternalurl-options}
 */
const openExternal = window.api.openExternal

export {
  isMaximized,
  isMenuActive,
  requestPython,
  close,
  minimize,
  toggleDevtools,
  toggleMaximize,
  reload,
  forceReload,
  quit,
  showOpenDialog,
  showSaveDialog,
  openExternal
}
