<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Reading, ChatDotRound } from '@element-plus/icons-vue'
import DailyPoem from '@/components/DailyPoem.vue'

const router = useRouter()

const handleStartLearning = () => {
  router.push('/poem/market')
}

const handleGoToCommunity = () => {
  router.push('/forum')
}
</script>

<template>
  <div class="home-view">
    <!-- 每日一首 - 悬浮在右侧 -->
    <DailyPoem class="floating-daily-poem" />

    <!-- 欢迎卡片 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>欢迎来到诗词社区</span>
        </div>
      </template>
      <div class="content">
        <h1>诗词学习与创作平台</h1>
        <p>探索中国古典诗词之美，与诗友共同成长</p>
        <el-space wrap>
          <el-button type="primary" size="large" @click="handleStartLearning">
            <el-icon><Reading /></el-icon>
            开始学习
          </el-button>
          <el-button size="large" @click="handleGoToCommunity">
            <el-icon><ChatDotRound /></el-icon>
            社区交流
          </el-button>
        </el-space>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.home-view {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

.floating-daily-poem {
  position: fixed;
  right: 20px;
  top: 80px;
  width: 320px;
  z-index: 100;
  
  @media (max-width: 1400px) {
    position: static;
    width: 100%;
    margin-bottom: 20px;
  }
}

.content {
  text-align: center;
  padding: 40px 20px;

  h1 {
    font-size: 32px;
    margin-bottom: 20px;
    color: var(--el-text-color-primary);
  }

  p {
    font-size: 18px;
    color: var(--el-text-color-secondary);
    margin-bottom: 30px;
  }
}
</style>
