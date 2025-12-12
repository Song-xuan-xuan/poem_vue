import type { MockHandler } from '../types'
import { parseToken } from './auth'

// Mock 收藏数据
interface MockCollect {
  collect_id: string
  user_id: number
  work_id: string
  collect_time: string
  work_info: {
    id: string
    title: string
    content: string
    publish_time: string
    like_count: number
    collect_count: number
    styles: string[]
  }
}

const mockCollects: MockCollect[] = [
  {
    collect_id: 'collect_001',
    user_id: 1,
    work_id: 'work_001',
    collect_time: '2025-12-07T10:30:00',
    work_info: {
      id: 'work_001',
      title: '唐代诗歌赏析',
      content: '唐诗是中国古典文学的瑰宝，代表了中国诗歌创作的最高成就。以李白、杜甫为代表的唐代诗人，创作了无数流传千古的佳作。',
      publish_time: '2025-12-06T15:45:00',
      like_count: 25,
      collect_count: 10,
      styles: ['文学', '诗歌']
    }
  },
  {
    collect_id: 'collect_002',
    user_id: 1,
    work_id: 'work_002',
    collect_time: '2025-12-07T09:15:00',
    work_info: {
      id: 'work_002',
      title: '宋词精选',
      content: '宋词以其婉约的风格著称，苏轼、辛弃疾、李清照等词人各具特色，为中国文学增添了无数瑰宝。',
      publish_time: '2025-12-05T14:20:00',
      like_count: 18,
      collect_count: 8,
      styles: ['文学', '诗歌']
    }
  },
  {
    collect_id: 'collect_003',
    user_id: 1,
    work_id: 'work_003',
    collect_time: '2025-12-06T16:20:00',
    work_info: {
      id: 'work_003',
      title: '李白诗歌风格浅析',
      content: '李白的诗歌以豪放飘逸著称，想象丰富，语言流畅自然，被誉为"诗仙"。',
      publish_time: '2025-12-04T10:15:00',
      like_count: 32,
      collect_count: 15,
      styles: ['文学', '诗歌', '名家']
    }
  },
  {
    collect_id: 'collect_004',
    user_id: 1,
    work_id: 'work_004',
    collect_time: '2025-12-06T14:10:00',
    work_info: {
      id: 'work_004',
      title: '静夜思的意境美',
      content: '《静夜思》是李白的代表作之一，短短二十字，却描绘出了游子思乡的深情。',
      publish_time: '2025-12-03T08:30:00',
      like_count: 45,
      collect_count: 20,
      styles: ['文学', '诗歌', '赏析']
    }
  },
  {
    collect_id: 'collect_005',
    user_id: 1,
    work_id: 'work_005',
    collect_time: '2025-12-05T11:45:00',
    work_info: {
      id: 'work_005',
      title: '杜甫的忧国情怀',
      content: '杜甫被称为"诗圣"，他的诗歌深刻反映了唐代社会的动荡和人民的疾苦。',
      publish_time: '2025-12-02T16:00:00',
      like_count: 28,
      collect_count: 12,
      styles: ['文学', '诗歌', '名家']
    }
  },
  {
    collect_id: 'collect_006',
    user_id: 2,
    work_id: 'work_006',
    collect_time: '2025-12-05T09:30:00',
    work_info: {
      id: 'work_006',
      title: '春晓的意境',
      content: '孟浩然的《春晓》清新自然，描绘了春天早晨的美好景色。',
      publish_time: '2025-12-01T12:20:00',
      like_count: 20,
      collect_count: 9,
      styles: ['文学', '诗歌', '赏析']
    }
  },
  {
    collect_id: 'collect_007',
    user_id: 1,
    work_id: 'work_007',
    collect_time: '2025-12-04T15:20:00',
    work_info: {
      id: 'work_007',
      title: '边塞诗的豪情',
      content: '边塞诗是唐代诗歌的重要组成部分，展现了戍边将士的豪迈气概。',
      publish_time: '2025-11-30T14:45:00',
      like_count: 22,
      collect_count: 11,
      styles: ['文学', '诗歌', '主题']
    }
  },
  {
    collect_id: 'collect_008',
    user_id: 1,
    work_id: 'work_008',
    collect_time: '2025-12-03T10:15:00',
    work_info: {
      id: 'work_008',
      title: '送别诗的情感',
      content: '送别诗表达了离别之情，王维、李白等诗人的送别诗各具特色。',
      publish_time: '2025-11-29T09:30:00',
      like_count: 19,
      collect_count: 7,
      styles: ['文学', '诗歌', '主题']
    }
  },
  {
    collect_id: 'collect_009',
    user_id: 1,
    work_id: 'work_009',
    collect_time: '2025-12-02T14:40:00',
    work_info: {
      id: 'work_009',
      title: '山水诗的韵味',
      content: '山水诗描绘自然景色，王维、孟浩然是山水诗的代表诗人。',
      publish_time: '2025-11-28T11:00:00',
      like_count: 24,
      collect_count: 10,
      styles: ['文学', '诗歌', '主题']
    }
  },
  {
    collect_id: 'collect_010',
    user_id: 1,
    work_id: 'work_010',
    collect_time: '2025-12-01T08:25:00',
    work_info: {
      id: 'work_010',
      title: '思乡诗的情怀',
      content: '思乡诗表达了游子对故乡的思念，《静夜思》《九月九日忆山东兄弟》都是代表作。',
      publish_time: '2025-11-27T15:30:00',
      like_count: 30,
      collect_count: 14,
      styles: ['文学', '诗歌', '主题']
    }
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

export const favoriteHandlers: MockHandler[] = [
  // GET /api/collect/list - 查询收藏列表
  {
    url: '/api/collect/list',
    method: 'GET',
    response: (config) => {
      const userId = validateTokenAndGetUserId(config.headers?.Authorization)
      if (!userId) {
        return {
          status: 401,
          data: { code: 401, message: '认证失败，请重新登录', data: [] }
        }
      }

      const page = parseInt(config.params?.page || '1')
      const title = config.params?.title || ''
      const pageSize = 10

      // 筛选当前用户的收藏
      let userCollects = mockCollects.filter(c => c.user_id === userId)

      // 标题模糊查询
      if (title) {
        userCollects = userCollects.filter(c =>
          c.work_info.title.toLowerCase().includes(title.toLowerCase())
        )
      }

      const total = userCollects.length
      const totalPages = Math.ceil(total / pageSize)
      const start = (page - 1) * pageSize
      const end = start + pageSize

      const items = userCollects.slice(start, end)

      let message = '收藏列表查询成功'
      if (items.length === 0 && title) {
        message = '暂无匹配的收藏内容'
      } else if (items.length === 0) {
        message = '当前页无收藏内容'
      }

      return {
        status: 200,
        data: {
          code: 200,
          message,
          data: {
            items,
            page,
            page_size: pageSize,
            total,
            total_pages: totalPages
          }
        }
      }
    }
  },

  // DELETE /api/collect/:id - 取消收藏
  {
    url: '/api/collect/:id',
    method: 'DELETE',
    response: (config) => {
      const userId = validateTokenAndGetUserId(config.headers?.Authorization)
      if (!userId) {
        return {
          status: 401,
          data: { code: 401, message: '认证失败，请重新登录', data: [] }
        }
      }

      const collectId = config.params?.id
      const collectIndex = mockCollects.findIndex(
        c => c.collect_id === collectId && c.user_id === userId
      )

      if (collectIndex === -1) {
        return {
          status: 404,
          data: { code: 404, message: '收藏记录不存在或你无权限取消', data: [] }
        }
      }

      // 删除收藏记录
      const collect = mockCollects[collectIndex]
      const workId = collect.work_id
      mockCollects.splice(collectIndex, 1)

      // 更新帖子的收藏计数
      const newCollectCount = Math.max(0, collect.work_info.collect_count - 1)

      return {
        status: 200,
        data: {
          code: 200,
          message: '取消收藏成功',
          data: {
            collect_id: collectId,
            work_id: workId,
            new_collect_count: newCollectCount
          }
        }
      }
    }
  }
]
