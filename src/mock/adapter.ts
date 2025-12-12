/**
 * Mock Axios Adapter
 * 拦截 Axios 请求，匹配到 Mock Handler 则返回 Mock 数据，否则透传到真实请求
 */

import type { AxiosAdapter, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import type { MockHandler, PathParams } from './types'

/**
 * 解析路径参数
 * @param pattern 路径模式，如 /api/user/:id
 * @param path 实际路径，如 /api/user/123
 * @returns 参数对象 { id: '123' } 或 null（不匹配）
 */
function matchPath(pattern: string, path: string): PathParams | null {
  // 移除查询参数
  const cleanPath = path.split('?')[0]
  
  // 将模式转换为正则表达式
  const paramNames: string[] = []
  const regexPattern = pattern
    .replace(/:[^/]+/g, (match) => {
      paramNames.push(match.slice(1)) // 去掉 :
      return '([^/]+)'
    })
    .replace(/\//g, '\\/')
  
  const regex = new RegExp(`^${regexPattern}$`)
  const match = cleanPath.match(regex)
  
  if (!match) return null
  
  const params: PathParams = {}
  paramNames.forEach((name, index) => {
    params[name] = match[index + 1]
  })
  
  return params
}

/**
 * 创建 Mock Adapter
 * @param handlers Mock 处理器列表
 * @param globalDelay 全局延迟时间（毫秒）
 * @returns Axios Adapter
 */
export function createMockAdapter(
  handlers: MockHandler[],
  globalDelay: number = 0
): AxiosAdapter {
  // 获取默认的 Axios Adapter（用于透传真实请求）
  const defaultAdapter = axios.defaults.adapter as AxiosAdapter
  
  return (config: AxiosRequestConfig): Promise<AxiosResponse> => {
    const method = (config.method?.toUpperCase() || 'GET') as MockHandler['method']
    const url = config.url || ''
    
    // 查找匹配的 Handler
    const handler = handlers.find((h) => {
      if (h.method !== method) return false
      return matchPath(h.url, url) !== null
    })
    
    // 如果没有匹配的 Handler，透传到真实请求
    if (!handler) {
      console.log(`[Mock] Passthrough: ${method} ${url}`)
      return defaultAdapter(config as InternalAxiosRequestConfig)
    }
    
    // 解析路径参数并注入到 config 中
    const pathParams = matchPath(handler.url, url)
    if (pathParams) {
      config.params = { ...config.params, ...pathParams }
    }
    
    // 使用 Mock 数据
    console.log(`[Mock] Matched: ${method} ${url}`)
    
    return new Promise((resolve, reject) => {
      const delay = handler.delay ?? globalDelay
      
      setTimeout(() => {
        try {
          // 调用 response 函数生成响应数据
          const responseData = handler.response(config)
          
          // 检测是否为流式响应（Chat SSE）
          if (responseData?.data?.stream === true) {
            const fullContent = responseData.data.full_content || ''
            const sessionId = responseData.data.session_id
            const questionId = responseData.data.question_id
            
            // 分片内容（每 20 个字符一段）
            const chunkSize = 20
            const chunks: string[] = []
            for (let i = 0; i < fullContent.length; i += chunkSize) {
              chunks.push(fullContent.slice(i, i + chunkSize))
            }
            
            let currentChunk = 0
            let accumulatedContent = ''
            
            // 使用 setInterval 模拟流式推送
            const interval = setInterval(() => {
              if (currentChunk < chunks.length) {
                accumulatedContent += chunks[currentChunk]
                
                // 构造分片数据
                const chunkData = JSON.stringify({
                  code: 200,
                  data: {
                    content: chunks[currentChunk],
                    final: false
                  }
                })
                
                // 通过 onDownloadProgress 回调推送数据
                if (config.onDownloadProgress) {
                  const progressEvent = new ProgressEvent('progress', {
                    lengthComputable: true,
                    loaded: accumulatedContent.length,
                    total: fullContent.length
                  })
                  config.onDownloadProgress({
                    loaded: accumulatedContent.length,
                    total: fullContent.length,
                    bytes: accumulatedContent.length,
                    lengthComputable: true,
                    event: progressEvent
                  })
                }
                
                currentChunk++
              } else {
                // 所有分片发送完毕，发送最终响应
                clearInterval(interval)
                
                const finalData = JSON.stringify({
                  code: 200,
                  data: {
                    final: true,
                    full_content: fullContent,
                    session_id: sessionId,
                    question_id: questionId
                  }
                })
                
                // 构造最终响应
                const response: AxiosResponse = {
                  data: {
                    code: 200,
                    data: {
                      full_content: fullContent,
                      session_id: sessionId,
                      question_id: questionId
                    }
                  },
                  status: 200,
                  statusText: 'OK',
                  headers: {
                    'content-type': 'text/event-stream'
                  },
                  config: config as InternalAxiosRequestConfig,
                  request: {}
                }
                
                resolve(response)
              }
            }, 100) // 每 100ms 推送一段
            
            return
          }
          
          // 非流式响应，正常返回
          const response: AxiosResponse = {
            data: responseData.data || responseData,  // 提取 data 字段
            status: responseData.status || 200,
            statusText: 'OK',
            headers: {
              'content-type': 'application/json'
            },
            config: config as InternalAxiosRequestConfig,
            request: {}
          }
          
          resolve(response)
        } catch (error) {
          reject(error)
        }
      }, delay)
    })
  }
}
