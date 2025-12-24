<template>
  <div class="ai-assistant">
    <BambooBackground />
    <!-- 左侧：会话列表 -->
    <div class="session-sidebar" :class="{ 'collapsed': isSidebarCollapsed }">
      <!-- 装饰：角落回纹 -->
      <div class="sidebar-decoration top-left">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M2 2H22V22" stroke="#10B981" stroke-width="1" stroke-opacity="0.2"/>
          <path d="M6 6H18V18" stroke="#10B981" stroke-width="1" stroke-opacity="0.15"/>
        </svg>
      </div>
      <div class="sidebar-decoration bottom-right">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M22 22H2V2" stroke="#10B981" stroke-width="1" stroke-opacity="0.2"/>
          <path d="M18 18H6V6" stroke="#10B981" stroke-width="1" stroke-opacity="0.15"/>
        </svg>
      </div>

      <div class="sidebar-header">
        <h3>会话列表</h3>
        <el-button
          type="primary"
          size="small"
          :icon="Plus"
          :loading="createLoading"
          @click="handleCreateSession"
          class="new-session-btn"
        >
          新建
        </el-button>
      </div>

      <div class="session-list" v-loading="sessionsLoading">
        <div
          v-for="session in sessions"
          :key="session.session_id"
          class="session-item"
          :class="{ active: session.session_id === currentSessionId }"
          @click="handleSelectSession(session.session_id)"
        >
          <div class="session-info">
            <template v-if="editingSessionId === session.session_id">
              <div class="session-edit">
                <el-input v-model="editingTitle" size="small" placeholder="输入会话标题" />
                <div class="edit-actions">
                  <el-button
                    size="small"
                    type="primary"
                    :icon="Check"
                    @click.stop="handleConfirmEdit(session.session_id)"
                  />
                  <el-button size="small" :icon="Close" @click.stop="handleCancelEdit" />
                </div>
              </div>
            </template>
            <template v-else>
              <div class="session-title">{{ session.name }}</div>
              <div class="session-meta">
                <span>{{ formatTime(session.create_time) }}</span>
              </div>
            </template>
          </div>

          <div class="session-actions">
            <el-button text :icon="Edit" @click.stop="handleEditTitle(session)" />
            <el-button text :icon="Delete" @click.stop="handleDeleteSession(session.session_id)" />
          </div>
        </div>
      </div>
    </div>

    <!-- 侧边栏折叠按钮 (小脚标) -->
    <div 
      class="sidebar-toggle-btn" 
      :class="{ 'is-collapsed': isSidebarCollapsed }"
      @click="toggleSidebar"
      title="切换侧边栏"
    >
      <el-icon>
        <ArrowRight v-if="isSidebarCollapsed" />
        <ArrowLeft v-else />
      </el-icon>
    </div>

    <!-- 右侧：聊天窗口 -->
    <div class="chat-container">
      

      <div v-if="!currentSessionId" class="chat-empty">
        <div class="empty-illustration">
          <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill="#F0FDF4" opacity="0.5" />
            <path d="M60,140 Q100,60 140,140" stroke="#10B981" stroke-width="2" fill="none" opacity="0.2" />
            <text x="100" y="110" font-family="serif" font-size="24" fill="#059669" text-anchor="middle" opacity="0.8">问道</text>
            <text x="100" y="135" font-family="serif" font-size="14" fill="#059669" text-anchor="middle" opacity="0.6">AI 诗词助手</text>
          </svg>
        </div>
        <el-empty description="请选择或创建一个会话，与 AI 共赏诗词之美">
          <el-button type="primary" class="create-btn" @click="handleCreateSession">
            <el-icon class="mr-1"><Plus /></el-icon>
            开启新对话
          </el-button>
        </el-empty>
      </div>

      <template v-else>
        <!-- 聊天消息列表 -->
        <div ref="messageListRef" class="message-list" v-loading="messagesLoading">
          <div
            v-for="message in messages"
            :key="message.id"
            class="message-item"
            :class="`message-${message.role}`"
          >
            <div class="message-avatar">
              <el-avatar v-if="message.role === 'user'" :src="userStore.userInfo?.photo_url">
                {{ userStore.userInfo?.name?.charAt(0) }}
              </el-avatar>
              <el-avatar v-else :icon="ChatLineSquare" />
            </div>

            <div class="message-content">
              <div class="message-header">
                <span class="message-sender">
                  {{ message.role === 'user' ? (userStore.userInfo?.name || '我') : 'AI 助手' }}
                </span>
                <div class="message-header-right">
                  <span class="message-time">{{ formatMessageTime(message.timestamp) }}</span>
                  <el-button
                    v-if="message.role === 'assistant'"
                    text
                    size="small"
                    :icon="Delete"
                    @click="handleDeleteMessage(message.id.replace('_a', ''))"
                    title="删除该轮对话"
                  />
                </div>
              </div>
              <div v-if="message.content" class="message-body" v-html="renderMarkdown(message.content)"></div>

              <div
                v-if="message.recommendation && message.recommendation.name && message.recommendation.url"
                class="recommend-card"
              >
                <div class="recommend-title">🎬 B站视频推荐</div>
                <div class="recommend-name">{{ message.recommendation.name }}</div>
                <a
                  class="recommend-link"
                  :href="message.recommendation.url"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🔗 点击观看
                </a>
              </div>
            </div>
          </div>

          <!-- 流式输出占位 -->
          <div v-if="isStreaming" class="message-item message-assistant">
            <div class="message-avatar">
              <el-avatar :icon="ChatLineSquare" />
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-sender">AI 助手</span>
                <span class="message-time">正在输入...</span>
              </div>
              <div class="message-body streaming" v-html="renderMarkdown(streamingContent)"></div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <!-- AGENT 功能按钮区 -->
          <div class="agent-buttons">
            <el-button
              type="primary"
              plain
              size="small"
              :class="{ 'active-agent': selectedAgent === 'hot-poem' }"
              @click="selectAgent('hot-poem')"
            >
              <el-icon><TrendCharts /></el-icon>
              热点诗词赏析
            </el-button>
            <el-button
              type="success"
              plain
              size="small"
              :class="{ 'active-agent': selectedAgent === 'ai-create' }"
              @click="selectAgent('ai-create')"
            >
              <el-icon><MagicStick /></el-icon>
              AI创作发布
            </el-button>
          </div>

          <div class="input-wrapper">
            <!-- AGENT 功能标识 -->
            <div v-if="selectedAgent" class="agent-badge">
              <el-tag
                v-if="selectedAgent === 'hot-poem'"
                type="primary"
                size="small"
                closable
                @close="clearAgent"
              >
                <el-icon><TrendCharts /></el-icon>
                热点诗词赏析
              </el-tag>
              <el-tag
                v-if="selectedAgent === 'ai-create'"
                type="success"
                size="small"
                closable
                @close="clearAgent"
              >
                <el-icon><MagicStick /></el-icon>
                AI创作发布
              </el-tag>
            </div>

            <el-input
              v-model="inputMessage"
              type="textarea"
              :rows="3"
              :placeholder="getInputPlaceholder()"
              :disabled="isSending || isStreaming"
              @keydown.enter="handleSendMessage"
            />

            <div class="input-icons">
              <el-upload
                :before-upload="handleBeforeOcrUpload"
                :show-file-list="false"
                accept="image/jpeg,image/jpg,image/png,image/webp"
              >
                <el-button
                  circle
                  plain
                  :icon="Folder"
                  :loading="ocrLoading"
                  :disabled="isSending || isStreaming"
                ></el-button>
              </el-upload>

              <el-button
                v-if="!isRecording"
                circle
                plain
                :icon="Microphone"
                :disabled="isSending || isStreaming"
                @click="startRecording"
              ></el-button>
              <el-button
                v-else
                circle
                type="warning"
                :icon="VideoPause"
                :loading="audioLoading"
                @click="stopRecording"
              ></el-button>

              <el-button
                v-if="isStreaming"
                circle
                type="danger"
                :icon="VideoPause"
                @click="handleStopGeneration"
              ></el-button>
              <el-button
                v-else
                circle
                type="primary"
                :icon="Promotion"
                @click="handleSendMessage"
                :loading="isSending"
                :disabled="!inputMessage.trim()"
              ></el-button>
            </div>



          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BambooBackground from '@/components/BambooBackground.vue'
import {
  Plus,
  Edit,
  Delete,
  Check,
  Close,
  Promotion,
  VideoPause,
  ChatLineSquare,
  Microphone,
  VideoPlay,
  Folder,
  Refresh,
  InfoFilled,
  TrendCharts,
  MagicStick,
  ArrowLeft,
  ArrowRight
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { SessionItem, QAPair, ChatMessage } from '@/api/type'
import type { UploadProps } from 'element-plus'
import {
  getSessionList,
  createSession,
  renameSession,
  deleteSession
} from '@/api/session'
import { getQAList, streamDialogWithFetch, stopQA, deleteQA } from '@/api/chat'
import { useUserStore } from '@/stores/user'
import { useMultimodalInput } from '@/composables/useMultimodalInput'
import { useBilibiliRecommend } from '@/composables/useBilibiliRecommend'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

// 侧边栏折叠状态
const isSidebarCollapsed = ref(false)
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

// Markdown 渲染器（收紧HTML渲染策略）
const md: MarkdownIt = new MarkdownIt({
  html: false,  // 禁止渲染HTML标签
  linkify: true,
  breaks: true,  // 支持换行（单个回车转换为 <br>）
  typographer: true,
  highlight: function (str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`
      } catch (__) {}
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  }
})

// 会话列表
const sessionsLoading = ref(false)
const sessions = ref<SessionItem[]>([])
const currentSessionId = ref<string>('')

// 会话创建和编辑
const createLoading = ref(false)
const editingSessionId = ref<string>('')
const editingTitle = ref('')

interface RecommendInfo {
  name: string | null
  url: string | null
}

type ChatMessageWithRecommend = ChatMessage & { recommendation?: RecommendInfo | null }

// 消息列表（使用 QAPair 作为消息类型）
const messagesLoading = ref(false)
const messages = ref<ChatMessageWithRecommend[]>([])
const messageListRef = ref<HTMLDivElement>()

// 消息发送
const inputMessage = ref('')
const isSending = ref(false)
const lastUserQuery = ref('') // 记录最后一次用户问题，用于 B站推荐

// AGENT 功能选择
const selectedAgent = ref<'hot-poem' | 'ai-create' | null>(null)

// 流式输出
const isStreaming = ref(false)
const streamingContent = ref('')
const currentStreamingMessageId = ref<string>('')
const currentQuestionId = ref<string>('') // 后端的 question_id
const streamAbortController = ref<AbortController | null>(null)

// 多模态输入
const {
  ocrLoading,
  audioLoading,
  runOcr,
  runAudioTranscribe
} = useMultimodalInput()

// 录音状态
const isRecording = ref(false)
const mediaRecorderRef = ref<MediaRecorder | null>(null)
const audioStreamRef = ref<MediaStream | null>(null)
const audioChunks = ref<Blob[]>([])
const selectedMimeType = ref<string>('')

// B站推荐
const {
  recommendLoading,
  fetchBilibili
} = useBilibiliRecommend()

/**
 * 选中会话并加载消息
 */
const handleSelectSession = async (sessionId: string) => {
  if (currentSessionId.value === sessionId && messages.value.length) return
  currentSessionId.value = sessionId
  await loadMessages(sessionId)
}

/**
 * 重新加载当前会话
 */
const handleRestartSession = async () => {
  if (!currentSessionId.value) return
  await loadMessages(currentSessionId.value)
}

/**
 * 编辑会话标题
 */
const handleEditTitle = (session: SessionItem) => {
  editingSessionId.value = session.session_id
  editingTitle.value = session.name
}

const handleCancelEdit = () => {
  editingSessionId.value = ''
  editingTitle.value = ''
}

const handleConfirmEdit = async (sessionId: string) => {
  const name = editingTitle.value.trim()
  if (!name) {
    ElMessage.warning('标题不能为空')
    return
  }
  try {
    await renameSession({ session_id: sessionId, name })
    ElMessage.success('修改成功')
    await loadSessions()
    editingSessionId.value = ''
    editingTitle.value = ''
  } catch (error: any) {
    ElMessage.error(error.message || '重命名失败')
  }
}

/**
 * 加载会话列表
 * GET /api/session/list - 直接返回 SessionItem[]
 */
const loadSessions = async () => {
  sessionsLoading.value = true
  try {
    const res = await getSessionList()
    // 兼容处理：如果返回的是数组，直接使用；如果是对象且包含 list，则使用 list
    if (Array.isArray(res.data)) {
      sessions.value = res.data
    } else if (res.data && Array.isArray((res.data as any).list)) {
      sessions.value = (res.data as any).list
    } else {
      sessions.value = []
    }
    
    // 如果有会话但没有选中，自动选中第一个
    if (sessions.value.length > 0 && !currentSessionId.value) {
      handleSelectSession(sessions.value[0].session_id)
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载会话列表失败')
    sessions.value = []
  } finally {
    sessionsLoading.value = false
  }
}

/**
 * 创建新会话
 */
const handleCreateSession = async () => {
  createLoading.value = true
  try {
    const sessionId = crypto.randomUUID()
    const res = await createSession({
      session_id: sessionId,
      name: `新对话 ${new Date().toLocaleString()}`
    })
    ElMessage.success('创建成功')

    await loadSessions()
    handleSelectSession(res.data.session_id)
  } catch (error: any) {
    ElMessage.error(error.message || '创建会话失败')
  } finally {
    createLoading.value = false
  }
}

/**
 * 选择 AGENT 功能
 * - 热点诗词赏析：点击后直接发送固定提示词
 * - AI创作发布：切换选中状态，等待用户输入
 */
const selectAgent = (agentType: 'hot-poem' | 'ai-create') => {
  if (agentType === 'hot-poem') {
    // 热点诗词赏析：直接发送固定提示词
    inputMessage.value = '热点诗词赏析'
    handleSendMessage()
    selectedAgent.value = null // 发送后清除选中状态
  } else if (agentType === 'ai-create') {
    // AI创作发布：切换选中状态（等待用户输入）
    if (selectedAgent.value === 'ai-create') {
      selectedAgent.value = null // 取消选中
    } else {
      selectedAgent.value = 'ai-create' // 选中
    }
  }
}

/**
 * 清除 AGENT 功能选择
 */
const clearAgent = () => {
  selectedAgent.value = null
}

/**
 * 获取输入框占位符
 */
const getInputPlaceholder = () => {
  if (selectedAgent.value === 'ai-create') {
    return '请描述您想创作的诗歌主题和风格... (Enter 发送)'
  }
  return '输入消息... (Enter 发送)'
}

/**
 * 删除会话
 */
const handleDeleteSession = async (sessionId: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个会话吗？删除后无法恢复。',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteSession(sessionId)
    ElMessage.success('删除成功')
    
    // 如果删除的是当前会话，清空选中
    if (currentSessionId.value === sessionId) {
      currentSessionId.value = ''
      messages.value = []
    }
    
    // 刷新列表
    await loadSessions()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

/**
 * 删除对话（QA对）
 * DELETE /api/qa/delete { question_id }
 */
const handleDeleteMessage = async (questionId: string) => {
  try {
    await ElMessageBox.confirm(
      '确定删除这轮对话吗？',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 调用删除接口
    await deleteQA({ question_id: questionId })
    ElMessage.success('删除成功')
    
    // 刷新消息列表
    if (currentSessionId.value) {
      await loadMessages(currentSessionId.value)
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

/**
 * 加载消息历史
 * GET /api/qa/list?session_id={sessionId}
 * 将 QAPair 转换为 User + AI 气泡
 */
const loadMessages = async (sessionId: string) => {
  messagesLoading.value = true
  try {
    const res = await getQAList(sessionId)
    const qaList = res.data
    
    // 将 QA 列表转换为 Message 列表（一个 QA 变为两条消息）
    messages.value = qaList.flatMap((qa: QAPair) => [
      {
        id: `${qa.question_id}_q`,
        role: 'user',
        content: qa.question,
        timestamp: qa.timestamp
      },
      {
        id: `${qa.question_id}_a`,
        role: 'assistant',
        content: qa.answer,
        timestamp: qa.timestamp,
        recommendation: null
      }
    ])
    
    // 滚动到底部
    await nextTick()
    scrollToBottom()
  } catch (error: any) {
    ElMessage.error(error.message || '加载消息失败')
    messages.value = []
  } finally {
    messagesLoading.value = false
  }
}

/**
 * 发送消息（流式）
 * GET /api/chat/dialog/stream?query={query}&session_id={sessionId}
 */
const handleSendMessage = async () => {
  if (!inputMessage.value.trim() || !currentSessionId.value) return
  
  // 获取用户输入的原始消息（用于显示在UI上）
  const userDisplayMessage = inputMessage.value.trim()
  
  // 根据 selectedAgent 决定实际发送给后端的消息
  let actualSendMessage = userDisplayMessage
  
  if (selectedAgent.value === 'ai-create') {
    // AI创作发布：静默拼接 #AI创作发布
    actualSendMessage = `${userDisplayMessage} #AI创作发布`
    // 发送后清除 Agent 选中状态
    selectedAgent.value = null
  }
  
  lastUserQuery.value = userDisplayMessage // 记录最后一次问题（用于B站推荐）
  inputMessage.value = ''
  
  // 添加用户消息到列表
  const userMsgId = `user_${Date.now()}`
  const userMsg: ChatMessageWithRecommend = {
    id: userMsgId,
    role: 'user',
    content: userDisplayMessage,
    timestamp: Math.floor(Date.now() / 1000)
  }
  messages.value.push(userMsg)
  
  await nextTick()
  scrollToBottom()
  
  // 准备流式接收
  isStreaming.value = true
  streamingContent.value = ''
  currentStreamingMessageId.value = `ai_${Date.now()}`
  currentQuestionId.value = '' // 重置

  // 中断上一次未完成的流式请求（避免并发导致重复渲染）
  if (streamAbortController.value) {
    streamAbortController.value.abort()
  }
  streamAbortController.value = new AbortController()
  
  // 标记是否已获取 question_id
  let hasQuestionId = false
  
  try {
    await streamDialogWithFetch(
      actualSendMessage,
      currentSessionId.value,
      // onMessage
      async (content: string, isFinal: boolean, fullContent: string) => {
        // 如果已停止流式（用户点击停止或其它原因），忽略后续回调
        if (!isStreaming.value) return

        // 在收到第一个 chunk 后获取 question_id
        if (!hasQuestionId && content) {
          hasQuestionId = true
          try {
            const qaRes = await getQAList(currentSessionId.value)
            if (qaRes.data && qaRes.data.length > 0) {
              // 取最后一条（最新的）
              const latestQA = qaRes.data[qaRes.data.length - 1]
              currentQuestionId.value = latestQA.question_id
              console.log('[AI] 获取到 question_id:', currentQuestionId.value)
            }
          } catch (error) {
            console.error('[AI] 获取 question_id 失败:', error)
          }
        }
        
        if (isFinal) {
          if (fullContent) {
            const assistantMsg: ChatMessageWithRecommend = {
              id: currentStreamingMessageId.value,
              role: 'assistant',
              content: fullContent,
              timestamp: Math.floor(Date.now() / 1000),
              recommendation: null
            }
            messages.value.push(assistantMsg)
          }

          // 独立获取 B站推荐并渲染在回复下方
          try {
            const recommend = await fetchBilibili(currentSessionId.value, userDisplayMessage)
            if (recommend.name && recommend.url) {
              const target = messages.value.find(
                (msg) => msg.id === currentStreamingMessageId.value
              )
              if (target) {
                target.recommendation = recommend
              }
            }
          } catch (error) {
            console.error('获取 B站推荐失败:', error)
          }

          isStreaming.value = false
          streamingContent.value = ''
          currentQuestionId.value = '' // 清空
          streamAbortController.value = null
        } else {
          // 流式拼接
          streamingContent.value += content
          nextTick(() => scrollToBottom())
        }
      },
      // onError
      (error: Error) => {
        if ((error as any)?.name === 'AbortError') return
        ElMessage.error(error.message || '发送消息失败')
        isStreaming.value = false
        streamingContent.value = ''
        streamAbortController.value = null
      },
      // onComplete
      () => {
        isStreaming.value = false
        streamingContent.value = ''
        streamAbortController.value = null
        // 刷新会话列表
        loadSessions()
      },
      { signal: streamAbortController.value.signal }
    )
  } catch (error: any) {
    if (error?.name === 'AbortError') return
    ElMessage.error(error.message || '发送消息失败')
    isStreaming.value = false
    streamingContent.value = ''
    streamAbortController.value = null
  }
}

/**
 * 把文本追加到输入框
 */
const appendToInput = (text: string) => {
  if (text) {
    inputMessage.value = inputMessage.value ? `${inputMessage.value}\n${text}` : text
  }
}

/**
 * 处理 OCR 图片上传
 */
const handleBeforeOcrUpload: UploadProps['beforeUpload'] = async (file) => {
  // 阻止自动上传
  const text = await runOcr(file)
  if (text) {
    appendToInput(text)
  }
  return false // 阻止 el-upload 的默认上传行为
}

/**
 * 处理音频上传
 */
const handleBeforeAudioUpload: UploadProps['beforeUpload'] = async (file) => {
  // 阻止自动上传
  const text = await runAudioTranscribe(file)
  if (text) {
    appendToInput(text)
  }
  return false // 阻止 el-upload 的默认上传行为
}

/**
 * 开始录音
 */
const startRecording = async () => {
  if (isRecording.value) return

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    ElMessage.error('当前浏览器不支持录音')
    return
  }

  // 按优先级选择可用格式，优先 WAV，不行则 mp3/m4a/amr
  const mimeCandidates = [
    'audio/wav',
    'audio/x-wav',
    'audio/mpeg',
    'audio/mp4',
    'audio/x-m4a',
    'audio/amr'
  ]
  const mimeType = mimeCandidates.find((type) => MediaRecorder.isTypeSupported(type))
  if (!mimeType) {
    ElMessage.error('当前浏览器不支持录制 wav/mp3/m4a/amr，请更换浏览器或使用上传方式')
    return
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream, { mimeType })
    audioChunks.value = []

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        audioChunks.value.push(event.data)
      }
    }

    recorder.onstop = async () => {
      const blob = new Blob(audioChunks.value, { type: mimeType })
      audioChunks.value = []

      // 停止轨道，释放麦克风
      stream.getTracks().forEach((track) => track.stop())
      audioStreamRef.value = null

      // 将录音转为 File 交给现有转写逻辑
      const extMap: Record<string, string> = {
        'audio/wav': 'wav',
        'audio/x-wav': 'wav',
        'audio/mpeg': 'mp3',
        'audio/mp4': 'm4a',
        'audio/x-m4a': 'm4a',
        'audio/amr': 'amr'
      }
      const ext = extMap[mimeType] || 'wav'

      const file = new File([blob], `record-${Date.now()}.${ext}`, {
        type: mimeType
      })

      const text = await runAudioTranscribe(file)
      if (text) {
        appendToInput(text)
      }

      isRecording.value = false
      mediaRecorderRef.value = null
    }

    mediaRecorderRef.value = recorder
    audioStreamRef.value = stream
    recorder.start()
    isRecording.value = true
    ElMessage.success('开始录音，点击停止按钮结束')
  } catch (error: any) {
    console.error('录音失败:', error)
    ElMessage.error(error?.message || '无法开始录音')
    // 确保释放资源
    if (audioStreamRef.value) {
      audioStreamRef.value.getTracks().forEach((track) => track.stop())
      audioStreamRef.value = null
    }
    mediaRecorderRef.value = null
    isRecording.value = false
    audioChunks.value = []
  }
}

/**
 * 停止录音
 */
const stopRecording = () => {
  if (!isRecording.value || !mediaRecorderRef.value) return
  if (mediaRecorderRef.value.state !== 'inactive') {
    mediaRecorderRef.value.stop()
  }
}

/**
 * 处理 B站推荐
 */
const handleBilibiliRecommend = async () => {
  if (!currentSessionId.value) {
    ElMessage.warning('请先选择一个会话')
    return
  }

  // 获取 query：优先使用输入框内容，为空则使用最后一次用户问题
  let query = inputMessage.value.trim()
  if (!query) {
    query = lastUserQuery.value
  }

  if (!query) {
    ElMessage.warning('请先输入问题或发送一条消息')
    return
  }

  const result = await fetchBilibili(currentSessionId.value, query)
  
  if (result.name && result.url) {
    const lastAssistant = [...messages.value].reverse().find((msg) => msg.role === 'assistant')

    if (lastAssistant) {
      lastAssistant.recommendation = result
    } else {
      const recommendMsg: ChatMessageWithRecommend = {
        id: `recommend_${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: Math.floor(Date.now() / 1000),
        recommendation: result
      }
      messages.value.push(recommendMsg)
    }

    await nextTick()
    scrollToBottom()
  } else {
    // 无结果，已经在 composable 中显示 ElMessage.info
  }
}

/**
 * 停止生成
 * 同时调用后端 stopQA 接口，对齐 api.md 的状态管理
 */
const handleStopGeneration = async () => {
  // 先中断网络请求，避免流式回调结束时再次 push
  if (streamAbortController.value) {
    streamAbortController.value.abort()
    streamAbortController.value = null
  }

  // 将已生成的内容保存到 messages 数组
  if (streamingContent.value) {
    const assistantMsg: ChatMessageWithRecommend = {
      id: currentStreamingMessageId.value,
      role: 'assistant',
      content: streamingContent.value,
      timestamp: Math.floor(Date.now() / 1000),
      recommendation: null
    }
    messages.value.push(assistantMsg)

    // 调用后端 stopQA 接口，使用真实的 question_id
    if (currentQuestionId.value) {
      try {
        await stopQA({
          session_id: currentSessionId.value,
          question_id: currentQuestionId.value,
          num_render: streamingContent.value.length
        })
        console.log('[AI] 停止成功，question_id:', currentQuestionId.value)
      } catch (error) {
        console.error('[AI] 调用 stopQA 失败:', error)
      }
    } else {
      console.warn('[AI] 未获取到 question_id，无法调用 stopQA')
    }
  }
  
  // 清除流式状态（这会移除临时占位消息）
  isStreaming.value = false
  streamingContent.value = ''
  currentStreamingMessageId.value = ''
  currentQuestionId.value = ''
  
  ElMessage.info('已停止生成')
}

// 离开时清理录音资源
onBeforeUnmount(() => {
  if (mediaRecorderRef.value && mediaRecorderRef.value.state !== 'inactive') {
    mediaRecorderRef.value.stop()
  }
  if (audioStreamRef.value) {
    audioStreamRef.value.getTracks().forEach((track) => track.stop())
    audioStreamRef.value = null
  }
})

/**
 * 渲染 Markdown（添加预处理以修复不规范格式）
 */
const renderMarkdown = (content: string) => {
  if (!content) return ''

  // 预处理：修复不规范的 markdown 格式
  let processedContent = content

  // 0. 修复标题换行问题：确保标题标记前后有换行
  // 处理标题前没有换行的情况：文本## 标题 → 文本\n## 标题
  processedContent = processedContent.replace(/([^\n])(#{1,6}\s+)/g, '$1\n$2')

  // 处理标题后没有换行的情况：## 标题文本 → ## 标题\n文本
  // 注意：这里需要确保标题内容后面跟着的不是换行符
  processedContent = processedContent.replace(/(#{1,6}\s+[^\n]+)([^\n])/g, (match, title, nextChar) => {
    // 如果标题后面紧跟着非换行字符，添加换行
    if (nextChar && nextChar !== '\n') {
      return title + '\n' + nextChar
    }
    return match
  })

  // 1. 修复标题：识别行首的 # 号，确保 # 与内容之间有空格
  // 支持 1-6 级标题: #内容 → # 内容
  processedContent = processedContent.replace(/^(#{1,6})([^\s#])/gm, '$1 $2')

  // 2. 修复有序列表：识别行首的数字+点号，确保点号后有空格
  // 1.内容 → 1. 内容
  processedContent = processedContent.replace(/^(\d+\.)([^\s])/gm, '$1 $2')

  // 3. 修复无序列表（星号）：识别行首的星号，确保星号后有空格
  // *内容 → * 内容
  processedContent = processedContent.replace(/^(\*)([^\s*])/gm, '$1 $2')

  // 4. 修复无序列表（短横线）：识别行首的短横线，确保短横线后有空格
  // -内容 → - 内容
  processedContent = processedContent.replace(/^(-)([^\s-])/gm, '$1 $2')

  // 5. 修复加粗：**文本** 确保前后有空格分隔（可选优化）
  processedContent = processedContent.replace(/\*\*([^\s*][^*]*?)\*\*/g, '**$1**')

  // 6. 修复代码块：确保代码块标记独立一行
  processedContent = processedContent.replace(/```(\w*)\n/g, '```$1\n')

  const rendered = md.render(processedContent)


  return rendered
}

/**
 * 滚动到底部
 */
const scrollToBottom = () => {
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

/**
 * 格式化时间
 */
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return '今天'
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${month}-${day}`
  }
}

/**
 * 格式化消息时间
 */
const formatMessageTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

onMounted(async () => {
  await loadSessions()
  
  // 处理从其他页面跳转过来的自动发送逻辑
  const query = route.query
  if (query.sessionId && query.autoSend) {
    const sessionId = query.sessionId as string
    const autoSendMessage = query.autoSend as string
    
    // 选中指定会话
    await handleSelectSession(sessionId)
    
    // 自动填充消息并发送
    inputMessage.value = autoSendMessage
    await nextTick()
    handleSendMessage()
    
    // 清除 URL 参数（避免刷新页面时重复发送）
    router.replace({ path: '/ai' })
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.ai-assistant {
  display: flex;
  height: 100%;
  gap: 16px;
  padding: 16px;
  background: transparent;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;

  .session-sidebar {
    width: 280px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(209, 250, 229, 0.5);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    box-shadow: 0 8px 32px -8px rgba(16, 185, 129, 0.15);
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    position: relative;
    z-index: 10;

    &.collapsed {
      width: 0;
      padding: 0;
      border: none;
      margin-right: -16px; // 抵消 gap
      opacity: 0;
      pointer-events: none;
    }

    .sidebar-decoration {
      position: absolute;
      pointer-events: none;
      z-index: 0;
      opacity: 0.6;

      &.top-left {
        top: 8px;
        left: 8px;
      }

      &.bottom-right {
        bottom: 8px;
        right: 8px;
      }
    }

    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid rgba(16, 185, 129, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 1;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1F2937;
        font-family: 'Noto Serif SC', serif;
        letter-spacing: 1px;
      }

      .new-session-btn {
        background: linear-gradient(135deg, #10B981 0%, #059669 100%);
        border: none;
        font-family: 'Noto Serif SC', serif;
        
        &:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }
      }
    }

    .session-list {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      position: relative;
      z-index: 1;

      &::-webkit-scrollbar {
        width: 4px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: rgba(16, 185, 129, 0.1);
        border-radius: 2px;
      }

      .session-item {
        padding: 14px;
        margin-bottom: 8px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #4B5563;
        border: 1px solid transparent;

        &:hover {
          background: rgba(16, 185, 129, 0.05);
          color: #059669;

          .session-actions {
            opacity: 1;
          }
        }

        &.active {
          background: rgba(255, 255, 255, 0.8);
          border-color: rgba(16, 185, 129, 0.2);
          color: #059669;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.05);
          
          &::before {
            content: '';
            position: absolute;
            left: 4px;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 16px;
            background: #10B981;
            border-radius: 2px;
          }
        }

        .session-edit {
          flex: 1;

          .edit-actions {
            display: flex;
            gap: 4px;
            margin-top: 8px;
          }
        }

        .session-info {
          flex: 1;
          min-width: 0;

          .session-title {
            font-size: 14px;
            font-weight: 500;
            color: inherit;
            margin-bottom: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .session-meta {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: $color-ink-light;
          }
        }

        .session-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.3s;
        }
      }
    }
  }

  .sidebar-toggle-btn {
    position: absolute;
    left: 296px; // 侧边栏宽度(280) + padding(16)
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 40px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-left: none;
    border-radius: 0 8px 8px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 20;
    color: #059669;
    box-shadow: 2px 0 8px rgba(16, 185, 129, 0.1);
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    backdrop-filter: blur(4px);

    &:hover {
      background: #ECFDF5;
      width: 24px;
    }

    &.is-collapsed {
      left: 16px; // 收起时贴在左侧 padding 处
      border-left: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 0 8px 8px 0;
    }
  }

  .chat-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(8px);
    border-radius: 12px;
    border: 1px solid rgba(16, 185, 129, 0.2);
    box-shadow: 0 8px 32px -8px rgba(16, 185, 129, 0.15);
    height: 100%;
    overflow: hidden;

    .chat-empty {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 20px;
      
      :deep(.el-empty__description) {
        font-family: 'Noto Serif SC', serif;
        color: #4B5563;
      }
    }

    .agent-buttons {
      padding: 12px 20px;
      border-bottom: 1px solid rgba(16, 185, 129, 0.1);
      background: rgba(255, 255, 255, 0.4);
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;

      .el-button {
        transition: all 0.3s;
        border-color: rgba(16, 185, 129, 0.2);
        background: rgba(255, 255, 255, 0.6);

        &:hover {
          background: rgba(16, 185, 129, 0.05);
          border-color: rgba(16, 185, 129, 0.4);
          color: #059669;
        }

        &.active-agent {
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
          border-color: #10B981;
          color: #059669;
          background: #ECFDF5;
        }
      }
    }

    .message-list {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      scroll-behavior: smooth;
      min-height: 0;

      .message-item {
        display: flex;
        gap: 12px;
        margin-bottom: 24px;

        &.message-user {
          flex-direction: row-reverse;

          .message-content {
            align-items: flex-end;

            .message-header {
              justify-content: flex-end;
            }

            .message-body {
              background: linear-gradient(135deg, #10B981 0%, #059669 100%);
              color: #fff;
              box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
              border: none;
            }
          }
        }

        .message-avatar {
          flex-shrink: 0;
        }

        .message-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;

          .message-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;

            .message-sender {
              font-size: 14px;
              font-weight: 600;
              color: #374151;
              font-family: 'Noto Serif SC', serif;
            }

            .message-header-right {
              display: flex;
              align-items: center;
              gap: 8px;
            }

            .message-time {
              font-size: 12px;
              color: #9CA3AF;
            }
          }

          .message-body {
            padding: 12px 16px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.9);
            line-height: 1.6;
            word-wrap: break-word;
            max-width: 85%;
            color: #374151;
            border: 1px solid rgba(16, 185, 129, 0.15);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            font-family: 'Noto Serif SC', sans-serif;

            &.streaming {
              animation: pulse 1.5s infinite;
            }

            // Markdown 基础样式
            :deep(h1) {
               font-size: 1.8em;
               font-weight: 700;
               margin: 0.67em 0;
               color: #111827;
               border-bottom: 2px solid rgba(16, 185, 129, 0.2);
               padding-bottom: 0.3em;
            }

            :deep(h2) {
               font-size: 1.5em;
               font-weight: 700;
               margin: 0.75em 0;
               color: #111827;
               border-bottom: 1px solid rgba(16, 185, 129, 0.15);
               padding-bottom: 0.3em;
            }

            :deep(h3) {
               font-size: 1.3em;
               font-weight: 600;
               margin: 0.83em 0;
               color: #111827;
            }

            :deep(h4) {
               font-size: 1.1em;
               font-weight: 600;
               margin: 1em 0;
               color: #111827;
            }

            :deep(h5), :deep(h6) {
               font-size: 1em;
               font-weight: 600;
               margin: 1em 0;
               color: #111827;
            }

            :deep(p) {
               margin: 0.8em 0;
               line-height: 1.7;
            }

            :deep(strong), :deep(b) {
               color: #059669;
               font-weight: 700;
            }

            :deep(em), :deep(i) {
               font-style: italic;
               color: #374151;
            }

            :deep(ul), :deep(ol) {
               margin: 0.8em 0;
               padding-left: 2em;
            }

            :deep(li) {
               margin: 0.4em 0;
               line-height: 1.6;
            }

            :deep(blockquote) {
               border-left: 4px solid #10B981;
               background: rgba(16, 185, 129, 0.05);
               color: #4B5563;
               margin: 1em 0;
               padding: 0.5em 1em;
               border-radius: 4px;
            }

            :deep(code) {
               background: rgba(16, 185, 129, 0.08);
               color: #059669;
               padding: 0.2em 0.4em;
               border-radius: 3px;
               font-family: 'Courier New', Courier, monospace;
               font-size: 0.9em;
            }

            :deep(pre) {
               background: #1f2937;
               color: #e5e7eb;
               padding: 1em;
               border-radius: 6px;
               overflow-x: auto;
               margin: 1em 0;

               code {
                  background: transparent;
                  color: inherit;
                  padding: 0;
               }
            }

            :deep(a) {
               color: #059669;
               text-decoration: underline;

               &:hover {
                  color: #10B981;
               }
            }

            :deep(hr) {
               border: none;
               border-top: 1px solid rgba(16, 185, 129, 0.2);
               margin: 1.5em 0;
            }

            :deep(table) {
               border-collapse: collapse;
               width: 100%;
               margin: 1em 0;

               th, td {
                  border: 1px solid rgba(16, 185, 129, 0.2);
                  padding: 0.5em 0.8em;
                  text-align: left;
               }

               th {
                  background: rgba(16, 185, 129, 0.1);
                  font-weight: 600;
               }
            }
          }

          .recommend-card {
            margin-top: 10px;
            padding: 12px 14px;
            border-radius: 8px;
            border: 1px dashed $color-ink-light;
            background: rgba($color-bg-base, 0.5);
            color: $color-ink-secondary;
            max-width: 70%;

            .recommend-title {
              font-weight: 600;
              margin-bottom: 6px;
              color: $color-ink-primary;
            }

            .recommend-name {
              font-size: 14px;
              margin-bottom: 6px;
            }

            .recommend-link {
              color: $color-ink-primary;
              text-decoration: none;
              font-weight: 600;
            }
          }
        }
      }
    }

    .input-area {
      border-top: 1px solid rgba(16, 185, 129, 0.2);
      padding: 16px;
      flex-shrink: 0;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(12px);

      .input-wrapper {
        position: relative;

        .agent-badge {
          position: absolute;
          left: 12px;
          top: 12px;
          z-index: 10;

          .el-tag {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-weight: 500;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            background-color: rgba(255, 255, 255, 0.9);
            border-color: rgba(16, 185, 129, 0.2);
            color: #059669;

            .el-icon {
              font-size: 14px;
            }
          }
        }

        :deep(.el-textarea__inner) {
          padding-right: 160px;
          padding-left: 12px;
          background-color: rgba(255, 255, 255, 0.6);
          border-color: rgba(16, 185, 129, 0.2);
          color: #374151;
          transition: all 0.3s;
          
          &:focus {
             border-color: #10B981;
             box-shadow: 0 0 0 1px #10B981 inset;
             background-color: rgba(255, 255, 255, 0.95);
          }
        }

        &:has(.agent-badge) {
          :deep(.el-textarea__inner) {
            padding-left: 160px;
          }
        }
      }

      .input-icons {
        position: absolute;
        right: 12px;
        bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .recording-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-top: 10px;
        padding: 6px 10px;
        border-radius: 999px;
        background: #fef0f0;
        color: #c45656;
        font-size: 12px;
        border: 1px solid #fbc4c4;

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #f56c6c;
          animation: blink 1.2s infinite;
        }

        .chip-text {
          white-space: nowrap;
        }

        &.idle {
          background: #f4f4f5;
          color: #606266;
          border-color: #e4e7ed;

          .dot {
            display: none;
          }
        }
      }
    }
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

@media (max-width: 768px) {
  .ai-assistant {
    flex-direction: column;
    height: 100%;
    padding: 0;
    gap: 0;

    .session-sidebar {
      width: 100%;
      height: 200px;
      border-right: none;
      border-bottom: 1px solid $color-ink-light;
      flex-shrink: 0;
      border-radius: 0;
    }

    .chat-container {
      flex: 1;
      height: auto;
      min-height: 0;
      border-radius: 0;
      border: none;
    }
  }
}
</style>
