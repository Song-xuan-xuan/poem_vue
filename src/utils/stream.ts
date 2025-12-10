import type { StreamChunk } from '@/api/type'

/**
 * 流式响应处理器
 */
export class StreamProcessor {
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null
  private decoder = new TextDecoder()
  private aborted = false

  /**
   * 处理流式响应
   * @param response Fetch Response 对象
   * @param onChunk 接收到数据块时的回调
   * @param onDone 流结束时的回调
   * @param onError 发生错误时的回调
   */
  async processStream(
    response: Response,
    onChunk: (chunk: StreamChunk) => void,
    onDone?: () => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    if (!response.body) {
      throw new Error('Response body is null')
    }

    this.reader = response.body.getReader()
    this.aborted = false

    try {
      let buffer = ''

      while (true) {
        const { done, value } = await this.reader.read()

        if (done || this.aborted) {
          break
        }

        // 解码数据块
        const chunk = this.decoder.decode(value, { stream: true })
        buffer += chunk

        // 按行分割数据
        const lines = buffer.split('\n')
        // 保留最后一个不完整的行
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine) continue

          // 处理 SSE 格式: data: {...}
          if (trimmedLine.startsWith('data: ')) {
            const jsonStr = trimmedLine.slice(6)
            
            // 处理特殊标记
            if (jsonStr === '[DONE]') {
              onChunk({ type: 'done' })
              continue
            }

            try {
              const data = JSON.parse(jsonStr)
              onChunk(data)
            } catch (e) {
              // 如果不是 JSON，直接当作文本处理
              onChunk({
                type: 'text',
                content: jsonStr
              })
            }
          } else {
            // 非 SSE 格式，尝试解析 JSON
            try {
              const data = JSON.parse(trimmedLine)
              onChunk(data)
            } catch (e) {
              // 解析失败，当作纯文本
              onChunk({
                type: 'text',
                content: trimmedLine
              })
            }
          }
        }
      }

      // 处理剩余的 buffer
      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer)
          onChunk(data)
        } catch (e) {
          onChunk({
            type: 'text',
            content: buffer
          })
        }
      }

      if (!this.aborted && onDone) {
        onDone()
      }
    } catch (error) {
      if (!this.aborted && onError) {
        onError(error as Error)
      }
    } finally {
      this.cleanup()
    }
  }

  /**
   * 中止流处理
   */
  abort(): void {
    this.aborted = true
    if (this.reader) {
      this.reader.cancel()
    }
  }

  /**
   * 清理资源
   */
  private cleanup(): void {
    if (this.reader) {
      this.reader.releaseLock()
      this.reader = null
    }
  }
}

/**
 * 简化的流式处理函数
 */
export async function processStreamResponse(
  response: Response,
  onText: (text: string) => void,
  onDone?: () => void,
  onError?: (error: Error) => void
): Promise<StreamProcessor> {
  const processor = new StreamProcessor()

  processor.processStream(
    response,
    (chunk) => {
      if (chunk.type === 'text' && chunk.content) {
        onText(chunk.content)
      } else if (chunk.type === 'done') {
        if (onDone) onDone()
      } else if (chunk.type === 'error' && chunk.error) {
        if (onError) onError(new Error(chunk.error))
      }
    },
    onDone,
    onError
  )

  return processor
}
