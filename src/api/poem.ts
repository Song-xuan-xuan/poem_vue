import { request } from '@/utils/request'
import type { 
  Result,
  PoemPageData,
  PoemListData,
  PoemDetail,
  DailyPoemData,
  PageParams,
  TagsQueryParams,
  AuthorQueryParams,
  KeywordSearchParams,
  PoemRespondParams,
  PoemRespondData
} from './type'

/**
 * 诗词相关 API
 */

/**
 * 分页查询诗词
 */
export const getPoemPage = (params: PageParams): Promise<Result<PoemPageData>> => {
  return request.get('/api/poem/page', { params })
}

/**
 * 根据标签查询诗词
 */
export const getPoemsByTags = (params: TagsQueryParams): Promise<Result<PoemListData>> => {
  return request.get('/api/poem/tags', { 
    params: { tags: params.tags },
    paramsSerializer: (params) => {
      // 处理数组参数：tags=边塞&tags=思乡
      return params.tags.map((tag: string) => `tags=${encodeURIComponent(tag)}`).join('&')
    }
  })
}

/**
 * 根据作者查询诗词
 */
export const getPoemsByAuthor = (params: AuthorQueryParams): Promise<Result<PoemListData>> => {
  return request.get('/api/poem/author', { params })
}

/**
 * 诗句模糊查询
 */
export const searchPoemsByParagraph = (params: KeywordSearchParams): Promise<Result<PoemListData>> => {
  return request.get('/api/poem/paragraphs/search', { params })
}

/**
 * 标题模糊查询
 */
export const searchPoemsByTitle = (params: KeywordSearchParams): Promise<Result<PoemListData>> => {
  return request.get('/api/poem/title/search', { params })
}

/**
 * 查询诗词详情
 */
export const getPoemDetail = (id: number): Promise<Result<PoemDetail>> => {
  return request.get(`/api/poem/${id}`)
}

/**
 * 对诗
 */
export const respondPoem = (params: PoemRespondParams): Promise<Result<PoemRespondData>> => {
  return request.post('/api/poem/respond', params)
}

/**
 * 每日一首
 */
export const getDailyPoem = (): Promise<Result<DailyPoemData>> => {
  return request.get('/api/poem/daily')
}

/**
 * 智能解析构造Prompt
 */
export const getParsePoemPrompt = (keyword: string): Promise<Result<{ prompt: string }>> => {
  return request.get('/api/poem/parse/prompt', { params: { keyword } })
}
