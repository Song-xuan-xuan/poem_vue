<template>
  <div class="ai-assistant">
    <!-- 左侧：会话列表 -->
    <div class="session-sidebar">
      <div class="sidebar-header">
        <h3>会话列表</h3>
        <el-button
          type="primary"
          :icon="Plus"
          circle
          size="small"
          @click="handleCreateSession"
          :loading="createLoading"
        />
      </div>

      <div v-loading="sessionsLoading" class="session-list">
        <el-empty v-if="!sessionsLoading && sessions.length === 0" description="暂无会话" />
        
        <div
          v-for="session in sessions"
          :key="session.id"
          class="session-item"
          :class="{ active: currentSessionId === session.id }"
          @click="handleSelectSession(session.id)"
        >
          <div v-if="editingSessionId === session.id" class="session-edit" @click.stop>
            <el-input
              v-model="editingTitle"
              size="small"
              @keyup.enter="handleSaveTitle(session.id)"
              @blur="handleCancelEdit"
            />
            <div class="edit-actions">
              <el-button
                size="small"
                type="primary"
                text
                :icon="Check"
                @click="handleSaveTitle(session.id)"
              />
              <el-button
                size="small"
                text
                :icon="Close"
                @click="handleCancelEdit"
              />
            </div>
          </div>

          <div v-else class="session-info">
            <div class="session-title">{{ session.title }}</div>
            <div class="session-meta">
              <span>{{ session.message_count }} 条消息</span>
              <span>{{ formatTime(session.update_time) }}</span>
            </div>
          </div>

          <div v-if="editingSessionId !== session.id" class="session-actions" @click.stop>
            <el-button
              text
              :icon="Edit"
              size="small"
              @click="handleEditTitle(session.id, session.title)"
            />
            <el-button
              text
              :icon="Delete"
              size="small"
              @click="handleDeleteSession(session.id)"
            />
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
                <span class="message-time">{{ formatMessageTime(message.timestamp) }}</span>
              </div>
              <div class="message-body" v-html="renderMarkdown(message.content)"></div>
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
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="3"
            placeholder="输入消息... (Ctrl+Enter 发送)"
            :disabled="isSending || isStreaming"
            @keydown.ctrl.enter="handleSendMessage"
          />
          <div class="input-actions">
            <el-button
              v-if="isStreaming"
              type="danger"
              :icon="VideoPause"
              @click="handleStopGeneration"
            >
              停止生成
            </el-button>
            <el-button
              v-else
              type="primary"
              :icon="Promotion"
              @click="handleSendMessage"
              :loading="isSending"
              :disabled="!inputMessage.trim()"
            >
              发送
            </el-button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import {
  Plus,
  Edit,
  Delete,
  Check,
  Close,
  Promotion,
  VideoPause,
  ChatLineSquare
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { AISession, ChatMessage } from '@/api/type'
import {
  getSessionList,
  createSession,
  renameSession,
  deleteSession
} from '@/api/session'
import { getChatHistory, sendMessageStream } from '@/api/chat'
import { StreamProcessor } from '@/utils/stream'
import { useUserStore } from '@/stores/user'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

const userStore = useUserStore()

// Markdown 渲染器
const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
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
const sessions = ref<AISession[]>([])
const currentSessionId = ref<string>('')

// 会话创建和编辑
const createLoading = ref(false)
const editingSessionId = ref<string>('')
const editingTitle = ref('')

// 消息列表
const messagesLoading = ref(false)
const messages = ref<ChatMessage[]>([])
const messageListRef = ref<HTMLDivElement>()

// 消息发送
const inputMessage = ref('')
const isSending = ref(false)

// 流式输出
const isStreaming = ref(false)
const streamingContent = ref('')
const streamProcessor = ref<StreamProcessor | null>(null)

/**
 * 加载会话列表
 */
const loadSessions = async () => {
  sessionsLoading.value = true
  try {
    const res = await getSessionList()
    sessions.value = res.data.list || []
    
    // 如果有会话但没有选中，自动选中第一个
    if (sessions.value.length > 0 && !currentSessionId.value) {
      handleSelectSession(sessions.value[0].id)
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
    const res = await createSession({
      title: `新对话 ${new Date().toLocaleString()}`
    })
    ElMessage.success('创建成功')
    
    // 刷新列表并选中新会话
    await loadSessions()
    handleSelectSession(res.data.id)
  } catch (error: any) {
    ElMessage.error(error.message || '创建会话失败')
  } finally {
    createLoading.value = false
  }
}

/**
 * 选择会话
 */
const handleSelectSession = async (sessionId: string) => {
  if (currentSessionId.value === sessionId) return
  
  currentSessionId.value = sessionId
  await loadMessages(sessionId)
}

/**
 * 编辑会话标题
 */
const handleEditTitle = (sessionId: string, currentTitle: string) => {
  editingSessionId.value = sessionId
  editingTitle.value = currentTitle
}

/**
 * 保存会话标题
 */
const handleSaveTitle = async (sessionId: string) => {
  if (!editingTitle.value.trim()) {
    ElMessage.warning('标题不能为空')
    return
  }

  try {
    await renameSession({
      session_id: sessionId,
      title: editingTitle.value.trim()
    })
    ElMessage.success('重命名成功')
    
    // 更新本地列表
    const session = sessions.value.find(s => s.id === sessionId)
    if (session) {
      session.title = editingTitle.value.trim()
    }
    
    handleCancelEdit()
  } catch (error: any) {
    ElMessage.error(error.message || '重命名失败')
  }
}

/**
 * 取消编辑
 */
const handleCancelEdit = () => {
  editingSessionId.value = ''
  editingTitle.value = ''
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

    await deleteSession({ session_id: sessionId })
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
 * 加载消息历史
 */
const loadMessages = async (sessionId: string) => {
  messagesLoading.value = true
  try {
    const res = await getChatHistory(sessionId)
    messages.value = res.data.messages || []
    
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
 * 发送消息
 */
const handleSendMessage = async () => {
  if (!inputMessage.value.trim() || !currentSessionId.value) return
  
  const userMessage = inputMessage.value.trim()
  inputMessage.value = ''
  
  // 添加用户消息到列表
  const userMsg: ChatMessage = {
    id: Date.now().toString(),
    role: 'user',
    content: userMessage,
    timestamp: Math.floor(Date.now() / 1000)
  }
  messages.value.push(userMsg)
  
  await nextTick()
  scrollToBottom()
  
  // 发送流式请求
  isStreaming.value = true
  streamingContent.value = ''
  
  try {
    const response = await sendMessageStream({
      session_id: currentSessionId.value,
      content: userMessage,
      stream: true
    })
    
    streamProcessor.value = new StreamProcessor()
    
    await streamProcessor.value.processStream(
      response,
      (chunk) => {
        if (chunk.type === 'text' && chunk.content) {
          streamingContent.value += chunk.content
          nextTick(() => scrollToBottom())
        } else if (chunk.type === 'done') {
          // 流结束，将内容添加到消息列表
          if (streamingContent.value) {
            const assistantMsg: ChatMessage = {
              id: chunk.message_id || Date.now().toString(),
              role: 'assistant',
              content: streamingContent.value,
              timestamp: Math.floor(Date.now() / 1000)
            }
            messages.value.push(assistantMsg)
          }
          
          isStreaming.value = false
          streamingContent.value = ''
          streamProcessor.value = null
          
          // 刷新会话列表（消息数可能变化）
          loadSessions()
        }
      },
      () => {
        // 完成回调
        isStreaming.value = false
        streamingContent.value = ''
        streamProcessor.value = null
      },
      (error) => {
        // 错误回调
        ElMessage.error(error.message || '发送消息失败')
        isStreaming.value = false
        streamingContent.value = ''
        streamProcessor.value = null
      }
    )
  } catch (error: any) {
    ElMessage.error(error.message || '发送消息失败')
    isStreaming.value = false
    streamingContent.value = ''
    streamProcessor.value = null
  }
}

/**
 * 停止生成
 */
const handleStopGeneration = () => {
  if (streamProcessor.value) {
    streamProcessor.value.abort()
    
    // 将已生成的内容保存
    if (streamingContent.value) {
      const assistantMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: streamingContent.value,
        timestamp: Math.floor(Date.now() / 1000)
      }
      messages.value.push(assistantMsg)
    }
    
    isStreaming.value = false
    streamingContent.value = ''
    streamProcessor.value = null
    
    ElMessage.info('已停止生成')
  }
}

/**
 * 渲染 Markdown
 */
const renderMarkdown = (content: string) => {
  return md.render(content)
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

onMounted(() => {
  loadSessions()
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
            gap: 8px;
            margin-bottom: 8px;

            .message-sender {
              font-size: 14px;
              font-weight: 600;
              color: #303133;
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
            max-width: 70%;

            &.streaming {
              animation: pulse 1.5s infinite;
            }

            :deep(pre) {
              margin: 8px 0;
              border-radius: 4px;
              overflow-x: auto;

              code {
                font-family: 'Courier New', monospace;
                font-size: 14px;
              }
            }

            :deep(p) {
              margin: 8px 0;

              &:first-child {
                margin-top: 0;
              }

              &:last-child {
                margin-bottom: 0;
              }
            }

            :deep(ul), :deep(ol) {
              margin: 8px 0;
              padding-left: 20px;
            }

            :deep(blockquote) {
              margin: 8px 0;
              padding-left: 12px;
              border-left: 3px solid #dcdfe6;
              color: #606266;
            }

            :deep(code:not(pre code)) {
              background: rgba(0, 0, 0, 0.1);
              padding: 2px 6px;
              border-radius: 3px;
              font-family: 'Courier New', monospace;
            }
          }
        }
      }
    }

    .input-area {
      border-top: 1px solid #e4e7ed;
      padding: 16px;

      .input-actions {
        margin-top: 12px;
        display: flex;
        justify-content: flex-end;
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
