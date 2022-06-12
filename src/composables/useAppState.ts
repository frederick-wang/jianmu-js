import { readonly, ref } from 'vue'

const { isMaximized: isMaximizedFunc } = window.api

const _isMaximized = ref(false)

function throttleEvent(type: string, name: string) {
  let running = false
  const func = () => {
    if (running) {
      return
    }
    running = true
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent(name))
      running = false
    })
  }
  window.addEventListener(type, func)
}
throttleEvent('resize', 'optimizedResize')
window.addEventListener('optimizedResize', async () => {
  _isMaximized.value = await isMaximizedFunc()
})
const isMaximized = readonly(_isMaximized)

const _isMenuActive = ref(false)
window.addEventListener('click', (e) => {
  const element = e.target as HTMLElement
  _isMenuActive.value = element.className === 'menubar-menu-title'
})
const isMenuActive = readonly(_isMenuActive)

export { isMaximized, isMenuActive }
