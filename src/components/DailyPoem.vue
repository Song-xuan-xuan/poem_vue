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
// ==================== 每日一首卡片 ====================
.daily-poem-card {
  position: relative;
  // 移除默认背景和边框，由外层容器控制
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  overflow: visible; // 允许印章溢出

  // 覆盖 Element Plus 卡片样式
  :deep(.el-card__header) {
    background: transparent;
    border-bottom: 1px solid rgba(148, 163, 184, 0.2); // 浅墨色分割线
    padding: $spacing-md 0;
    margin: 0 $spacing-lg;
  }

  :deep(.el-card__body) {
    padding: $spacing-xl $spacing-lg;
    background: transparent;
  }

  // 卡片头部
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 2;

    .header-title {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      font-size: $font-size-base;
      font-weight: 600;
      font-family: $font-family-serif;
      color: $color-ink-primary;

      .el-icon {
        color: $color-seal-red; // 朱砂红
        font-size: $font-size-lg;
      }
    }

    .header-date {
      font-size: $font-size-sm;
      color: $color-ink-secondary;
      font-family: $font-family-serif;
    }
  }

  // 诗词内容
  .poem-content {
    position: relative;
    z-index: 1;
    cursor: pointer;
    transition: all $transition-base;

    &:hover {
      .poem-title {
        color: $color-bamboo-primary;
      }
    }

    .poem-title {
      font-size: $font-size-2xl;
      margin: 0 0 $spacing-sm 0;
      font-weight: 600;
      color: $color-ink-primary;
      text-align: center;
      font-family: $font-family-serif;
      letter-spacing: 2px;
      transition: color $transition-base;
    }

    .poem-author {
      font-size: $font-size-sm;
      color: $color-ink-secondary;
      text-align: center;
      margin-bottom: $spacing-lg;
      font-family: $font-family-serif;

      &::before {
        content: '—— ';
      }
    }

    .poem-paragraphs {
      line-height: $line-height-loose;
      font-size: $font-size-lg;
      margin-bottom: $spacing-lg;
      color: $color-ink-primary;
      max-height: 280px;
      overflow-y: auto;
      font-family: $font-family-serif;

      // 自定义滚动条
      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(30, 41, 59, 0.05);
        border-radius: $radius-sm;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(30, 41, 59, 0.2);
        border-radius: $radius-sm;

        &:hover {
          background: rgba(30, 41, 59, 0.4);
        }
      }

      p {
        margin: $spacing-md 0;
        text-align: center;
        letter-spacing: 1px;
        text-indent: 0;
      }
    }

    .poem-tags {
      display: flex;
      flex-wrap: wrap;
      gap: $spacing-sm;
      justify-content: center;

      :deep(.el-tag) {
        background: transparent;
        border: 1px solid $color-ink-light;
        color: $color-ink-secondary;
        border-radius: $radius-sm;
        font-size: $font-size-xs;
        font-family: $font-family-serif;
        padding: $spacing-xs $spacing-sm;
        transition: all $transition-fast;

        &:hover {
          background: rgba(30, 41, 59, 0.05);
          border-color: $color-ink-secondary;
          color: $color-ink-primary;
          transform: scale(1.05);
        }
      }
    }
  }
}

// 星星闪烁动画
@keyframes twinkle {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

// 空状态样式
:deep(.el-empty) {
  padding: $spacing-xl 0;

  .el-empty__description {
    color: $color-ink-light;
    font-family: $font-family-chinese;
  }
}

// Loading 状态
:deep(.el-loading-mask) {
  background-color: rgba(240, 242, 240, 0.8); // 适配灰白玉背景
  backdrop-filter: $blur-sm;
}
</style>
