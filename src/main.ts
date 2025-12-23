import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import '@/styles/global.scss'

import App from './App.vue'
import router from './router'

/**
 * 初始化应用
 */
async function bootstrap() {

  const app = createApp(App)
  
  // 注册所有 Element Plus 图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
  
  app.use(createPinia())
  app.use(router)
  app.use(ElementPlus)
  
  app.mount('#app')
}

// 启动应用
bootstrap()
