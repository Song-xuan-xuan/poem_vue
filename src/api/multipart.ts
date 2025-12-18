import { requestAI as request } from '@/utils/request'
import type { Result, OcrTextData, AudioTranscribeData } from './type'

/**
 * 多模态输入相关 API
 */

/**
 * OCR 图片识别
 * POST /api/multipart/ocr
 * @param image 图片文件（支持 jpg/jpeg/png/webp 格式，最大 10MB）
 * @returns 识别出的文本内容
 */
export const ocrImage = (image: File): Promise<Result<OcrTextData>> => {
  const form = new FormData()
  form.append('image', image)
  // 不手动设置 Content-Type，让浏览器自动添加 boundary
  return request.post('/api/multipart/ocr', form)
}

/**
 * 音频转写
 * POST /api/multipart/audio
 * @param audio 音频文件（支持 mp3/wav/m4a/amr 格式，最大 5MB）
 * @returns 转写出的文本内容
 */
export const transcribeAudio = (audio: File): Promise<Result<AudioTranscribeData>> => {
  const form = new FormData()
  form.append('audio', audio)
  // 不手动设置 Content-Type，让浏览器自动添加 boundary
  return request.post('/api/multipart/audio', form)
}
