import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAuthModalStore, type AuthModalTab } from '@/stores/authModal'

export interface EnsureAuthOptions {
  tab?: AuthModalTab
  redirectPath?: string
}

/**
 * 统一鉴权入口：未登录则打开全局登录弹窗，并返回 false。
 */
export function useRequireAuth() {
  const route = useRoute()
  const userStore = useUserStore()
  const authModalStore = useAuthModalStore()

  const ensureAuth = (options: EnsureAuthOptions = {}): boolean => {
    if (userStore.isLoggedIn()) return true

    authModalStore.open({
      tab: options.tab ?? 'login',
      redirectPath: options.redirectPath ?? route.fullPath
    })
    return false
  }

  return { ensureAuth }
}
