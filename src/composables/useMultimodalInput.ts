import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { ocrImage, transcribeAudio } from '@/api/multipart'

/**
 * 多模态输入 Composable
 * 职责：校验文件 + 调用 API + 返回文本
 */
export const useMultimodalInput = () => {
  const ocrLoading = ref(false)
  const audioLoading = ref(false)

  /**
   * 校验图片文件
   * 支持格式：jpg, jpeg, png, webp
   * 最大大小：10MB
   */
  const validateImage = (file: File): boolean => {
    // 检查文件类型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      ElMessage.error('只支持 jpg/jpeg/png/webp 格式的图片')
      return false
    }

    // 检查文件大小（10MB）
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      ElMessage.error('图片大小不能超过 10MB')
      return false
    }

    return true
  }

  /**
   * 校验音频文件
   * 支持格式：mp3, wav, m4a, amr
   * 最大大小：5MB
   */
  const validateAudio = (file: File): boolean => {
    // 检查文件类型
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-m4a', 'audio/amr']
    const validExtensions = ['.mp3', '.wav', '.m4a', '.amr']
    const fileName = file.name.toLowerCase()
    
    const isValidType = validTypes.includes(file.type) || 
                        validExtensions.some(ext => fileName.endsWith(ext))
    
    if (!isValidType) {
      ElMessage.error('只支持 mp3/wav/m4a/amr 格式的音频')
      return false
    }

    // 检查文件大小（5MB）
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      ElMessage.error('音频大小不能超过 5MB')
      return false
    }

    return true
  }

  /**
   * 执行 OCR 图片识别
   * @param file 图片文件
   * @returns 识别出的文本内容
   */
  const runOcr = async (file: File): Promise<string> => {
    // 校验文件
    if (!validateImage(file)) {
      return ''
    }

    ocrLoading.value = true
    try {
      const res = await ocrImage(file)
      if (res.code === 200) {
        ElMessage.success('图片识别成功')
        return res.data
      } else {
        ElMessage.error(res.message || 'OCR 识别失败')
        return ''
      }
    } catch (error: any) {
      console.error('OCR 识别失败:', error)
      ElMessage.error(error.message || 'OCR 识别失败')
      return ''
    } finally {
      ocrLoading.value = false
    }
  }

  /**
   * 执行音频转写
   * @param file 音频文件
   * @returns 转写出的文本内容
   */
  const runAudioTranscribe = async (file: File): Promise<string> => {
    // 校验文件
    if (!validateAudio(file)) {
      return ''
    }

    audioLoading.value = true
    try {
      const res = await transcribeAudio(file)
      if (res.code === 200) {
        ElMessage.success('音频转写成功')
        return res.data
      } else {
        ElMessage.error(res.message || '音频转写失败')
        return ''
      }
    } catch (error: any) {
      console.error('音频转写失败:', error)
      ElMessage.error(error.message || '音频转写失败')
      return ''
    } finally {
      audioLoading.value = false
    }
  }

  return {
    // 状态
    ocrLoading,
    audioLoading,
    
    // 方法
    runOcr,
    runAudioTranscribe,
    validateImage,
    validateAudio
  }
}
