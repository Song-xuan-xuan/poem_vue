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

          <div class="poem-content">
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
            跳转到 AI 助手解析
          </el-button>
        </el-card>
      </div>

      <el-empty v-else-if="!loading" description="未找到诗词信息" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  ArrowLeft,
  Reading,
  MagicStick
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

      .poem-line {
        font-size: 20px;
        color: #303133;
        margin: 12px 0;
        font-weight: 400;
        letter-spacing: 2px;
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
}
</style>
