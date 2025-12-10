import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { PoemInfo, PageData } from '@/api/type'
import {
  getPoemPage,
  getPoemsByTags,
  searchPoemsByParagraph,
  searchPoemsByTitle
} from '@/api/poem'

export interface SearchParams {
  keyword?: string
  tags?: string[]
  searchType?: 'title' | 'paragraph' | 'all'
  page?: number
  pageSize?: number
}

export function usePoemSearch() {
  const loading = ref(false)
  const poems = ref<PoemInfo[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)

  // 搜索参数
  const searchParams = ref<SearchParams>({
    keyword: '',
    tags: [],
    searchType: 'all',
    page: 1,
    pageSize: 20
  })

  // 是否有搜索条件
  const hasSearchCondition = computed(() => {
    return (
      !!searchParams.value.keyword ||
      (searchParams.value.tags && searchParams.value.tags.length > 0)
    )
  })

  /**
   * 执行搜索
   */
  const search = async () => {
    loading.value = true
    try {
      let result: PageData<PoemInfo>

      const { keyword, tags, searchType, page, pageSize: size } = searchParams.value

      // 优先按标签筛选
      if (tags && tags.length > 0) {
        const res = await getPoemsByTags({ tags })
        // PoemListData 转换为 PageData 格式
        result = {
          list: res.data.list,
          total: res.data.total,
          page_size: size || 20,
          page_num: page || 1,
          total_pages: Math.ceil(res.data.total / (size || 20))
        }
      }
      // 按关键词搜索
      else if (keyword && keyword.trim()) {
        if (searchType === 'title') {
          const res = await searchPoemsByTitle({ keyword: keyword.trim() })
          result = {
            list: res.data.list,
            total: res.data.total,
            page_size: size || 20,
            page_num: page || 1,
            total_pages: Math.ceil(res.data.total / (size || 20))
          }
        } else if (searchType === 'paragraph') {
          const res = await searchPoemsByParagraph({ keyword: keyword.trim() })
          result = {
            list: res.data.list,
            total: res.data.total,
            page_size: size || 20,
            page_num: page || 1,
            total_pages: Math.ceil(res.data.total / (size || 20))
          }
        } else {
          // 'all' 模式：先搜标题，如果没结果再搜正文
          const titleRes = await searchPoemsByTitle({ keyword: keyword.trim() })
          if (titleRes.data.list && titleRes.data.list.length > 0) {
            result = {
              list: titleRes.data.list,
              total: titleRes.data.total,
              page_size: size || 20,
              page_num: page || 1,
              total_pages: Math.ceil(titleRes.data.total / (size || 20))
            }
          } else {
            const paragraphRes = await searchPoemsByParagraph({ keyword: keyword.trim() })
            result = {
              list: paragraphRes.data.list,
              total: paragraphRes.data.total,
              page_size: size || 20,
              page_num: page || 1,
              total_pages: Math.ceil(paragraphRes.data.total / (size || 20))
            }
          }
        }
      }
      // 无搜索条件，获取全部分页数据
      else {
        const res = await getPoemPage({ page_num: page || 1, page_size: size || 20 })
        result = res.data
      }

      poems.value = result.list || []
      total.value = result.total || 0
      currentPage.value = result.page_num || 1
      pageSize.value = result.page_size || 20
    } catch (error: any) {
      ElMessage.error(error.message || '搜索失败')
      poems.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置搜索
   */
  const resetSearch = () => {
    searchParams.value = {
      keyword: '',
      tags: [],
      searchType: 'all',
      page: 1,
      pageSize: 20
    }
    currentPage.value = 1
    search()
  }

  /**
   * 设置搜索关键词
   */
  const setKeyword = (keyword: string) => {
    searchParams.value.keyword = keyword
    searchParams.value.page = 1
    currentPage.value = 1
  }

  /**
   * 设置标签筛选
   */
  const setTags = (tags: string[]) => {
    searchParams.value.tags = tags
    searchParams.value.page = 1
    currentPage.value = 1
  }

  /**
   * 设置搜索类型
   */
  const setSearchType = (type: 'title' | 'paragraph' | 'all') => {
    searchParams.value.searchType = type
  }

  /**
   * 切换页码
   */
  const changePage = (page: number) => {
    searchParams.value.page = page
    currentPage.value = page
    search()
  }

  /**
   * 切换每页条数
   */
  const changePageSize = (size: number) => {
    searchParams.value.pageSize = size
    searchParams.value.page = 1
    pageSize.value = size
    currentPage.value = 1
    search()
  }

  return {
    loading,
    poems,
    total,
    currentPage,
    pageSize,
    searchParams,
    hasSearchCondition,
    search,
    resetSearch,
    setKeyword,
    setTags,
    setSearchType,
    changePage,
    changePageSize
  }
}
