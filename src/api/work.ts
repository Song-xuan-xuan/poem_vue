import { requestBiz as request } from '@/utils/request'
import type { 
  Result,
  WorkPageData,
  WorkDetail,
  CreateWorkParams,
  CreateWorkData,
  LikeWorkData,
  CollectWorkData,
  CreateWorkCommentParams,
  CreateWorkCommentData,
  HotRankData,
  LikeParams,
  // 兼容旧版
  CreatePostParams,
  CreatePostData,
  CreateCommentParams,
  CreateCommentData,
  ForumPageData,
  PostDetail
} from './type'

/**
 * 论坛相关 API
 */

/**
 * 主页帖子分页查询（每页 20 条）
 * @param page - 页码，默认 1
 */
export const getHomePosts = (page: number = 1): Promise<Result<WorkPageData>> => {
  return request.get('/api/work/home/page', { params: { page } })
}

/**
 * 关键词搜索帖子（每页 10 条）
 * @param keyword - 搜索关键词
 * @param page - 页码，默认 1
 */
export const searchPostsByKeyword = (keyword: string, page: number = 1): Promise<Result<WorkPageData>> => {
  return request.get('/api/work/page/keyword', { params: { keyword, page } })
}

/**
 * 风格筛选帖子（每页 10 条）
 * @param style - 风格标签
 * @param page - 页码，默认 1
 */
export const searchPostsByStyle = (style: string, page: number = 1): Promise<Result<WorkPageData>> => {
  return request.get('/api/work/page/style', { params: { style, page } })
}

/**
 * 分页查询论坛帖子（兼容旧版）
 * @deprecated 请使用 getHomePosts
 */
export const getForumPosts = (page: number = 1): Promise<Result<WorkPageData>> => {
  return getHomePosts(page)
}

/**
 * 查询帖子详情
 * @param workId - 帖子ID
 */
export const getPostDetail = (workId: string): Promise<Result<{ detail: WorkDetail }>> => {
  return request.get(`/api/work/detail/${workId}`)
}

/**
 * 发布帖子
 * @param params - 包含 title, content, styles
 */
export const createPost = (params: CreateWorkParams): Promise<Result<CreateWorkData>> => {
  return request.post('/api/work/poem', params)
}

/**
 * 删除帖子
 * @param poemId - 帖子ID
 */
export const deletePost = (poemId: string): Promise<Result<null>> => {
  return request.delete(`/api/work/poem/${poemId}`)
}

/**
 * 发布评论
 * @param params - work_id 和 content
 */
export const createComment = (params: CreateWorkCommentParams): Promise<Result<CreateWorkCommentData>> => {
  return request.post('/api/work/comment', params)
}

/**
 * 点赞帖子
 * @param poemId - 帖子ID
 * @returns 包含最新 like_count 的响应数据
 */
export const likePost = (poemId: string): Promise<Result<LikeWorkData>> => {
  return request.post(`/api/work/like/${poemId}`)
}

/**
 * 点赞/取消点赞（兼容旧版）
 * @deprecated 请使用 likePost
 */
export const toggleLike = (params: LikeParams): Promise<Result<LikeWorkData>> => {
  const poemId = params.target_id
  return likePost(poemId)
}

/**
 * 收藏帖子
 * @param poemId - 帖子ID
 * @returns 包含最新 collect_count 的响应数据
 */
export const collectPost = (poemId: string): Promise<Result<CollectWorkData>> => {
  return request.post(`/api/work/collect/${poemId}/`)
}

/**
 * 查询热力榜 Top10
 */
export const getHotRank = (): Promise<Result<HotRankData>> => {
  return request.get('/api/work/hot')
}
