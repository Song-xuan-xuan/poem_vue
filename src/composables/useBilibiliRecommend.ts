import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getBilibiliRecommend } from '@/api/recommend'
import type { BilibiliRecommendData } from '@/api/type'

/**
 * B站资源推荐 Composable
 * 职责：根据 sessionId + query 获取推荐视频
 */
export const useBilibiliRecommend = () => {
  const recommendLoading = ref(false)

  /**
   * 获取 B站视频推荐
   * @param sessionId 会话 ID（UUID 格式）
   * @param query 当前用户问题内容
   * @returns B站视频推荐数据（包含标题和链接，无结果时为 null）
   */
  const fetchBilibili = async (
    sessionId: string,
    query: string
  ): Promise<BilibiliRecommendData> => {
    // 参数校验
    if (!sessionId) {
      ElMessage.error('缺少会话 ID')
      return { name: null, url: null }
    }

    if (!query || query.trim() === '') {
      ElMessage.error('问题内容不能为空')
      return { name: null, url: null }
    }

    recommendLoading.value = true
    try {
      const res = await getBilibiliRecommend({
        session_id: sessionId,
        query: query.trim()
      })

      if (res.code === 200) {
        if (res.data.name && res.data.url) {
          // ElMessage.success('成功获取 B站推荐视频')
        } else {
          ElMessage.info('未找到相关的 B站视频')
        }
        return res.data
      } else {
        ElMessage.error(res.message || '获取推荐失败')
        return { name: null, url: null }
      }
    } catch (error: any) {
      console.error('获取 B站推荐失败:', error)
      ElMessage.error(error.message || '获取推荐失败')
      return { name: null, url: null }
    } finally {
      recommendLoading.value = false
    }
  }

  return {
    // 状态
    recommendLoading,
    
    // 方法
    fetchBilibili
  }
}
