<template>
  <el-card class="poem-respond-widget" shadow="hover">
    <template #header>
      <div class="widget-header">
        <el-icon><EditPen /></el-icon>
        <span>对诗功能</span>
      </div>
    </template>

    <el-form :model="respondForm" :rules="respondRules" ref="respondFormRef">
      <el-form-item prop="content">
        <el-input
          v-model="respondForm.content"
          type="textarea"
          :rows="4"
          placeholder="请输入您的对诗内容..."
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item>
        <el-button 
          type="primary" 
          @click="handleSubmit" 
          :loading="loading"
          style="width: 100%"
        >
          <el-icon><Check /></el-icon>
          提交对诗
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 对诗结果 -->
    <div v-if="result" class="respond-result">
      <el-alert
        title="对诗成功"
        type="success"
        :closable="true"
        @close="result = null"
        show-icon
      >
        <template #default>
          <div class="result-content">
            <p><strong>您的对诗：</strong></p>
            <p class="respond-text">{{ result.userPoem }}</p>
            <p v-if="result.aiResponse"><strong>AI 点评：</strong></p>
            <p v-if="result.aiResponse" class="ai-response">{{ result.aiResponse }}</p>
          </div>
        </template>
      </el-alert>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { EditPen, Check } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { respondPoem } from '@/api/poem'

const respondFormRef = ref<FormInstance>()
const loading = ref(false)
const respondForm = ref({
  content: ''
})

const respondRules: FormRules = {
  content: [
    { required: true, message: '请输入对诗内容', trigger: 'blur' },
    { min: 4, message: '对诗内容至少4个字', trigger: 'blur' }
  ]
}

const result = ref<{
  userPoem: string
  aiResponse?: string
} | null>(null)

/**
 * 提交对诗
 */
const handleSubmit = async () => {
  if (!respondFormRef.value) return

  await respondFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const res = await respondPoem({
        user_sentence: respondForm.value.content
      })

      result.value = {
        userPoem: res.data.user_input,
        aiResponse: `匹配句：${res.data.matched_clauses.join(', ')}\n\n下一句：${res.data.next_sentence}\n\n出处：《${res.data.poem_title}》- ${res.data.poem_author}`
      }

      ElMessage.success('对诗提交成功')
      // 清空表单
      respondForm.value = { content: '' }
      respondFormRef.value?.resetFields()
    } catch (error: any) {
      ElMessage.error(error.message || '对诗提交失败')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.poem-respond-widget {
  position: sticky;
  top: 20px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 253, 244, 0.8) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 16px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 24px -8px rgba(16, 185, 129, 0.15);
    border-color: rgba(16, 185, 129, 0.3);
  }

  .widget-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 600;
    color: #047857;
    font-family: 'Noto Serif SC', serif;

    .el-icon {
      color: #10B981;
    }
  }

  :deep(.el-card__header) {
    border-bottom: 1px solid rgba(16, 185, 129, 0.1);
    padding: 16px 20px;
  }

  :deep(.el-card__body) {
    padding: 20px;
  }

  :deep(.el-textarea__inner) {
    background-color: rgba(255, 255, 255, 0.6);
    box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2) inset;
    border-radius: 8px;
    padding: 12px;
    font-family: 'Noto Serif SC', serif;
    color: #1F2937;
    transition: all 0.3s;

    &:focus {
      box-shadow: 0 0 0 1px #10B981 inset;
      background-color: #fff;
    }
    
    &::placeholder {
      color: #9CA3AF;
    }
  }

  :deep(.el-button--primary) {
    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
    border: none;
    height: 40px;
    font-size: 15px;
    border-radius: 8px;
    font-family: 'Noto Serif SC', serif;
    letter-spacing: 1px;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      opacity: 0.95;
    }
    
    &:active {
      transform: translateY(0);
    }
  }

  :deep(.el-form-item) {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .respond-result {
    margin-top: 20px;
    animation: fadeIn 0.5s ease-out;

    :deep(.el-alert) {
      background-color: rgba(236, 253, 245, 0.8);
      border: 1px solid rgba(16, 185, 129, 0.2);
      
      .el-alert__title {
        color: #047857;
        font-weight: 600;
      }
      
      .el-alert__icon {
        color: #10B981;
      }
    }

    .result-content {
      margin-top: 8px;
      
      p {
        margin: 8px 0;
        line-height: 1.6;
        font-family: 'Noto Serif SC', serif;

        strong {
          color: #047857;
        }

        &:first-child {
          margin-top: 0;
        }

        &:last-child {
          margin-bottom: 0;
        }
      }

      .respond-text {
        color: #374151;
        font-size: 15px;
        padding: 10px 14px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 6px;
        border-left: 3px solid #10B981;
        font-style: italic;
      }

      .ai-response {
        color: #4B5563;
        font-size: 14px;
        white-space: pre-line;
        padding: 10px 14px;
        background: rgba(240, 253, 244, 0.6);
        border-radius: 6px;
        border-left: 3px solid #059669;
        margin-top: 4px;
      }
    }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
}
</style>
