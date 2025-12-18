<template>
  <el-card class="daily-poem-card" shadow="hover" v-loading="loading">
    <template #header>
      <div class="card-header">
        <span class="header-title">
          <el-icon><StarFilled /></el-icon>
          每日一首
        </span>
        <span class="header-date">{{ currentDate }}</span>
      </div>
    </template>

    <el-empty v-if="!loading && !poem" description="暂无数据" />
    
    <div
      v-else-if="poem"
      class="poem-content"
      style="cursor: pointer;"
      @click="goToDetail"
      title="点击查看详情"
    >
      <h2 class="poem-title">{{ poem.title }}</h2>
      <p class="poem-author">{{ poem.author }}</p>
      <div class="poem-paragraphs">
        <p v-for="(para, index) in poem.paragraphs" :key="index">
          {{ para }}
        </p>
      </div>
      <div class="poem-tags" v-if="poem.tags && poem.tags.length > 0">
        <el-tag
          v-for="tag in poem.tags"
          :key="tag"
          size="small"
          type="info"
          effect="plain"
        >
          {{ tag }}
        </el-tag>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { StarFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getDailyPoem } from '@/api/poem'
import type { PoemDetail } from '@/api/type'

const loading = ref(false)
const poem = ref<PoemDetail | null>(null)
const router = useRouter()

/**
 * 当前日期
 */
const currentDate = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`
})

/**
 * 跳转到诗词详情页
 */
const goToDetail = () => {
  if (poem.value?.id) {
    router.push({ name: 'PoemDetail', params: { id: poem.value.id } })
  }
}

/**
 * 加载每日一首
 */
const loadDailyPoem = async () => {
  loading.value = true
  try {
    const res = await getDailyPoem()
    poem.value = res.data // API 直接返回 PoemDetail，无需 .poem
  } catch (error: any) {
    ElMessage.error(error.message || '加载每日一首失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDailyPoem()
})
</script>

<style scoped lang="scss">
.daily-poem-card {
  :deep(.el-card__header) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border-bottom: none;
    padding: 12px 16px;
  }

  :deep(.el-card__body) {
    padding: 16px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 15px;
      font-weight: 600;

      .el-icon {
        color: #ffd700;
        font-size: 16px;
      }
    }

    .header-date {
      font-size: 12px;
      opacity: 0.9;
    }
  }

  .poem-content {
    .poem-title {
      font-size: 18px;
      margin: 0 0 6px 0;
      font-weight: 600;
      color: var(--el-text-color-primary);
      text-align: center;
    }

    .poem-author {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      text-align: center;
      margin-bottom: 12px;
    }

    .poem-paragraphs {
      line-height: 1.8;
      font-size: 14px;
      margin-bottom: 12px;
      color: var(--el-text-color-regular);
      max-height: 200px;
      overflow-y: auto;

      p {
        margin: 6px 0;
        text-indent: 2em;
      }
    }

    .poem-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: center;
    }
  }
}
</style>
