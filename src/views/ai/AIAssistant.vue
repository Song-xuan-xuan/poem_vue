<template>
  <div class="ai-assistant">
    <!-- 左侧：会话列表 -->
    <div class="session-sidebar">
      <div class="sidebar-header">
        <h3>会话列表</h3>
        <el-button
          type="primary"
          size="small"
          :icon="Plus"
          :loading="createLoading"
          @click="handleCreateSession"
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

    <!-- 右侧：聊天窗口 -->
    <div class="chat-container">
      

      <div v-if="!currentSessionId" class="chat-empty">
        <el-empty description="请选择或创建一个会话开始对话">
          <el-button type="primary" @click="handleCreateSession">创建新会话</el-button>
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
  MagicStick
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
    sessions.value = res.data
    
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
  
  return md.render(processedContent)
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
.ai-assistant {
  display: flex;
  height: calc(100vh - 100px);
  gap: 0;
  background: #f5f7fa;

  .session-sidebar {
    width: 280px;
    background: #fff;
    border-right: 1px solid #e4e7ed;
    display: flex;
    flex-direction: column;

    .sidebar-header {
      padding: 16px;
      border-bottom: 1px solid #e4e7ed;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
    }

    .session-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px;

      .session-item {
        padding: 12px;
        margin-bottom: 4px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;

        &:hover {
          background: #f5f7fa;

          .session-actions {
            opacity: 1;
          }
        }

        &.active {
          background: #ecf5ff;
          border-left: 3px solid #409eff;
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
            color: #303133;
            margin-bottom: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .session-meta {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #909399;
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

  .chat-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #fff;

    .chat-empty {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .agent-buttons {
      padding: 12px 20px;
      border-bottom: 1px solid #e4e7ed;
      background: #f5f7fa;
      display: flex;
      align-items: center;
      gap: 12px;

      .el-button {
        transition: all 0.3s;

        &.active-agent {
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
        }
      }
    }

    .message-list {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      scroll-behavior: smooth;

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
              background: #409eff;
              color: #fff;
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
              color: #303133;
            }

            .message-header-right {
              display: flex;
              align-items: center;
              gap: 8px;
            }

            .message-time {
              font-size: 12px;
              color: #909399;
            }
          }

          .message-body {
            padding: 12px 16px;
            border-radius: 8px;
            background: #f5f7fa;
            line-height: 1.6;
            word-wrap: break-word;
            max-width: 85%;

            &.streaming {
              animation: pulse 1.5s infinite;
            }

            // 标题样式（优化间距与行高）
            :deep(h1) {
              font-size: 24px;
              font-weight: 700;
              line-height: 1.3;
              margin: 16px 0 8px 0;
              padding-bottom: 8px;
              border-bottom: 2px solid #dcdfe6;
              color: #303133;

              &:first-child {
                margin-top: 0;
              }
            }

            :deep(h2) {
              font-size: 20px;
              font-weight: 600;
              line-height: 1.3;
              margin: 16px 0 8px 0;
              padding-bottom: 6px;
              border-bottom: 1px solid #e4e7ed;
              color: #303133;

              &:first-child {
                margin-top: 0;
              }
            }

            :deep(h3) {
              font-size: 18px;
              font-weight: 600;
              line-height: 1.4;
              margin: 16px 0 8px 0;
              color: #606266;

              &:first-child {
                margin-top: 0;
              }
            }

            :deep(h4) {
              font-size: 16px;
              font-weight: 600;
              line-height: 1.4;
              margin: 16px 0 8px 0;
              color: #606266;

              &:first-child {
                margin-top: 0;
              }
            }

            :deep(h5), :deep(h6) {
              font-size: 14px;
              font-weight: 600;
              line-height: 1.4;
              margin: 16px 0 8px 0;
              color: #909399;

              &:first-child {
                margin-top: 0;
              }
            }

            // 段落样式（增加段落间距）
            :deep(p) {
              margin: 0 0 12px 0;

              &:first-child {
                margin-top: 0;
              }

              &:last-child {
                margin-bottom: 0;
              }
            }

            // 列表样式（优化缩进和间距）
            :deep(ul), :deep(ol) {
              margin: 8px 0 12px 0;
              padding-left: 20px;

              li {
                margin: 4px 0;
                line-height: 1.6;
              }
            }

            :deep(ul) {
              li {
                list-style-type: disc;
              }

              ul li {
                list-style-type: circle;
              }

              ul ul li {
                list-style-type: square;
              }
            }

            // 引用块样式
            :deep(blockquote) {
              margin: 8px 0;
              padding: 8px 12px;
              border-left: 4px solid #409eff;
              background: rgba(64, 158, 255, 0.05);
              color: #606266;

              p {
                margin: 4px 0;
              }
            }

            // 代码块样式
            :deep(pre) {
              margin: 8px 0;
              border-radius: 4px;
              overflow-x: auto;

              code {
                font-family: 'Courier New', Consolas, Monaco, monospace;
                font-size: 14px;
              }
            }

            // 行内代码样式
            :deep(code:not(pre code)) {
              background: rgba(0, 0, 0, 0.1);
              padding: 2px 6px;
              border-radius: 3px;
              font-family: 'Courier New', Consolas, Monaco, monospace;
              font-size: 13px;
              color: #e83e8c;
            }

            // 分隔线样式
            :deep(hr) {
              margin: 16px 0;
              border: none;
              border-top: 2px solid #e4e7ed;
            }

            // 表格样式
            :deep(table) {
              border-collapse: collapse;
              width: 100%;
              margin: 8px 0;

              th, td {
                border: 1px solid #dcdfe6;
                padding: 8px 12px;
                text-align: left;
              }

              th {
                background: #f5f7fa;
                font-weight: 600;
              }

              tr:nth-child(even) {
                background: #fafafa;
              }
            }

            // 链接样式
            :deep(a) {
              color: #409eff;
              text-decoration: none;

              &:hover {
                text-decoration: underline;
              }
            }

            // 强调样式
            :deep(strong) {
              font-weight: 600;
              color: #303133;
            }

            :deep(em) {
              font-style: italic;
            }
          }

          .recommend-card {
            margin-top: 10px;
            padding: 12px 14px;
            border-radius: 8px;
            border: 1px dashed #dcdfe6;
            background: #fdf6ec;
            color: #8c6b34;
            max-width: 70%;

            .recommend-title {
              font-weight: 600;
              margin-bottom: 6px;
            }

            .recommend-name {
              font-size: 14px;
              margin-bottom: 6px;
            }

            .recommend-link {
              color: #d48806;
              text-decoration: none;
              font-weight: 600;
            }
          }
        }
      }
    }

    .input-area {
      border-top: 1px solid #e4e7ed;
      padding: 16px;

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
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

            .el-icon {
              font-size: 14px;
            }
          }
        }

        :deep(.el-textarea__inner) {
          padding-right: 160px; // 给右侧图标留出空间
          padding-left: 12px;
        }

        // 当有 AGENT 标识时，增加左侧内边距
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
    height: auto;

    .session-sidebar {
      width: 100%;
      height: 200px;
      border-right: none;
      border-bottom: 1px solid #e4e7ed;
    }

    .chat-container {
      height: calc(100vh - 300px);
    }
  }
}
</style>
