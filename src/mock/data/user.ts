import type { MockHandler } from '../types'
import { mockUsers, parseToken, generateRandomName } from './auth'

// Mock 用户诗词数据
const mockUserPoems = [
  {
    userId: 2,
    poems: [
      {
        id: 101,
        title: '静夜思赏析',
        publish_time: '2024-01-15 10:30:00',
        like_count: 45,
        collect_count: 12
      },
      {
        id: 102,
        title: '李白的浪漫主义',
        publish_time: '2024-01-10 08:20:00',
        like_count: 38,
        collect_count: 8
      },
      {
        id: 103,
        title: '将进酒深度解读',
        publish_time: '2024-01-05 14:15:00',
        like_count: 52,
        collect_count: 18
      }
    ]
  }
]

// 获取用户的诗词列表
function getUserPoems(userId: number) {
  const userPoem = mockUserPoems.find(up => up.userId === userId)
  return userPoem?.poems || []
}

// 从 Authorization 头中提取 Token
function extractToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

// 网名格式验证
function validateName(name: string): string | null {
  if (name.length < 2 || name.length > 20) {
    return '网名长度必须为2-20位'
  }
  if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(name)) {
    return '网名仅支持中文、数字、字母、下划线'
  }
  return null
}

// 密码格式验证
function validatePassword(password: string): string | null {
  if (!/^[a-zA-Z0-9_]{6,18}$/.test(password)) {
    return '新密码必须为6-18位，且仅包含数字、字母、下划线'
  }
  return null
}

export const userHandlers: MockHandler[] = [
  // GET /api/user/info - 查询当前用户信息
  {
    url: '/api/user/info',
    method: 'GET',
    response: (config) => {
      const token = extractToken(config.headers?.Authorization)
      if (!token) {
        return {
          status: 401,
          data: { code: 401, message: '无效的token!', data: [] }
        }
      }

      const userId = parseToken(token)
      const user = mockUsers.find(u => u.id === userId)
      if (!user) {
        return {
          status: 401,
          data: { code: 401, message: '无效的token!', data: [] }
        }
      }

      return {
        status: 200,
        data: {
          code: 200,
          message: '查询成功',
          data: {
            id: user.id,
            username: user.username,
            name: user.name,
            photo_url: user.photo_url,
            exp: user.exp,
            level: user.level
          }
        }
      }
    }
  },

  // GET /api/user/info/:id - 查询用户主页
  {
    url: '/api/user/info/:id',
    method: 'GET',
    response: (config) => {
      const token = extractToken(config.headers?.Authorization)
      if (!token) {
        return {
          status: 401,
          data: { code: 401, message: '无效的token!', data: [] }
        }
      }

      // 验证 Token 有效性
      const currentUserId = parseToken(token)
      if (!currentUserId || !mockUsers.find(u => u.id === currentUserId)) {
        return {
          status: 401,
          data: { code: 401, message: '无效的token!', data: [] }
        }
      }

      // 获取路径参数中的用户 ID
      const targetUserId = parseInt(config.params?.id || '0')
      const targetUser = mockUsers.find(u => u.id === targetUserId)
      if (!targetUser) {
        return {
          status: 404,
          data: { code: 404, message: '用户不存在', data: [] }
        }
      }

      // 获取用户的诗词作品
      const poems = getUserPoems(targetUserId)

      return {
        status: 200,
        data: {
          code: 200,
          message: '查询成功',
          data: {
            username: targetUser.username,
            name: targetUser.name,
            photo_url: targetUser.photo_url,
            exp: targetUser.exp,
            level: targetUser.level,
            poems,
            poem_count: poems.length
          }
        }
      }
    }
  },

  // PUT /api/user/name - 修改网名
  {
    url: '/api/user/name',
    method: 'PUT',
    response: (config) => {
      const token = extractToken(config.headers?.Authorization)
      if (!token) {
        return {
          status: 401,
          data: { code: 401, message: '无效的token!', data: [] }
        }
      }

      const userId = parseToken(token)
      const user = mockUsers.find(u => u.id === userId)
      if (!user) {
        return {
          status: 401,
          data: { code: 401, message: '无效的token!', data: [] }
        }
      }

      const { new_name } = JSON.parse(config.data || '{}')

      // 验证网名格式
      const nameError = validateName(new_name)
      if (nameError) {
        return {
          status: 400,
          data: { code: 400, message: nameError, data: [] }
        }
      }

      // 检查网名是否已被占用
      if (mockUsers.find(u => u.id !== userId && u.name === new_name)) {
        return {
          status: 400,
          data: { code: 400, message: '该网名已被占用，请更换', data: [] }
        }
      }

      // 更新网名
      user.name = new_name

      return {
        status: 200,
        data: {
          code: 200,
          message: '网名修改成功',
          data: { name: new_name }
        }
      }
    }
  },

  // PUT /api/user/avatar - 上传头像
  {
    url: '/api/user/avatar',
    method: 'PUT',
    response: (config) => {
      const token = extractToken(config.headers?.Authorization)
      if (!token) {
        return {
          status: 401,
          data: { code: 401, message: '无效的token!', data: [] }
        }
      }

      const userId = parseToken(token)
      const user = mockUsers.find(u => u.id === userId)
      if (!user) {
        return {
          status: 401,
          data: { code: 401, message: '无效的token!', data: [] }
        }
      }

      // Mock 文件上传，生成新的头像 URL
      const mockPhotoUrl = `https://math-qa-photos.oss-cn-beijing.aliyuncs.com/avatars/${userId}/${generateRandomName()}.png`
      user.photo_url = mockPhotoUrl

      return {
        status: 200,
        data: {
          code: 200,
          message: '头像上传成功',
          data: { photo_url: mockPhotoUrl }
        }
      }
    }
  },

  // PUT /api/user/password - 修改密码
  {
    url: '/api/user/password',
    method: 'PUT',
    response: (config) => {
      const token = extractToken(config.headers?.Authorization)
      if (!token) {
        return {
          status: 401,
          data: { code: 401, message: '无效的token!', data: [] }
        }
      }

      const userId = parseToken(token)
      const user = mockUsers.find(u => u.id === userId)
      if (!user) {
        return {
          status: 401,
          data: { code: 401, message: '无效的token!', data: [] }
        }
      }

      const { old_password, new_password } = JSON.parse(config.data || '{}')

      // 验证旧密码
      if (user.password !== old_password) {
        return {
          status: 401,
          data: { code: 401, message: '旧密码错误', data: [] }
        }
      }

      // 验证新密码格式
      const passwordError = validatePassword(new_password)
      if (passwordError) {
        return {
          status: 400,
          data: { code: 400, message: passwordError, data: [] }
        }
      }

      // 检查新旧密码是否相同
      if (old_password === new_password) {
        return {
          status: 400,
          data: { code: 400, message: '新密码不能与旧密码一致', data: [] }
        }
      }

      // 更新密码
      user.password = new_password

      return {
        status: 200,
        data: {
          code: 200,
          message: '密码修改成功，请重新登录',
          data: null
        }
      }
    }
  }
]
