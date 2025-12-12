/**
 * Mock 数据示例
 * 用于测试 Mock 系统是否正常工作
 */

import type { MockHandler } from '../types'

/**
 * 测试 Mock Handlers
 * 可以删除此文件，这里仅作为示例
 */
export const testHandlers: MockHandler[] = [
  {
    url: '/api/test/hello',
    method: 'GET',
    response: () => {
      return {
        code: 200,
        message: 'Mock 系统工作正常！',
        data: {
          timestamp: Date.now(),
          message: 'Hello from Mock!'
        }
      }
    }
  },
  
  {
    url: '/api/test/user/:id',
    method: 'GET',
    response: (config) => {
      const { id } = config.params
      
      return {
        code: 200,
        message: '获取用户成功',
        data: {
          id,
          name: `User ${id}`,
          email: `user${id}@example.com`
        }
      }
    }
  }
]
