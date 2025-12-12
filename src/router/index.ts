import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

// 布局组件
import MainLayout from '@/layouts/MainLayout.vue'

// 视图组件
import HomeView from '@/views/home/HomeView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import PoemMarket from '@/views/poem/PoemMarket.vue'
import PoemDetail from '@/views/poem/PoemDetail.vue'
import ForumHome from '@/views/work/ForumHome.vue'
import PostDetail from '@/views/work/PostDetail.vue'
import UserProfile from '@/views/user/UserProfile.vue'
import NotFound from '@/views/error/NotFound.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ==================== 独立路由（不使用 Layout）====================
    {
      path: '/auth/login',
      name: 'Login',
      component: LoginView,
      meta: { 
        title: '用户登录',
        requiresAuth: false
      }
    },
    {
      path: '/auth/register',
      name: 'Register',
      component: RegisterView,
      meta: { 
        title: '用户注册',
        requiresAuth: false
      }
    },

    // ==================== 嵌套路由（使用 MainLayout）====================
    {
      path: '/',
      component: MainLayout,
      children: [
        // 首页
        {
          path: '',
          name: 'Home',
          component: HomeView,
          meta: { 
            title: '首页',
            requiresAuth: false
          }
        },

        // 诗词模块
        {
          path: 'poem/market',
          name: 'PoemMarket',
          component: PoemMarket,
          meta: { 
            title: '诗词集市',
            requiresAuth: false
          }
        },
        {
          path: 'poem/detail/:id',
          name: 'PoemDetail',
          component: PoemDetail,
          meta: { 
            title: '诗词详情',
            requiresAuth: false
          }
        },

        // 论坛模块
        {
          path: 'forum',
          name: 'ForumHome',
          component: ForumHome,
          meta: { 
            title: '论坛社区',
            requiresAuth: false
          }
        },
        {
          path: 'forum/post/:id',
          name: 'PostDetail',
          component: PostDetail,
          meta: { 
            title: '帖子详情',
            requiresAuth: false
          }
        },

        // 用户模块
        {
          path: 'user/profile',
          name: 'UserProfile',
          component: UserProfile,
          meta: { 
            title: '个人中心',
            requiresAuth: true  // 需要登录
          }
        },
        {
          path: 'user/profile/:id',
          name: 'UserProfileById',
          component: UserProfile,
          meta: { 
            title: '用户主页',
            requiresAuth: false
          }
        },
        {
          path: 'user/favorites',
          name: 'FavoritesPage',
          component: () => import('@/views/user/FavoritesPage.vue'),
          meta: { 
            title: '我的收藏',
            requiresAuth: true  // 需要登录
          }
        },

        // AI 助手模块（待开发）
        {
          path: 'ai',
          name: 'AIAssistant',
          component: () => import('@/views/ai/AIAssistant.vue'),
          meta: { 
            title: 'AI助手',
            requiresAuth: true  // 需要登录
          }
        }
      ]
    },

    // ==================== 错误页面 ====================
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound,
      meta: { 
        title: '页面未找到'
      }
    }
  ]
})

// ==================== 全局路由守卫 ====================
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 诗词社区`
  }

  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    if (userStore.isLoggedIn()) {
      // 已登录，允许访问
      next()
    } else {
      // 未登录，跳转到登录页
      ElMessage.warning('请先登录')
      next({
        path: '/auth/login',
        query: { redirect: to.fullPath }  // 保存目标路由，登录后可跳转回来
      })
    }
  } else {
    // 不需要登录，直接访问
    next()
  }
})

// 路由跳转后滚动到顶部
router.afterEach(() => {
  window.scrollTo(0, 0)
})

export default router
