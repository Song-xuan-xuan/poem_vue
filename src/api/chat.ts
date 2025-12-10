import { request } from '@/utils/request'
import type {
  Result,
  ChatHistoryData,
  SendMessageParams,
  SendMessageData
} from './type'

/**
 * AI 聊天 API
 */

/**
 * 获取聊天历史
 */
export const getChatHistory = (sessionId: string): Promise<Result<ChatHistoryData>> => {
  return request.get(`/api/ai/chat/history/${sessionId}`)
}

/**
 * 发送消息（非流式）
 */
export const sendMessage = (params: SendMessageParams): Promise<Result<SendMessageData>> => {
  return request.post('/api/ai/chat/send', params)
}

/**
 * 发送消息（流式）
 * 返回 Response 对象，需要调用者自行处理 ReadableStream
 */
export const sendMessageStream = async (params: SendMessageParams): Promise<Response> => {
  const baseURL = import.meta.env.VITE_API_BASE || ''
  const token = localStorage.getItem('accessToken')
  
  const response = await fetch(`${baseURL}/api/ai/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({
      ...params,
      stream: true
    })
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response
}

/**
 * 清空会话历史
 */
export const clearChatHistory = (sessionId: string): Promise<Result<null>> => {
  return request.delete(`/api/ai/chat/history/${sessionId}`)
}
