/**
 * Mock 数据入口
 * 负责初始化 Mock 系统
 */

import { createMockAdapter } from './adapter'
import type { MockHandler } from './types'

/**
 * 设置 Mock 系统
 * 在 main.ts 中调用
 */
export async function setupMock(): Promise<void> {
  console.log('[Mock] 正在初始化 Mock 系统...')
  
  // 获取环境变量配置
  const delay = Number(import.meta.env.VITE_MOCK_DELAY) || 500
  
  // Mock 处理器列表
  const handlers: MockHandler[] = []
  
  // 动态导入所有 Mock 模块
  // 示例数据（仅用于测试，生产环境可删除 _example.ts 并注释掉以下两行）
  // const { testHandlers } = await import('./data/_example')
  // handlers.push(...testHandlers)
  
  // 业务 Mock 数据
  const { authHandlers } = await import('./data/auth')
  const { userHandlers } = await import('./data/user')
  const { poemHandlers } = await import('./data/poem')
  const { favoriteHandlers } = await import('./data/favorite')
  const { workHandlers } = await import('./data/work')
  const { sessionHandlers } = await import('./data/session')
  const { chatHandlers } = await import('./data/chat')
  handlers.push(...authHandlers, ...userHandlers, ...poemHandlers, ...favoriteHandlers, ...workHandlers, ...sessionHandlers, ...chatHandlers)
  
  console.log(`[Mock] 已加载 ${handlers.length} 个 Mock 处理器`)
  console.log(`[Mock] 全局延迟: ${delay}ms`)
  
  // 应用 Mock Adapter
  const { service } = await import('@/utils/request')
  const mockAdapter = createMockAdapter(handlers, delay)
  service.defaults.adapter = mockAdapter
  
  console.log('[Mock] Mock 系统初始化完成')
}

/**
 * 导出类型供业务 Mock 使用
 */
export type { MockHandler } from './types'
