<template>
  <div class="favorites-page">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索收藏的帖子..."
        class="search-input"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button :icon="Search" @click="handleSearch" :loading="searchLoading" />
        </template>
      </el-input>

      <div class="stats">
        共 <span class="highlight">{{ total }}</span> 条收藏
      </div>
    </div>

    <!-- 收藏列表 -->
    <div v-loading="loading" class="favorites-container">
      <el-empty v-if="!loading && favorites.length === 0" description="暂无收藏" />

      <div v-else class="favorites-grid">
        <el-card
          v-for="item in favorites"
          :key="item.work_info.id"
          shadow="hover"
          class="favorite-card"
          @click="goToPost(item.work_info.id)"
        >
          <!-- 卡片头部 -->
          <div class="card-header">
            <div class="card-title-section">
              <h3 class="card-title">{{ item.work_info.title }}</h3>
              <div class="card-tags" v-if="item.work_info.styles && item.work_info.styles.length > 0">
                <el-tag
                  v-for="style in item.work_info.styles.slice(0, 3)"
                  :key="style"
                  size="small"
                  type="info"
                  effect="plain"
                >
                  {{ style }}
                </el-tag>
              </div>
            </div>
            <el-button
              type="danger"
              size="small"
              text
              :icon="Delete"
              @click.stop="handleUnCollect(item.work_info.id, item.work_info.title)"
            >
              取消收藏
            </el-button>
          </div>

          <!-- 内容预览 -->
          <div class="card-content">
            <p class="content-preview">{{ item.work_info.content }}</p>
          </div>

          <!-- 卡片底部 -->
          <div class="card-footer">
            <div class="card-stats">
              <span class="stat-item">
                <span class="icon-wrapper" aria-hidden="true">
                  <!-- 空心爱心（与 ForumHome 一致） -->
                  <svg viewBox="0 0 24 24" width="1.2em" height="1.2em" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12.1 18.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/>
                  </svg>
                </span>
                {{ item.work_info.like_count }}
              </span>
              <span class="stat-item">
                <span class="icon-wrapper" aria-hidden="true">
                  <el-icon><StarFilled /></el-icon>
                </span>
                {{ item.work_info.collect_count }}
              </span>
              <span class="collect-time">
                <el-icon><Clock /></el-icon>
                {{ formatCollectTime(item.collect_time) }}
              </span>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 加载更多提示 -->
      <div class="load-more" v-if="favorites.length > 0">
        <div v-if="loading" class="loading-text">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>
        <div v-else-if="hasMore" class="load-more-text">
          向下滚动加载更多
        </div>
        <div v-else class="no-more-text">
          已加载全部收藏
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Delete, StarFilled, Clock, Loading } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FavoriteItem } from '@/api/type'
import { getFavorites, unCollect } from '@/api/favorite'
import { useUserStore } from '@/stores/user'
import { useAuthModalStore } from '@/stores/authModal'

const router = useRouter()
const userStore = useUserStore()
const authModalStore = useAuthModalStore()

// 搜索
const searchKeyword = ref('')
const searchLoading = ref(false)

// 收藏列表
const loading = ref(false)
const favorites = ref<FavoriteItem[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)  // 固定10条/页

// 外部收藏状态变化（从论坛/详情页触发）时，自动刷新收藏列表
let refreshTimer: ReturnType<typeof setTimeout> | null = null
const scheduleRefresh = () => {
  if (refreshTimer) clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => {
    // 重置并重新拉取，保证“新增/取消收藏”都能真实同步
    currentPage.value = 1
    loadFavorites(false)
    refreshTimer = null
  }, 250)
}

const onCollectChanged = (_e: Event) => {
  scheduleRefresh()
}

/**
 * 是否还有更多数据
 */
const hasMore = computed(() => {
  return currentPage.value * pageSize.value < total.value
})

/**
 * 加载收藏列表
 * @param append 是否追加数据
 */
const loadFavorites = async (append = false) => {
  if (!userStore.isLoggedIn()) {
    authModalStore.open({ tab: 'login', redirectPath: '/user/favorites' })
    return
  }

  loading.value = true
  try {
    const res = await getFavorites({
      page: currentPage.value,
      title: searchKeyword.value.trim() || undefined
    })

    // 新接口结构：{ items, total, page_size, total_pages }
    const items = res.data.items || []
    
    // 追加模式：累加数据
    if (append) {
      favorites.value = [...favorites.value, ...items]
    } else {
      // 替换模式：重置数据
      favorites.value = items
    }

    total.value = res.data.total || 0
    pageSize.value = res.data.page_size || 10
  } catch (error: any) {
    ElMessage.error(error.message || '加载收藏列表失败')
    if (!append) {
      favorites.value = []
      total.value = 0
    }
  } finally {
    loading.value = false
  }
}

/**
 * 搜索收藏
 */
const handleSearch = async () => {
  currentPage.value = 1
  searchLoading.value = true
  await loadFavorites(false)
  searchLoading.value = false
}

/**
 * 加载下一页
 */
const loadMore = async () => {
  if (loading.value || !hasMore.value) return

  currentPage.value++
  await loadFavorites(true)
}

/**
 * 滚动事件处理
 */
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  // 距离底部 200px 时触发加载
  if (scrollTop + windowHeight >= documentHeight - 200) {
    loadMore()
  }
}

/**
 * 取消收藏
 */
const handleUnCollect = async (poemId: string, title: string) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消收藏《${title}》吗？`,
      '取消收藏',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await unCollect(poemId)
    ElMessage.success('取消收藏成功')

    // 通知全局：收藏状态已变化（便于论坛/详情页等同步）
    window.dispatchEvent(
      new CustomEvent('work:collect-changed', {
        detail: { postId: String(poemId), collectStatus: 0 }
      })
    )

    // 从当前列表中移除该项（使用 work_info.id 匹配）
    favorites.value = favorites.value.filter(item => String(item.work_info.id) !== String(poemId))
    total.value--

    // 再拉一次，避免“乐观移除但后端没成功/数据不同步”
    scheduleRefresh()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '取消收藏失败')
    }
  }
}

/**
 * 跳转到帖子详情
 */
const goToPost = (postId: string) => {
  router.push(`/forum/post/${postId}`)
}

/**
 * 格式化收藏时间
 */
const formatCollectTime = (collectTime: number | string) => {
  if (!collectTime) return ''
  
  // 根据类型处理：number 是 Unix 时间戳（秒），string 是 ISO 字符串
  const date = typeof collectTime === 'number' 
    ? new Date(collectTime * 1000)  // Unix 时间戳（秒）转毫秒
    : new Date(collectTime)           // ISO 字符串直接解析
  
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return '今天收藏'
  } else if (days === 1) {
    return '昨天收藏'
  } else if (days < 7) {
    return `${days}天前收藏`
  } else {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day} 收藏`
  }
}

onMounted(() => {
  loadFavorites()
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll)

  // 监听其他页面的收藏/取消收藏
  window.addEventListener('work:collect-changed', onCollectChanged)
})

onUnmounted(() => {
  // 移除滚动监听
  window.removeEventListener('scroll', handleScroll)

  window.removeEventListener('work:collect-changed', onCollectChanged)
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
})
</script>

<style scoped lang="scss">
.favorites-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Noto Serif SC', 'Songti SC', serif;

  .toolbar {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 24px;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 253, 244, 0.8) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(16, 185, 129, 0.15);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.05);

    .search-input {
      flex: 1;
      max-width: 500px;

      :deep(.el-input__wrapper) {
        background-color: rgba(255, 255, 255, 0.6);
        box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2) inset;
        border-radius: 8px;
        padding-left: 12px;
        
        &.is-focus {
          box-shadow: 0 0 0 1px #10B981 inset;
          background-color: #fff;
        }
      }
      
      :deep(.el-input-group__append) {
        background-color: #10B981;
        border: none;
        box-shadow: none;
        
        .el-button {
          color: white;
          border: none;
          
          &:hover {
            background: transparent;
            color: white;
          }
        }
      }
    }

    .stats {
      font-size: 15px;
      color: #047857;
      font-weight: 500;

      .highlight {
        color: #10B981;
        font-weight: 700;
        font-size: 20px;
        margin: 0 4px;
      }
    }
  }

  .favorites-container {
    min-height: 400px;

    .favorites-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
      margin-bottom: 24px;

      .favorite-card {
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        height: 280px;
        display: flex;
        flex-direction: column;
        background: linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 253, 244, 0.6) 100%);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(16, 185, 129, 0.1);
        border-radius: 12px;
        overflow: hidden;
        animation: cardFadeIn 0.6s ease-out backwards;

        &:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 16px 32px -8px rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.3);
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(236, 253, 245, 0.8) 100%);
        }

        :deep(.el-card__body) {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 24px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;

          .card-title-section {
            flex: 1;
            min-width: 0;

            .card-title {
              font-size: 18px;
              font-weight: 700;
              color: #1F2937;
              margin: 0 0 8px 0;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              transition: color 0.3s;
            }

            .card-tags {
              display: flex;
              gap: 6px;
              
              .el-tag {
                background: transparent;
                border-color: rgba(16, 185, 129, 0.2);
                color: #059669;
                font-family: 'Noto Serif SC', serif;
              }
            }
          }
          
          .el-button {
            color: #9CA3AF;
            
            &:hover {
              color: #EF4444;
              background: rgba(239, 68, 68, 0.1);
            }
          }
        }

        .card-content {
          flex: 1;
          margin-bottom: 16px;
          overflow: hidden;

          .content-preview {
            color: #4B5563;
            font-size: 15px;
            line-height: 1.8;
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            line-clamp: 3;
            -webkit-box-orient: vertical;
            text-align: justify;
          }
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px dashed rgba(16, 185, 129, 0.15);

          .author-info {
            display: flex;
            align-items: center;
            gap: 8px;

            .author-name {
              font-size: 14px;
              color: #059669;
              font-weight: 500;
            }
          }

          .card-stats {
            display: flex;
            gap: 12px;
            color: #9CA3AF;
            font-size: 13px;
            
            span {
              display: flex;
              align-items: center;
              gap: 4px;
            }

            .icon-wrapper {
              display: inline-flex;
              align-items: center;
              font-size: 18px;
            }
          }
        }
      }
    }
    
    // 列表加载动画延迟
    @for $i from 1 through 12 {
      .favorite-card:nth-child(#{$i}) {
        animation-delay: #{$i * 0.05}s;
      }
    }

    @keyframes cardFadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes bounce {
      0% { transform: scale(1); }
      50% { transform: scale(1.4); }
      100% { transform: scale(1); }
    }

    // 轻弹：让图标风格与 ForumHome 更一致
    .favorite-card:hover {
      .card-stats {
        .icon-wrapper {
          animation: bounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      }
    }

    .load-more {
      text-align: center;
      padding: 40px 0;
      color: #909399;
      font-size: 14px;

      .loading-text {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #10B981;

        .el-icon {
          font-size: 18px;
        }
      }

      .load-more-text {
        color: #909399;
      }

      .no-more-text {
        color: #c0c4cc;
        font-style: italic;
      }
    }
  }
}

@media (max-width: 1200px) {
  .favorites-page {
    .favorites-container {
      .favorites-grid {
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      }
    }
  }
}

@media (max-width: 768px) {
  .favorites-page {
    padding: 12px;

    .toolbar {
      flex-direction: column;
      align-items: stretch;

      .search-input {
        max-width: 100%;
      }

      .stats {
        text-align: center;
      }
    }

    .favorites-container {
      .favorites-grid {
        grid-template-columns: 1fr;
        gap: 16px;

        .favorite-card {
          height: auto;
          min-height: 220px;
        }
      }
    }
  }
}
</style>
