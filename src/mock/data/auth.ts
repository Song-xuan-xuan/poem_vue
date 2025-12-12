import type { MockHandler } from '../types'

// Mock 用户数据库
interface MockUser {
  id: number
  username: string
  password: string
  name: string
  photo_url: string
  exp: number
  level: string
}

const mockUsers: MockUser[] = [
  {
    id: 1,
    username: 'test01',
    password: '123456',
    name: '诗仙爱好者',
    photo_url: 'https://math-qa-photos.oss-cn-beijing.aliyuncs.com/default-photo.png',
    exp: 0,
    level: '小白'
  },
  {
    id: 2,
    username: 'test02',
    password: '123456',
    name: '李白粉丝',
    photo_url: 'https://math-qa-photos.oss-cn-beijing.aliyuncs.com/default-photo.png',
    exp: 22,
    level: '诗童'
  }
]

// 生成随机网名
function generateRandomName(): string {
  return Math.random().toString(36).substring(2, 12)
}

// 生成模拟 JWT Token（简化格式）
function generateToken(userId: number): string {
  // 使用简单格式：mock_token_<userId>
  return `mock_token_${userId}`
}

// 从 Token 中解析用户 ID（Mock 版本）
function parseToken(token: string): number | null {
  // 支持两种格式：
  // 1. 新格式：mock_token_<userId>
  if (token.startsWith('mock_token_')) {
    const userId = parseInt(token.replace('mock_token_', ''))
    return isNaN(userId) ? null : userId
  }
  
  // 2. 旧格式（JWT）：兼容处理
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1]))
    return payload.user_id || null
  } catch {
    return null
  }
}

// 用户名格式验证
function validateUsername(username: string): string | null {
  if (!/^[a-zA-Z0-9_]{6,18}$/.test(username)) {
    return '账号格式错误（6-18位，仅数字、字母、下划线）'
  }
  return null
}

// 密码格式验证
function validatePassword(password: string): string | null {
  if (!/^[a-zA-Z0-9_]{6,18}$/.test(password)) {
    return '密码格式错误（6-18位，仅数字、字母、下划线）'
  }
  return null
}

export const authHandlers: MockHandler[] = [
  // POST /api/auth/register
  {
    url: '/api/auth/register',
    method: 'POST',
    response: (config) => {
      const { username, password } = JSON.parse(config.data || '{}')

      // 验证用户名格式
      const usernameError = validateUsername(username)
      if (usernameError) {
        return {
          status: 400,
          data: { code: 400, message: usernameError, data: [] }
        }
      }

      // 验证密码格式
      const passwordError = validatePassword(password)
      if (passwordError) {
        return {
          status: 400,
          data: { code: 400, message: passwordError, data: [] }
        }
      }

      // 检查用户名是否已存在
      if (mockUsers.find(u => u.username === username)) {
        return {
          status: 400,
          data: { code: 400, message: '该账户已存在', data: [] }
        }
      }

      // 创建新用户
      const newUser: MockUser = {
        id: mockUsers.length + 1,
        username,
        password,
        name: generateRandomName(),
        photo_url: 'https://math-qa-photos.oss-cn-beijing.aliyuncs.com/default-photo.png',
        exp: 0,
        level: '小白'
      }
      mockUsers.push(newUser)

      return {
        status: 201,
        data: {
          code: 201,
          message: '用户注册成功',
          data: {
            id: newUser.id,
            username: newUser.username,
            name: newUser.name,
            photo_url: newUser.photo_url,
            exp: newUser.exp,
            level: newUser.level
          }
        }
      }
    }
  },

  // POST /api/auth/login
  {
    url: '/api/auth/login',
    method: 'POST',
    response: (config) => {
      const { username, password } = JSON.parse(config.data || '{}')

      // 查找用户
      const user = mockUsers.find(u => u.username === username && u.password === password)
      if (!user) {
        return {
          status: 401,
          data: { code: 401, message: '账号或密码错误', data: [] }
        }
      }

      // 生成 Token
      const accessToken = generateToken(user.id)
      const refreshToken = generateToken(user.id)

      return {
        status: 200,
        data: {
          code: 200,
          message: '登录成功',
          data: {
            access_token: accessToken,
            refresh_token: refreshToken,
            token_type: 'bearer'
          }
        }
      }
    }
  },

  // POST /api/auth/refresh
  {
    url: '/api/auth/refresh',
    method: 'POST',
    response: (config) => {
      const { refresh_token } = JSON.parse(config.data || '{}')

      // 验证 refresh_token
      const userId = parseToken(refresh_token)
      if (!userId || !mockUsers.find(u => u.id === userId)) {
        return {
          status: 401,
          data: { code: 401, message: '无效的刷新令牌', data: [] }
        }
      }

      // 生成新的 Token
      const newAccessToken = generateToken(userId)
      const newRefreshToken = generateToken(userId)

      return {
        status: 200,
        data: {
          code: 200,
          message: 'Token刷新成功',
          data: {
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
            token_type: 'bearer'
          }
        }
      }
    }
  }
]

// 导出辅助函数供 user.ts 使用
export { mockUsers, parseToken, generateRandomName }
