import type { MockHandler } from '../types'
import { parseToken } from './auth'

// Mock Session 数据结构
export interface MockSession {
  session_id: string
  user_id: number
  name: string
  create_time: number
}

// Mock 会话数据（按用户分组）
export const mockSessions: MockSession[] = [
  {
    session_id: '550e8400-e29b-41d4-a716-446655440000',
    user_id: 1,
    name: '唐诗鉴赏讨论',
    create_time: 1702780800.123456
  },
  {
    session_id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    user_id: 1,
    name: '李白诗歌研究',
    create_time: 1702694400.654321
  },
  {
    session_id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    user_id: 1,
    name: '诗词格律学习',
    create_time: 1702608000.987654
  },
  {
    session_id: '9b2fff9c-4ae0-4a09-a9de-5d8e8a30e7f5',
    user_id: 2,
    name: '宋词欣赏',
    create_time: 1702521600.456789
  }
]

// 从 Authorization 头中提取 Token
function extractToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

// 验证 Token 并返回用户 ID
function validateTokenAndGetUserId(authHeader?: string): number | null {
  const token = extractToken(authHeader)
  if (!token) return null
  return parseToken(token)
}

// 验证 UUID 格式
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export const sessionHandlers: MockHandler[] = [
  // POST /api/session/create - 创建会话
  {
    url: '/api/session/create',
    method: 'POST',
    response: (config) => {
      const userId = validateTokenAndGetUserId(config.headers?.Authorization)
      if (!userId) {
        return {
          status: 401,
          data: { code: 401, message: '认证失败，请重新登录', data: [] }
        }
      }

      const { session_id, name } = JSON.parse(config.data || '{}')

      // 验证会话名称
      if (!name || name.trim() === '') {
        return {
          status: 400,
          data: { code: 400, message: '会话名称不能为空', data: [] }
        }
      }

      // 验证 UUID 格式
      if (!isValidUUID(session_id)) {
        return {
          status: 400,
          data: { code: 400, message: '会话ID格式错误，必须为UUID格式', data: [] }
        }
      }

      // 检查会话 ID 是否已存在
      const existingSession = mockSessions.find(
        s => s.session_id === session_id && s.user_id === userId
      )
      if (existingSession) {
        return {
          status: 400,
          data: { code: 400, message: '会话ID已存在', data: [] }
        }
      }

      // 创建新会话
      const newSession: MockSession = {
        session_id,
        user_id: userId,
        name: name.trim(),
        create_time: Date.now() / 1000
      }
      mockSessions.unshift(newSession)

      return {
        status: 201,
        data: {
          code: 201,
          message: '创建会话成功',
          data: {
            session_id,
            name: name.trim()
          }
        }
      }
    }
  },

  // GET /api/session/list - 会话列表
  {
    url: '/api/session/list',
    method: 'GET',
    response: (config) => {
      const userId = validateTokenAndGetUserId(config.headers?.Authorization)
      if (!userId) {
        return {
          status: 401,
          data: { code: 401, message: '认证失败，请重新登录', data: [] }
        }
      }

      // 筛选当前用户的会话，按创建时间降序排列
      const userSessions = mockSessions
        .filter(s => s.user_id === userId)
        .sort((a, b) => b.create_time - a.create_time)
        .map(s => ({
          session_id: s.session_id,
          name: s.name,
          create_time: s.create_time
        }))

      return {
        status: 200,
        data: {
          code: 200,
          message: '获取会话列表成功',
          data: userSessions
        }
      }
    }
  },

  // PUT /api/session/rename - 重命名会话
  {
    url: '/api/session/rename',
    method: 'PUT',
    response: (config) => {
      const userId = validateTokenAndGetUserId(config.headers?.Authorization)
      if (!userId) {
        return {
          status: 401,
          data: { code: 401, message: '认证失败，请重新登录', data: [] }
        }
      }

      const { session_id, name } = JSON.parse(config.data || '{}')

      // 验证会话名称
      if (!name || name.trim() === '') {
        return {
          status: 400,
          data: { code: 400, message: '会话名不能为空', data: [] }
        }
      }

      // 查找会话
      const session = mockSessions.find(
        s => s.session_id === session_id && s.user_id === userId
      )

      if (!session) {
        return {
          status: 404,
          data: { code: 404, message: '会话不存在', data: [] }
        }
      }

      // 更新会话名称
      session.name = name.trim()

      return {
        status: 200,
        data: {
          code: 200,
          message: '重命名会话成功',
          data: {
            session_id,
            new_name: name.trim()
          }
        }
      }
    }
  },

  // DELETE /api/session/delete/:id - 删除会话
  {
    url: '/api/session/delete/:id',
    method: 'DELETE',
    response: (config) => {
      const userId = validateTokenAndGetUserId(config.headers?.Authorization)
      if (!userId) {
        return {
          status: 401,
          data: { code: 401, message: '认证失败，请重新登录', data: [] }
        }
      }

      const sessionId = config.params?.id

      // 查找会话索引
      const sessionIndex = mockSessions.findIndex(
        s => s.session_id === sessionId && s.user_id === userId
      )

      if (sessionIndex === -1) {
        return {
          status: 404,
          data: { code: 404, message: '会话不存在', data: [] }
        }
      }

      // 删除会话
      mockSessions.splice(sessionIndex, 1)

      // 同时删除该会话下的所有 QA 记录
      // 注意：使用延迟导入避免循环依赖
      import('./chat').then(({ mockQAs }) => {
        const qaIndicesToDelete: number[] = []
        mockQAs.forEach((qa: any, index: number) => {
          if (qa.session_id === sessionId) {
            qaIndicesToDelete.push(index)
          }
        })
        // 从后往前删除，避免索引错乱
        qaIndicesToDelete.reverse().forEach(index => {
          mockQAs.splice(index, 1)
        })
      })

      return {
        status: 200,
        data: {
          code: 200,
          message: '删除会话成功',
          data: {
            session_id: sessionId
          }
        }
      }
    }
  }
]
