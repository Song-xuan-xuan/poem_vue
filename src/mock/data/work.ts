import type { MockHandler } from '../types'
import { parseToken, mockUsers } from './auth'

// Mock 帖子数据结构
export interface MockWork {
  id: string
  title: string
  content: string
  user_id: number
  publish_time: number
  like_count: number
  collect_count: number
  styles: string[]
  comments: MockComment[]
}

// Mock 评论数据结构
export interface MockComment {
  comment_id: string
  user_id: number
  user_name: string
  content: string
  comment_time: number
}

// Mock 帖子数据（20 条）
export const mockWorks: MockWork[] = [
  {
    id: 'work_001',
    title: '唐诗中的月亮意象',
    content: '月亮在唐诗中是最常见的意象之一，代表着思乡、团圆、孤独等多重情感。李白的"举头望明月，低头思故乡"将月亮与思乡之情完美结合。',
    user_id: 1,
    publish_time: 1702780800,
    like_count: 45,
    collect_count: 15,
    styles: ['文学', '诗歌', '意象'],
    comments: [
      {
        comment_id: 'comment_001',
        user_id: 2,
        user_name: '李白粉丝',
        content: '写得非常深刻！月亮在古诗中确实有独特的地位。',
        comment_time: 1702784400
      },
      {
        comment_id: 'comment_002',
        user_id: 1,
        user_name: '诗仙爱好者',
        content: '杜甫的"露从今夜白，月是故乡明"也是经典。',
        comment_time: 1702788000
      }
    ]
  },
  {
    id: 'work_002',
    title: '李白诗歌的浪漫主义风格',
    content: '李白是盛唐浪漫主义诗歌的代表，他的诗歌想象丰富、气势磅礴、语言流畅。从《将进酒》到《蜀道难》，都展现了诗人超凡的想象力。',
    user_id: 2,
    publish_time: 1702694400,
    like_count: 62,
    collect_count: 25,
    styles: ['文学', '诗歌', '名家', '浪漫主义'],
    comments: [
      {
        comment_id: 'comment_003',
        user_id: 1,
        user_name: '诗仙爱好者',
        content: '李白的浪漫主义确实独树一帜！',
        comment_time: 1702698000
      }
    ]
  },
  {
    id: 'work_003',
    title: '杜甫的现实主义创作',
    content: '与李白的浪漫主义不同，杜甫的诗歌更注重现实主义，深刻反映了唐代社会的动荡和人民的疾苦。《石壕吏》《茅屋为秋风所破歌》都是经典之作。',
    user_id: 1,
    publish_time: 1702608000,
    like_count: 38,
    collect_count: 12,
    styles: ['文学', '诗歌', '名家', '现实主义'],
    comments: []
  },
  {
    id: 'work_004',
    title: '王维山水诗的禅意',
    content: '王维的山水诗融合了佛教禅宗思想，意境空灵淡远。《山居秋暝》《鸟鸣涧》等作品都体现了"诗中有画，画中有诗"的艺术境界。',
    user_id: 2,
    publish_time: 1702521600,
    like_count: 28,
    collect_count: 10,
    styles: ['文学', '诗歌', '名家', '山水诗', '禅意'],
    comments: [
      {
        comment_id: 'comment_004',
        user_id: 1,
        user_name: '诗仙爱好者',
        content: '王维的诗确实很有画面感。',
        comment_time: 1702525200
      },
      {
        comment_id: 'comment_005',
        user_id: 2,
        user_name: '李白粉丝',
        content: '空山新雨后，天气晚来秋。',
        comment_time: 1702528800
      }
    ]
  },
  {
    id: 'work_005',
    title: '边塞诗的豪情壮志',
    content: '边塞诗是唐诗的重要组成部分，王昌龄、岑参、高适等诗人创作了大量边塞诗。这些诗歌展现了戍边将士的豪迈气概和保家卫国的决心。',
    user_id: 1,
    publish_time: 1702435200,
    like_count: 32,
    collect_count: 11,
    styles: ['文学', '诗歌', '边塞诗', '主题'],
    comments: []
  },
  {
    id: 'work_006',
    title: '送别诗中的深情厚谊',
    content: '送别诗表达了离别之情和对友人的祝福。王维的《送元二使安西》、李白的《黄鹤楼送孟浩然之广陵》都是送别诗的经典。',
    user_id: 2,
    publish_time: 1702348800,
    like_count: 25,
    collect_count: 8,
    styles: ['文学', '诗歌', '送别诗', '主题'],
    comments: [
      {
        comment_id: 'comment_006',
        user_id: 1,
        user_name: '诗仙爱好者',
        content: '劝君更尽一杯酒，西出阳关无故人。',
        comment_time: 1702352400
      }
    ]
  },
  {
    id: 'work_007',
    title: '闺怨诗的细腻情感',
    content: '闺怨诗描写女性的思念之情，王昌龄的《闺怨》、李白的《子夜吴歌》都表现了女性细腻的情感世界。',
    user_id: 1,
    publish_time: 1702262400,
    like_count: 22,
    collect_count: 7,
    styles: ['文学', '诗歌', '闺怨诗', '主题'],
    comments: []
  },
  {
    id: 'work_008',
    title: '田园诗的自然之美',
    content: '孟浩然和王维是田园诗的代表，他们的诗歌描绘了恬静的田园生活和美丽的自然风光，给人以清新脱俗之感。',
    user_id: 2,
    publish_time: 1702176000,
    like_count: 30,
    collect_count: 9,
    styles: ['文学', '诗歌', '田园诗', '主题'],
    comments: [
      {
        comment_id: 'comment_007',
        user_id: 1,
        user_name: '诗仙爱好者',
        content: '春眠不觉晓，处处闻啼鸟。',
        comment_time: 1702179600
      }
    ]
  },
  {
    id: 'work_009',
    title: '咏史诗的历史感悟',
    content: '咏史诗通过历史事件和人物表达诗人的感慨和见解。杜牧的《赤壁》、刘禹锡的《乌衣巷》都是咏史诗的佳作。',
    user_id: 1,
    publish_time: 1702089600,
    like_count: 18,
    collect_count: 6,
    styles: ['文学', '诗歌', '咏史诗', '主题'],
    comments: []
  },
  {
    id: 'work_010',
    title: '咏物诗的托物言志',
    content: '咏物诗通过描写具体事物来表达志向和情感。于谦的《石灰吟》、郑燮的《竹石》都运用了托物言志的手法。',
    user_id: 2,
    publish_time: 1702003200,
    like_count: 26,
    collect_count: 8,
    styles: ['文学', '诗歌', '咏物诗', '主题'],
    comments: [
      {
        comment_id: 'comment_008',
        user_id: 1,
        user_name: '诗仙爱好者',
        content: '粉骨碎身浑不怕，要留清白在人间。',
        comment_time: 1702006800
      }
    ]
  },
  {
    id: 'work_011',
    title: '唐诗的格律美',
    content: '唐诗在格律上非常讲究，五言、七言、律诗、绝句各有特点。严格的格律反而成就了唐诗独特的韵律美和音乐美。',
    user_id: 1,
    publish_time: 1701916800,
    like_count: 35,
    collect_count: 13,
    styles: ['文学', '诗歌', '格律', '技法'],
    comments: []
  },
  {
    id: 'work_012',
    title: '李商隐的朦胧美',
    content: '李商隐的诗歌以朦胧著称，《锦瑟》《无题》等作品意境深远，给人以无限的想象空间。',
    user_id: 2,
    publish_time: 1701830400,
    like_count: 29,
    collect_count: 10,
    styles: ['文学', '诗歌', '名家', '朦胧诗'],
    comments: [
      {
        comment_id: 'comment_009',
        user_id: 1,
        user_name: '诗仙爱好者',
        content: '此情可待成追忆，只是当时已惘然。',
        comment_time: 1701834000
      }
    ]
  },
  {
    id: 'work_013',
    title: '白居易的通俗易懂',
    content: '白居易主张诗歌应该通俗易懂，为民众所理解。他的《长恨歌》《琵琶行》都是叙事长诗的经典。',
    user_id: 1,
    publish_time: 1701744000,
    like_count: 31,
    collect_count: 11,
    styles: ['文学', '诗歌', '名家', '叙事诗'],
    comments: []
  },
  {
    id: 'work_014',
    title: '韩愈的以文为诗',
    content: '韩愈开创了"以文为诗"的先河，将散文的章法、句法引入诗歌，形成了独特的风格。',
    user_id: 2,
    publish_time: 1701657600,
    like_count: 20,
    collect_count: 7,
    styles: ['文学', '诗歌', '名家', '创新'],
    comments: [
      {
        comment_id: 'comment_010',
        user_id: 1,
        user_name: '诗仙爱好者',
        content: '韩愈的诗确实很有气势。',
        comment_time: 1701661200
      }
    ]
  },
  {
    id: 'work_015',
    title: '元稹与白居易的唱和',
    content: '元稹和白居易是至交好友，两人经常唱和诗歌，留下了许多佳话。他们的友情和诗歌交流成为文学史上的美谈。',
    user_id: 1,
    publish_time: 1701571200,
    like_count: 24,
    collect_count: 8,
    styles: ['文学', '诗歌', '友情', '历史'],
    comments: []
  },
  {
    id: 'work_016',
    title: '唐诗中的酒文化',
    content: '酒在唐诗中占有重要地位，李白的《将进酒》、王翰的《凉州词》都与酒有关。酒既是诗人的灵感源泉，也是抒发情感的媒介。',
    user_id: 2,
    publish_time: 1701484800,
    like_count: 33,
    collect_count: 12,
    styles: ['文学', '诗歌', '文化', '主题'],
    comments: [
      {
        comment_id: 'comment_011',
        user_id: 1,
        user_name: '诗仙爱好者',
        content: '人生得意须尽欢，莫使金樽空对月。',
        comment_time: 1701488400
      }
    ]
  },
  {
    id: 'work_017',
    title: '唐诗的意境美',
    content: '唐诗追求意境美，讲究情景交融、虚实相生。王国维在《人间词话》中提出的"境界说"对理解唐诗有重要意义。',
    user_id: 1,
    publish_time: 1701398400,
    like_count: 27,
    collect_count: 9,
    styles: ['文学', '诗歌', '美学', '理论'],
    comments: []
  },
  {
    id: 'work_018',
    title: '唐诗的继承与创新',
    content: '唐诗在继承前代诗歌传统的基础上，进行了大胆创新。从初唐的"沈宋体"到盛唐的浪漫主义和现实主义，再到晚唐的朦胧诗风，展现了强大的创新能力。',
    user_id: 2,
    publish_time: 1701312000,
    like_count: 19,
    collect_count: 6,
    styles: ['文学', '诗歌', '历史', '发展'],
    comments: [
      {
        comment_id: 'comment_012',
        user_id: 1,
        user_name: '诗仙爱好者',
        content: '唐诗的发展史本身就是一部创新史。',
        comment_time: 1701315600
      }
    ]
  },
  {
    id: 'work_019',
    title: '唐诗对后世的影响',
    content: '唐诗对宋词、元曲乃至现代诗歌都产生了深远影响。许多现代诗人如郭沫若、艾青等都从唐诗中汲取营养。',
    user_id: 1,
    publish_time: 1701225600,
    like_count: 21,
    collect_count: 7,
    styles: ['文学', '诗歌', '影响', '历史'],
    comments: []
  },
  {
    id: 'work_020',
    title: '如何欣赏唐诗',
    content: '欣赏唐诗需要了解时代背景、诗人生平、诗歌格律等多方面知识。同时也要用心去感受诗歌的意境和情感，做到"知人论世"和"以意逆志"。',
    user_id: 2,
    publish_time: 1701139200,
    like_count: 40,
    collect_count: 16,
    styles: ['文学', '诗歌', '鉴赏', '方法'],
    comments: [
      {
        comment_id: 'comment_013',
        user_id: 1,
        user_name: '诗仙爱好者',
        content: '这篇文章很实用，对学习唐诗很有帮助。',
        comment_time: 1701142800
      },
      {
        comment_id: 'comment_014',
        user_id: 2,
        user_name: '李白粉丝',
        content: '感谢分享！',
        comment_time: 1701146400
      }
    ]
  }
]

// 点赞记录（user_id -> work_id[]）
const likeRecords: Map<number, Set<string>> = new Map()

// 收藏记录（user_id -> work_id[]）
const collectRecords: Map<number, Set<string>> = new Map()

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

// 生成唯一 ID
function generateId(): string {
  return `work_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// 生成评论 ID
function generateCommentId(): string {
  return `comment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// 计算热力值（简单算法：点赞数 * 2 + 收藏数 * 3 + 评论数 * 1.5）
function calculateHeatScore(work: MockWork): number {
  return work.like_count * 2 + work.collect_count * 3 + work.comments.length * 1.5
}

export const workHandlers: MockHandler[] = [
  // GET /api/work/home/page - 主页帖子分页查询
  {
    url: '/api/work/home/page',
    method: 'GET',
    response: (config) => {
      const userId = validateTokenAndGetUserId(config.headers?.Authorization)
      if (!userId) {
        return {
          status: 401,
          data: { code: 401, message: '未提供认证令牌', data: [] }
        }
      }

      const page = parseInt(config.params?.page || '1')
      const pageSize = 20

      // 按发布时间降序排列
      const sortedWorks = [...mockWorks].sort((a, b) => b.publish_time - a.publish_time)

      const total = sortedWorks.length
      const totalPages = Math.ceil(total / pageSize)
      const start = (page - 1) * pageSize
      const end = start + pageSize

      const items = sortedWorks.slice(start, end)

      return {
        status: 200,
        data: {
          code: 200,
          message: '主页帖子查询成功！',
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

  // GET /api/work/hot - 热力榜 Top10
  {
    url: '/api/work/hot',
    method: 'GET',
    response: (config) => {
      const userId = validateTokenAndGetUserId(config.headers?.Authorization)
      if (!userId) {
        return {
          status: 401,
          data: { code: 401, message: '未提供认证令牌', data: [] }
        }
      }

      // 计算热力值并排序
      const worksWithHeat = mockWorks.map(work => ({
        id: work.id,
        title: work.title,
        heat_score: calculateHeatScore(work)
      })).sort((a, b) => b.heat_score - a.heat_score)

      const top10 = worksWithHeat.slice(0, 10)

      return {
        status: 200,
        data: {
          code: 200,
          message: top10.length > 0 ? '获取热力榜 Top10 成功' : '当前热力榜暂无数据',
          data: {
            top10,
            total: mockWorks.length
          }
        }
      }
    }
  },

  // GET /api/work/detail/:id - 查询帖子详情
  {
    url: '/api/work/detail/:id',
    method: 'GET',
    response: (config) => {
      const userId = validateTokenAndGetUserId(config.headers?.Authorization)
      if (!userId) {
        return {
          status: 401,
          data: { code: 401, message: '未提供认证令牌', data: [] }
        }
      }

      const workId = config.params?.id
      const work = mockWorks.find(w => w.id === workId)

      if (!work) {
        return {
          status: 404,
          data: { code: 404, message: '帖子不存在！', data: [] }
        }
      }

      return {
        status: 200,
        data: {
          code: 200,
          message: '帖子详情查询成功！',
          data: {
            detail: {
              ...work,
              comment_total: work.comments.length
            }
          }
        }
      }
    }
  },

  // POST /api/work/poem - 发布帖子
  {
    url: '/api/work/poem',
    method: 'POST',
    response: (config) => {
      const userId = validateTokenAndGetUserId(config.headers?.Authorization)
      if (!userId) {
        return {
          status: 401,
          data: { code: 401, message: '未提供认证令牌', data: [] }
        }
      }

      const { title, content, styles = [] } = JSON.parse(config.data || '{}')

      if (!title || !content) {
        return {
          status: 400,
          data: { code: 400, message: '标题和内容不能为空', data: [] }
        }
      }

      // 查找用户
      const user = mockUsers.find(u => u.id === userId)
      if (!user) {
        return {
          status: 404,
          data: { code: 404, message: '用户不存在', data: [] }
        }
      }

      // 创建新帖子
      const newWork: MockWork = {
        id: generateId(),
        title,
        content,
        user_id: userId,
        publish_time: Math.floor(Date.now() / 1000),
        like_count: 0,
        collect_count: 0,
        styles,
        comments: []
      }

      // 添加到列表头部
      mockWorks.unshift(newWork)

      // 用户经验 +1
      const originalExp = user.exp
      user.exp += 1
      const levelUpdated = user.level !== user.level // 简化处理，实际应有段位系统

      return {
        status: 201,
        data: {
          code: 201,
          message: `帖子发布成功！经验+1，当前段位：${user.level}`,
          data: {
            poem: newWork,
            user_exp: user.exp,
            user_level: user.level,
            level_updated: levelUpdated,
            original_exp: originalExp
          }
        }
      }
    }
  },

  // DELETE /api/work/poem/:id - 删除帖子
  {
    url: '/api/work/poem/:id',
    method: 'DELETE',
    response: (config) => {
      const userId = validateTokenAndGetUserId(config.headers?.Authorization)
      if (!userId) {
        return {
          status: 401,
          data: { code: 401, message: '未提供认证令牌', data: [] }
        }
      }

      const workId = config.params?.id
      const workIndex = mockWorks.findIndex(w => w.id === workId && w.user_id === userId)

      if (workIndex === -1) {
        return {
          status: 404,
          data: { code: 404, message: '帖子不存在或你无删除权限', data: [] }
        }
      }

      // 删除帖子
      mockWorks.splice(workIndex, 1)

      // 清除相关的点赞和收藏记录
      likeRecords.forEach(likes => likes.delete(workId))
      collectRecords.forEach(collects => collects.delete(workId))

      return {
        status: 200,
        data: {
          code: 200,
          message: '帖子及关联的点赞、收藏、评论已全部删除成功！',
          data: null
        }
      }
    }
  },

  // POST /api/work/like/:id - 点赞帖子
  {
    url: '/api/work/like/:id',
    method: 'POST',
    response: (config) => {
      const userId = validateTokenAndGetUserId(config.headers?.Authorization)
      if (!userId) {
        return {
          status: 401,
          data: { code: 401, message: '未提供认证令牌', data: [] }
        }
      }

      const workId = config.params?.id
      const work = mockWorks.find(w => w.id === workId)

      if (!work) {
        return {
          status: 404,
          data: { code: 404, message: '帖子不存在', data: [] }
        }
      }

      // 检查是否已点赞
      if (!likeRecords.has(userId)) {
        likeRecords.set(userId, new Set())
      }
      const userLikes = likeRecords.get(userId)!

      if (userLikes.has(workId)) {
        return {
          status: 400,
          data: { code: 400, message: '你已给该帖子点赞，不可重复点赞！', data: [] }
        }
      }

      // 点赞
      userLikes.add(workId)
      work.like_count += 1

      // 作者经验 +1
      const author = mockUsers.find(u => u.id === work.user_id)
      const originalExp = author?.exp || 0
      if (author) {
        author.exp += 1
      }

      return {
        status: 200,
        data: {
          code: 200,
          message: `点赞成功！帖子作者经验+1，当前段位：${author?.level || '小白'}`,
          data: {
            poem_id: workId,
            like_count: work.like_count,
            post_user_id: work.user_id,
            user_original_exp: originalExp,
            user_new_exp: author?.exp || 0,
            user_original_level: author?.level || '小白',
            user_new_level: author?.level || '小白',
            level_updated: false
          }
        }
      }
    }
  },

  // POST /api/work/collect/:id - 收藏帖子
  {
    url: '/api/work/collect/:id/',
    method: 'POST',
    response: (config) => {
      const userId = validateTokenAndGetUserId(config.headers?.Authorization)
      if (!userId) {
        return {
          status: 401,
          data: { code: 401, message: '未提供认证令牌', data: [] }
        }
      }

      const workId = config.params?.id
      const work = mockWorks.find(w => w.id === workId)

      if (!work) {
        return {
          status: 404,
          data: { code: 404, message: '帖子不存在', data: [] }
        }
      }

      // 检查是否已收藏
      if (!collectRecords.has(userId)) {
        collectRecords.set(userId, new Set())
      }
      const userCollects = collectRecords.get(userId)!

      if (userCollects.has(workId)) {
        return {
          status: 400,
          data: { code: 400, message: '你已收藏该帖子，不可重复收藏！', data: [] }
        }
      }

      // 收藏
      userCollects.add(workId)
      work.collect_count += 1

      // 作者经验 +1
      const author = mockUsers.find(u => u.id === work.user_id)
      const originalExp = author?.exp || 0
      if (author) {
        author.exp += 1
      }

      return {
        status: 200,
        data: {
          code: 200,
          message: `收藏成功！帖子作者经验+1，当前段位：${author?.level || '小白'}`,
          data: {
            poem_id: workId,
            collect_count: work.collect_count,
            post_user_id: work.user_id,
            user_original_exp: originalExp,
            user_new_exp: author?.exp || 0,
            user_original_level: author?.level || '小白',
            user_new_level: author?.level || '小白',
            level_updated: false
          }
        }
      }
    }
  },

  // POST /api/work/comment - 发布评论
  {
    url: '/api/work/comment',
    method: 'POST',
    response: (config) => {
      const userId = validateTokenAndGetUserId(config.headers?.Authorization)
      if (!userId) {
        return {
          status: 401,
          data: { code: 401, message: '未提供认证令牌', data: [] }
        }
      }

      const { work_id, content } = JSON.parse(config.data || '{}')

      if (!content || content.trim() === '') {
        return {
          status: 400,
          data: { code: 400, message: '评论内容不能为空！', data: [] }
        }
      }

      if (content.length > 500) {
        return {
          status: 400,
          data: { code: 400, message: '评论内容长度不能超过500字！', data: [] }
        }
      }

      const work = mockWorks.find(w => w.id === work_id)
      if (!work) {
        return {
          status: 404,
          data: { code: 404, message: '帖子不存在', data: [] }
        }
      }

      // 查找评论者
      const commenter = mockUsers.find(u => u.id === userId)
      if (!commenter) {
        return {
          status: 404,
          data: { code: 404, message: '用户不存在', data: [] }
        }
      }

      // 创建评论
      const newComment: MockComment = {
        comment_id: generateCommentId(),
        user_id: userId,
        user_name: commenter.name,
        content,
        comment_time: Math.floor(Date.now() / 1000)
      }

      work.comments.push(newComment)

      // 作者经验 +1
      const author = mockUsers.find(u => u.id === work.user_id)
      const originalExp = author?.exp || 0
      if (author) {
        author.exp += 1
      }

      return {
        status: 201,
        data: {
          code: 201,
          message: `评论发布成功！帖子作者经验+1，当前段位：${author?.level || '小白'}`,
          data: {
            comment_id: newComment.comment_id,
            work_id: work_id,
            content,
            comment_time: newComment.comment_time,
            user_id: userId,
            comment_count: work.comments.length,
            post_user_id: work.user_id,
            user_original_exp: originalExp,
            user_new_exp: author?.exp || 0,
            user_original_level: author?.level || '小白',
            user_new_level: author?.level || '小白',
            level_updated: false
          }
        }
      }
    }
  }
]
