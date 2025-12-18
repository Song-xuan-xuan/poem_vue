import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'
import type { Result } from '@/api/type'

// 扩展 axios config 类型，添加跳过刷新标记
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    skipAuthRefresh?: boolean
  }
}

/**
 * 双端口微服务 Axios 实例封装
 * - bizService (8000): 常规业务（权限、用户、诗歌、帖子/创作社区、收藏夹管理）
 * - aiService (8001): AI 业务（会话、对话、AI 问答）
 */

// 是否正在刷新 Token（全局共享）
let isRefreshing = false
// 存储待重试的请求（全局共享）
let requestQueue: Array<(token: string) => void> = []

// 基础配置
const BASE_CONFIG = {
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
}

// 创建业务服务实例（8000 端口）
const bizService: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_1 || 'http://localhost:8000',
  ...BASE_CONFIG
})

// 创建 AI 服务实例（8001 端口）
const aiService: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_2 || 'http://localhost:8001',
  ...BASE_CONFIG
})

/**
 * 通用拦截器安装函数
 * @param instance Axios 实例
 */
function attachInterceptors(instance: AxiosInstance) {
  // ========== 请求拦截器 ==========
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const userStore = useUserStore()
      
      // 如果有 Token，添加到请求头
      if (userStore.accessToken) {
        config.headers.Authorization = `Bearer ${userStore.accessToken}`
      }

      // 如果是 FormData 上传，移除默认的 JSON 头，让浏览器自动带 boundary
      if (config.data instanceof FormData && config.headers) {
        delete (config.headers as any)['Content-Type']
        delete (config.headers as any)['content-type']
      }
      
      return config
    },
    (error) => {
      console.error('请求错误:', error)
      return Promise.reject(error)
    }
  )

  // ========== 响应拦截器 ==========
  instance.interceptors.response.use(
    (response: AxiosResponse<Result>) => {
      // 直接返回 data
      return response.data as any
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
      
      // ========== 处理 401 错误（Token 失效）==========
      if (status === 401) {
        // 如果请求已标记跳过刷新逻辑，直接登出
        if (config.skipAuthRefresh) {
          ElMessage.error('登录已过期，请重新登录')
          userStore.logout()
          return Promise.reject(error)
        }
        
        // 尝试刷新 Token
        if (!isRefreshing && userStore.refreshToken) {
          isRefreshing = true
          
          try {
            // 固定使用 bizService 调用刷新接口（认证在 8000 端口）
            const refreshResponse: any = await bizService.post(
              '/api/auth/refresh',
              { refresh_token: userStore.refreshToken },
              { skipAuthRefresh: true } as any // 标记跳过刷新逻辑，避免递归
            )
            
            if (refreshResponse.code === 200) {
              const tokenData = refreshResponse.data
              
              // 更新 Token
              userStore.setTokens(tokenData)
              
              // 重试所有待处理的请求（来自 8000 或 8001 的请求都会重放）
              requestQueue.forEach(callback => callback(tokenData.access_token))
              requestQueue = []
              
              // 重试当前请求
              if (config.headers) {
                config.headers.Authorization = `Bearer ${tokenData.access_token}`
              }
              return instance(config)
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
              resolve(instance(config))
            })
          })
        } else {
          // 没有 refresh_token，直接跳转登录
          ElMessage.error('请先登录')
          router.push('/auth/login')
          return Promise.reject(error)
        }
      }
      
      // ========== 处理其他错误状态码 ==========
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
}

// 为两个实例安装拦截器
attachInterceptors(bizService)
attachInterceptors(aiService)

/**
 * 请求方法工厂函数
 */
function createRequestMethods(service: AxiosInstance) {
  return {
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
}

// ========== 导出业务服务请求方法（8000 端口）==========
export const requestBiz = createRequestMethods(bizService)

// ========== 导出 AI 服务请求方法（8001 端口）==========
export const requestAI = createRequestMethods(aiService)

// ========== 默认导出（向后兼容，使用业务服务）==========
export const request = requestBiz
export const service = bizService

// 导出实例（供 Mock 系统使用）
export { bizService, aiService }
export default bizService
