import { requestBiz as request } from '@/utils/request'
import type { 
  Result,
  FavoritePageData,
  FavoriteListParams,
  UnCollectData
} from './type'

/**
 * 收藏夹相关 API
 */

/**
 * 分页查询收藏夹列表
 * @param params - 支持 page 和 title（模糊查询）参数
 */
export const getFavorites = (params: FavoriteListParams): Promise<Result<FavoritePageData>> => {
  return request.get('/api/collect/list', { params })
}

/**
 * 取消收藏
 * @param collectId - 收藏记录ID
 * @returns 包含最新 new_collect_count 的响应数据
 */
export const unCollect = (collectId: string): Promise<Result<UnCollectData>> => {
  return request.delete(`/api/collect/${collectId}`)
}


