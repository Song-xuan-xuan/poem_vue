import { requestBiz as request } from '@/utils/request'
import type { 
  Result,
  FavoritePageData,
  FavoriteListParams,
  UnCollectData,
  UnCollectWorkData
} from './type'

/**
 * 收藏夹相关 API
 * 
 * 注意：新版 API 已迁移到 /api/work/* 路径
 * - 推荐使用 src/api/work.ts 中的 getWorkCollectList() 和 cancelCollectPost()
 * - 本文件保留用于向后兼容
 */

/**
 * 分页查询收藏夹列表（新版 API）
 * @param params - 支持 page 和 title（模糊查询）参数
 */
export const getFavorites = (params: FavoriteListParams): Promise<Result<FavoritePageData>> => {
  return request.get('/api/work/list', { params })
}

/**
 * 取消收藏（新版 API）
 * @param poemId - 帖子ID（而非收藏记录ID）
 * @returns 包含更新后的 collect_count 和 collect_status
 */
export const unCollect = (poemId: string): Promise<Result<UnCollectWorkData>> => {
  return request.delete(`/api/work/collect/cancel/${poemId}`)
}


