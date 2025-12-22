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
  // 检查是否启用 Mock
  const useMock = import.meta.env.VITE_USE_MOCK === 'true'
  
  if (useMock) {
    console.log('[App] Mock 模式已启用')
    const { setupMock } = await import('./mock')
    await setupMock()
  } else {
    console.log('[App] 使用真实 API')
  }
  
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
