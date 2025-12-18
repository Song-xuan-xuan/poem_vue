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
  // 半透明背景 + 毛玻璃效果
  background: $gradient-card-bg;
  backdrop-filter: $blur-md;
  -webkit-backdrop-filter: $blur-md;
  border: 1px solid rgba(90, 140, 111, 0.15);
  border-radius: $radius-2xl;
  overflow: hidden;
  box-shadow: $shadow-lg;
  transition: all $transition-base;

  // 竹叶装饰（左下角）
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 120px;
    height: 120px;
    background:
      radial-gradient(ellipse 60px 20px at 20% 80%, rgba(90, 140, 111, 0.12) 0%, transparent 60%),
      radial-gradient(ellipse 50px 18px at 30% 85%, rgba(90, 140, 111, 0.1) 0%, transparent 60%),
      radial-gradient(ellipse 55px 19px at 25% 90%, rgba(90, 140, 111, 0.11) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  // 竹叶装饰（右上角）
  &::after {
    content: '';
    position: absolute;
    top: 60px;
    right: 0;
    width: 100px;
    height: 100px;
    background:
      radial-gradient(ellipse 55px 18px at 80% 20%, rgba(90, 140, 111, 0.1) 0%, transparent 60%),
      radial-gradient(ellipse 48px 16px at 75% 25%, rgba(90, 140, 111, 0.09) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-glass;
    border-color: rgba(90, 140, 111, 0.25);
  }

  // 覆盖 Element Plus 卡片样式
  :deep(.el-card__header) {
    // 竹青渐变背景
    background: linear-gradient(135deg, $color-bamboo-primary 0%, $color-bamboo-light 100%);
    color: #fff;
    border: none;
    padding: $spacing-md $spacing-lg;
    position: relative;
    overflow: hidden;

    // 添加竹叶装饰纹理
    &::before {
      content: '';
      position: absolute;
      top: -20px;
      right: -20px;
      width: 100px;
      height: 100px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
      border-radius: 50%;
    }
  }

  :deep(.el-card__body) {
    padding: $spacing-xl;
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
      font-family: $font-family-chinese;

      .el-icon {
        color: $color-accent-gold;
        font-size: $font-size-lg;
        animation: twinkle 2s ease-in-out infinite;
      }
    }

    .header-date {
      font-size: $font-size-xs;
      opacity: 0.9;
      font-family: $font-family-chinese;
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
      color: $color-ink-black;
      text-align: center;
      font-family: $font-family-poem;
      letter-spacing: 2px;
      transition: color $transition-base;
    }

    .poem-author {
      font-size: $font-size-sm;
      color: $color-ink-gray;
      text-align: center;
      margin-bottom: $spacing-lg;
      font-family: $font-family-chinese;

      &::before {
        content: '—— ';
      }
    }

    .poem-paragraphs {
      line-height: $line-height-loose;
      font-size: $font-size-base;
      margin-bottom: $spacing-lg;
      color: $color-ink-black;
      max-height: 280px;
      overflow-y: auto;
      font-family: $font-family-poem;

      // 自定义滚动条
      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(90, 140, 111, 0.05);
        border-radius: $radius-sm;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(90, 140, 111, 0.3);
        border-radius: $radius-sm;

        &:hover {
          background: rgba(90, 140, 111, 0.5);
        }
      }

      p {
        margin: $spacing-md 0;
        text-align: center;
        letter-spacing: 1px;

        // 移除首行缩进，改为居中对齐
        text-indent: 0;
      }
    }

    .poem-tags {
      display: flex;
      flex-wrap: wrap;
      gap: $spacing-sm;
      justify-content: center;

      :deep(.el-tag) {
        background: rgba(90, 140, 111, 0.1);
        border: 1px solid rgba(90, 140, 111, 0.2);
        color: $color-bamboo-primary;
        border-radius: $radius-md;
        font-size: $font-size-xs;
        font-family: $font-family-chinese;
        padding: $spacing-xs $spacing-sm;
        transition: all $transition-fast;

        &:hover {
          background: rgba(90, 140, 111, 0.15);
          border-color: rgba(90, 140, 111, 0.3);
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
  background-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: $blur-sm;
}
</style>
