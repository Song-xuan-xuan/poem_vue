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

  .widget-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #303133;

    .el-icon {
      color: #409eff;
    }
  }

  :deep(.el-card__body) {
    padding: 20px;
  }

  :deep(.el-form-item) {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .respond-result {
    margin-top: 16px;

    .result-content {
      p {
        margin: 8px 0;
        line-height: 1.6;

        &:first-child {
          margin-top: 0;
        }

        &:last-child {
          margin-bottom: 0;
        }
      }

      .respond-text {
        color: #606266;
        font-size: 15px;
        padding: 8px 12px;
        background: #f5f7fa;
        border-radius: 4px;
      }

      .ai-response {
        color: #606266;
        font-size: 14px;
        white-space: pre-line;
        padding: 8px 12px;
        background: #f0f9ff;
        border-radius: 4px;
        border-left: 3px solid #409eff;
      }
    }
  }
}
</style>
