import ElementPlus from 'element-plus'
import { createApp } from 'vue'
import FontAwesomeIcon from './FontAwesomeIcon'
import JianmuApp from './JianmuApp.vue'
import './styles/tailwind.css'
// Element-UI 的样式必须在 Tailwind 的样式之后引入，否则会被覆盖
import 'element-plus/dist/index.css'

const jianmuApp = createApp(JianmuApp)
jianmuApp.component('FontAwesomeIcon', FontAwesomeIcon)
jianmuApp.component('fa', FontAwesomeIcon)
jianmuApp.use(ElementPlus)
jianmuApp.mount('#jianmu-app')
