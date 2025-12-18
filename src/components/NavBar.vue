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
  transition: transform $transition-base;

  // 竹青色主题
  color: $color-bamboo-primary;

  .el-icon {
    font-size: 28px;
  }

  .logo-text {
    font-size: $font-size-xl;
    font-weight: 600;
    font-family: $font-family-chinese;
    white-space: nowrap;
    letter-spacing: 1px;

    // 移动端隐藏文字
    @media (max-width: $breakpoint-mobile) {
      display: none;
    }
  }

  &:hover {
    transform: scale(1.02);
  }
}

// ==================== 导航菜单 ====================
.navbar-menu {
  flex: 1;
  display: flex;
  gap: $spacing-xs;

  // 覆盖 Element Plus 菜单项样式
  :deep(.el-menu-item) {
    height: 40px;
    line-height: 40px;
    padding: 0 $spacing-md;
    margin: 0 $spacing-xs;
    border-radius: $radius-md;

    // 文字样式
    font-size: $font-size-sm;
    font-family: $font-family-chinese;
    color: $color-ink-gray;
    transition: all $transition-base;

    // 去除默认边框
    border-bottom: none !important;

    // 图标样式
    .el-icon {
      margin-right: $spacing-xs;
      font-size: $font-size-base;
    }

    // Hover 状态：轻微背景 + 竹青色文字
    &:hover {
      background: rgba(90, 140, 111, 0.08);
      color: $color-bamboo-primary;
    }

    // 激活状态：竹青色背景 + 白色文字
    &.is-active {
      background: $color-bamboo-primary;
      color: #fff;
      font-weight: 500;
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
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  cursor: pointer;
  padding: $spacing-sm $spacing-md;
  border-radius: $radius-lg;
  transition: all $transition-base;

  // 轻微背景
  background: rgba(255, 255, 255, 0.5);

  &:hover {
    background: rgba(90, 140, 111, 0.1);
    transform: translateY(-1px);
  }

  .el-avatar {
    border: 2px solid rgba(90, 140, 111, 0.2);
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

    // 移动端隐藏用户名
    @media (max-width: $breakpoint-mobile) {
      display: none;
    }
  }

  .el-icon {
    color: $color-ink-light;
    transition: transform $transition-base;
  }

  &:hover .el-icon {
    transform: rotate(180deg);
  }
}

// 登录按钮样式
:deep(.el-button) {
  background: $color-bamboo-primary;
  border-color: $color-bamboo-primary;
  color: #fff;
  border-radius: $radius-lg;
  padding: $spacing-sm $spacing-lg;
  font-family: $font-family-chinese;
  transition: all $transition-base;

  &:hover {
    background: $color-bamboo-dark;
    border-color: $color-bamboo-dark;
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }

  @media (max-width: $breakpoint-mobile) {
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-xs;
  }
}

// ==================== 下拉菜单样式 ====================
:deep(.el-dropdown-menu) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: $blur-sm;
  border: 1px solid rgba(90, 140, 111, 0.1);
  border-radius: $radius-lg;
  box-shadow: $shadow-lg;
  padding: $spacing-sm;

  .el-dropdown-menu__item {
    border-radius: $radius-md;
    padding: $spacing-sm $spacing-md;
    font-family: $font-family-chinese;
    color: $color-ink-gray;
    transition: all $transition-fast;

    .el-icon {
      margin-right: $spacing-sm;
      color: $color-bamboo-primary;
    }

    &:hover {
      background: rgba(90, 140, 111, 0.08);
      color: $color-bamboo-primary;
    }
  }
}
</style>
