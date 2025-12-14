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
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>用户登录</h2>
          <p>欢迎回到诗词社区</p>
        </div>
      </template>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        label-width="0"
        @keyup.enter="handleLogin"
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
              记住我
            </el-checkbox>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            style="width: 100%"
            size="large"
            @click="handleLogin"
          >
            <span v-if="!loading">登录</span>
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

<style scoped>
.login-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 420px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-header {
  text-align: center;
  padding: 10px 0;
}

.card-header h2 {
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
  font-size: 24px;
}

.card-header p {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.register-link {
  width: 100%;
  text-align: center;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}
</style>
