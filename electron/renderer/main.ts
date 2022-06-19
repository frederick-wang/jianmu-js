import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import JianmuApp from './JianmuApp.vue'
import FontAwesomeIcon from './FontAwesomeIcon'

const jianmuApp = createApp(JianmuApp)
jianmuApp.component('FontAwesomeIcon', FontAwesomeIcon)
jianmuApp.component('fa', FontAwesomeIcon)
jianmuApp.use(ElementPlus)
jianmuApp.mount('#jianmu-app')
