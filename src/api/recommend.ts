import { requestAI as request } from '@/utils/request'
import type { Result, BilibiliRecommendParams, BilibiliRecommendData } from './type'

/**
 * 资源推荐相关 API
 */

/**
 * B站资源推荐
 * GET /api/recommend/bilibili
 * @param params 包含 query（当前问题）和 session_id（会话ID）
 * @returns B站视频推荐结果（包含标题和链接，无结果时为 null）
 */
export const getBilibiliRecommend = (
  params: BilibiliRecommendParams
): Promise<Result<BilibiliRecommendData>> => {
  return request.get('/api/recommend/bilibili', { params })
}
