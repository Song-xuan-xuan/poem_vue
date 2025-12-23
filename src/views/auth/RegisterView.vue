<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '@/api/auth'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()

// 表单引用
const registerFormRef = ref<FormInstance>()

// 表单数据
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)

// 自定义验证器：用户名格式
const validateUsername = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入账号'))
  } else if (!/^[a-zA-Z0-9_]{6,18}$/.test(value)) {
    callback(new Error('账号必须为6-18位，且仅包含数字、英文字母、下划线'))
  } else {
    callback()
  }
}

// 自定义验证器：密码格式
const validatePassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (!/^[a-zA-Z0-9_]{6,18}$/.test(value)) {
    callback(new Error('密码必须为6-18位，且仅包含数字、英文字母、下划线'))
  } else {
    callback()
  }
}

// 自定义验证器：确认密码
const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
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
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 注册处理
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  // 验证表单
  await registerFormRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }

    loading.value = true
    try {
      const res = await register({
        username: registerForm.username,
        password: registerForm.password
      })
      
      if (res.code === 201) {
        ElMessage.success('注册成功，请登录')
        router.push('/auth/login')
      }
    } catch (error: any) {
      console.error('注册失败:', error)
      // 错误已在 request.ts 中处理并显示
    } finally {
      loading.value = false
    }
  })
}

// 返回登录页
const goToLogin = () => {
  router.push('/auth/login')
}
</script>

<template>
  <div class="register-view">
    <!-- 动态背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
    </div>

    <el-card class="register-card">
      <template #header>
        <div class="card-header">
          <div class="logo-icon">
            <el-icon><EditPen /></el-icon>
          </div>
          <h2>加入雅集</h2>
          <p>以诗会友，共赏风雅</p>
        </div>
      </template>
      
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="rules"
        label-width="0"
        @keyup.enter="handleRegister"
        class="register-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="账号 (6-18位，数字/字母/下划线)"
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
            v-model="registerForm.password"
            type="password"
            placeholder="密码 (6-18位，数字/字母/下划线)"
            show-password
            size="large"
            maxlength="18"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
            size="large"
            maxlength="18"
          >
            <template #prefix>
              <el-icon><CircleCheck /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-alert
            type="success"
            :closable="false"
            show-icon
            class="custom-alert"
          >
            <template #default>
              <div class="alert-text">
                账号和密码只能使用数字、字母、下划线，且长度在6-18位
              </div>
            </template>
          </el-alert>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            style="width: 100%"
            size="large"
            class="submit-btn"
            @click="handleRegister"
          >
            注 册
          </el-button>
        </el-form-item>
        
        <el-form-item>
          <el-button
            text
            type="primary"
            style="width: 100%"
            class="login-link-btn"
            @click="goToLogin"
          >
            已有账号？立即登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.register-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: radial-gradient(circle at 90% 80%, rgb(240, 253, 244) 0%, rgb(209, 250, 229) 90%);
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
      animation: float 12s infinite ease-in-out;
    }

    .circle-1 {
      width: 350px;
      height: 350px;
      background: rgba(16, 185, 129, 0.15);
      top: -50px;
      right: -50px;
    }

    .circle-2 {
      width: 250px;
      height: 250px;
      background: rgba(5, 150, 105, 0.1);
      bottom: -20px;
      left: -20px;
      animation-delay: -6s;
    }
  }
}

.register-card {
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
    transform: rotate(5deg);
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

.register-form {
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

.custom-alert {
  background-color: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  
  :deep(.el-alert__icon) {
    color: #10B981;
  }
  
  .alert-text {
    font-size: 12px;
    color: #059669;
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
  margin-top: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
    opacity: 0.95;
  }

  &:active {
    transform: translateY(0);
  }
}

.login-link-btn {
  color: #6B7280;
  font-weight: normal;
  
  &:hover {
    color: #10B981;
    background: transparent;
  }
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-20px, 20px); }
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
