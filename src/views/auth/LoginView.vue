<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login } from '@/api/auth'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 表单引用
const loginFormRef = ref<FormInstance>()

// 表单数据
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const loading = ref(false)

// 自定义验证器：用户名
const validateUsername = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入账号'))
  } else if (!/^[a-zA-Z0-9_]{6,18}$/.test(value)) {
    callback(new Error('账号格式不正确'))
  } else {
    callback()
  }
}

// 自定义验证器：密码
const validatePassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (!/^[a-zA-Z0-9_]{6,18}$/.test(value)) {
    callback(new Error('密码格式不正确'))
  } else {
    callback()
  }
}

// 表单验证规则
const rules: FormRules = {
  username: [
    { required: true, validator: validateUsername, trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ]
}

// 初始化：从 localStorage 读取记住的账号
onMounted(() => {
  const rememberedUsername = localStorage.getItem('remembered_username')
  if (rememberedUsername) {
    loginForm.username = rememberedUsername
    loginForm.remember = true
  }
})

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  // 验证表单
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }

    loading.value = true
    try {
      console.log('[Login] 开始登录...')
      const res = await login({
        username: loginForm.username,
        password: loginForm.password
      })
      
      console.log('[Login] 登录响应:', res)
      
      if (res.code === 200) {
        console.log('[Login] 登录成功，保存 Token...')
        // 保存 Token
        userStore.setTokens(res.data)
        
        console.log('[Login] 获取用户信息...')
        // 获取用户信息
        const profileSuccess = await userStore.fetchProfile()
        
        console.log('[Login] 获取用户信息结果:', profileSuccess)
        
        if (!profileSuccess) {
          ElMessage.error('获取用户信息失败')
          return
        }
        
        // 处理"记住我"
        if (loginForm.remember) {
          localStorage.setItem('remembered_username', loginForm.username)
        } else {
          localStorage.removeItem('remembered_username')
        }
        
        ElMessage.success('登录成功')
        
        // 跳转到目标页面或首页
        const redirect = (route.query.redirect as string) || '/'
        console.log('[Login] 准备跳转到:', redirect)
        await router.push(redirect)
        console.log('[Login] 跳转完成')
      } else {
        console.error('[Login] 登录失败，code:', res.code)
      }
    } catch (error: any) {
      console.error('[Login] 登录异常:', error)
      // 错误已在 request.ts 中处理并显示
    } finally {
      loading.value = false
    }
  })
}

// 跳转注册页
const goToRegister = () => {
  router.push('/auth/register')
}
</script>

<template>
  <div class="login-view">
    <!-- 动态背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="bamboo-leaf leaf-1"></div>
      <div class="bamboo-leaf leaf-2"></div>
    </div>

    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <div class="logo-icon">
            <el-icon><Reading /></el-icon>
          </div>
          <h2>竹林雅集</h2>
          <p>清风明月本无价，近水远山皆有情</p>
        </div>
      </template>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        label-width="0"
        @keyup.enter="handleLogin"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入账号"
            clearable
            size="large"
            maxlength="18"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            size="large"
            maxlength="18"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="loginForm.remember">
              <span class="remember-text">记住我</span>
            </el-checkbox>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            style="width: 100%"
            size="large"
            class="submit-btn"
            @click="handleLogin"
          >
            <span v-if="!loading">登 录</span>
            <span v-else>登录中...</span>
          </el-button>
        </el-form-item>
        
        <el-form-item>
          <div class="register-link">
            还没有账号？
            <el-link type="primary" :underline="false" @click="goToRegister">
              立即注册
            </el-link>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.login-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: radial-gradient(circle at 10% 20%, rgb(240, 253, 244) 0%, rgb(209, 250, 229) 90%);
  position: relative;
  overflow: hidden;
  font-family: 'Noto Serif SC', serif;

  .bg-decoration {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;

    .circle {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      opacity: 0.6;
      animation: float 10s infinite ease-in-out;
    }

    .circle-1 {
      width: 400px;
      height: 400px;
      background: rgba(16, 185, 129, 0.2);
      top: -100px;
      left: -100px;
    }

    .circle-2 {
      width: 300px;
      height: 300px;
      background: rgba(5, 150, 105, 0.15);
      bottom: -50px;
      right: -50px;
      animation-delay: -5s;
    }
  }
}

.login-card {
  width: 420px;
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.05),
    0 1px 3px rgba(0, 0, 0, 0.05),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);
  animation: cardEntrance 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);

  :deep(.el-card__header) {
    border-bottom: 1px solid rgba(16, 185, 129, 0.1);
    padding: 32px 32px 20px;
  }

  :deep(.el-card__body) {
    padding: 32px;
  }
}

.card-header {
  text-align: center;

  .logo-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 16px;
    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    box-shadow: 0 8px 16px rgba(16, 185, 129, 0.2);
    transform: rotate(-5deg);
  }

  h2 {
    margin: 0 0 8px 0;
    color: #064E3B;
    font-size: 28px;
    font-weight: 600;
    letter-spacing: 2px;
  }

  p {
    margin: 0;
    color: #059669;
    font-size: 14px;
    opacity: 0.8;
    letter-spacing: 1px;
  }
}

.login-form {
  :deep(.el-input__wrapper) {
    background-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2) inset;
    border-radius: 12px;
    padding: 4px 15px;
    transition: all 0.3s;

    &.is-focus {
      background-color: #fff;
      box-shadow: 0 0 0 1px #10B981 inset !important;
    }
  }

  :deep(.el-input__inner) {
    height: 42px;
    color: #064E3B;
  }

  :deep(.el-input__prefix-inner) {
    color: #10B981;
  }
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .remember-text {
    color: #059669;
  }
  
  :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    background-color: #10B981;
    border-color: #10B981;
  }
  
  :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
    color: #10B981;
  }
}

.submit-btn {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  border: none;
  border-radius: 12px;
  height: 48px;
  font-size: 16px;
  letter-spacing: 4px;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
    opacity: 0.95;
  }

  &:active {
    transform: translateY(0);
  }
}

.register-link {
  width: 100%;
  text-align: center;
  color: #6B7280;
  font-size: 14px;
  margin-top: 8px;

  :deep(.el-link) {
    color: #10B981;
    font-weight: 500;
    margin-left: 4px;
    
    &:hover {
      color: #059669;
    }
  }
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, -20px); }
}

@keyframes cardEntrance {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
