<template>
  <div class="post-detail">
    <!-- 返回按钮 -->
    <el-button class="back-btn" :icon="ArrowLeft" @click="goBack">返回列表</el-button>

    <div v-loading="loading" class="detail-container">
      <div v-if="!loading && postDetail">
        <!-- 帖子主体 -->
        <el-card class="post-card" shadow="hover">
          <!-- 帖子头部 -->
          <div class="post-header">
            <div class="user-section">
              <el-avatar :size="50">
                U
              </el-avatar>
              <div class="user-info">
                <div class="user-name">
                  用户 {{ postDetail.user_id }}
                </div>
                <div class="post-time">{{ formatTime(postDetail.publish_time) }}</div>
              </div>
            </div>

            <!-- 作者操作 -->
            <el-button
              v-if="isAuthor"
              type="danger"
              :icon="Delete"
              @click="handleDelete"
              :loading="deleteLoading"
            >
              删除帖子
            </el-button>
          </div>

          <el-divider />

          <!-- 帖子内容 -->
          <div class="post-content">
            <h1 class="post-title">{{ postDetail.title }}</h1>
            <div class="post-tags" v-if="postDetail.styles && postDetail.styles.length > 0">
              <el-tag
                v-for="style in postDetail.styles"
                :key="style"
                type="info"
                effect="plain"
              >
                {{ style }}
              </el-tag>
            </div>
            <div class="post-body">{{ postDetail.content }}</div>
          </div>

          <!-- 帖子统计和操作 -->
          <div class="post-footer">
            <div class="stats">
              <span class="stat-item">
                <el-icon><ChatDotRound /></el-icon>
                {{ postDetail.comment_total }} 评论
              </span>
            </div>
            <div class="actions">
              <el-button
                :type="postDetail.is_liked ? 'primary' : 'default'"
                :icon="Star"
                @click="handleLike"
              >
                {{ postDetail.is_liked ? '已点赞' : '点赞' }}
                ({{ postDetail.like_count }})
              </el-button>
              <el-button
                :type="postDetail.is_collected ? 'warning' : 'default'"
                :icon="Collection"
                @click="handleCollect"
              >
                {{ postDetail.is_collected ? '已收藏' : '收藏' }}
                ({{ postDetail.collect_count }})
              </el-button>
            </div>
          </div>
        </el-card>

        <!-- 评论区 -->
        <el-card class="comment-section" shadow="hover">
          <template #header>
            <div class="section-header">
              <span>评论 ({{ postDetail.comment_total }})</span>
            </div>
          </template>

          <!-- 发表评论 -->
          <div class="comment-form">
            <el-input
              v-model="commentContent"
              type="textarea"
              :rows="3"
              placeholder="发表您的评论..."
              maxlength="500"
              show-word-limit
            />
            <el-button
              type="primary"
              :icon="Promotion"
              @click="handleSubmitComment"
              :loading="commentLoading"
              :disabled="!commentContent.trim()"
              class="submit-btn"
            >
              发表评论
            </el-button>
          </div>

          <!-- 评论列表 -->
          <div class="comment-list">
            <el-empty
              v-if="postDetail.comments.length === 0"
              description="暂无评论，快来抢沙发吧！"
            />
            <div
              v-for="comment in postDetail.comments"
              :key="comment.comment_id"
              class="comment-item"
            >
              <el-avatar :size="40">
                {{ comment.user_name.charAt(0) }}
              </el-avatar>
              <div class="comment-content">
                <div class="comment-header">
                  <div class="user-info">
                    <span class="user-name">{{ comment.user_name }}</span>
                    <span class="comment-time">{{ formatTime(comment.comment_time) }}</span>
                  </div>
                </div>
                <div class="comment-body">{{ comment.content }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <el-empty v-else-if="!loading" description="未找到帖子" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Delete,
  Star,
  Collection,
  ChatDotRound,
  Promotion
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { WorkDetail } from '@/api/type'
import { getPostDetail, deletePost, createComment } from '@/api/work'
import { useLikeAndFavor } from '@/composables/useLikeAndFavor'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { likePost, collectPost } = useLikeAndFavor()

// 帖子详情（扩展类型以包含 UI 状态）
const loading = ref(false)
const postDetail = ref<(WorkDetail & { is_liked?: boolean; is_collected?: boolean }) | null>(null)

// 删除帖子
const deleteLoading = ref(false)

// 评论
const commentContent = ref('')
const commentLoading = ref(false)

// 是否是作者
const isAuthor = computed(() => {
  if (!postDetail.value || !userStore.userInfo) return false
  return postDetail.value.user_id === String(userStore.userInfo.id)
})

/**
 * 加载帖子详情
 */
const loadPostDetail = async () => {
  const postId = route.params.id as string
  if (!postId) {
    ElMessage.error('帖子ID不能为空')
    return
  }

  loading.value = true
  try {
    const res = await getPostDetail(postId)
    // 初始化 UI 状态字段
    postDetail.value = {
      ...res.data.detail,
      is_liked: false,
      is_collected: false
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载帖子详情失败')
    postDetail.value = null
  } finally {
    loading.value = false
  }
}

/**
 * 点赞帖子
 */
const handleLike = () => {
  if (!userStore.isLoggedIn()) {
    ElMessage.warning('请先登录')
    router.push('/auth/login')
    return
  }

  if (!postDetail.value) return
  
  // 如果已点赞，不再执行
  if (postDetail.value.is_liked) {
    ElMessage.info('您已点赞过该帖子')
    return
  }

  likePost(
    postDetail.value.id,
    postDetail.value.like_count,
    (count: number) => {
      if (postDetail.value) {
        postDetail.value.is_liked = true
        postDetail.value.like_count = count
      }
    }
  )
}

/**
 * 收藏帖子
 */
const handleCollect = () => {
  if (!userStore.isLoggedIn()) {
    ElMessage.warning('请先登录')
    router.push('/auth/login')
    return
  }

  if (!postDetail.value) return
  
  // 如果已收藏，不再执行
  if (postDetail.value.is_collected) {
    ElMessage.info('您已收藏过该帖子，可在收藏夹页面取消收藏')
    return
  }

  collectPost(
    postDetail.value.id,
    postDetail.value.collect_count,
    (count: number) => {
      if (postDetail.value) {
        postDetail.value.is_collected = true
        postDetail.value.collect_count = count
      }
    }
  )
}



/**
 * 删除帖子
 */
const handleDelete = async () => {
  if (!postDetail.value) return

  try {
    await ElMessageBox.confirm(
      '确定要删除这篇帖子吗？此操作不可恢复。',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    deleteLoading.value = true
    await deletePost(postDetail.value.id)
    ElMessage.success('删除成功')
    router.push('/forum')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  } finally {
    deleteLoading.value = false
  }
}

/**
 * 发表评论
 */
const handleSubmitComment = async () => {
  if (!userStore.isLoggedIn()) {
    ElMessage.warning('请先登录')
    router.push('/auth/login')
    return
  }

  if (!postDetail.value) return

  if (!commentContent.value.trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }

  commentLoading.value = true
  try {
    const res = await createComment({
      work_id: postDetail.value.id,
      content: commentContent.value.trim()
    })

    ElMessage.success('评论成功')
    commentContent.value = ''

    // 刷新详情
    await loadPostDetail()
  } catch (error: any) {
    ElMessage.error(error.message || '评论失败')
  } finally {
    commentLoading.value = false
  }
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
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
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

/**
 * 返回列表
 */
const goBack = () => {
  router.back()
}

onMounted(() => {
  loadPostDetail()
})
</script>

<style scoped lang="scss">
.post-detail {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;

  .back-btn {
    margin-bottom: 16px;
  }

  .detail-container {
    min-height: 400px;
  }

  .post-card {
    margin-bottom: 20px;

    .post-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .user-section {
        display: flex;
        align-items: center;
        gap: 12px;

        .user-info {
          .user-name {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 4px;
          }

          .post-time {
            font-size: 13px;
            color: #909399;
          }
        }
      }
    }

    .post-content {
      .post-title {
        font-size: 28px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 16px 0;
        line-height: 1.4;
      }

      .post-tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 20px;
      }

      .post-body {
        font-size: 16px;
        line-height: 1.8;
        color: #606266;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
    }

    .post-footer {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .stats {
        display: flex;
        gap: 16px;

        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #606266;
          font-size: 14px;

          .el-icon {
            font-size: 18px;
          }
        }
      }

      .actions {
        display: flex;
        gap: 12px;
      }
    }
  }

  .comment-section {
    .section-header {
      font-size: 18px;
      font-weight: 600;
    }

    .comment-form {
      margin-bottom: 24px;

      .submit-btn {
        margin-top: 12px;
        float: right;
      }

      &::after {
        content: '';
        display: block;
        clear: both;
      }
    }

    .comment-list {
      .comment-item {
        display: flex;
        gap: 12px;
        padding: 16px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .comment-content {
          flex: 1;
          min-width: 0;

          .comment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .user-info {
              display: flex;
              align-items: center;
              gap: 8px;

              .user-name {
                font-weight: 600;
                color: #303133;
              }

              .comment-time {
                font-size: 12px;
                color: #909399;
              }
            }

            .el-icon.filled {
              color: #f56c6c;
            }
          }

          .comment-body {
            font-size: 14px;
            line-height: 1.6;
            color: #606266;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .post-detail {
    padding: 12px;

    .post-card {
      .post-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .post-content {
        .post-title {
          font-size: 22px;
        }

        .post-body {
          font-size: 15px;
        }
      }

      .post-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;

        .actions {
          width: 100%;

          .el-button {
            flex: 1;
          }
        }
      }
    }
  }
}
</style>
