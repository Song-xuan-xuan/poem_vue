import type { MockHandler } from '../types'
import { parseToken } from './auth'

// Mock 诗词数据
export interface MockPoem {
  id: number
  title: string
  author: string
  paragraphs: string[]
  tags: string[]
}

export const mockPoems: MockPoem[] = [
  {
    id: 1,
    title: '静夜思',
    author: '李白',
    paragraphs: ['床前明月光，疑是地上霜。', '举头望明月，低头思故乡。'],
    tags: ['思乡', '月亮', '五言绝句', '新乐府辞']
  },
  {
    id: 2,
    title: '春晓',
    author: '孟浩然',
    paragraphs: ['春眠不觉晓，处处闻啼鸟。', '夜来风雨声，花落知多少。'],
    tags: ['春天', '写景', '五言绝句']
  },
  {
    id: 3,
    title: '登鹳雀楼',
    author: '王之涣',
    paragraphs: ['白日依山尽，黄河入海流。', '欲穷千里目，更上一层楼。'],
    tags: ['黄河', '励志', '写景', '哲理', '名楼、庙宇', '五言绝句']
  },
  {
    id: 4,
    title: '早发白帝城',
    author: '李白',
    paragraphs: ['朝辞白帝彩云间，千里江陵一日还。', '两岸猿声啼不住，轻舟已过万重山。'],
    tags: ['长江', '山', '喜悦', '七言绝句', '描写山', '地名']
  },
  {
    id: 5,
    title: '春思',
    author: '皇甫冉',
    paragraphs: ['莺啼燕语报新年，马邑龙堆路几千。', '家住层城临汉苑，心随明月到胡天。', '机中锦字论长恨，楼上花枝笑独眠。', '为问元戎窦车骑，何时返旆勒燕然。'],
    tags: ['思念', '七言律诗', '春天', '妇女', '闺怨']
  },
  {
    id: 6,
    title: '夜月',
    author: '刘方平',
    paragraphs: ['更深月色半人家，北斗阑干南斗斜。', '今夜偏知春气暖，虫声新透绿窗纱。'],
    tags: ['月亮', '春天', '田园', '七言绝句']
  },
  {
    id: 7,
    title: '春怨',
    author: '刘方平',
    paragraphs: ['纱窗日落渐黄昏，金屋无人见泪痕。', '寂寞空庭春欲晚，梨花满地不开门。'],
    tags: ['孤独', '七言绝句', '宫怨']
  },
  {
    id: 8,
    title: '凉州词',
    author: '王之涣',
    paragraphs: ['黄河远上白云间，一片孤城万仞山。', '羌笛何须怨杨柳，春风不度玉门关。'],
    tags: ['黄河', '写景', '乐府', '思乡', '边塞', '将士']
  },
  {
    id: 9,
    title: '枫桥夜泊',
    author: '张继',
    paragraphs: ['月落乌啼霜满天，江枫渔火对愁眠。', '姑苏城外寒山寺，夜半钟声到客船。'],
    tags: ['写景', '秋天', '七言绝句', '思乡']
  },
  {
    id: 10,
    title: '望庐山瀑布',
    author: '李白',
    paragraphs: ['日照香炉生紫烟，遥看瀑布挂前川。', '飞流直下三千尺，疑是银河落九天。'],
    tags: ['山水', '写景', '七言绝句', '描写山']
  },
  {
    id: 11,
    title: '赋得古原草送别',
    author: '白居易',
    paragraphs: ['离离原上草，一岁一枯荣。', '野火烧不尽，春风吹又生。', '远芳侵古道，晴翠接荒城。', '又送王孙去，萋萋满别情。'],
    tags: ['送别', '草原', '励志', '五言律诗']
  },
  {
    id: 12,
    title: '黄鹤楼送孟浩然之广陵',
    author: '李白',
    paragraphs: ['故人西辞黄鹤楼，烟花三月下扬州。', '孤帆远影碧空尽，唯见长江天际流。'],
    tags: ['送别', '长江', '七言绝句', '名楼、庙宇']
  },
  {
    id: 13,
    title: '九月九日忆山东兄弟',
    author: '王维',
    paragraphs: ['独在异乡为异客，每逢佳节倍思亲。', '遥知兄弟登高处，遍插茱萸少一人。'],
    tags: ['思乡', '节日', '七言绝句', '怀人']
  },
  {
    id: 14,
    title: '山行',
    author: '杜牧',
    paragraphs: ['远上寒山石径斜，白云深处有人家。', '停车坐爱枫林晚，霜叶红于二月花。'],
    tags: ['秋天', '写景', '山', '七言绝句', '描写山']
  },
  {
    id: 15,
    title: '江南春',
    author: '杜牧',
    paragraphs: ['千里莺啼绿映红，水村山郭酒旗风。', '南朝四百八十寺，多少楼台烟雨中。'],
    tags: ['春天', '写景', '江南', '七言绝句']
  },
  {
    id: 16,
    title: '望洞庭',
    author: '刘禹锡',
    paragraphs: ['湖光秋月两相和，潭面无风镜未磨。', '遥望洞庭山水翠，白银盘里一青螺。'],
    tags: ['秋天', '写景', '湖泊', '七言绝句']
  },
  {
    id: 17,
    title: '浪淘沙',
    author: '刘禹锡',
    paragraphs: ['九曲黄河万里沙，浪淘风簸自天涯。', '如今直上银河去，同到牵牛织女家。'],
    tags: ['黄河', '想象', '七言绝句', '乐府']
  },
  {
    id: 18,
    title: '竹枝词',
    author: '刘禹锡',
    paragraphs: ['杨柳青青江水平，闻郎江上踏歌声。', '东边日出西边雨，道是无晴却有晴。'],
    tags: ['爱情', '民歌', '七言绝句', '乐府']
  },
  {
    id: 19,
    title: '渔歌子',
    author: '张志和',
    paragraphs: ['西塞山前白鹭飞，桃花流水鳜鱼肥。', '青箬笠，绿蓑衣，斜风细雨不须归。'],
    tags: ['山水', '写景', '田园', '词']
  },
  {
    id: 20,
    title: '游子吟',
    author: '孟郊',
    paragraphs: ['慈母手中线，游子身上衣。', '临行密密缝，意恐迟迟归。', '谁言寸草心，报得三春晖。'],
    tags: ['母爱', '感恩', '五言古诗']
  }
]

// 从 Authorization 头中提取 Token
function extractToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

// 验证 Token
function validateToken(authHeader?: string): boolean {
  const token = extractToken(authHeader)
  if (!token) return false
  const userId = parseToken(token)
  return userId !== null
}

export const poemHandlers: MockHandler[] = [
  // GET /api/poem/page - 分页查询诗词
  {
    url: '/api/poem/page',
    method: 'GET',
    response: (config) => {
      if (!validateToken(config.headers?.Authorization)) {
        return {
          status: 401,
          data: { code: 401, message: '认证失败，请重新登录', data: [] }
        }
      }

      const pageSize = parseInt(config.params?.page_size || '20')
      const pageNum = parseInt(config.params?.page_num || '1')

      const total = mockPoems.length
      const totalPages = Math.ceil(total / pageSize)
      const start = (pageNum - 1) * pageSize
      const end = start + pageSize

      const list = mockPoems.slice(start, end).map(p => ({
        id: p.id,
        title: p.title,
        author: p.author,
        tags: p.tags
      }))

      return {
        status: 200,
        data: {
          code: 200,
          message: '分页查询诗歌成功',
          data: {
            list,
            total,
            page_size: pageSize,
            page_num: pageNum,
            total_pages: totalPages
          }
        }
      }
    }
  },

  // GET /api/poem/paragraphs/search - 诗句模糊查询
  {
    url: '/api/poem/paragraphs/search',
    method: 'GET',
    response: (config) => {
      if (!validateToken(config.headers?.Authorization)) {
        return {
          status: 401,
          data: { code: 401, message: '认证失败，请重新登录', data: [] }
        }
      }

      const keyword = config.params?.keyword || ''
      const results = mockPoems.filter(p =>
        p.paragraphs.some(para => para.includes(keyword))
      )

      const list = results.map(p => ({
        id: p.id,
        title: p.title,
        author: p.author,
        tags: p.tags
      }))

      return {
        status: 200,
        data: {
          code: 200,
          message: '根据诗句模糊查询诗歌成功',
          data: {
            list,
            total: list.length
          }
        }
      }
    }
  },

  // GET /api/poem/title/search - 标题模糊查询
  {
    url: '/api/poem/title/search',
    method: 'GET',
    response: (config) => {
      if (!validateToken(config.headers?.Authorization)) {
        return {
          status: 401,
          data: { code: 401, message: '认证失败，请重新登录', data: [] }
        }
      }

      const keyword = config.params?.keyword || ''
      const results = mockPoems.filter(p => p.title.includes(keyword))

      const list = results.map(p => ({
        id: p.id,
        title: p.title,
        author: p.author,
        tags: p.tags
      }))

      return {
        status: 200,
        data: {
          code: 200,
          message: '根据标题模糊查询诗歌成功',
          data: {
            list,
            total: list.length
          }
        }
      }
    }
  },

  // GET /api/poem/daily - 每日一首
  {
    url: '/api/poem/daily',
    method: 'GET',
    response: (config) => {
      if (!validateToken(config.headers?.Authorization)) {
        return {
          status: 401,
          data: { code: 401, message: '认证失败，请重新登录', data: [] }
        }
      }

      // 根据当前日期计算诗词 ID
      const now = new Date()
      const dateNum = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
      const poemIndex = dateNum % mockPoems.length
      const poem = mockPoems[poemIndex]

      const dateStr = `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日`

      return {
        status: 200,
        data: {
          code: 200,
          message: `获取${dateStr}每日一首成功`,
          data: poem
        }
      }
    }
  },

  // GET /api/poem/:id - 查询诗词详情
  {
    url: '/api/poem/:id',
    method: 'GET',
    response: (config) => {
      if (!validateToken(config.headers?.Authorization)) {
        return {
          status: 401,
          data: { code: 401, message: '认证失败，请重新登录', data: [] }
        }
      }

      const poemId = parseInt(config.params?.id || '0')
      const poem = mockPoems.find(p => p.id === poemId)

      if (!poem) {
        return {
          status: 404,
          data: { code: 404, message: `未找到ID为${poemId}的诗歌`, data: [] }
        }
      }

      return {
        status: 200,
        data: {
          code: 200,
          message: '查询诗歌详情成功',
          data: poem
        }
      }
    }
  },

  // POST /api/poem/respond - 对诗接口
  {
    url: '/api/poem/respond',
    method: 'POST',
    response: (config) => {
      if (!validateToken(config.headers?.Authorization)) {
        return {
          status: 401,
          data: { code: 401, message: '认证失败，请重新登录', data: [] }
        }
      }

      const { user_sentence } = JSON.parse(config.data || '{}')

      if (!user_sentence) {
        return {
          status: 400,
          data: { code: 400, message: '输入的诗句不能为空', data: [] }
        }
      }

      // 简单实现：匹配静夜思
      const poem = mockPoems[0] // 静夜思
      const sentences = user_sentence.split(/[，。、]/).filter((s: string) => s.trim())

      // 预定义对诗逻辑
      const poemSentences = [
        '床前明月光，',
        '疑是地上霜。',
        '举头望明月，',
        '低头思故乡。'
      ]

      // 尝试匹配第一句
      if (user_sentence.includes('床前明月光')) {
        const matchedClauses = ['床前明月光，']
        if (user_sentence.includes('疑是地上霜')) {
          matchedClauses.push('疑是地上霜。')
          return {
            status: 200,
            data: {
              code: 200,
              message: '对诗成功，返回2个下一句子句',
              data: {
                user_input: user_sentence,
                matched_clauses: matchedClauses,
                next_sentence: '举头望明月，低头思故乡。',
                poem_title: poem.title,
                poem_author: poem.author
              }
            }
          }
        }
        return {
          status: 200,
          data: {
            code: 200,
            message: '对诗成功，返回1个下一句子句',
            data: {
              user_input: user_sentence,
              matched_clauses: matchedClauses,
              next_sentence: '疑是地上霜。',
              poem_title: poem.title,
              poem_author: poem.author
            }
          }
        }
      }

      // 尝试匹配最后一句
      if (user_sentence.includes('举头望明月') && user_sentence.includes('低头思故乡')) {
        return {
          status: 200,
          data: {
            code: 200,
            message: '当前为最后一句，对诗结束',
            data: {
              user_input: user_sentence,
              matched_clauses: ['举头望明月，', '低头思故乡。'],
              next_sentence: '对诗结束。',
              poem_title: poem.title,
              poem_author: poem.author
            }
          }
        }
      }

      return {
        status: 400,
        data: {
          code: 400,
          message: `未查询到包含'${user_sentence}'的诗歌`,
          data: []
        }
      }
    }
  },

  // GET /api/poem/parse/prompt - 智能解析构造 Prompt
  {
    url: '/api/poem/parse/prompt',
    method: 'GET',
    response: (config) => {
      if (!validateToken(config.headers?.Authorization)) {
        return {
          status: 401,
          data: { code: 401, message: '认证失败，请重新登录', data: [] }
        }
      }

      const content = config.params?.content || ''

      // 优先匹配标题
      const poemByTitle = mockPoems.find(p => p.title === content)
      if (poemByTitle) {
        return {
          status: 200,
          data: {
            code: 200,
            message: '匹配到诗歌标题，生成赏析Prompt成功',
            data: {
              prompt: `赏析诗歌《${poemByTitle.title}》`,
              poem_title: poemByTitle.title
            }
          }
        }
      }

      // 匹配诗句
      for (const poem of mockPoems) {
        for (const para of poem.paragraphs) {
          if (para.includes(content)) {
            return {
              status: 200,
              data: {
                code: 200,
                message: '匹配到诗歌诗句，生成赏析Prompt成功',
                data: {
                  prompt: `赏析《${poem.title}》中的${para}`,
                  poem_title: poem.title,
                  user_input: content,
                  matched_sentence: para
                }
              }
            }
          }
        }
      }

      return {
        status: 400,
        data: {
          code: 400,
          message: '未匹配到对应的诗歌标题或诗句，请检查输入内容',
          data: []
        }
      }
    }
  }
]
