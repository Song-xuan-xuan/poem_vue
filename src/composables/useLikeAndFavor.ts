import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { toggleLike, toggleCollect } from '@/api/forum'

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
  // 防抖请求队列，用于合并多次快速点击
  const pendingRequests = ref(new Map<string, boolean>())

  /**
   * 点赞/取消点赞
   * @param targetId 目标 ID（帖子或评论）
   * @param targetType 目标类型
   * @param currentLiked 当前是否已点赞
   * @param currentCount 当前点赞数
   * @param onUpdate 更新回调函数
   */
  const handleLike = debounce(
    async (
      targetId: string,
      targetType: 'post' | 'comment',
      currentLiked: boolean,
      currentCount: number,
      onUpdate: (liked: boolean, count: number) => void
    ) => {
      const requestKey = `like_${targetType}_${targetId}`
      
      // 如果已有相同请求在进行中，忽略本次请求
      if (pendingRequests.value.get(requestKey)) {
        return
      }

      // 乐观 UI 更新：立即更新 UI
      const newLiked = !currentLiked
      const newCount = newLiked ? currentCount + 1 : currentCount - 1
      onUpdate(newLiked, newCount)

      // 标记请求进行中
      pendingRequests.value.set(requestKey, true)

      try {
        await toggleLike({
          target_id: targetId,
          target_type: targetType
        })
        // 请求成功，保持 UI 状态
        ElMessage.success(newLiked ? '点赞成功' : '取消点赞')
      } catch (error: any) {
        // 请求失败，回退 UI 状态
        onUpdate(currentLiked, currentCount)
        ElMessage.error(error.message || '操作失败')
      } finally {
        // 移除请求标记
        pendingRequests.value.delete(requestKey)
      }
    },
    300
  )

  /**
   * 收藏/取消收藏
   * @param postId 帖子 ID
   * @param currentCollected 当前是否已收藏
   * @param currentCount 当前收藏数
   * @param onUpdate 更新回调函数
   */
  const handleCollect = debounce(
    async (
      postId: string,
      currentCollected: boolean,
      currentCount: number,
      onUpdate: (collected: boolean, count: number) => void
    ) => {
      const requestKey = `collect_${postId}`

      // 如果已有相同请求在进行中，忽略本次请求
      if (pendingRequests.value.get(requestKey)) {
        return
      }

      // 乐观 UI 更新：立即更新 UI
      const newCollected = !currentCollected
      const newCount = newCollected ? currentCount + 1 : currentCount - 1
      onUpdate(newCollected, newCount)

      // 标记请求进行中
      pendingRequests.value.set(requestKey, true)

      try {
        await toggleCollect({ post_id: postId })
        // 请求成功，保持 UI 状态
        ElMessage.success(newCollected ? '收藏成功' : '取消收藏')
      } catch (error: any) {
        // 请求失败，回退 UI 状态
        onUpdate(currentCollected, currentCount)
        ElMessage.error(error.message || '操作失败')
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
    currentLiked: boolean,
    currentCount: number,
    onUpdate: (liked: boolean, count: number) => void
  ) => {
    handleLike(postId, 'post', currentLiked, currentCount, onUpdate)
  }

  /**
   * 点赞评论
   */
  const likeComment = (
    commentId: string,
    currentLiked: boolean,
    currentCount: number,
    onUpdate: (liked: boolean, count: number) => void
  ) => {
    handleLike(commentId, 'comment', currentLiked, currentCount, onUpdate)
  }

  /**
   * 收藏帖子
   */
  const collectPost = (
    postId: string,
    currentCollected: boolean,
    currentCount: number,
    onUpdate: (collected: boolean, count: number) => void
  ) => {
    handleCollect(postId, currentCollected, currentCount, onUpdate)
  }

  return {
    likePost,
    likeComment,
    collectPost
  }
}
