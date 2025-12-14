import { requestBiz as request } from '@/utils/request'
import type { 
  Result, 
  LoginParams, 
  RegisterParams, 
  RefreshTokenParams,
  TokenData, 
  RegisterData 
} from './type'

/**
 * 认证相关 API
 */

/**
 * 用户注册
 */
export const register = (params: RegisterParams): Promise<Result<RegisterData>> => {
  return request.post('/api/auth/register', params)
}

/**
 * 用户登录
 */
export const login = (params: LoginParams): Promise<Result<TokenData>> => {
  return request.post('/api/auth/login', params)
}

/**
 * 刷新令牌
 */
export const refreshToken = (params: RefreshTokenParams): Promise<Result<TokenData>> => {
  return request.post('/api/auth/refresh', params)
}
