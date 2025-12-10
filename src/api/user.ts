import { request } from '@/utils/request'
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
 * 查询登录用户信息
 */
export const getUserInfo = (): Promise<Result<UserInfo>> => {
  return request.get('/api/user/info')
}

/**
 * 查询用户主页（根据用户ID）
 */
export const getUserProfile = (userId: number): Promise<Result<UserProfileData>> => {
  return request.get(`/api/user/info/${userId}`)
}

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
