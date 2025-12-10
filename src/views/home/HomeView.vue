<script setup lang="ts">
// 首页视图
</script>

<template>
  <div class="home-view">
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
          <el-button type="primary" size="large">
            <el-icon><Reading /></el-icon>
            开始学习
          </el-button>
          <el-button size="large">
            <el-icon><ChatDotRound /></el-icon>
            社区交流
          </el-button>
        </el-space>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
}

.content {
  text-align: center;
  padding: 40px 20px;
}

.content h1 {
  font-size: 32px;
  margin-bottom: 20px;
  color: var(--el-text-color-primary);
}

.content p {
  font-size: 18px;
  color: var(--el-text-color-secondary);
  margin-bottom: 30px;
}
</style>
