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

// 用户菜单项
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/user/profile')
      break
    case 'favorites':
      router.push('/user/favorites')
      break
    case 'settings':
      router.push('/user/settings')
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
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon>
              账号设置
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

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid var(--el-border-color);
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 40px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  color: var(--el-color-primary);
}

.logo-text {
  white-space: nowrap;
}

.navbar-menu {
  flex: 1;
  display: flex;
}

.navbar-user {
  margin-left: auto;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: var(--el-fill-color-light);
}

.user-name {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
