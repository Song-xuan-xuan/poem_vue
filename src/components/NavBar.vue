<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

// 导航菜单项
const menuItems = [
  { name: '首页', path: '/', icon: 'House' },
  { name: '诗词集市', path: '/poem/market', icon: 'Reading' },
  { name: '论坛社区', path: '/forum', icon: 'ChatDotRound' },
  { name: 'AI助手', path: '/ai', icon: 'ChatLineRound' }
]

// 未登录点击导航项时引导登录
const handleMenuClick = (path: string) => {
  const needsAuth = ['/poem/market', '/forum', '/ai']
  if (needsAuth.includes(path) && !userStore.isLoggedIn()) {
    ElMessage.warning('请先登录后访问')
    router.push('/auth/login')
    return false
  }
  return true
}

// 用户菜单项
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/user/profile')
      break
    case 'favorites':
      router.push('/user/favorites')
      break
    case 'logout':
      userStore.logout()
      break
  }
}

// 跳转登录
const goToLogin = () => {
  router.push('/auth/login')
}
</script>

<template>
  <el-menu
    mode="horizontal"
    :ellipsis="false"
    :router="true"
    class="navbar"
  >
    <!-- Logo / 网站标题 -->
    <div class="navbar-logo">
      <el-icon size="24"><Reading /></el-icon>
      <span class="logo-text">诗词社区</span>
    </div>

    <!-- 导航菜单 -->
    <div class="navbar-menu">
      <el-menu-item
        v-for="item in menuItems"
        :key="item.path"
        :index="item.path"
        @click="handleMenuClick(item.path)"
      >
        <el-icon><component :is="item.icon" /></el-icon>
        <span>{{ item.name }}</span>
      </el-menu-item>
    </div>

    <!-- 右侧用户区域 -->
    <div class="navbar-user">
      <!-- 已登录：显示用户信息 -->
      <el-dropdown v-if="userStore.isLoggedIn()" @command="handleCommand" trigger="click">
        <div class="user-info">
          <el-avatar :src="userStore.userInfo?.photo_url" size="default" />
          <span class="user-name">{{ userStore.userInfo?.name }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item command="favorites">
              <el-icon><Star /></el-icon>
              我的收藏
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 未登录：显示登录按钮 -->
      <el-button v-else type="primary" @click="goToLogin">
        登录 / 注册
      </el-button>
    </div>
  </el-menu>
</template>

<style scoped lang="scss">
// ==================== 导航栏容器 ====================
.navbar {
  display: flex;
  align-items: center;
  height: $navbar-height;
  padding: 0 $spacing-xl;

  // 去除 Element Plus 默认边框
  border: none !important;
  border-bottom: none !important;

  // 透明背景（由 MainLayout 控制毛玻璃效果）
  background: transparent !important;

  // 最大宽度约束
  max-width: $container-max-width;
  margin: 0 auto;
  width: 100%;

  // 响应式调整
  @media (max-width: $breakpoint-tablet) {
    padding: 0 $spacing-lg;
  }

  @media (max-width: $breakpoint-mobile) {
    padding: 0 $spacing-md;
    height: 56px;
  }
}

// ==================== Logo 区域 ====================
.navbar-logo {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-right: $spacing-2xl;
  cursor: pointer;
  transition: all $transition-slow;
  position: relative;

  // 竹青色主题
  color: $color-bamboo-primary;

  // 光晕效果
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 0;
    height: 0;
    background: radial-gradient(circle, rgba(107, 144, 128, 0.15) 0%, transparent 70%);
    border-radius: 50%;
    transition: all $transition-slow;
    z-index: -1;
  }

  .el-icon {
    font-size: 28px;
    transition: all $transition-slow cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .logo-text {
    font-size: $font-size-xl;
    font-weight: 600;
    font-family: $font-family-chinese;
    white-space: nowrap;
    letter-spacing: 1px;
    transition: all $transition-base;

    // 移动端隐藏文字
    @media (max-width: $breakpoint-mobile) {
      display: none;
    }
  }

  &:hover {
    transform: scale(1.05);
    color: $color-bamboo-dark;

    &::before {
      width: 120%;
      height: 120%;
    }

    .el-icon {
      transform: rotate(10deg) scale(1.1);
    }

    .logo-text {
      letter-spacing: 2px;
    }
  }

  &:active {
    transform: scale(1.02);
    transition: transform $transition-fast;
  }
}

// ==================== 导航菜单 ====================
.navbar-menu {
  flex: 1;
  display: flex;
  gap: $spacing-xs;

  // 覆盖 Element Plus 菜单项样式
  :deep(.el-menu-item) {
    position: relative;
    height: 40px;
    line-height: 40px;
    padding: 0 $spacing-md;
    margin: 0 $spacing-xs;
    border-radius: $radius-md;
    overflow: hidden;

    // 文字样式
    font-size: $font-size-sm;
    font-family: $font-family-chinese;
    color: $color-ink-gray;
    transition: all $transition-slow;

    // 去除默认边框
    border-bottom: none !important;

    // 背景过渡层（用于平滑动画）
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(107, 144, 128, 0.08);
      opacity: 0;
      transform: scale(0.8);
      transition: all $transition-slow cubic-bezier(0.34, 1.56, 0.64, 1);
      border-radius: $radius-md;
      z-index: -1;
    }

    // 图标样式
    .el-icon {
      margin-right: $spacing-xs;
      font-size: $font-size-base;
      transition: transform $transition-base;
    }

    // Hover 状态：轻微背景 + 竹青色文字 + 图标微动
    &:hover {
      color: $color-bamboo-primary;
      transform: translateY(-1px);

      &::before {
        opacity: 1;
        transform: scale(1);
      }

      .el-icon {
        transform: scale(1.1);
      }
    }

    // 激活状态：竹青色背景 + 白色文字 + 轻微阴影
    &.is-active {
      background: linear-gradient(135deg, $color-bamboo-primary 0%, $color-bamboo-light 100%);
      color: #fff;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(107, 144, 128, 0.25);
      transform: translateY(-1px);

      &::before {
        display: none;
      }

      .el-icon {
        transform: scale(1.05);
      }
    }

    // 点击动画
    &:active {
      transform: translateY(0);
      transition: transform $transition-fast;
    }
  }

  // 移动端调整
  @media (max-width: $breakpoint-mobile) {
    gap: 0;

    :deep(.el-menu-item) {
      padding: 0 $spacing-sm;
      margin: 0 2px;
      font-size: $font-size-xs;

      span {
        display: none;
      }

      .el-icon {
        margin-right: 0;
      }
    }
  }
}

// ==================== 用户区域 ====================
.navbar-user {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.user-info {
  position: relative;
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  cursor: pointer;
  padding: $spacing-sm $spacing-md;
  border-radius: $radius-lg;
  transition: all $transition-slow;

  // 轻微背景
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 1px 3px rgba(107, 144, 128, 0.08);

  // 背景光晕效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, rgba(107, 144, 128, 0.12) 0%, transparent 70%);
    opacity: 0;
    border-radius: $radius-lg;
    transition: opacity $transition-slow;
    z-index: -1;
  }

  &:hover {
    background: rgba(107, 144, 128, 0.08);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(107, 144, 128, 0.15);

    &::before {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(-1px);
    transition: transform $transition-fast;
  }

  .el-avatar {
    border: 2px solid rgba(107, 144, 128, 0.2);
    transition: all $transition-base;
  }

  &:hover .el-avatar {
    border-color: rgba(107, 144, 128, 0.4);
    box-shadow: 0 2px 8px rgba(107, 144, 128, 0.2);
  }

  .user-name {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: $font-size-sm;
    font-family: $font-family-chinese;
    color: $color-ink-black;
    font-weight: 500;
    transition: color $transition-base;

    // 移动端隐藏用户名
    @media (max-width: $breakpoint-mobile) {
      display: none;
    }
  }

  &:hover .user-name {
    color: $color-bamboo-primary;
  }

  .el-icon {
    color: $color-ink-light;
    transition: all $transition-slow cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  &:hover .el-icon {
    transform: rotate(180deg);
    color: $color-bamboo-primary;
  }
}

// 登录按钮样式
:deep(.el-button) {
  position: relative;
  background: linear-gradient(135deg, $color-bamboo-primary 0%, $color-bamboo-light 100%);
  border: none;
  color: #fff;
  border-radius: $radius-lg;
  padding: $spacing-sm $spacing-lg;
  font-family: $font-family-chinese;
  font-weight: 500;
  overflow: hidden;
  transition: all $transition-slow;
  box-shadow: 0 2px 8px rgba(107, 144, 128, 0.2);

  // 光泽效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left $transition-slow;
  }

  // 背景渐变层
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, $color-bamboo-dark 0%, $color-bamboo-primary 100%);
    opacity: 0;
    transition: opacity $transition-slow;
    z-index: -1;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(107, 144, 128, 0.35);

    &::before {
      left: 100%;
    }

    &::after {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(-1px);
    box-shadow: 0 3px 12px rgba(107, 144, 128, 0.25);
    transition: all $transition-fast;
  }

  @media (max-width: $breakpoint-mobile) {
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-xs;
  }
}

// ==================== 下拉菜单样式 ====================
:deep(.el-dropdown-menu) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: $blur-md saturate(180%);
  -webkit-backdrop-filter: $blur-md saturate(180%);
  border: 1px solid rgba(107, 144, 128, 0.15);
  border-radius: $radius-lg;
  box-shadow: 0 8px 32px rgba(107, 144, 128, 0.2);
  padding: $spacing-sm;
  animation: dropdownFadeIn $transition-slow cubic-bezier(0.34, 1.56, 0.64, 1);

  .el-dropdown-menu__item {
    position: relative;
    border-radius: $radius-md;
    padding: $spacing-sm $spacing-md;
    font-family: $font-family-chinese;
    color: $color-ink-gray;
    transition: all $transition-base;
    overflow: hidden;

    // 背景过渡层
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(107, 144, 128, 0.08), transparent);
      transition: left $transition-slow;
    }

    .el-icon {
      margin-right: $spacing-sm;
      color: $color-bamboo-primary;
      transition: transform $transition-base;
    }

    &:hover {
      background: rgba(107, 144, 128, 0.08);
      color: $color-bamboo-primary;
      transform: translateX(4px);

      &::before {
        left: 100%;
      }

      .el-icon {
        transform: scale(1.15) rotate(5deg);
      }
    }

    &:active {
      transform: translateX(2px);
      transition: transform $transition-fast;
    }
  }
}

// 下拉菜单淡入动画
@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
