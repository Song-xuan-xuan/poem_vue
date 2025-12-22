<template>
  <div class="poem-detail">
    <!-- 返回按钮 -->
    <el-button class="back-btn" :icon="ArrowLeft" @click="goBack">返回列表</el-button>

    <div v-loading="loading" class="detail-container">
      <div v-if="!loading && poemDetail">
        <!-- 诗词主体内容 -->
        <el-card class="poem-card" shadow="hover">
          <div class="poem-header">
            <h1 class="poem-title">{{ poemDetail.title }}</h1>
            <div class="poem-meta">
              <span v-if="poemDetail.dynasty" class="dynasty">{{ poemDetail.dynasty }}</span>
              <span v-if="poemDetail.dynasty" class="divider">·</span>
              <span class="author">{{ poemDetail.author }}</span>
            </div>
          </div>

          <el-divider />

          <div 
            class="poem-content" 
            @mouseup="handleTextSelection"
            @touchend="handleTextSelection"
          >
            <p v-for="(para, index) in poemDetail.paragraphs" :key="index" class="poem-line">
              {{ para }}
            </p>
          </div>

          <div class="poem-tags" v-if="poemDetail.tags && poemDetail.tags.length > 0">
            <el-tag
              v-for="tag in poemDetail.tags"
              :key="tag"
              type="info"
              effect="plain"
              size="large"
            >
              {{ tag }}
            </el-tag>
          </div>
        </el-card>

        <!-- 赏析内容 -->
        <el-card class="appreciation-card" shadow="hover" v-if="poemDetail.appreciation">
          <template #header>
            <div class="section-header">
              <el-icon><Reading /></el-icon>
              <span>作品赏析</span>
            </div>
          </template>
          <div class="appreciation-content" v-html="formatAppreciation(poemDetail.appreciation)"></div>
        </el-card>

        <!-- 智能解析 -->
        <el-card class="analysis-card" shadow="hover">
          <template #header>
            <div class="section-header">
              <el-icon><MagicStick /></el-icon>
              <span>AI 智能解析</span>
            </div>
          </template>

          <el-button
            type="primary"
            :loading="parsingLoading"
            @click="handleIntelligentParse"
          >
            <el-icon><MagicStick /></el-icon>
            解析整首诗词
          </el-button>
        </el-card>

        <!-- 浮动解析按钮 -->
        <transition name="fade">
          <div
            v-if="showFloatingButton"
            class="floating-parse-button"
            :style="{
              top: floatingButtonPosition.top + 'px',
              left: floatingButtonPosition.left + 'px'
            }"
          >
            <el-button
              type="primary"
              size="small"
              :loading="parsingLoading"
              @click="handleParseSelectedText"
            >
              <el-icon><MagicStick /></el-icon>
              AI 解析
            </el-button>
            <el-button
              size="small"
              circle
              :icon="Close"
              @click="hideFloatingButton"
              class="close-btn"
            />
          </div>
        </transition>
      </div>

      <el-empty v-else-if="!loading" description="未找到诗词信息" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  ArrowLeft,
  Reading,
  MagicStick,
  Close
} from '@element-plus/icons-vue'
import type { PoemDetail } from '@/api/type'
import { getPoemDetail, getParsePoemPrompt } from '@/api/poem'
import { createSession } from '@/api/session'

const route = useRoute()
const router = useRouter()

// 诗词详情
const loading = ref(false)
const poemDetail = ref<PoemDetail | null>(null)

// 智能解析
const parsingLoading = ref(false)

// 文本选中相关
const selectedText = ref('')
const showFloatingButton = ref(false)
const floatingButtonPosition = ref({ top: 0, left: 0 })

/**
 * 加载诗词详情
 */
const loadPoemDetail = async () => {
  const id = route.params.id as string
  if (!id) {
    ElMessage.error('诗词ID不能为空')
    return
  }

  loading.value = true
  try {
    const res = await getPoemDetail(Number(id))
    poemDetail.value = res.data
  } catch (error: any) {
    ElMessage.error(error.message || '加载诗词详情失败')
    poemDetail.value = null
  } finally {
    loading.value = false
  }
}

/**
 * 智能解析 - 跳转到 AI 助手并自动发送
 */
const handleIntelligentParse = async () => {
  if (!poemDetail.value) return

  parsingLoading.value = true
  try {
    // 1. 获取智能解析提示词
    const res = await getParsePoemPrompt(poemDetail.value.title)
    const prompt = res.data.prompt

    // 2. 创建新会话
    const sessionId = crypto.randomUUID()
    const sessionRes = await createSession({
      session_id: sessionId,
      name: `诗词解析 - ${poemDetail.value.title}`
    })

    // 3. 跳转到 AI 助手页面，并传递会话ID和提示词
    router.push({
      path: '/ai',
      query: {
        sessionId: sessionRes.data.session_id,
        autoSend: prompt
      }
    })

    ElMessage.success('正在跳转到 AI 助手...')
  } catch (error: any) {
    ElMessage.error(error.message || '获取智能解析失败')
  } finally {
    parsingLoading.value = false
  }
}

/**
 * 处理文本选中事件
 */
const handleTextSelection = () => {
  const selection = window.getSelection()
  const text = selection?.toString().trim()
  
  if (text && text.length > 0) {
    selectedText.value = text
    
    // 获取选中文本的位置
    const range = selection?.getRangeAt(0)
    const rect = range?.getBoundingClientRect()
    
    if (rect) {
      // 计算浮动按钮位置（在选中文字上方居中）
      floatingButtonPosition.value = {
        top: rect.top + window.scrollY - 50, // 在选中文字上方 50px
        left: rect.left + window.scrollX + rect.width / 2 - 60 // 居中对齐，按钮宽度约 120px
      }
      showFloatingButton.value = true
    }
  } else {
    // 没有选中文字，隐藏按钮
    showFloatingButton.value = false
    selectedText.value = ''
  }
}

/**
 * 隐藏浮动按钮
 */
const hideFloatingButton = () => {
  showFloatingButton.value = false
  selectedText.value = ''
}

/**
 * 使用选中的文本进行智能解析
 */
const handleParseSelectedText = async () => {
  if (!selectedText.value) return
  
  parsingLoading.value = true
  try {
    // 1. 获取智能解析提示词（使用选中的文本）
    const res = await getParsePoemPrompt(selectedText.value)
    const prompt = res.data.prompt

    // 2. 创建新会话
    const sessionId = crypto.randomUUID()
    const sessionRes = await createSession({
      session_id: sessionId,
      name: `诗句解析 - ${selectedText.value.substring(0, 10)}...`
    })

    // 3. 跳转到 AI 助手页面，并传递会话ID和提示词
    router.push({
      path: '/ai',
      query: {
        sessionId: sessionRes.data.session_id,
        autoSend: prompt
      }
    })

    ElMessage.success('正在跳转到 AI 助手...')
    
    // 隐藏浮动按钮
    hideFloatingButton()
  } catch (error: any) {
    ElMessage.error(error.message || '获取智能解析失败')
  } finally {
    parsingLoading.value = false
  }
}

/**
 * 格式化赏析内容
 */
const formatAppreciation = (text: string) => {
  // 简单的段落处理
  return text
    .split('\n')
    .filter((para) => para.trim())
    .map((para) => `<p>${para}</p>`)
    .join('')
}

/**
 * 返回列表
 */
const goBack = () => {
  router.back()
}

onMounted(() => {
  loadPoemDetail()
  
  // 点击页面其他区域时隐藏浮动按钮
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    // 如果点击的不是浮动按钮本身，则隐藏
    if (!target.closest('.floating-parse-button') && !target.closest('.poem-content')) {
      hideFloatingButton()
    }
  })
})

onBeforeUnmount(() => {
  // 清理事件监听器
  document.removeEventListener('click', hideFloatingButton)
})
</script>

<style scoped lang="scss">
.poem-detail {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;

  .back-btn {
    margin-bottom: 16px;
  }

  .detail-container {
    min-height: 400px;
  }

  .poem-card {
    margin-bottom: 20px;
    background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);

    .poem-header {
      text-align: center;
      padding: 20px 0;

      .poem-title {
        font-size: 32px;
        margin: 0 0 16px 0;
        color: #303133;
        font-weight: 600;
      }

      .poem-meta {
        font-size: 16px;
        color: #606266;

        .divider {
          margin: 0 8px;
        }

        .dynasty,
        .author {
          font-weight: 500;
        }
      }
    }

    .poem-content {
      padding: 30px 0;
      text-align: center;
      line-height: 2.5;
      user-select: text; // 允许文本选择
      cursor: text; // 鼠标样式改为文本选择

      .poem-line {
        font-size: 20px;
        color: #303133;
        margin: 12px 0;
        font-weight: 400;
        letter-spacing: 2px;
        
        // 选中文本的高亮样式
        &::selection {
          background: #409eff;
          color: #fff;
        }
      }
    }

    .poem-tags {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
      padding-top: 20px;
    }
  }

  .appreciation-card,
  .analysis-card,
  .respond-card {
    margin-bottom: 20px;

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;

      .el-icon {
        font-size: 20px;
      }
    }

    .appreciation-content {
      line-height: 2;
      color: #606266;
      font-size: 15px;

      :deep(p) {
        margin: 12px 0;
        text-indent: 2em;
      }
    }

    .respond-result {
      margin-top: 20px;

      .result-content {
        line-height: 1.8;

        p {
          margin: 8px 0;
        }

        .respond-text {
          color: #303133;
          font-size: 16px;
          font-weight: 500;
          padding: 12px;
          background: #f5f7fa;
          border-radius: 4px;
          margin: 12px 0;
        }

        .ai-response {
          color: #606266;
          padding: 12px;
          background: #ecf5ff;
          border-radius: 4px;
          margin: 12px 0;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .poem-detail {
    padding: 12px;

    .poem-card {
      .poem-header {
        .poem-title {
          font-size: 24px;
        }

        .poem-meta {
          font-size: 14px;
        }
      }

      .poem-content {
        .poem-line {
          font-size: 16px;
          letter-spacing: 1px;
        }
      }
    }
  }

  // 浮动解析按钮
  .floating-parse-button {
    position: absolute;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: fadeInUp 0.3s ease;

    .close-btn {
      width: 24px;
      height: 24px;
      padding: 0;
      min-height: 24px;
    }
  }

  // 淡入淡出动画
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  // 浮动按钮出现动画
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
</style>
