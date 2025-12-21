import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { likePost as likePostAPI, collectPost as collectPostAPI } from '@/api/work'
import { useUserStore } from '@/stores/user'
import { useAuthModalStore } from '@/stores/authModal'

/**
 * 防抖函数
 */
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

/**
 * 点赞和收藏的乐观 UI 更新 Hook
 */
export function useLikeAndFavor() {
  const userStore = useUserStore()
  const authModalStore = useAuthModalStore()

  // 防抖请求队列，用于合并多次快速点击
  const pendingRequests = ref(new Map<string, boolean>())

  /**
   * 点赞帖子（只能点赞一次，不支持取消）
   * @param postId 帖子 ID
   * @param currentCount 当前点赞数
   * @param onSuccess 成功回调
   * @param onError 错误回调
   */
  const handleLikePost = debounce(
    async (
      postId: string,
      currentCount: number,
      onSuccess: (count: number) => void,
      onError?: () => void
    ) => {
      if (!userStore.isLoggedIn()) {
        authModalStore.open({ tab: 'login', redirectPath: `/forum/post/${postId}` })
        return
      }

      const requestKey = `like_${postId}`
      
      // 如果已有相同请求在进行中，忽略本次请求
      if (pendingRequests.value.get(requestKey)) {
        return
      }

      // 标记请求进行中
      pendingRequests.value.set(requestKey, true)

      try {
        const res = await likePostAPI(postId)
        // 请求成功，使用接口返回的最新点赞数
        ElMessage.success('点赞成功')
        onSuccess(res.data.like_count)
      } catch (error: any) {
        // 处理重复点赞错误
        if (error.response?.status === 400 || error.message?.includes('重复') || error.message?.includes('已')) {
          ElMessage.warning('您已点赞过该帖子')
          // 保持当前计数，不增加
          onSuccess(currentCount)
        } else {
          ElMessage.error(error.message || '点赞失败')
          if (onError) onError()
        }
      } finally {
        // 移除请求标记
        pendingRequests.value.delete(requestKey)
      }
    },
    300
  )

  /**
   * 收藏帖子（只能收藏一次，不支持取消）
   * 注意：取消收藏只能在收藏夹页面进行
   * @param postId 帖子 ID
   * @param currentCount 当前收藏数
   * @param onSuccess 成功回调
   * @param onError 错误回调
   */
  const handleCollectPost = debounce(
    async (
      postId: string,
      currentCount: number,
      onSuccess: (count: number) => void,
      onError?: () => void
    ) => {
      if (!userStore.isLoggedIn()) {
        authModalStore.open({ tab: 'login', redirectPath: `/forum/post/${postId}` })
        return
      }

      const requestKey = `collect_${postId}`

      // 如果已有相同请求在进行中，忽略本次请求
      if (pendingRequests.value.get(requestKey)) {
        return
      }

      // 标记请求进行中
      pendingRequests.value.set(requestKey, true)

      try {
        const res = await collectPostAPI(postId)
        // 请求成功，使用接口返回的最新收藏数
        ElMessage.success('收藏成功')
        onSuccess(res.data.collect_count)
      } catch (error: any) {
        // 处理重复收藏错误
        if (error.response?.status === 400 || error.message?.includes('重复') || error.message?.includes('已收藏')) {
          ElMessage.warning('您已收藏过该帖子')
          // 保持当前计数，不增加
          onSuccess(currentCount)
        } else {
          ElMessage.error(error.message || '收藏失败')
          if (onError) onError()
        }
      } finally {
        // 移除请求标记
        pendingRequests.value.delete(requestKey)
      }
    },
    300
  )

  /**
   * 点赞帖子
   */
  const likePost = (
    postId: string,
    currentCount: number,
    onSuccess: (count: number) => void,
    onError?: () => void
  ) => {
    handleLikePost(postId, currentCount, onSuccess, onError)
  }

  /**
   * 收藏帖子
   */
  const collectPost = (
    postId: string,
    currentCount: number,
    onSuccess: (count: number) => void,
    onError?: () => void
  ) => {
    handleCollectPost(postId, currentCount, onSuccess, onError)
  }

  return {
    likePost,
    collectPost
  }
}
