import { ref } from 'vue'
import { defineStore } from 'pinia'

export type AuthModalTab = 'login' | 'register'

export interface OpenAuthModalOptions {
  tab?: AuthModalTab
  redirectPath?: string
}

export const useAuthModalStore = defineStore('authModal', () => {
  const visible = ref(false)
  const activeTab = ref<AuthModalTab>('login')
  const redirectPath = ref<string>('')

  const open = (options: OpenAuthModalOptions = {}) => {
    if (options.tab) activeTab.value = options.tab
    if (typeof options.redirectPath === 'string') redirectPath.value = options.redirectPath
    visible.value = true
  }

  const close = () => {
    visible.value = false
  }

  const clearRedirect = () => {
    redirectPath.value = ''
  }

  return {
    visible,
    activeTab,
    redirectPath,
    open,
    close,
    clearRedirect
  }
})
