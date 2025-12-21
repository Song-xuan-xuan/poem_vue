<template>
  <div class="forum-home">
    <!-- 顶部操作栏 -->
    <div class="toolbar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索帖子..."
        class="search-input"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select
        v-model="selectedTag"
        placeholder="标签筛选"
        clearable
        @change="handleSearch"
        class="tag-filter"
      >
        <el-option label="全部" value="" />
        <el-option label="诗词讨论" value="诗词讨论" />
        <el-option label="创作分享" value="创作分享" />
        <el-option label="学习交流" value="学习交流" />
        <el-option label="问题求助" value="问题求助" />
        <el-option label="资源分享" value="资源分享" />
      </el-select>

      <el-button type="primary" :icon="Plus" @click="showCreateDialog = true">
        发布帖子
      </el-button>
    </div>

    <!-- 主体内容区 -->
    <div class="main-content">
      <!-- 左侧：帖子列表 -->
      <div class="post-list-container">
        <div v-loading="loading" class="post-list">
          <el-empty v-if="!loading && posts.length === 0" description="暂无帖子" />
          
          <div
            v-for="post in posts"
            :key="post.id"
            class="post-item"
            @click="goToDetail(post.id)"
          >
            <!-- 帖子内容 -->
            <div class="post-content">
              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-preview">{{ post.content }}</p>
              <div class="post-time">{{ formatTime(post.publish_time) }}</div>
              <div class="post-tags" v-if="post.styles && post.styles.length > 0">
                <el-tag
                  v-for="style in post.styles"
                  :key="style"
                  size="small"
                  type="info"
                  effect="plain"
                >
                  {{ style }}
                </el-tag>
              </div>
            </div>

            <!-- 帖子统计 -->
            <div class="post-footer" @click.stop>
              <div class="stats">
                <span class="stat-item">
                  <el-icon><ChatDotRound /></el-icon>
                  {{ post.comments?.length || 0 }}
                </span>
              </div>
              <div class="actions">
                <el-button
                  text
                  @click.stop="handleLikePost(post)"
                >
                  <el-icon><Star /></el-icon>
                  {{ post.like_count }}
                </el-button>
                <el-button
                  text
                  @click.stop="handleCollectPost(post)"
                >
                  <el-icon><Collection /></el-icon>
                  {{ post.collect_count }}
                </el-button>
              </div>
            </div>
          </div>
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

      <!-- 右侧：热力榜 -->
      <div class="hot-rank-container">
        <el-card shadow="hover" class="hot-rank-card">
          <template #header>
            <div class="rank-header">
              <el-icon class="fire-icon"><Histogram /></el-icon>
              <span>热力榜 Top10</span>
            </div>
          </template>
          <div v-loading="hotRankLoading" class="hot-rank-list">
            <el-empty v-if="!hotRankLoading && hotRankList.length === 0" description="暂无数据" />
            <div
              v-for="(item, index) in hotRankList"
              :key="item.id"
              class="hot-rank-item"
              @click="goToDetail(item.id)"
            >
              <div class="rank-number" :class="`rank-${index + 1}`">
                {{ index + 1 }}
              </div>
              <div class="rank-content">
                <div class="rank-title">{{ item.title }}</div>
                <div class="rank-stats">
                  <span>
                    <el-icon><Histogram /></el-icon>
                    {{ item.heat_score.toFixed(1) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 发布帖子对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="发布帖子"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="80px"
      >
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="createForm.title"
            placeholder="请输入帖子标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <el-input
            v-model="createForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入帖子内容"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="风格标签" prop="styles">
          <el-select
            v-model="createForm.styles"
            multiple
            placeholder="选择风格标签（最如3个）"
            style="width: 100%"
          >
            <el-option label="诗词讨论" value="诗词讨论" />
            <el-option label="创作分享" value="创作分享" />
            <el-option label="学习交流" value="学习交流" />
            <el-option label="问题求助" value="问题求助" />
            <el-option label="资源分享" value="资源分享" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" @click="handleCreatePost">
          发布
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search,
  Plus,
  Star,
  Collection,
  ChatDotRound,
  Histogram
} from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { WorkItem, HotWorkItem } from '@/api/type'
import { getHomePosts, searchPostsByKeyword, searchPostsByStyle, createPost, getHotRank } from '@/api/work'
import { useLikeAndFavor } from '@/composables/useLikeAndFavor'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const { likePost, collectPost } = useLikeAndFavor()

// 搜索和筛选
const searchKeyword = ref('')
const selectedTag = ref('')

// 帖子列表
const loading = ref(false)
const posts = ref<WorkItem[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// 热力榜
const hotRankLoading = ref(false)
const hotRankList = ref<HotWorkItem[]>([])

// 发布帖子
const showCreateDialog = ref(false)
const createLoading = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = ref({
  title: '',
  content: '',
  styles: [] as string[]
})

const createRules: FormRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度在 5 到 100 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' },
    { min: 10, max: 2000, message: '内容长度在 10 到 2000 个字符', trigger: 'blur' }
  ],
  styles: [
    {
      type: 'array',
      max: 3,
      message: '最多选择 3 个风格标签',
      trigger: 'change'
    }
  ]
}

/**
 * 加载帖子列表（支持搜索和筛选）
 */
const loadPosts = async () => {
  loading.value = true
  try {
    let res
    
    // 根据搜索关键词、风格标签或主页加载
    if (searchKeyword.value.trim()) {
      // 关键词搜索（每页 10 条）
      res = await searchPostsByKeyword(searchKeyword.value.trim(), currentPage.value)
      pageSize.value = 10
    } else if (selectedTag.value) {
      // 风格筛选（每页 10 条）
      res = await searchPostsByStyle(selectedTag.value, currentPage.value)
      pageSize.value = 10
    } else {
      // 主页列表（每页 20 条）
      res = await getHomePosts(currentPage.value)
      pageSize.value = 20
    }
    
    posts.value = res.data.items || []
    total.value = res.data.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载帖子列表失败')
    posts.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

/**
 * 加载热力榜
 */
const loadHotRank = async () => {
  hotRankLoading.value = true
  try {
    const res = await getHotRank()
    hotRankList.value = res.data.top10 || []
  } catch (error: any) {
    console.error('加载热力榜失败:', error)
    hotRankList.value = []
  } finally {
    hotRankLoading.value = false
  }
}

/**
 * 搜索帖子
 */
const handleSearch = () => {
  currentPage.value = 1
  loadPosts()
}

/**
 * 分页切换
 */
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadPosts()
}



/**
 * 点赞帖子
 */
const handleLikePost = (post: WorkItem) => {
  likePost(
    post.id,
    post.like_count,
    (count: number) => {
      post.like_count = count
    }
  )
}

/**
 * 收藏帖子
 */
const handleCollectPost = (post: WorkItem) => {
  collectPost(
    post.id,
    post.collect_count,
    (count: number) => {
      post.collect_count = count
    }
  )
}

/**
 * 发布帖子
 */
const handleCreatePost = async () => {
  if (!createFormRef.value) return

  await createFormRef.value.validate(async (valid) => {
    if (!valid) return

    createLoading.value = true
    try {
      const res = await createPost({
        title: createForm.value.title,
        content: createForm.value.content,
        styles: createForm.value.styles
      })
      ElMessage.success('发布成功')
      showCreateDialog.value = false
      createForm.value = { title: '', content: '', styles: [] }
      createFormRef.value?.resetFields()
      
      // 刷新列表
      currentPage.value = 1
      loadPosts()
      
      // 跳转到详情页（如果 API 返回了 ID）
      if (res.data?.poem?.id) {
        router.push(`/forum/post/${res.data.poem.id}`)
      }
    } catch (error: any) {
      ElMessage.error(error.message || '发布失败')
    } finally {
      createLoading.value = false
    }
  })
}

/**
 * 跳转到详情页
 */
const goToDetail = (postId: string) => {
  router.push(`/forum/post/${postId}`)
}

/**
 * 格式化时间
 */
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 7) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  } else if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return '刚刚'
  }
}

onMounted(() => {
  loadPosts()
  loadHotRank()
})
</script>

<style scoped lang="scss">
.forum-home {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;

  .toolbar {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    align-items: center;

    .search-input {
      flex: 1;
      max-width: 400px;
    }

    .tag-filter {
      width: 150px;
    }
  }

  .main-content {
    display: flex;
    gap: 20px;

    .post-list-container {
      flex: 1;
      min-width: 0;

      .post-list {
        min-height: 400px;

        .post-item {
          background: #fff;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
          }

          .post-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;

            .user-info {
              flex: 1;

              .user-name {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 600;
                color: #303133;
                margin-bottom: 4px;
              }

              .post-time {
                font-size: 12px;
                color: #909399;
              }
            }
          }

          .post-content {
            .post-title {
              font-size: 18px;
              font-weight: 600;
              color: #303133;
              margin: 0 0 12px 0;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              line-clamp: 2;
              -webkit-box-orient: vertical;
            }

            .post-preview {
              color: #606266;
              line-height: 1.6;
              margin-bottom: 12px;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 3;
              line-clamp: 3;
              -webkit-box-orient: vertical;
            }

            .post-tags {
              display: flex;
              gap: 8px;
              flex-wrap: wrap;
            }
          }

          .post-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #f0f0f0;

            .stats {
              display: flex;
              gap: 16px;

              .stat-item {
                display: flex;
                align-items: center;
                gap: 4px;
                color: #909399;
                font-size: 14px;

                .el-icon {
                  font-size: 16px;
                }
              }
            }

            .actions {
              display: flex;
              gap: 8px;

              .el-icon.filled {
                color: #f56c6c;
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

    .hot-rank-container {
      width: 320px;
      flex-shrink: 0;

      .hot-rank-card {
        position: sticky;
        top: 80px;

        .rank-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;

          .fire-icon {
            color: #f56c6c;
            font-size: 18px;
          }
        }

        .hot-rank-list {
          .hot-rank-item {
            display: flex;
            gap: 12px;
            padding: 12px 0;
            border-bottom: 1px solid #f0f0f0;
            cursor: pointer;
            transition: all 0.3s;

            &:last-child {
              border-bottom: none;
            }

            &:hover {
              background: #f5f7fa;
              padding-left: 8px;
              margin-left: -8px;
              padding-right: 8px;
              margin-right: -8px;
              border-radius: 4px;
            }

            .rank-number {
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #f0f0f0;
              color: #909399;
              border-radius: 4px;
              font-weight: 600;
              font-size: 14px;
              flex-shrink: 0;

              &.rank-1 {
                background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
                color: #fff;
              }

              &.rank-2 {
                background: linear-gradient(135deg, #c0c0c0 0%, #e0e0e0 100%);
                color: #fff;
              }

              &.rank-3 {
                background: linear-gradient(135deg, #cd7f32 0%, #daa520 100%);
                color: #fff;
              }
            }

            .rank-content {
              flex: 1;
              min-width: 0;

              .rank-title {
                font-size: 14px;
                color: #303133;
                margin-bottom: 4px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }

              .rank-stats {
                display: flex;
                gap: 12px;
                font-size: 12px;
                color: #909399;

                span {
                  display: flex;
                  align-items: center;
                  gap: 4px;
                }
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 1024px) {
  .forum-home {
    .main-content {
      flex-direction: column;

      .hot-rank-container {
        width: 100%;

        .hot-rank-card {
          position: static;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .forum-home {
    padding: 12px;

    .toolbar {
      flex-wrap: wrap;

      .search-input {
        max-width: 100%;
      }
    }
  }
}
</style>
