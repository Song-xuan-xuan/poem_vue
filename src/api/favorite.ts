import { request } from '@/utils/request'
import type { 
  Result,
  FavoritePageData,
  UnCollectParams,
  FavoriteSearchParams,
  PageParams
} from './type'

/**
 * 收藏夹相关 API
 */

/**
 * 分页查询收藏夹列表
 */
export const getFavorites = (params: PageParams): Promise<Result<FavoritePageData>> => {
  return request.get('/api/favorite/list', { params })
}

/**
 * 取消收藏
 */
export const unCollect = (params: UnCollectParams): Promise<Result<null>> => {
  return request.delete('/api/favorite/item', { data: params })
}

/**
 * 收藏夹搜索（模糊查询）
 */
export const searchFavorites = (params: FavoriteSearchParams): Promise<Result<FavoritePageData>> => {
  return request.get('/api/favorite/search', { params })
}
