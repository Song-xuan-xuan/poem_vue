import { requestAI as request } from '@/utils/request'
import type {
  Result,
  SessionItem,
  CreateSessionParams,
  CreateSessionData,
  RenameSessionParams
} from './type'

/**
 * AI 会话管理 API（对齐 api.md 智能体问答系统）
 * 使用 requestAI 连接到 8001 端口的 AI 服务
 */

/**
 * 获取会话列表
 * @returns 直接返回 SessionItem 数组（注意：没有 data.list 包裹）
 * GET /api/session/list
 */
export const getSessionList = (): Promise<Result<SessionItem[]>> => {
  return request.get('/api/session/list')
}

/**
 * 创建新会话
 * @param params { session_id: UUID, name: string }
 * @returns 创建的会话信息
 * POST /api/session/create
 * 注意：session_id 必须由前端生成（UUID 格式）
 */
export const createSession = (params: CreateSessionParams): Promise<Result<CreateSessionData>> => {
  return request.post('/api/session/create', params)
}

/**
 * 重命名会话
 * @param params { session_id: string, name: string }
 * PUT /api/session/rename
 */
export const renameSession = (params: RenameSessionParams): Promise<Result<{ session_id: string; new_name: string }>> => {
  return request.put('/api/session/rename', params)
}

/**
 * 删除会话
 * @param sessionId 会话 ID
 * DELETE /api/session/delete/{session_id}
 */
export const deleteSession = (sessionId: string): Promise<Result<{ session_id: string }>> => {
  return request.delete(`/api/session/delete/${sessionId}`)
}
