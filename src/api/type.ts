/**
 * API 类型定义文件
 * 所有接口的请求参数、响应数据和实体模型必须在此定义
 */

// ==================== 通用响应模型 ====================

/**
 * 统一响应结构
 */
export interface Result<T = any> {
  code: number
  message: string
  data: T
}

// ==================== 认证模块 (Auth) ====================

/**
 * 注册请求参数
 */
export interface RegisterParams {
  username: string
  password: string
}

/**
 * 登录请求参数
 */
export interface LoginParams {
  username: string
  password: string
}

/**
 * Token 响应数据
 */
export interface TokenData {
  access_token: string
  refresh_token: string
  token_type: string
}

/**
 * 刷新令牌请求参数
 */
export interface RefreshTokenParams {
  refresh_token: string
}

/**
 * 用户注册响应数据
 */
export interface RegisterData {
  id: number
  username: string
  name: string
  photo_url: string
  exp: number
  level: string
}

// ==================== 用户模块 (User) ====================

/**
 * 用户基本信息
 */
export interface UserInfo {
  id?: number
  username: string
  name: string
  photo_url: string
  exp: number
  level: string
}

/**
 * 用户主页帖子信息
 */
export interface UserPoem {
  id: string
  title: string
  publish_time: number
  like_count: number
  collect_count: number
}

/**
 * 用户主页信息
 */
export interface UserProfileData extends UserInfo {
  poems: UserPoem[]
  poem_count: number
}

/**
 * 修改网名请求参数
 */
export interface UpdateNameParams {
  new_name: string
}

/**
 * 修改网名响应数据
 */
export interface UpdateNameData {
  name: string
}

/**
 * 上传头像响应数据
 */
export interface UploadAvatarData {
  photo_url: string
}

/**
 * 修改密码请求参数
 */
export interface UpdatePasswordParams {
  old_password: string
  new_password: string
}

// ==================== 诗词模块 (Poem) ====================

/**
 * 诗词基本信息
 */
export interface PoemInfo {
  id: number
  title: string
  author: string
  tags: string[]
  paragraphs: string[]
}

/**
 * 诗词列表项（用于列表展示，包含部分内容）
 */
export interface PoemListItem {
  id: number
  title: string
  author: string
  part_content: string  // 部分内容预览
  tags: string[]
}

/**
 * 分页查询请求参数
 */
export interface PageParams {
  page_size?: number
  page_num?: number
}

/**
 * 分页响应数据
 */
export interface PageData<T = any> {
  list: T[]
  total: number
  page_size: number
  page_num: number
  total_pages: number
}

/**
 * 诗词分页查询响应（列表项）
 */
export type PoemPageData = PageData<PoemListItem>

/**
 * 诗词列表响应数据（用于搜索、标签筛选等）
 */
export interface PoemListData {
  list: PoemListItem[]
  total: number
}

/**
 * 标签查询请求参数
 */
export interface TagsQueryParams {
  tags: string[]
}

/**
 * 作者查询请求参数
 */
export interface AuthorQueryParams {
  author: string
}

/**
 * 关键词查询请求参数
 */
export interface KeywordSearchParams {
  keyword: string
}

/**
 * 对诗请求参数
 */
export interface PoemRespondParams {
  user_sentence: string
}

/**
 * 对诗响应数据
 */
export interface PoemRespondData {
  user_input: string
  matched_clauses: string[]
  next_sentence: string
  poem_title: string
  poem_author: string
}

/**
 * 诗词详情
 */
export interface PoemDetail {
  id: number
  title: string
  author: string
  paragraphs: string[]
  tags: string[]
  dynasty?: string        // 朝代（可选）
  appreciation?: string   // 赏析内容（可选）
}

/**
 * 每日一首响应数据
 * 直接返回诗词详情，不嵌套
 */
export type DailyPoemData = PoemDetail

// ==================== Work 模块 (帖子/作品) ====================

/**
 * 帖子列表项（用于主页、搜索等列表）
 */
export interface WorkItem {
  id: string
  title: string
  content: string
  user_id: string
  publish_time: number
  like_count: number
  collect_count: number
  styles: string[]
  comments?: WorkComment[]
  heat_score?: number
  user_like_status?: number      // 当前用户点赞状态（1=已点赞，0=未点赞）
  user_collect_status?: number   // 当前用户收藏状态（1=已收藏，0=未收藏）
}

/**
 * 帖子评论
 */
export interface WorkComment {
  comment_id: string
  user_id: string
  user_name: string
  user_photo_url?: string
  content: string
  comment_time: number
}

/**
 * 帖子详情
 */
export interface WorkDetail {
  id: string
  title: string
  content: string
  user_id: string
  author_name?: string
  author_photo_url?: string
  publish_time: number
  like_count: number
  collect_count: number
  styles: string[]
  comment_total: number
  comments: WorkComment[]
  user_like_status: number       // 当前用户点赞状态（1=已点赞，0=未点赞）
  user_collect_status: number    // 当前用户收藏状态（1=已收藏，0=未收藏）
}

/**
 * 帖子列表分页响应
 */
export interface WorkPageData {
  items: WorkItem[]
  page: number
  page_size: number
  total: number
  total_pages: number
}

/**
 * 发布帖子请求参数
 */
export interface CreateWorkParams {
  title: string
  content: string
  styles?: string[]
}

/**
 * 发布帖子响应数据
 */
export interface CreateWorkData {
  poem: WorkItem  // WorkItem 已包含 user_like_status 和 user_collect_status
  user_exp: number
  user_level: string
  level_updated: boolean
  original_exp: number
}

/**
 * 点赞帖子响应数据
 */
export interface LikeWorkData {
  poem_id: string
  like_count: number
  like_status: number            // 点赞状态（1=已点赞）
  post_user_id: string
  is_first_like: boolean         // 是否是第一次点赞
  user_original_exp?: number
  user_new_exp?: number
  user_original_level?: string
  user_new_level?: string
  level_updated?: boolean
}

/**
 * 收藏帖子响应数据
 */
export interface CollectWorkData {
  poem_id: string
  collect_count: number
  collect_status: number         // 收藏状态（1=已收藏）
  post_user_id: string
  is_first_collect: boolean      // 是否是第一次收藏
  user_original_exp?: number
  user_new_exp?: number
  user_original_level?: string
  user_new_level?: string
  level_updated?: boolean
}

/**
 * 取消点赞响应数据
 */
export interface UnlikeWorkData {
  poem_id: string
  like_count: number
  like_status: number            // 点赞状态（0=未点赞）
  message: string
}

/**
 * 取消收藏响应数据
 */
export interface UnCollectWorkData {
  poem_id: string
  collect_count: number
  collect_status: number         // 收藏状态（0=未收藏）
  message: string
}

/**
 * 发布评论请求参数
 */
export interface CreateWorkCommentParams {
  work_id: string
  content: string
}

/**
 * 发布评论响应数据
 */
export interface CreateWorkCommentData {
  comment_id: string
  work_id: string
  content: string
  comment_time: number
  user_id: number
  comment_count: number
  post_user_id: number
  user_original_exp: number
  user_new_exp: number
  user_original_level: string
  user_new_level: string
  level_updated: boolean
}

/**
 * 热力榜项
 */
export interface HotWorkItem {
  id: string
  title: string
  heat_score: number
  user_like_status?: number      // 当前用户点赞状态（1=已点赞，0=未点赞）
  user_collect_status?: number   // 当前用户收藏状态（1=已收藏，0=未收藏）
}

/**
 * 热力榜 Top10 响应
 */
export interface HotRankData {
  top10: HotWorkItem[]
  total: number
}

// ==================== 论坛模块 (Forum - 保留兼容) ====================

/**
 * 帖子基本信息（兼容旧版）
 */
export interface ForumPost {
  id: string
  user_id: number
  user_name: string
  user_photo: string
  user_level: string
  title: string
  content: string
  tags: string[]
  publish_time: number
  like_count: number
  collect_count: number
  comment_count: number
  is_liked?: boolean
  is_collected?: boolean
}

/**
 * 论坛分页查询响应（兼容旧版）
 */
export type ForumPageData = PageData<ForumPost>

/**
 * 发布帖子请求参数
 */
export interface CreatePostParams {
  title: string
  content: string
  tags: string[]
}

/**
 * 发布帖子响应数据
 */
export interface CreatePostData {
  id: string
  title: string
  publish_time: number
}

/**
 * 帖子详情
 */
export interface PostDetail extends ForumPost {
  comments: PostComment[]
}

/**
 * 评论信息
 */
export interface PostComment {
  id: string
  user_id: number
  user_name: string
  user_photo: string
  user_level: string
  content: string
  publish_time: number
  like_count: number
  is_liked?: boolean
}

/**
 * 发布评论请求参数
 */
export interface CreateCommentParams {
  post_id: string
  content: string
}

/**
 * 发布评论响应数据
 */
export interface CreateCommentData {
  id: string
  content: string
  publish_time: number
}

/**
 * 点赞请求参数
 */
export interface LikeParams {
  target_id: string
  target_type: 'post' | 'comment'
}

/**
 * 收藏帖子请求参数
 */
export interface CollectParams {
  poem_id: string
}

// ==================== 收藏夹模块 (collect) ====================

/**
 * 收藏项信息
 */
export interface FavoriteItem {
  collect_id: string
  collect_time: number          // 收藏时间戳（秒）
  work_info: {
    id: string
    title: string
    content: string
    publish_time: number        // 发布时间戳（秒）
    like_count: number
    collect_count: number
    styles: string[]
  }
}

/**
 * 收藏夹列表响应
 */
export interface FavoriteListData {
  list: FavoriteItem[]
  total: number
}

/**
 * 收藏夹分页查询响应
 */
export interface FavoritePageData {
  items: FavoriteItem[]
  page: number
  page_size: number
  total: number
  total_pages: number
}

/**
 * 取消收藏请求参数
 */
export interface UnCollectParams {
  collect_id: string
}

/**
 * 取消收藏响应数据
 */
export interface UnCollectData {
  collect_id: string
  work_id: string
  new_collect_count: number
}

/**
 * 收藏夹列表查询请求参数
 */
export interface FavoriteListParams {
  page?: number
  title?: string  // 模糊查询关键词
}

/**
 * Work 收藏夹列表查询请求参数（新版 API）
 */
export interface WorkCollectListParams {
  page?: number
  title?: string  // 模糊查询关键词
}

/**
 * 收藏夹搜索请求参数
 */
export interface FavoriteSearchParams extends KeywordSearchParams, PageParams {}

// ==================== AI 会话模块 (AI Session & Chat) ====================

/**
 * AI 会话项
 */
export interface SessionItem {
  session_id: string
  name: string
  create_time: number
}

/**
 * AI 会话列表响应（直接返回数组）
 */
export type SessionListData = SessionItem[]

/**
 * 创建会话请求参数
 */
export interface CreateSessionParams {
  session_id: string
  name: string
}

/**
 * 创建会话响应数据
 */
export interface CreateSessionData {
  session_id: string
  name: string
}

/**
 * 重命名会话请求参数
 * PUT /api/session/rename
 */
export interface RenameSessionParams {
  session_id: string
  name: string
}

/**
 * 删除会话请求参数
 */
export interface DeleteSessionParams {
  session_id: string
}

/**
 * QA 问答对
 */
export interface QAPair {
  question_id: string
  question: string
  answer: string
  num_render: number
  status: 'normal' | 'stopped'
  timestamp: number
}

/**
 * QA 列表响应（直接返回数组）
 */
export type QAListData = QAPair[]

/**
 * QA 详情
 */
export interface QADetail extends QAPair {
  session_id: string
}

/**
 * 发送消息请求参数
 */
export interface SendMessageParams {
  session_id: string
  question: string
}

/**
 * 中断对话请求参数
 */
export interface StopQAParams {
  session_id: string
  question_id: string
  num_render: number
}

/**
 * 中断对话响应数据
 */
export interface StopQAData {
  session_id: string
  num_render: number
}

/**
 * 继续对话请求参数
 */
export interface ContinueQAParams {
  session_id: string
  question_id: string
}

/**
 * 继续对话响应数据
 */
export interface ContinueQAData {
  session_id: string
  question_id: string
}

/**
 * 删除对话请求参数
 */
export interface DeleteQAParams {
  question_id: string
}

/**
 * 删除对话响应数据
 */
export interface DeleteQAData {
  question_id: string
}

// ==================== 兼容旧版 AI 类型 ====================

/**
 * AI 会话信息（兼容旧版）
 */
export interface AISession {
  id: string
  title: string
  create_time: number
  update_time: number
  message_count: number
}

/**
 * AI 会话列表响应（兼容旧版）
 */
export interface AISessionListData {
  list: AISession[]
  total: number
}

/**
 * 聊天消息（兼容旧版）
 */
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

/**
 * 聊天历史响应（兼容旧版）
 */
export interface ChatHistoryData {
  session_id: string
  messages: ChatMessage[]
  total: number
}

/**
 * 发送消息响应（非流式，兼容旧版）
 */
export interface SendMessageData {
  message_id: string
  content: string
  timestamp: number
}

/**
 * 流式响应数据块
 */
export interface StreamChunk {
  type: 'text' | 'done' | 'error'
  content?: string
  message_id?: string
  error?: string
}

// ==================== 多模态输入模块 (Multipart Input) ====================

/**
 * OCR 图片识别响应数据
 * 返回识别出的文本内容
 */
export type OcrTextData = string

/**
 * 音频转写响应数据
 * 返回转写出的文本内容
 */
export type AudioTranscribeData = string

// ==================== 资源推荐模块 (Recommend) ====================

/**
 * B站资源推荐请求参数
 */
export interface BilibiliRecommendParams {
  query: string       // 当前用户问题内容
  session_id: string  // 会话唯一标识符（UUID格式）
}

/**
 * B站资源推荐响应数据
 */
export interface BilibiliRecommendData {
  name: string | null   // 视频标题（无结果时为 null）
  url: string | null    // 视频链接（无结果时为 null）
}
