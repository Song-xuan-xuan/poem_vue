/**
 * Mock 数据类型定义
 */

import type { AxiosRequestConfig } from 'axios'

/**
 * Mock 处理器接口
 */
export interface MockHandler {
  /** 匹配的 URL 路径（支持路径参数，如 /api/user/:id） */
  url: string
  /** HTTP 方法 */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  /** 响应生成函数 */
  response: (config: AxiosRequestConfig) => any
  /** 延迟时间（毫秒），可选，覆盖全局延迟 */
  delay?: number
}

/**
 * Mock 配置
 */
export interface MockConfig {
  /** 是否启用 Mock */
  enabled: boolean
  /** 全局延迟时间（毫秒） */
  delay: number
  /** Mock 处理器列表 */
  handlers: MockHandler[]
}

/**
 * 路径参数匹配结果
 */
export interface PathParams {
  [key: string]: string
}
