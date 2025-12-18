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
          :key="item.collect_id"
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
              @click.stop="handleUnCollect(item.collect_id, item.work_info.title)"
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
                <el-icon><Star /></el-icon>
                {{ item.work_info.like_count }}
              </span>
              <span class="stat-item">
                <el-icon><Collection /></el-icon>
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

      <!-- 分页 -->
      <div class="pagination-container" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next, jumper"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Delete, Star, ChatDotRound, Clock } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FavoriteItem } from '@/api/type'
import { getFavorites, unCollect } from '@/api/favorite'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 搜索
const searchKeyword = ref('')
const searchLoading = ref(false)

// 收藏列表
const loading = ref(false)
const favorites = ref<FavoriteItem[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)  // 固定10条/页

/**
 * 加载收藏列表
 */
const loadFavorites = async () => {
  if (!userStore.isLoggedIn()) {
    ElMessage.warning('请先登录')
    router.push('/auth/login')
    return
  }

  loading.value = true
  try {
    const res = await getFavorites({
      page: currentPage.value,
      title: searchKeyword.value.trim() || undefined
    })
    favorites.value = res.data.items || []
    total.value = res.data.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载收藏列表失败')
    favorites.value = []
    total.value = 0
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
  await loadFavorites()
  searchLoading.value = false
}

/**
 * 取消收藏
 */
const handleUnCollect = async (collectId: string, title: string) => {
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

    await unCollect(collectId)
    ElMessage.success('取消收藏成功')

    // 刷新列表
    await loadFavorites()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '取消收藏失败')
    }
  }
}

/**
 * 分页切换
 */
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadFavorites()
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
const formatCollectTime = (dateStr: string) => {
  if (!dateStr) return ''
  // 解析时间字符串：2025-12-07T10:30:00
  const date = new Date(dateStr)
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
})
</script>

<style scoped lang="scss">
.favorites-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;

  .toolbar {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 24px;

    .search-input {
      flex: 1;
      max-width: 500px;
    }

    .stats {
      font-size: 14px;
      color: #606266;

      .highlight {
        color: #409eff;
        font-weight: 600;
        font-size: 18px;
      }
    }
  }

  .favorites-container {
    min-height: 400px;

    .favorites-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      margin-bottom: 24px;

      .favorite-card {
        cursor: pointer;
        transition: all 0.3s;
        height: 280px;
        display: flex;
        flex-direction: column;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        :deep(.el-card__body) {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 20px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;

          .card-title-section {
            flex: 1;
            min-width: 0;

            .card-title {
              margin: 0 0 8px 0;
              font-size: 18px;
              font-weight: 600;
              color: #303133;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              line-clamp: 2;
              -webkit-box-orient: vertical;
              line-height: 1.4;
            }

            .card-tags {
              display: flex;
              gap: 6px;
              flex-wrap: wrap;
            }
          }
        }

        .card-content {
          flex: 1;
          margin-bottom: 12px;
          overflow: hidden;

          .content-preview {
            color: #606266;
            font-size: 14px;
            line-height: 1.6;
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            line-clamp: 3;
            -webkit-box-orient: vertical;
          }
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid #f0f0f0;

          .author-info {
            display: flex;
            align-items: center;
            gap: 8px;

            .author-name {
              font-size: 14px;
              color: #606266;
              font-weight: 500;
            }
          }

          .card-stats {
            display: flex;
            gap: 12px;
            font-size: 13px;
            color: #909399;

            .stat-item,
            .collect-time {
              display: flex;
              align-items: center;
              gap: 4px;

              .el-icon {
                font-size: 14px;
              }
            }

            .collect-time {
              color: #c0c4cc;
              font-size: 12px;
            }
          }
        }
      }
    }

    .pagination-container {
      display: flex;
      justify-content: center;
      padding: 20px 0;
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
        gap: 12px;

        .favorite-card {
          height: auto;
          min-height: 220px;
        }
      }
    }
  }
}
</style>
