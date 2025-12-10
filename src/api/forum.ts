import { request } from '@/utils/request'
import type { 
  Result,
  ForumPageData,
  PostDetail,
  CreatePostParams,
  CreatePostData,
  CreateCommentParams,
  CreateCommentData,
  LikeParams,
  CollectParams,
  HotRankData,
  PageParams
} from './type'

/**
 * 论坛相关 API
 */

/**
 * 分页查询论坛帖子
 */
export const getForumPosts = (params: PageParams): Promise<Result<ForumPageData>> => {
  return request.get('/api/forum/posts', { params })
}

/**
 * 查询帖子详情
 */
export const getPostDetail = (postId: string): Promise<Result<PostDetail>> => {
  return request.get(`/api/forum/post/${postId}`)
}

/**
 * 发布帖子
 */
export const createPost = (params: CreatePostParams): Promise<Result<CreatePostData>> => {
  return request.post('/api/forum/post', params)
}

/**
 * 删除帖子
 */
export const deletePost = (postId: string): Promise<Result<null>> => {
  return request.delete(`/api/forum/post/${postId}`)
}

/**
 * 发布评论
 */
export const createComment = (params: CreateCommentParams): Promise<Result<CreateCommentData>> => {
  return request.post('/api/forum/comment', params)
}

/**
 * 点赞/取消点赞
 */
export const toggleLike = (params: LikeParams): Promise<Result<null>> => {
  return request.post('/api/forum/like', params)
}

/**
 * 收藏/取消收藏
 */
export const toggleCollect = (params: CollectParams): Promise<Result<null>> => {
  return request.post('/api/forum/collect', params)
}

/**
 * 查询热力榜 Top10
 */
export const getHotRank = (): Promise<Result<HotRankData>> => {
  return request.get('/api/forum/hot')
}
