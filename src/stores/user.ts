import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { getUserInfo } from '@/api/user'
import type { UserProfileData, TokenData } from '@/api/type'

const decodeJwtPayload = (token: string): any | null => {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null

    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const json = atob(padded)
    return JSON.parse(json)
  } catch {
    return null
  }
}

/**
 * 用户状态管理 Store (Setup Store 写法)
 * 管理用户登录状态、Token 和用户信息
 */
export const useUserStore = defineStore('user', () => {
  // ==================== State ====================
  const accessToken = ref<string>('')
  const refreshToken = ref<string>('')
  // /api/user/info 现在返回“当前用户信息（含作品）”
  const userInfo = ref<UserProfileData | null>(null)

  // ==================== Actions ====================
  
  /**
   * 初始化：从 localStorage 读取持久化数据
   */
  const initStore = () => {
    const savedAccessToken = localStorage.getItem('access_token')
    const savedRefreshToken = localStorage.getItem('refresh_token')
    const savedUserInfo = localStorage.getItem('user_info')

    if (savedAccessToken) {
      accessToken.value = savedAccessToken
    }
    if (savedRefreshToken) {
      refreshToken.value = savedRefreshToken
    }
    if (savedUserInfo) {
      try {
        userInfo.value = JSON.parse(savedUserInfo)
      } catch (e) {
        console.error('解析用户信息失败:', e)
        localStorage.removeItem('user_info')
      }
    }
  }

  /**
   * 设置 Tokens (保存令牌并持久化到 localStorage)
   */
  const setTokens = (tokenData: TokenData) => {
    accessToken.value = tokenData.access_token
    refreshToken.value = tokenData.refresh_token
    
    // 持久化到 localStorage
    localStorage.setItem('access_token', tokenData.access_token)
    localStorage.setItem('refresh_token', tokenData.refresh_token)
  }

  /**
   * 设置用户信息
   */
  const setUserInfo = (info: UserProfileData) => {
    userInfo.value = info
    
    // 持久化到 localStorage
    localStorage.setItem('user_info', JSON.stringify(info))
  }

  /**
   * 获取用户详情 (调用用户详情接口更新 State)
   */
  const fetchProfile = async (): Promise<boolean> => {
    try {
      const res = await getUserInfo()
      
      if (res.code === 200 && res.data) {
        setUserInfo(res.data)
        return true
      } else {
        ElMessage.error(res.message || '获取用户信息失败')
        return false
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      ElMessage.error('获取用户信息失败')
      return false
    }
  }

  /**
   * 登出 (清除状态和 LocalStorage，重置路由)
   */
  const logout = () => {
    // 清除状态
    accessToken.value = ''
    refreshToken.value = ''
    userInfo.value = null
    
    // 清除 localStorage
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_info')
    
    // 回到首页（登录改为全局弹窗触发）
    router.push('/')
    
    ElMessage.success('已退出登录')
  }

  /**
   * 检查是否已登录
   */
  const isLoggedIn = (): boolean => {
    return !!accessToken.value
  }

  /**
   * 当前用户ID（从 access_token 的 JWT payload 解析）
   *
   * 说明：/api/user/info 不返回 user_id，因此不能依赖 userInfo.id。
   * 这里兼容不同后端字段命名（user_id / id / uid / sub）。
   */
  const currentUserId = computed<string | number | null>(() => {
    if (!accessToken.value) return null
    const payload = decodeJwtPayload(accessToken.value)
    if (!payload) return null

    return (
      payload.user_id ??
      payload.userId ??
      payload.uid ??
      payload.id ??
      payload.sub ??
      null
    )
  })

  // 初始化 store
  initStore()

  // ==================== Return ====================
  return {
    // State
    accessToken,
    refreshToken,
    userInfo,
    
    // Actions
    setTokens,
    setUserInfo,
    fetchProfile,
    logout,
    isLoggedIn,
    currentUserId
  }
})
