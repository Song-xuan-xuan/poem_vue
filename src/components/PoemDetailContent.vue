<template>
  <div class="poem-detail-content" v-loading="loading">
    <div v-if="!loading && poemDetail">
      <!-- 诗词主体内容 -->
      <div class="poem-card-inner">
        <div 
          ref="poemHeaderRef"
          class="poem-header"
          @mouseup="handleTextSelection($event)"
          @touchend="handleTextSelection($event)"
        >
          <h1 class="poem-title">{{ poemDetail.title }}</h1>
          <div class="poem-meta">
            <span v-if="poemDetail.dynasty" class="dynasty">{{ poemDetail.dynasty }}</span>
            <span v-if="poemDetail.dynasty" class="divider">·</span>
            <span class="author">{{ poemDetail.author }}</span>
          </div>
        </div>

        <div class="divider-line"></div>

        <div
          ref="poemContentRef"
          class="poem-content"
          @mouseup="handleTextSelection($event)"
          @touchend="handleTextSelection($event)"
        >
          <p v-for="(para, index) in poemDetail.paragraphs" :key="index" class="poem-line">
            {{ para }}
          </p>
        </div>

        <div class="poem-tags" v-if="poemDetail.tags && poemDetail.tags.length > 0">
          <span
            v-for="tag in poemDetail.tags"
            :key="tag"
            class="poem-tag"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- 赏析内容 -->
      <div class="appreciation-section" v-if="poemDetail.appreciation">
        <div class="section-header">
          <span class="header-icon">📖</span>
          <span class="header-text">作品赏析</span>
        </div>
        <div class="appreciation-content" v-html="formatAppreciation(poemDetail.appreciation)"></div>
      </div>

      <!-- 浮动解析按钮 -->
      <Teleport to="body">
        <transition name="fade">
          <div
            v-if="showFloatingButton"
            class="floating-parse-button"
            :style="{
              top: floatingButtonPosition.top + 'px',
              left: floatingButtonPosition.left + 'px'
            }"
          >
            <button
              class="parse-btn"
              :disabled="parsingLoading"
              @click="handleParseSelectedText"
            >
              <span v-if="parsingLoading" class="loading-spinner"></span>
              <span v-else class="btn-icon">✨</span>
              <span>AI 智能解析</span>
            </button>
            <button
              class="close-btn"
              @click="hideFloatingButton"
            >
              ✕
            </button>
          </div>
        </transition>
      </Teleport>
    </div>

    <div v-else-if="!loading" class="empty-state">
      <div class="empty-icon">📜</div>
      <p class="empty-text">未找到诗词信息</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { PoemDetail } from '@/api/type'
import { getPoemDetail, getParsePoemPrompt } from '@/api/poem'
import { createSession } from '@/api/session'

interface Props {
  poemId: number | null
}

const props = defineProps<Props>()
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
const poemContentRef = ref<HTMLElement | null>(null)
const poemHeaderRef = ref<HTMLElement | null>(null)

/**
 * 加载诗词详情
 */
const loadPoemDetail = async () => {
  if (!props.poemId) {
    poemDetail.value = null
    return
  }

  loading.value = true
  try {
    const res = await getPoemDetail(props.poemId)
    poemDetail.value = res.data
  } catch (error: any) {
    ElMessage.error(error.message || '加载诗词详情失败')
    poemDetail.value = null
  } finally {
    loading.value = false
  }
}

/**
 * 从事件获取鼠标/手指坐标
 */
const getClientPoint = (e?: MouseEvent | TouchEvent) => {
  if (!e) return null
  if ('changedTouches' in e && e.changedTouches?.length) {
    const t = e.changedTouches[0]
    return { x: t.clientX, y: t.clientY }
  }
  if ('clientX' in e) {
    return { x: e.clientX, y: e.clientY }
  }
  return null
}

/**
 * 处理文本选中事件
 */
const handleTextSelection = (e?: MouseEvent | TouchEvent) => {
  const selection = window.getSelection()
  const text = selection?.toString().trim()

  if (!text) {
    hideFloatingButton()
    return
  }

  const poemContentEl = poemContentRef.value
  const poemHeaderEl = poemHeaderRef.value
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    const container = range.commonAncestorContainer
    const containerEl = container.nodeType === 1 ? (container as Element) : container.parentElement
    
    const isInHeader = poemHeaderEl && containerEl && poemHeaderEl.contains(containerEl)
    const isInContent = poemContentEl && containerEl && poemContentEl.contains(containerEl)
    
    if (!isInHeader && !isInContent) {
      hideFloatingButton()
      return
    }
  }

  selectedText.value = text

  const p = getClientPoint(e)
  if (p) {
    const offsetX = 12
    const offsetY = 12
    let left = p.x + offsetX
    let top = p.y + offsetY

    const margin = 8
    const approxWidth = 180
    const approxHeight = 44

    left = Math.min(window.innerWidth - approxWidth - margin, Math.max(margin, left))
    top = Math.min(window.innerHeight - approxHeight - margin, Math.max(margin, top))

    floatingButtonPosition.value = { top, left }
    showFloatingButton.value = true
    return
  }

  const rect = selection?.getRangeAt(0)?.getBoundingClientRect()
  if (rect) {
    floatingButtonPosition.value = {
      top: rect.top - 10,
      left: rect.left + rect.width / 2
    }
    showFloatingButton.value = true
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
    const res = await getParsePoemPrompt(selectedText.value)
    const prompt = res.data.prompt

    const sessionId = crypto.randomUUID()
    const sessionRes = await createSession({
      session_id: sessionId,
      name: `诗句解析 - ${selectedText.value.substring(0, 10)}...`
    })

    router.push({
      path: '/ai',
      query: {
        sessionId: sessionRes.data.session_id,
        autoSend: prompt
      }
    })

    ElMessage.success('正在跳转到 AI 助手...')
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
  return text
    .split('\n')
    .filter((para) => para.trim())
    .map((para) => `<p>${para}</p>`)
    .join('')
}

/**
 * 点击其他区域隐藏浮动按钮
 */
const handleDocumentClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (
    !target.closest('.floating-parse-button') && 
    !target.closest('.poem-header') && 
    !target.closest('.poem-content')
  ) {
    hideFloatingButton()
  }
}

// 监听 poemId 变化
watch(() => props.poemId, () => {
  hideFloatingButton()
  loadPoemDetail()
}, { immediate: true })

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<style scoped lang="scss">
// ==================== 诗词详情内容容器 ====================
.poem-detail-content {
  min-height: 300px;
  position: relative;
}

// ==================== 诗词卡片内容 ====================
.poem-card-inner {
  .poem-header {
    text-align: center;
    padding: 16px 0 24px;
    user-select: text;
    cursor: text;

    .poem-title {
      font-size: 28px;
      margin: 0 0 16px 0;
      color: #1A202C;
      font-weight: 700;
      font-family: 'Noto Serif SC', 'Songti SC', serif;
      letter-spacing: 3px;
      
      &::selection {
        background: #047857;
        color: #fff;
      }
    }

    .poem-meta {
      font-size: 15px;
      color: #4A5568;
      font-family: 'Noto Serif SC', serif;

      .divider {
        margin: 0 10px;
        color: #A0AEC0;
      }

      .dynasty,
      .author {
        font-weight: 500;
        
        &::selection {
          background: #047857;
          color: #fff;
        }
      }
    }
  }

  .divider-line {
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(107, 144, 128, 0.3) 20%,
      rgba(107, 144, 128, 0.3) 80%,
      transparent 100%
    );
    margin: 0 40px;
  }

  .poem-content {
    padding: 32px 20px;
    text-align: center;
    line-height: 2.8;
    user-select: text;
    cursor: text;

    .poem-line {
      font-size: 20px;
      color: #2D3748;
      margin: 14px 0;
      font-weight: 400;
      letter-spacing: 2px;
      font-family: 'Noto Serif SC', 'Songti SC', serif;
      
      &::selection {
        background: #047857;
        color: #fff;
      }
    }
  }

  .poem-tags {
    display: flex;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
    padding: 16px 20px 24px;

    .poem-tag {
      padding: 4px 12px;
      font-size: 13px;
      color: #4A5568;
      background: rgba(107, 144, 128, 0.1);
      border: 1px solid rgba(107, 144, 128, 0.2);
      border-radius: 4px;
      font-family: 'Noto Serif SC', serif;
      transition: all 0.2s ease;
      
      &:hover {
        background: rgba(107, 144, 128, 0.15);
        border-color: rgba(107, 144, 128, 0.3);
      }
    }
  }
}

// ==================== 赏析区域 ====================
.appreciation-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px dashed rgba(107, 144, 128, 0.25);

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    padding-left: 8px;

    .header-icon {
      font-size: 20px;
    }

    .header-text {
      font-size: 17px;
      font-weight: 600;
      color: #2D3748;
      font-family: 'Noto Serif SC', serif;
    }
  }

  .appreciation-content {
    line-height: 2;
    color: #4A5568;
    font-size: 15px;
    font-family: 'Noto Serif SC', serif;
    padding: 0 8px;

    :deep(p) {
      margin: 14px 0;
      text-indent: 2em;
    }
  }
}

// ==================== 空状态 ====================
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  
  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.6;
  }
  
  .empty-text {
    font-size: 15px;
    color: #718096;
    font-family: 'Noto Serif SC', serif;
  }
}

// ==================== 浮动解析按钮 ====================
.floating-parse-button {
  position: fixed;
  z-index: 3000;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: #FFFBEB;
  border-radius: 8px;
  box-shadow: 
    0 4px 16px rgba(4, 120, 87, 0.25),
    0 0 0 1px rgba(4, 120, 87, 0.15);
  animation: fadeInUp 0.25s ease;

  .parse-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'Noto Serif SC', serif;
    
    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(4, 120, 87, 0.3);
    }
    
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .btn-icon {
      font-size: 14px;
    }
    
    .loading-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
  }

  .close-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid rgba(107, 144, 128, 0.2);
    border-radius: 50%;
    color: #718096;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(107, 144, 128, 0.1);
      color: #4A5568;
    }
  }
}

// ==================== 动画 ====================
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// ==================== 响应式适配 ====================
@media (max-width: 768px) {
  .poem-card-inner {
    .poem-header {
      padding: 12px 0 20px;
      
      .poem-title {
        font-size: 22px;
        letter-spacing: 2px;
      }

      .poem-meta {
        font-size: 14px;
      }
    }

    .divider-line {
      margin: 0 20px;
    }

    .poem-content {
      padding: 24px 12px;

      .poem-line {
        font-size: 17px;
        letter-spacing: 1px;
      }
    }

    .poem-tags {
      padding: 12px 12px 20px;
      
      .poem-tag {
        font-size: 12px;
        padding: 3px 10px;
      }
    }
  }

  .appreciation-section {
    margin-top: 20px;
    padding-top: 20px;

    .appreciation-content {
      font-size: 14px;
    }
  }
}
</style>
