import { isMaximized, isMenuActive } from './composables/useAppState'

const {
  close,
  minimize,
  toggleDevtools: openDevtools,
  toggleMaximize,
  reload,
  forceReload,
  quit,
  requestPython,
  showOpenDialog,
  showSaveDialog
} = window.api

export {
  isMaximized,
  isMenuActive,
  requestPython,
  close,
  minimize,
  openDevtools,
  toggleMaximize,
  reload,
  forceReload,
  quit,
  showOpenDialog,
  showSaveDialog
}
