<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
</script>

<template>
  <div class="main-layout">
    <!-- 顶部导航栏 -->
    <header class="layout-header">
      <NavBar />
    </header>

    <!-- 主要内容区域 -->
    <main class="layout-main">
      <RouterView />
    </main>

    <!-- 底部 -->
    <footer class="layout-footer">
      <div class="footer-content">
        <p>© 2025 诗词社区. All rights reserved.</p>
        <div class="footer-links">
          <a href="#">关于我们</a>
          <span class="divider">|</span>
          <a href="#">联系我们</a>
          <span class="divider">|</span>
          <a href="#">用户协议</a>
          <span class="divider">|</span>
          <a href="#">隐私政策</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.layout-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.layout-main {
  flex: 1;
  padding: 20px;
  background-color: var(--el-bg-color-page);
}

.layout-footer {
  background-color: #fff;
  border-top: 1px solid var(--el-border-color);
  padding: 20px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.footer-links {
  margin-top: 10px;
}

.footer-links a {
  color: var(--el-text-color-regular);
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: var(--el-color-primary);
}

.footer-links .divider {
  margin: 0 10px;
  color: var(--el-border-color);
}
</style>
