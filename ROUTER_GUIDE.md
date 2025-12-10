# 路由系统使用指南

## 📁 目录结构

```
src/
├── layouts/
│   └── MainLayout.vue          # 主布局（包含 NavBar 和 Footer）
├── components/
│   └── NavBar.vue              # 顶部导航栏
├── router/
│   └── index.ts                # 路由配置
└── views/
    ├── home/
    │   └── HomeView.vue        # 首页
    ├── auth/
    │   ├── LoginView.vue       # 登录页
    │   └── RegisterView.vue    # 注册页
    ├── poem/
    │   ├── PoemMarket.vue      # 诗词集市
    │   └── PoemDetail.vue      # 诗词详情
    ├── forum/
    │   ├── ForumHome.vue       # 论坛首页
    │   └── PostDetail.vue      # 帖子详情
    ├── user/
    │   └── UserProfile.vue     # 用户中心
    ├── ai/
    │   └── AIAssistant.vue     # AI助手
    └── error/
        └── NotFound.vue        # 404页面
```

## 🗺️ 路由架构

### 1. **嵌套路由**（使用 MainLayout）

使用主布局的路由，包含顶部导航栏和底部信息：

```typescript
{
  path: '/',
  component: MainLayout,
  children: [
    { path: '', component: HomeView },           // 首页
    { path: 'poem/market', component: PoemMarket },    // 诗词集市
    { path: 'forum', component: ForumHome },     // 论坛
    { path: 'user/profile', component: UserProfile },  // 个人中心
    // ...
  ]
}
```

### 2. **独立路由**（不使用 Layout）

登录、注册等页面独立展示，不使用主布局：

```typescript
{ path: '/auth/login', component: LoginView }
{ path: '/auth/register', component: RegisterView }
```

## 🔐 路由守卫

### Meta 字段说明

```typescript
meta: {
  title: '页面标题',           // 页面标题
  requiresAuth: true/false    // 是否需要登录
}
```

### 守卫逻辑

1. **设置页面标题**：自动从 `meta.title` 设置浏览器标题
2. **登录检查**：
   - `requiresAuth: true`：未登录用户会被重定向到登录页
   - 登录后会自动跳转回原目标页面（通过 `redirect` 参数）
3. **滚动行为**：路由切换后自动滚动到页面顶部

## 📋 完整路由列表

### 公开路由（无需登录）

| 路径 | 名称 | 组件 | 说明 |
|------|------|------|------|
| `/` | Home | HomeView | 首页 |
| `/auth/login` | Login | LoginView | 登录页 |
| `/auth/register` | Register | RegisterView | 注册页 |
| `/poem/market` | PoemMarket | PoemMarket | 诗词集市 |
| `/poem/detail/:id` | PoemDetail | PoemDetail | 诗词详情 |
| `/forum` | ForumHome | ForumHome | 论坛首页 |
| `/forum/post/:id` | PostDetail | PostDetail | 帖子详情 |
| `/user/profile/:id` | UserProfileById | UserProfile | 用户主页 |

### 受保护路由（需要登录）

| 路径 | 名称 | 组件 | 说明 |
|------|------|------|------|
| `/user/profile` | UserProfile | UserProfile | 个人中心 |
| `/ai` | AIAssistant | AIAssistant | AI助手 |

## 💻 使用示例

### 1. 编程式导航

```typescript
import { useRouter } from 'vue-router'

const router = useRouter()

// 跳转到首页
router.push('/')

// 跳转到诗词详情（带参数）
router.push(`/poem/detail/${poemId}`)

// 跳转到登录页
router.push('/auth/login')

// 带查询参数
router.push({
  path: '/poem/market',
  query: { keyword: '李白' }
})
```

### 2. 声明式导航

```vue
<template>
  <!-- 使用 to 属性 -->
  <router-link to="/">首页</router-link>
  <router-link to="/poem/market">诗词集市</router-link>
  
  <!-- 使用命名路由 -->
  <router-link :to="{ name: 'PoemDetail', params: { id: 123 } }">
    诗词详情
  </router-link>
  
  <!-- Element Plus 按钮 -->
  <el-button @click="$router.push('/forum')">论坛</el-button>
</template>
```

### 3. 获取路由参数

```typescript
import { useRoute } from 'vue-router'

const route = useRoute()

// 获取路径参数
const id = route.params.id

// 获取查询参数
const keyword = route.query.keyword
```

### 4. 路由守卫中的跳转

```typescript
// 登录成功后跳转
const handleLogin = async () => {
  // ... 登录逻辑
  
  // 获取登录前想访问的页面
  const redirect = route.query.redirect as string
  
  // 跳转到目标页面，或默认首页
  router.push(redirect || '/')
}
```

## 🎨 NavBar 组件功能

### 导航菜单

- 首页
- 诗词集市
- 论坛社区
- AI助手

### 用户菜单（已登录）

- 个人中心
- 账号设置
- 退出登录

### 未登录状态

- 显示"登录/注册"按钮

## 🔧 MainLayout 组件结构

```vue
<div class="main-layout">
  <!-- 顶部导航栏 -->
  <header class="layout-header">
    <NavBar />
  </header>

  <!-- 主要内容区域 -->
  <main class="layout-main">
    <RouterView />
  </main>

  <!-- 底部信息 -->
  <footer class="layout-footer">
    <!-- 版权信息、链接等 -->
  </footer>
</div>
```

## 📝 开发新页面步骤

### 1. 创建视图文件

在 `src/views/` 对应模块文件夹下创建 `.vue` 文件：

```vue
<script setup lang="ts">
// 组件逻辑
</script>

<template>
  <div class="my-view">
    <!-- 页面内容 -->
  </div>
</template>

<style scoped>
/* 样式 */
</style>
```

### 2. 添加路由配置

在 `src/router/index.ts` 中添加路由：

```typescript
// 导入组件
import MyView from '@/views/xxx/MyView.vue'

// 添加到对应的路由配置中
{
  path: 'my-path',
  name: 'MyView',
  component: MyView,
  meta: {
    title: '我的页面',
    requiresAuth: false  // 根据需要设置
  }
}
```

### 3. 添加导航入口（可选）

在 `NavBar.vue` 中添加菜单项：

```typescript
const menuItems = [
  // ...
  { name: '我的页面', path: '/my-path', icon: 'Document' }
]
```

## ⚠️ 注意事项

1. **路径规范**：
   - 所有路径使用小写字母
   - 使用 `/` 分隔层级
   - 动态参数使用 `:id` 格式

2. **组件命名**：
   - 视图组件使用 `XxxView.vue` 格式
   - 布局组件使用 `XxxLayout.vue` 格式

3. **目录结构**：
   - 严格按业务模块划分目录
   - 每个模块有独立的文件夹

4. **路由守卫**：
   - 需要登录的页面必须设置 `requiresAuth: true`
   - 守卫会自动处理未登录的跳转

5. **懒加载**：
   - 不常用的页面可使用懒加载：
     ```typescript
     component: () => import('@/views/xxx/XxxView.vue')
     ```

## 🎯 后续扩展

需要添加新功能时：

1. 在对应的 `views/` 子目录创建视图文件
2. 在 `router/index.ts` 添加路由配置
3. 根据需要在 `NavBar.vue` 添加导航入口
4. 设置正确的 `meta` 信息（标题、权限等）
