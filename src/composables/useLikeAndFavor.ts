import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  likePost as likePostAPI, 
  cancelLikePost as cancelLikePostAPI,
  collectPost as collectPostAPI,
  cancelCollectPost as cancelCollectPostAPI
} from '@/api/work'
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
 * 点赞和收藏的智能切换 Hook（支持乐观更新）
 */
export function useLikeAndFavor() {
  const userStore = useUserStore()
  const authModalStore = useAuthModalStore()

  // 防抖请求队列，防止重复点击
  const pendingRequests = ref(new Map<string, boolean>())

  /**
   * 切换点赞状态（支持点赞/取消点赞）
   * @param postId 帖子 ID
   * @param currentStatus 当前点赞状态（0=未点赞, 1=已点赞）
   * @param currentCount 当前点赞数
   * @param onSuccess 成功回调 (newStatus: number, newCount: number) => void
   * @param onError 失败回调（可选）
   */
  const toggleLike = debounce(
    async (
      postId: string,
      currentStatus: number,
      currentCount: number,
      onSuccess: (status: number, count: number) => void,
      onError?: () => void
    ) => {
      // 1. 检查登录状态
      if (!userStore.isLoggedIn()) {
        authModalStore.open({ tab: 'login', redirectPath: `/forum/post/${postId}` })
        return
      }

      const requestKey = `like_${postId}`
      
      // 2. 防止重复请求
      if (pendingRequests.value.get(requestKey)) {
        return
      }

      // 3. 乐观更新 UI（先更新界面）
      const optimisticStatus = currentStatus === 1 ? 0 : 1
      const optimisticCount = currentStatus === 1 ? currentCount - 1 : currentCount + 1
      onSuccess(optimisticStatus, optimisticCount)

      // 4. 标记请求进行中
      pendingRequests.value.set(requestKey, true)

      try {
        // 5. 根据当前状态决定调用点赞还是取消点赞
        if (currentStatus === 1) {
          // 已点赞 -> 取消点赞
          const res = await cancelLikePostAPI(postId)
          // ElMessage.success('已取消点赞')
          // 用接口返回的实际值覆盖 UI
          onSuccess(res.data.like_status, res.data.like_count)
        } else {
          // 未点赞 -> 点赞
          const res = await likePostAPI(postId)
          // ElMessage.success('点赞成功')
          // 用接口返回的实际值覆盖 UI
          onSuccess(res.data.like_status, res.data.like_count)
        }
      } catch (error: any) {
        // 6. 请求失败：回滚 UI
        ElMessage.error(error.message || '操作失败')
        onSuccess(currentStatus, currentCount)
        if (onError) onError()
      } finally {
        // 7. 移除请求标记
        pendingRequests.value.delete(requestKey)
      }
    },
    300
  )

  /**
   * 切换收藏状态（支持收藏/取消收藏）
   * @param postId 帖子 ID
   * @param currentStatus 当前收藏状态（0=未收藏, 1=已收藏）
   * @param currentCount 当前收藏数
   * @param onSuccess 成功回调 (newStatus: number, newCount: number) => void
   * @param onError 失败回调（可选）
   */
  const toggleCollect = debounce(
    async (
      postId: string,
      currentStatus: number,
      currentCount: number,
      onSuccess: (status: number, count: number) => void,
      onError?: () => void
    ) => {
      // 1. 检查登录状态
      if (!userStore.isLoggedIn()) {
        authModalStore.open({ tab: 'login', redirectPath: `/forum/post/${postId}` })
        return
      }

      const requestKey = `collect_${postId}`

      // 2. 防止重复请求
      if (pendingRequests.value.get(requestKey)) {
        return
      }

      // 3. 乐观更新 UI（先更新界面）
      const optimisticStatus = currentStatus === 1 ? 0 : 1
      const optimisticCount = currentStatus === 1 ? currentCount - 1 : currentCount + 1
      onSuccess(optimisticStatus, optimisticCount)

      // 4. 标记请求进行中
      pendingRequests.value.set(requestKey, true)

      try {
        // 5. 根据当前状态决定调用收藏还是取消收藏
        if (currentStatus === 1) {
          // 已收藏 -> 取消收藏
          const res = await cancelCollectPostAPI(postId)
          // ElMessage.success('已取消收藏')
          // 用接口返回的实际值覆盖 UI
          onSuccess(res.data.collect_status, res.data.collect_count)
        } else {
          // 未收藏 -> 收藏
          const res = await collectPostAPI(postId)
          // ElMessage.success('收藏成功')
          // 用接口返回的实际值覆盖 UI
          onSuccess(res.data.collect_status, res.data.collect_count)
        }
      } catch (error: any) {
        // 6. 请求失败：回滚 UI
        ElMessage.error(error.message || '操作失败')
        onSuccess(currentStatus, currentCount)
        if (onError) onError()
      } finally {
        // 7. 移除请求标记
        pendingRequests.value.delete(requestKey)
      }
    },
    300
  )

  /**
   * 点赞帖子（兼容旧版，仅支持点赞，不支持取消）
   * @deprecated 请使用 toggleLike
   */
  const likePost = (
    postId: string,
    currentCount: number,
    onSuccess: (count: number) => void,
    onError?: () => void
  ) => {
    toggleLike(postId, 0, currentCount, (status, count) => {
      onSuccess(count)
    }, onError)
  }

  /**
   * 收藏帖子（兼容旧版，仅支持收藏，不支持取消）
   * @deprecated 请使用 toggleCollect
   */
  const collectPost = (
    postId: string,
    currentCount: number,
    onSuccess: (count: number) => void,
    onError?: () => void
  ) => {
    toggleCollect(postId, 0, currentCount, (status, count) => {
      onSuccess(count)
    }, onError)
  }

  return {
    toggleLike,
    toggleCollect,
    // 兼容旧版
    likePost,
    collectPost
  }
}
