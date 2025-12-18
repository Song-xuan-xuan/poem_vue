<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
</script>

<template>
  <div class="main-layout">
    <!-- 统一背景层：竹影水墨纹理 -->
    <div class="layout-background">
      <div class="bamboo-texture"></div>
      <div class="ink-overlay"></div>
    </div>

    <!-- 顶部导航栏：毛玻璃效果，悬浮在背景上 -->
    <header class="layout-header">
      <NavBar />
    </header>

    <!-- 主要内容区域：无背景色，融入整体背景 -->
    <main class="layout-main">
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
  min-height: 100vh;
  overflow-x: hidden;
}

// ==================== 统一背景层 ====================
.layout-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: $z-index-background;

  // 宣纸渐变底色
  background: $gradient-bamboo-bg;

  // 竹影纹理层
  .bamboo-texture {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    // 竹子剪影（左侧）- 使用新的竹青色
    &::before {
      content: '';
      position: absolute;
      left: -50px;
      top: 0;
      width: 300px;
      height: 100%;
      background:
        // 竹竿（更柔和的绿色）
        linear-gradient(90deg, transparent 45%, rgba(107, 144, 128, 0.06) 48%, rgba(107, 144, 128, 0.1) 50%, rgba(107, 144, 128, 0.06) 52%, transparent 55%),
        linear-gradient(90deg, transparent 65%, rgba(107, 144, 128, 0.05) 68%, rgba(107, 144, 128, 0.08) 70%, rgba(107, 144, 128, 0.05) 72%, transparent 75%),
        linear-gradient(90deg, transparent 80%, rgba(107, 144, 128, 0.05) 83%, rgba(107, 144, 128, 0.09) 85%, rgba(107, 144, 128, 0.05) 87%, transparent 90%);
      background-size: 100% 100%;
      opacity: 0.7;
    }

    // 竹子剪影（右侧）
    &::after {
      content: '';
      position: absolute;
      right: -50px;
      top: 0;
      width: 250px;
      height: 100%;
      background:
        linear-gradient(90deg, transparent 15%, rgba(107, 144, 128, 0.05) 18%, rgba(107, 144, 128, 0.09) 20%, rgba(107, 144, 128, 0.05) 22%, transparent 25%),
        linear-gradient(90deg, transparent 40%, rgba(107, 144, 128, 0.05) 43%, rgba(107, 144, 128, 0.08) 45%, rgba(107, 144, 128, 0.05) 47%, transparent 50%);
      background-size: 100% 100%;
      opacity: 0.6;
    }

    // 竹叶点缀（更淡雅）
    background-image:
      // 左上竹叶
      radial-gradient(ellipse 100px 30px at 15% 20%, rgba(107, 144, 128, 0.06) 0%, transparent 60%),
      radial-gradient(ellipse 80px 25px at 12% 25%, rgba(107, 144, 128, 0.04) 0%, transparent 60%),
      radial-gradient(ellipse 90px 28px at 18% 22%, rgba(107, 144, 128, 0.05) 0%, transparent 60%),
      // 右上竹叶
      radial-gradient(ellipse 110px 32px at 88% 15%, rgba(107, 144, 128, 0.07) 0%, transparent 60%),
      radial-gradient(ellipse 85px 26px at 85% 18%, rgba(107, 144, 128, 0.05) 0%, transparent 60%),
      radial-gradient(ellipse 95px 29px at 91% 17%, rgba(107, 144, 128, 0.06) 0%, transparent 60%),
      // 右下竹叶
      radial-gradient(ellipse 120px 35px at 90% 85%, rgba(107, 144, 128, 0.08) 0%, transparent 60%),
      radial-gradient(ellipse 90px 27px at 87% 88%, rgba(107, 144, 128, 0.06) 0%, transparent 60%),
      radial-gradient(ellipse 100px 30px at 93% 86%, rgba(107, 144, 128, 0.07) 0%, transparent 60%);
    background-size: 100% 100%;
    background-repeat: no-repeat;
    opacity: 0.8;
  }

  // 水墨晕染层（更柔和）
  .ink-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 10% 20%, rgba(107, 144, 128, 0.015) 0%, transparent 40%),
      radial-gradient(circle at 90% 70%, rgba(107, 144, 128, 0.02) 0%, transparent 40%);
    pointer-events: none;
  }
}

// ==================== 导航栏：毛玻璃效果 ====================
.layout-header {
  position: sticky;
  top: 0;
  z-index: $z-index-navbar;

  // 毛玻璃效果（glassmorphism）
  background: $gradient-nav-bg;
  backdrop-filter: $blur-md saturate(180%);
  -webkit-backdrop-filter: $blur-md saturate(180%);

  // 轻微阴影，增强悬浮感
  box-shadow: $shadow-glass;

  // 底部细线（可选）
  border-bottom: 1px solid rgba(90, 140, 111, 0.08);

  transition: all $transition-base;

  // 滚动时增强效果（可通过 JS 动态添加 class）
  &.scrolled {
    background: rgba(255, 255, 255, 0.9);
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

  // 响应式调整
  @media (max-width: $breakpoint-tablet) {
    padding: $spacing-lg $spacing-md;
  }

  @media (max-width: $breakpoint-mobile) {
    padding: $spacing-md $spacing-sm;
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
