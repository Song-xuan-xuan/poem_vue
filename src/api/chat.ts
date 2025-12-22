import { requestAI as request } from '@/utils/request'
import { useUserStore } from '@/stores/user'
import type {
  Result,
  QAPair,
  QADetail,
  StopQAParams,
  StopQAData,
  ContinueQAParams,
  ContinueQAData,
  DeleteQAParams,
  DeleteQAData
} from './type'

/**
 * AI 聊天 API（对齐 api.md 智能体问答系统）
 * 使用 requestAI 连接到 8001 端口的 AI 服务
 */

/**
 * 获取对话列表（QA 历史记录）
 * @param sessionId 会话 ID
 * @returns QAPair 数组
 * GET /api/qa/list?session_id={sessionId}
 */
export const getQAList = (sessionId: string): Promise<Result<QAPair[]>> => {
  return request.get('/api/qa/list', { params: { session_id: sessionId } })
}

/**
 * 流式对话接口（SSE）
 * @param query 用户问题
 * @param sessionId 会话 ID（必须为 UUID）
 * @returns EventSource 对象，用于接收 SSE 流
 * GET /api/chat/dialog/stream?query={query}&session_id={sessionId}
 * 
 * 使用示例：
 * ```typescript
 * const eventSource = streamDialog('什么是微积分', 'uuid-xxx')
 * eventSource.onmessage = (event) => {
 *   if (event.data === '[DONE]') {
 *     eventSource.close()
 *     return
 *   }
 *   const data = JSON.parse(event.data)
 *   if (data.data.final) {
 *     // 流式结束
 *   } else {
 *     // 拼接 data.data.content
 *   }
 * }
 * ```
 */
export const streamDialog = (query: string, sessionId: string): EventSource => {
  const baseURL = import.meta.env.VITE_API_BASE_2 || 'http://localhost:8001'
  const userStore = useUserStore()
  const token = userStore.accessToken || localStorage.getItem('access_token')
  
  // 构建 URL 参数
  const params = new URLSearchParams({
    query,
    session_id: sessionId
  })
  
  // EventSource 不支持自定义 headers，需要通过 URL 传递 token
  // 或者使用 fetch + ReadableStream 手动实现 SSE
  const url = `${baseURL}/api/chat/dialog/stream?${params.toString()}`
  
  // 注意：标准 EventSource 不支持 Authorization header
  // 需要后端支持通过 URL 参数传递 token，或使用 fetch 实现
  const eventSource = new EventSource(url)
  
  return eventSource
}

/**
 * 使用 fetch 实现流式对话（支持 Authorization header）
 * Mock 模式下会自动模拟流式输出
 * @param query 用户问题
 * @param sessionId 会话 ID
 * @param onMessage 接收消息的回调
 * @param onError 错误回调
 * @param onComplete 完成回调
 */
export const streamDialogWithFetch = async (
  query: string,
  sessionId: string,
  onMessage: (content: string, isFinal: boolean, fullContent: string) => void,
  onError?: (error: Error) => void,
  onComplete?: () => void,
  options?: { signal?: AbortSignal }
): Promise<void> => {
  const isMock = import.meta.env.VITE_USE_MOCK === 'true'
  const userStore = useUserStore()
  const token = userStore.accessToken || localStorage.getItem('access_token')
  const signal = options?.signal
  
  // Mock 模式：使用 axios 请求，然后前端模拟流式输出
  if (isMock) {
    try {
      if (signal?.aborted) {
        return
      }

      const res = await request.get<Result<{ stream: boolean; question_id: string; full_content: string }>>('/api/chat/dialog/stream', {
        params: {
          query,
          session_id: sessionId
        }
      })

      if (res.code !== 200) {
        throw new Error(res.message || '对话失败')
      }

      const fullContent = (res.data as any)?.full_content || ''
      
      // 模拟流式输出：每次输出 3-8 个字符，间隔 50-100ms
      let currentIndex = 0
      const chunkSize = () => Math.floor(Math.random() * 6) + 3 // 3-8 字符
      const delay = () => Math.floor(Math.random() * 51) + 50 // 50-100ms

      const streamChunk = () => {
        if (signal?.aborted) {
          return
        }

        if (currentIndex >= fullContent.length) {
          // 发送最终消息
          onMessage('', true, fullContent)
          if (onComplete) onComplete()
          return
        }

        const size = Math.min(chunkSize(), fullContent.length - currentIndex)
        const chunk = fullContent.substring(currentIndex, currentIndex + size)
        currentIndex += size

        const accumulated = fullContent.substring(0, currentIndex)
        onMessage(chunk, false, accumulated)

        setTimeout(streamChunk, delay())
      }

      // 开始流式输出
      setTimeout(streamChunk, 100)
    } catch (error) {
      if (onError) onError(error as Error)
      throw error
    }
    return
  }

  // 真实模式：使用 fetch 实现 SSE
  const baseURL = import.meta.env.VITE_API_BASE_2 || 'http://localhost:8001'
  
  const params = new URLSearchParams({
    query,
    session_id: sessionId
  })
  
  try {
    const response = await fetch(`${baseURL}/api/chat/dialog/stream?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'text/event-stream'
      },
      signal
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('Response body is null')
    }

    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      
      // 按行分割
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // 保留最后一个不完整的行

      for (const line of lines) {
        if (!line.trim()) continue
        
        // 解析 SSE 格式：data: {...}
        if (line.startsWith('data: ')) {
          const data = line.substring(6).trim()
          
          // 检查结束标志
          if (data === '[DONE]') {
            if (onComplete) onComplete()
            return
          }
          
          try {
            const json = JSON.parse(data)
            if (json.code === 200 && json.data) {
              onMessage(
                json.data.content || '',
                json.data.final || false,
                json.data.full_content || ''
              )
            } else if (json.code !== 200) {
              throw new Error(json.message || '流式对话失败')
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e, data)
          }
        }
      }
    }

    if (onComplete) onComplete()
  } catch (error) {
    if ((error as any)?.name === 'AbortError') {
      // 用户主动取消
      return
    }
    if (onError) onError(error as Error)
    throw error
  }
}

/**
 * 中断 AI 回答
 * @param params { session_id: string; question_id: string; num_render: number }
 * POST /api/qa/stop
 */
export const stopQA = (params: StopQAParams): Promise<Result<StopQAData>> => {
  return request.post('/api/qa/stop', params)
}

/**
 * 继续中断的 AI 回答
 * @param params { session_id: string; question_id: string }
 * PUT /api/qa/continue
 */
export const continueQA = (params: ContinueQAParams): Promise<Result<ContinueQAData>> => {
  return request.put('/api/qa/continue', params)
}

/**
 * 删除对话记录
 * @param params { question_id: string }
 * DELETE /api/qa/delete
 */
export const deleteQA = (params: DeleteQAParams): Promise<Result<DeleteQAData>> => {
  return request.delete('/api/qa/delete', { data: params })
}

/**
 * 获取对话详情
 * @param questionId 问题 ID
 * GET /api/qa/detail?question_id={questionId}
 */
export const getQADetail = (questionId: string): Promise<Result<QADetail>> => {
  return request.get('/api/qa/detail', { params: { question_id: questionId } })
}
