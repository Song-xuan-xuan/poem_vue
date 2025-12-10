import { request } from '@/utils/request'
import type {
  Result,
  AISessionListData,
  CreateSessionParams,
  CreateSessionData,
  RenameSessionParams,
  DeleteSessionParams
} from './type'

/**
 * AI 会话管理 API
 */

/**
 * 获取会话列表
 */
export const getSessionList = (): Promise<Result<AISessionListData>> => {
  return request.get('/api/ai/sessions')
}

/**
 * 创建新会话
 */
export const createSession = (params: CreateSessionParams = {}): Promise<Result<CreateSessionData>> => {
  return request.post('/api/ai/session', params)
}

/**
 * 重命名会话
 */
export const renameSession = (params: RenameSessionParams): Promise<Result<null>> => {
  return request.put('/api/ai/session/rename', params)
}

/**
 * 删除会话
 */
export const deleteSession = (params: DeleteSessionParams): Promise<Result<null>> => {
  return request.delete(`/api/ai/session/${params.session_id}`)
}

/**
 * 获取会话详情
 */
export const getSessionDetail = (sessionId: string): Promise<Result<any>> => {
  return request.get(`/api/ai/session/${sessionId}`)
}
