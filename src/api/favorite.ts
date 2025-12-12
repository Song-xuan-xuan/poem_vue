import { request } from '@/utils/request'
import type { 
  Result,
  FavoritePageData
} from './type'

/**
 * 收藏夹相关 API
 */

/**
 * 分页查询收藏夹列表
 * @param params - 支持 page 和 title（模糊查询）参数
 */
export const getFavorites = (params: { page?: number; title?: string }): Promise<Result<FavoritePageData>> => {
  return request.get('/api/collect/list', { params })
}

/**
 * 取消收藏
 * @param collectId - 收藏记录ID
 */
export const unCollect = (collectId: string): Promise<Result<any>> => {
  return request.delete(`/api/collect/${collectId}`)
}


