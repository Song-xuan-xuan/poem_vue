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
        v-model="selectedStyleTag"
        placeholder="风格"
        clearable
        @change="handleSearch"
        class="tag-filter"
      >
        <el-option label="搞笑诗" value="搞笑诗" />
        <el-option label="藏头诗" value="藏头诗" />
        <el-option label="抒情诗" value="抒情诗" />
        <el-option label="哲理诗" value="哲理诗" />
        <el-option label="叙事诗" value="叙事诗" />
        <el-option label="荒诞诗" value="荒诞诗" />
        <el-option label="意象诗" value="意象诗" />
        <el-option label="口语诗" value="口语诗" />
        <el-option label="朦胧诗" value="朦胧诗" />
        <el-option label="讽刺诗" value="讽刺诗" />
        <el-option label="浪漫主义" value="浪漫主义" />
        <el-option label="现实主义" value="现实主义" />
        <el-option label="极简风" value="极简风" />
        <el-option label="复古风" value="复古风" />
        <el-option label="先锋派" value="先锋派" />
      </el-select>

      <el-select
        v-model="selectedThemeTag"
        placeholder="主题"
        clearable
        @change="handleSearch"
        class="tag-filter"
      >
        <el-option label="青春成长" value="青春成长" />
        <el-option label="乡愁故里" value="乡愁故里" />
        <el-option label="爱情告白" value="爱情告白" />
        <el-option label="自然风物" value="自然风物" />
        <el-option label="城市生活" value="城市生活" />
        <el-option label="职场感悟" value="职场感悟" />
        <el-option label="家国情怀" value="家国情怀" />
        <el-option label="孤独迷茫" value="孤独迷茫" />
        <el-option label="梦想希望" value="梦想希望" />
        <el-option label="友情羁绊" value="友情羁绊" />
        <el-option label="亲情思念" value="亲情思念" />
        <el-option label="科幻幻想" value="科幻幻想" />
        <el-option label="历史怀古" value="历史怀古" />
        <el-option label="环保议题" value="环保议题" />
        <el-option label="日常碎碎念" value="日常碎碎念" />
      </el-select>

      <el-select
        v-model="selectedFormTag"
        placeholder="形式"
        clearable
        @change="handleSearch"
        class="tag-filter"
      >
        <el-option label="短诗" value="短诗" />
        <el-option label="组诗" value="组诗" />
        <el-option label="散文诗" value="散文诗" />
        <el-option label="格律尝试" value="格律尝试" />
        <el-option label="自由体" value="自由体" />
        <el-option label="排比体" value="排比体" />
        <el-option label="问答体" value="问答体" />
        <el-option label="书信体" value="书信体" />
        <el-option label="日记体" value="日记体" />
        <el-option label="藏尾诗" value="藏尾诗" />
        <el-option label="回文诗" value="回文诗" />
        <el-option label="阶梯诗" value="阶梯诗" />
        <el-option label="对话诗" value="对话诗" />
      </el-select>

      <el-select
        v-model="selectedEmotionTag"
        placeholder="情感"
        clearable
        @change="handleSearch"
        class="tag-filter"
      >
        <el-option label="治愈系" value="治愈系" />
        <el-option label="伤感风" value="伤感风" />
        <el-option label="热血励志" value="热血励志" />
        <el-option label="温暖治愈" value="温暖治愈" />
        <el-option label="幽默诙谐" value="幽默诙谐" />
        <el-option label="深沉压抑" value="深沉压抑" />
        <el-option label="轻快明朗" value="轻快明朗" />
        <el-option label="怅惘遗憾" value="怅惘遗憾" />
        <el-option label="愤怒批判" value="愤怒批判" />
        <el-option label="平和佛系" value="平和佛系" />
      </el-select>

      <el-select
        v-model="selectedSceneTag"
        placeholder="场景"
        clearable
        @change="handleSearch"
        class="tag-filter"
      >
        <el-option label="即兴创作" value="即兴创作" />
        <el-option label="命题写作" value="命题写作" />
        <el-option label="节日特辑" value="节日特辑" />
        <el-option label="毕业季" value="毕业季" />
        <el-option label="旅行随记" value="旅行随记" />
        <el-option label="深夜随笔" value="深夜随笔" />
        <el-option label="春日限定" value="春日限定" />
        <el-option label="秋日私语" value="秋日私语" />
        <el-option label="应援创作" value="应援创作" />
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
                  {{ post.comments?.length ?? 0 }}
                </span>
              </div>
              <div class="actions">
                <el-button
                  :type="post.user_like_status === 1 ? 'primary' : 'default'"
                  text
                  @click.stop="handleLikePost(post)"
                >
                  <el-icon><Star /></el-icon>
                  {{ post.like_count }}
                </el-button>
                <el-button
                  :type="post.user_collect_status === 1 ? 'warning' : 'default'"
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
            <el-option-group label="风格">
              <el-option label="搞笑诗" value="搞笑诗" />
              <el-option label="藏头诗" value="藏头诗" />
              <el-option label="拒情诗" value="拒情诗" />
              <el-option label="哲理诗" value="哲理诗" />
              <el-option label="叙事诗" value="叙事诗" />
              <el-option label="荒诞诗" value="荒诞诗" />
              <el-option label="意象诗" value="意象诗" />
              <el-option label="口语诗" value="口语诗" />
              <el-option label="朦胧诗" value="朦胧诗" />
              <el-option label="讥刺诗" value="讥刺诗" />
              <el-option label="浪漫主义" value="浪漫主义" />
              <el-option label="现实主义" value="现实主义" />
              <el-option label="极简风" value="极简风" />
              <el-option label="复古风" value="复古风" />
              <el-option label="先锋派" value="先锋派" />
            </el-option-group>
            <el-option-group label="主题">
              <el-option label="青春成长" value="青春成长" />
              <el-option label="乡愁故里" value="乡愁故里" />
              <el-option label="爱情告白" value="爱情告白" />
              <el-option label="自然风物" value="自然风物" />
              <el-option label="城市生活" value="城市生活" />
              <el-option label="职场感悟" value="职场感悟" />
              <el-option label="家国情怀" value="家国情怀" />
              <el-option label="孤独迷茫" value="孤独迷茫" />
              <el-option label="梦想希望" value="梦想希望" />
              <el-option label="友情羁绊" value="友情羁绊" />
              <el-option label="亲情思念" value="亲情思念" />
              <el-option label="科幻幻想" value="科幻幻想" />
              <el-option label="历史怀古" value="历史怀古" />
              <el-option label="环保议题" value="环保议题" />
              <el-option label="日常碎碎念" value="日常碎碎念" />
            </el-option-group>
            <el-option-group label="形式">
              <el-option label="短诗" value="短诗" />
              <el-option label="组诗" value="组诗" />
              <el-option label="散文诗" value="散文诗" />
              <el-option label="格律尝试" value="格律尝试" />
              <el-option label="自由体" value="自由体" />
              <el-option label="排比体" value="排比体" />
              <el-option label="问答体" value="问答体" />
              <el-option label="书信体" value="书信体" />
              <el-option label="日记体" value="日记体" />
              <el-option label="藏尾诗" value="藏尾诗" />
              <el-option label="回文诗" value="回文诗" />
              <el-option label="阶梯诗" value="阶梯诗" />
              <el-option label="对话诗" value="对话诗" />
            </el-option-group>
            <el-option-group label="情感">
              <el-option label="治愈系" value="治愈系" />
              <el-option label="伤感风" value="伤感风" />
              <el-option label="热血励志" value="热血励志" />
              <el-option label="温暖治愈" value="温暖治愈" />
              <el-option label="幽默诧谐" value="幽默诧谐" />
              <el-option label="深沉压抑" value="深沉压抑" />
              <el-option label="轻快明朗" value="轻快明朗" />
              <el-option label="怅惘遗憾" value="怅惘遗憾" />
              <el-option label="愤怒批判" value="愤怒批判" />
              <el-option label="平和佛系" value="平和佛系" />
            </el-option-group>
            <el-option-group label="场景">
              <el-option label="即兴创作" value="即兴创作" />
              <el-option label="命题写作" value="命题写作" />
              <el-option label="节日特辑" value="节日特辑" />
              <el-option label="毕业季" value="毕业季" />
              <el-option label="旅行随记" value="旅行随记" />
              <el-option label="深夜随笔" value="深夜随笔" />
              <el-option label="春日限定" value="春日限定" />
              <el-option label="秋日私语" value="秋日私语" />
              <el-option label="应援创作" value="应援创作" />
            </el-option-group>
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
const { toggleLike, toggleCollect } = useLikeAndFavor()

// 搜索和筛选
const searchKeyword = ref('')
const selectedStyleTag = ref('')
const selectedThemeTag = ref('')
const selectedFormTag = ref('')
const selectedEmotionTag = ref('')
const selectedSceneTag = ref('')

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
    
    // 收集所有选中的标签
    const selectedTags = [
      selectedStyleTag.value,
      selectedThemeTag.value,
      selectedFormTag.value,
      selectedEmotionTag.value,
      selectedSceneTag.value
    ].filter(tag => tag && tag.trim())
    
    // 根据搜索关键词、风格标签或主页加载
    if (searchKeyword.value.trim()) {
      // 关键词搜索（每页 10 条）
      res = await searchPostsByKeyword(searchKeyword.value.trim(), currentPage.value)
      pageSize.value = 10
    } else if (selectedTags.length > 0) {
      // 风格筛选（使用第一个选中的标签，每页 10 条）
      res = await searchPostsByStyle(selectedTags[0], currentPage.value)
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
 * 切换点赞状态（点赞/取消点赞）
 */
const handleLikePost = (post: WorkItem) => {
  const currentStatus = post.user_like_status ?? 0
  
  toggleLike(
    post.id,
    currentStatus,
    post.like_count,
    (newStatus: number, newCount: number) => {
      post.user_like_status = newStatus
      post.like_count = newCount
    }
  )
}

/**
 * 切换收藏状态（收藏/取消收藏）
 */
const handleCollectPost = (post: WorkItem) => {
  const currentStatus = post.user_collect_status ?? 0
  
  toggleCollect(
    post.id,
    currentStatus,
    post.collect_count,
    (newStatus: number, newCount: number) => {
      post.user_collect_status = newStatus
      post.collect_count = newCount
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
    flex-wrap: wrap;

    .search-input {
      flex: 1;
      min-width: 300px;
    }

    .tag-filter {
      width: 140px;
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
