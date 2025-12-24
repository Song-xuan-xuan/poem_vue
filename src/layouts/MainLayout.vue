<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import BambooBackground from '@/components/BambooBackground.vue'

const route = useRoute()
const isAIPage = computed(() => route.path === '/ai')

// 导航栏滚动态：非 AI 页面在页面滚动时加“底”，避免内容穿透造成重叠
const isHeaderScrolled = ref(false)
const updateHeaderScrolled = () => {
  // AI 页面禁用浏览器滚动（内部滚动），保持透明悬浮
  if (isAIPage.value) {
    isHeaderScrolled.value = false
    return
  }
  isHeaderScrolled.value = window.scrollY > 8
}

onMounted(() => {
  updateHeaderScrolled()
  window.addEventListener('scroll', updateHeaderScrolled, { passive: true })
})

watch(
  () => route.path,
  () => {
    // 路由切换时刷新一次状态，避免切页残留
    updateHeaderScrolled()
  }
)

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateHeaderScrolled)
})
</script>

<template>
  <div class="main-layout" :class="{ 'main-layout--ai': isAIPage }">
    <!-- 统一背景层：清风竹影 -->
    <div class="layout-background">
      <BambooBackground />
    </div>

    <!-- 顶部导航栏：透明悬浮 -->
    <header class="layout-header" :class="{ scrolled: isHeaderScrolled }">
      <NavBar />
    </header>

    <!-- 主要内容区域：无背景色，融入整体背景 -->
    <main class="layout-main" :class="{ 'layout-main--ai': isAIPage }">
      <RouterView />
    </main>

    
  </div>
</template>

<style scoped lang="scss">
// ==================== 主布局容器 ====================
.main-layout {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh; // 默认：允许内容撑开，浏览器整体滚动
  // overflow 默认 visible，滚动条在浏览器最右侧

  // AI 页面：固定全屏，禁止浏览器滚动
  &.main-layout--ai {
    height: 100vh;
    overflow: hidden;
  }
}

// ==================== 统一背景层 ====================
.layout-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: $z-index-background;

  // 竹林光影渐变底色
  background: $gradient-bamboo-bg;
}

// ==================== 顶部导航栏 ====================
.layout-header {
  position: sticky;
  top: 0;
  z-index: $z-index-navbar;
  width: 100%;
  // 移除毛玻璃，改为极淡的透明背景或完全透明
  background: transparent; 
  transition: background-color 0.3s ease;
  
  // 滚动时可以加一点背景色 (可选，这里保持透明以显露雪景)
  &.scrolled {
    background: $gradient-nav-bg;
    backdrop-filter: $blur-md;
    -webkit-backdrop-filter: $blur-md;
    border-bottom: 1px solid rgba(16, 185, 129, 0.12);
    box-shadow: $shadow-md;
  }
}

// ==================== 主内容区：无背景，融入整体 ====================
.layout-main {
  position: relative;
  z-index: $z-index-content;
  flex: 1;

  // 去除背景色，让内容融入统一背景
  background: transparent;

  // 适当的内边距
  padding: $spacing-xl $spacing-lg;

  // 最大宽度约束
  max-width: $container-max-width;
  width: 100%;
  margin: 0 auto;

  // AI 助手页面不需要内边距和最大宽度限制
  &:has(.ai-assistant) {
    padding: 0;
    max-width: none;
  }

  // 兼容 scoped/:has 不生效的情况：AI 路由强制去除内边距与宽度限制
  &.layout-main--ai {
    padding: 0;
    max-width: none;
    height: 100%; // 填满父容器（AI 页父容器已固定 100vh）
    overflow: hidden; // AI 页不出现滚动条
  }

  // 响应式调整
  @media (max-width: $breakpoint-tablet) {
    padding: $spacing-lg $spacing-md;
    
    &:has(.ai-assistant) {
      padding: 0;
    }
  }

  @media (max-width: $breakpoint-mobile) {
    padding: $spacing-md $spacing-sm;
    
    &:has(.ai-assistant) {
      padding: 0;
    }
  }
}

// ==================== 底部：半透明融合 ====================
.layout-footer {
  position: relative;
  z-index: $z-index-content;

  // 半透明背景
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: $blur-sm;
  -webkit-backdrop-filter: $blur-sm;

  // 顶部细线
  border-top: 1px solid rgba(90, 140, 111, 0.1);

  padding: $spacing-xl $spacing-lg;
  margin-top: $spacing-3xl;
}

.footer-content {
  max-width: $content-max-width;
  margin: 0 auto;
  text-align: center;

  .footer-copyright {
    color: $color-ink-gray;
    font-size: $font-size-sm;
    margin-bottom: $spacing-sm;
    font-family: $font-family-chinese;
  }

  .footer-links {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: $spacing-xs;
    flex-wrap: wrap;

    a {
      color: $color-ink-light;
      font-size: $font-size-xs;
      text-decoration: none;
      transition: color $transition-base;

      &:hover {
        color: $color-bamboo-primary;
      }
    }

    .divider {
      color: rgba(90, 140, 111, 0.3);
      font-size: $font-size-xs;
    }
  }
}
</style>
