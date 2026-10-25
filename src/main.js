import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { locale } from './lib/i18n'
import './styles/main.css'

// 首屏就把 <html lang> 与当前界面语言对齐
document.documentElement.lang = locale.value

createApp(App).use(router).mount('#app')
