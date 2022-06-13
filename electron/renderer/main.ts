import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import FontAwesomeIcon from './FontAwesomeIcon'

const app = createApp(App)
app.component('FontAwesomeIcon', FontAwesomeIcon)
app.component('fa', FontAwesomeIcon)
app.use(ElementPlus)
app.mount('#app')
