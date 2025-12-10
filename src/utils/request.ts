import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'
import type { Result } from '@/api/type'

/**
 * Axios 实例封装
 * 自动处理 Token、请求拦截、响应拦截和错误处理
 */

// 创建 Axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8080',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 是否正在刷新 Token
let isRefreshing = false
// 存储待重试的请求
let requestQueue: Array<(token: string) => void> = []

/**
 * 请求拦截器
 * 自动添加 Authorization Header
 */
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore()
    
    // 如果有 Token，添加到请求头
    if (userStore.accessToken) {
      config.headers.Authorization = `Bearer ${userStore.accessToken}`
    }
    
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 * 直接返回 data，处理全局错误
 */
service.interceptors.response.use(
  (response: AxiosResponse<Result>) => {
    const res = response.data
    
    // 直接返回 data
    return res as any
  },
  async (error) => {
    console.error('响应错误:', error)
    
    const { response, config } = error
    
    // 没有响应（网络错误）
    if (!response) {
      ElMessage.error('网络连接失败，请检查网络设置')
      return Promise.reject(error)
    }
    
    const { status, data } = response
    const userStore = useUserStore()
    
    // 处理 401 错误（Token 失效）
    if (status === 401) {
      // 如果是刷新 Token 接口失败，直接登出
      if (config.url?.includes('/api/auth/refresh')) {
        ElMessage.error('登录已过期，请重新登录')
        userStore.logout()
        return Promise.reject(error)
      }
      
      // 尝试刷新 Token
      if (!isRefreshing && userStore.refreshToken) {
        isRefreshing = true
        
        try {
          // 调用刷新 Token 接口
          const refreshResponse = await axios.post(
            `${import.meta.env.VITE_API_BASE}/api/auth/refresh`,
            { refresh_token: userStore.refreshToken }
          )
          
          if (refreshResponse.data.code === 200) {
            const tokenData = refreshResponse.data.data
            
            // 更新 Token
            userStore.setTokens(tokenData)
            
            // 重试所有待处理的请求
            requestQueue.forEach(callback => callback(tokenData.access_token))
            requestQueue = []
            
            // 重试当前请求
            if (config.headers) {
              config.headers.Authorization = `Bearer ${tokenData.access_token}`
            }
            return service(config)
          } else {
            throw new Error('刷新 Token 失败')
          }
        } catch (refreshError) {
          // 刷新失败，清除用户数据并跳转登录
          ElMessage.error('登录已过期，请重新登录')
          userStore.logout()
          
          // 清空待处理请求
          requestQueue = []
          
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      } else if (isRefreshing) {
        // 如果正在刷新 Token，将请求加入队列
        return new Promise((resolve) => {
          requestQueue.push((token: string) => {
            if (config.headers) {
              config.headers.Authorization = `Bearer ${token}`
            }
            resolve(service(config))
          })
        })
      } else {
        // 没有 refresh_token，直接跳转登录
        ElMessage.error('请先登录')
        router.push('/auth/login')
        return Promise.reject(error)
      }
    }
    
    // 处理其他错误状态码
    const errorMessage = data?.message || '请求失败，请稍后重试'
    
    switch (status) {
      case 400:
        ElMessage.error(errorMessage)
        break
      case 403:
        ElMessage.error('没有权限访问该资源')
        break
      case 404:
        ElMessage.error('请求的资源不存在')
        break
      case 500:
        ElMessage.error('服务器错误，请稍后重试')
        break
      default:
        ElMessage.error(errorMessage)
    }
    
    return Promise.reject(error)
  }
)

/**
 * 封装请求方法
 */
export const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<Result<T>> {
    return service.get(url, config)
  },
  
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<Result<T>> {
    return service.post(url, data, config)
  },
  
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<Result<T>> {
    return service.put(url, data, config)
  },
  
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<Result<T>> {
    return service.delete(url, config)
  }
}

export default service
