import type { MockHandler } from '../types'
import { parseToken } from './auth'

// Mock QA 数据结构
export interface MockQA {
  question_id: string
  session_id: string
  user_id: number
  question: string
  answer: string
  num_render: number
  status: 'normal' | 'stopped'
  timestamp: number
}

// Mock QA 数据
export const mockQAs: MockQA[] = [
  {
    question_id: 'q1234567890',
    session_id: '550e8400-e29b-41d4-a716-446655440000',
    user_id: 1,
    question: '什么是唐诗？',
    answer: '唐诗是中国唐代产生的诗歌，是中国古典诗歌的巅峰之作。唐诗继承了汉魏民歌、乐府传统，并加以发展，形成了完备的律诗和绝句形式。唐诗题材广泛，风格多样，既有李白的豪放飘逸，也有杜甫的沉郁顿挫，还有王维的清新淡雅。',
    num_render: 200,
    status: 'normal',
    timestamp: 1702780800.123456
  },
  {
    question_id: 'q0987654321',
    session_id: '550e8400-e29b-41d4-a716-446655440000',
    user_id: 1,
    question: '李白的代表作有哪些？',
    answer: '李白的代表作众多，其中最著名的包括：《静夜思》、《将进酒》、《蜀道难》、《望庐山瀑布》、《早发白帝城》等。这些作品展现了李白浪漫主义的诗歌风格，想象力丰富，语言豪放洒脱。',
    num_render: 0,
    status: 'stopped',
    timestamp: 1702780900.654321
  },
  {
    question_id: 'q1122334455',
    session_id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    user_id: 1,
    question: '《静夜思》表达了什么情感？',
    answer: '《静夜思》是李白的一首五言绝句，表达了诗人在异乡的思乡之情。诗中"举头望明月，低头思故乡"成为千古名句，通过月光这一意象，将游子的思乡之情表达得淋漓尽致。全诗语言朴实自然，却能引起人们强烈的情感共鸣。',
    num_render: 150,
    status: 'normal',
    timestamp: 1702694400.789012
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

// 生成问题 ID
function generateQuestionId(): string {
  return `q${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// AI 回答模板
const aiAnswers: Record<string, string> = {
  '唐诗': '唐诗是中国唐代产生的诗歌，是中国古典诗歌的巅峰。唐诗继承了汉魏民歌、乐府传统，并加以发展创新。唐代诗人辈出，李白、杜甫、王维、白居易等名家的作品流传至今。唐诗的特点是格律严谨、意境深远、语言精炼，既有豪放派的气势磅礴，也有婉约派的细腻柔美。',
  '李白': '李白（701年-762年），字太白，号青莲居士，是唐代伟大的浪漫主义诗人，被后人誉为"诗仙"。他的诗歌想象丰富，语言流畅自然，风格豪放飘逸。代表作有《静夜思》、《将进酒》、《蜀道难》等。李白一生创作了大量优秀诗篇，对后世产生了深远影响。',
  '杜甫': '杜甫（712年-770年），字子美，号少陵野老，是唐代伟大的现实主义诗人，被后人尊为"诗圣"。他的诗歌深刻反映了唐代社会的动荡和人民的疾苦，代表作有《春望》、《茅屋为秋风所破歌》、《登高》等。杜甫的诗作被称为"诗史"，具有很高的思想性和艺术性。',
  '静夜思': '《静夜思》是李白创作的一首五言绝句。全诗仅二十字："床前明月光，疑是地上霜。举头望明月，低头思故乡。"诗人通过月光这一意象，表达了游子在异乡的思乡之情。诗歌语言朴实自然，意境深远，成为千古传诵的名篇。',
  '宋词': '宋词是继唐诗之后的又一文学高峰，是宋代盛行的一种韵文形式。词又称"曲子词"、"长短句"，源于民间，后经文人加工发展。宋词分为婉约派和豪放派两大流派。婉约派以柳永、李清照为代表，豪放派以苏轼、辛弃疾为代表。宋词在音韵、意境、情感表达等方面都达到了很高的艺术水平。',
  '格律': '格律是中国古典诗词在音韵、平仄、对仗等方面的规则。唐诗格律主要包括：平仄规则、韵脚要求、对仗规范等。律诗要求严格，每句的平仄都有固定格式；绝句相对自由，但也要遵循基本的平仄规律。掌握格律是学习古典诗词创作的基础。',
  default: '这是一个关于中国古典诗词的问题。中国古典诗词是中华文化的瑰宝，历经千年传承，涵盖了唐诗、宋词、元曲等多种形式。每个时代都有其独特的艺术特色和代表人物。学习古典诗词不仅能提高文学素养，还能更深入地理解中国传统文化。'
}

// 根据问题选择回答
function getAnswer(question: string): string {
  for (const [key, answer] of Object.entries(aiAnswers)) {
    if (question.includes(key)) {
      return answer
    }
  }
  return aiAnswers.default
}

export const chatHandlers: MockHandler[] = [
  // GET /api/qa/list - QA 列表
  {
    url: '/api/qa/list',
    method: 'GET',
    response: (config) => {
      const userId = validateTokenAndGetUserId(config.headers?.Authorization)
      if (!userId) {
        return {
          status: 401,
          data: { code: 401, message: '认证失败，请重新登录', data: [] }
        }
      }

      const sessionId = config.params?.session_id

      // 验证会话是否存在（简化处理，避免循环依赖）
      // 注意：实际应该验证 session_id，这里简化处理

      // 筛选该会话下的 QA 记录，按时间升序排列
      const qaList = mockQAs
        .filter(qa => qa.session_id === sessionId && qa.user_id === userId)
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(qa => ({
          question_id: qa.question_id,
          question: qa.question,
          answer: qa.answer,
          num_render: qa.num_render,
          status: qa.status,
          timestamp: qa.timestamp
        }))

      return {
        status: 200,
        data: {
          code: 200,
          message: '获取对话列表成功',
          data: qaList
        }
      }
    }
  },

  // GET /api/chat/dialog/stream - SSE 流式对话（特殊处理）
  {
    url: '/api/chat/dialog/stream',
    method: 'GET',
    response: (config) => {
      const userId = validateTokenAndGetUserId(config.headers?.Authorization)
      if (!userId) {
        return {
          status: 401,
          data: {
            code: 401,
            message: '缺少Authorization Token',
            data: {
              content: '',
              final: true,
              full_content: ''
            }
          }
        }
      }

      const query = config.params?.query || ''
      const sessionId = config.params?.session_id || ''

      if (!query) {
        return {
          status: 400,
          data: {
            code: 400,
            message: '问题不能为空',
            data: {
              content: '',
              final: true,
              full_content: ''
            }
          }
        }
      }

      // 验证会话是否存在（简化处理，避免循环依赖）
      // 注意：实际应该验证并创建 session，这里简化处理

      // 生成完整答案
      const fullAnswer = getAnswer(query)

      // 创建 QA 记录
      const newQA: MockQA = {
        question_id: generateQuestionId(),
        session_id: sessionId,
        user_id: userId,
        question: query,
        answer: fullAnswer,
        num_render: fullAnswer.length,
        status: 'normal',
        timestamp: Date.now() / 1000
      }
      mockQAs.push(newQA)

      // 返回流式响应标记
      return {
        status: 200,
        data: {
          code: 200,
          message: '流式响应',
          data: {
            stream: true, // 特殊标记，表示这是流式响应
            question_id: newQA.question_id,
            full_content: fullAnswer
          }
        }
      }
    }
  }
]
