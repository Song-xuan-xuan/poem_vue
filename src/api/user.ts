import { requestBiz as request } from '@/utils/request'
import type { 
  Result,
  UserInfo,
  UserProfileData,
  UpdateNameParams,
  UpdateNameData,
  UploadAvatarData,
  UpdatePasswordParams
} from './type'

/**
 * 用户相关 API
 */

/**
 * 查询当前登录用户信息（含作品）
 * GET /api/user/info
 */
export const getCurrentUserInfo = (): Promise<Result<UserProfileData>> => {
  return request.get('/api/user/info')
}

/**
 * 查询他人用户主页（根据 user_id）
 * GET /api/user/info/{user_id}
 */
export const getUserInfoById = (userId: string | number): Promise<Result<UserProfileData>> => {
  return request.get(`/api/user/info/${userId}`)
}

// 兼容旧命名：避免一次性改动太多调用点
export const getUserInfo = getCurrentUserInfo
export const getUserProfile = getUserInfoById

/**
 * 修改网名
 */
export const updateName = (params: UpdateNameParams): Promise<Result<UpdateNameData>> => {
  return request.put('/api/user/name', params)
}

/**
 * 上传头像
 */
export const uploadAvatar = (file: File): Promise<Result<UploadAvatarData>> => {
  const formData = new FormData()
  formData.append('file', file)
  
  return request.put('/api/user/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 修改密码
 */
export const updatePassword = (params: UpdatePasswordParams): Promise<Result<null>> => {
  return request.put('/api/user/password', params)
}
