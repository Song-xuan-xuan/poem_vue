import { ref, computed } from 'vue'

export interface PaginationOptions {
  initialPage?: number
  initialPageSize?: number
  pageSizes?: number[]
}

export function usePagination(options: PaginationOptions = {}) {
  const {
    initialPage = 1,
    initialPageSize = 20,
    pageSizes = [10, 20, 30, 50, 100]
  } = options

  const currentPage = ref(initialPage)
  const pageSize = ref(initialPageSize)
  const total = ref(0)

  // 计算总页数
  const totalPages = computed(() => {
    return Math.ceil(total.value / pageSize.value) || 1
  })

  // 计算分页范围
  const pageRange = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value + 1
    const end = Math.min(currentPage.value * pageSize.value, total.value)
    return { start, end }
  })

  // 是否有上一页
  const hasPrev = computed(() => currentPage.value > 1)

  // 是否有下一页
  const hasNext = computed(() => currentPage.value < totalPages.value)

  /**
   * 设置总数
   */
  const setTotal = (value: number) => {
    total.value = value
  }

  /**
   * 切换页码
   */
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  /**
   * 切换每页条数
   */
  const handleSizeChange = (size: number) => {
    pageSize.value = size
    // 重置到第一页
    currentPage.value = 1
  }

  /**
   * 上一页
   */
  const prev = () => {
    if (hasPrev.value) {
      currentPage.value--
    }
  }

  /**
   * 下一页
   */
  const next = () => {
    if (hasNext.value) {
      currentPage.value++
    }
  }

  /**
   * 重置分页
   */
  const reset = () => {
    currentPage.value = initialPage
    pageSize.value = initialPageSize
    total.value = 0
  }

  /**
   * 跳转到指定页
   */
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  return {
    currentPage,
    pageSize,
    total,
    totalPages,
    pageRange,
    hasPrev,
    hasNext,
    pageSizes,
    setTotal,
    handlePageChange,
    handleSizeChange,
    prev,
    next,
    reset,
    goToPage
  }
}
