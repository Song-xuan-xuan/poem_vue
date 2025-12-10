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
    <el-card class="register-card">
      <template #header>
        <div class="card-header">
          <h2>用户注册</h2>
        </div>
      </template>
      
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="rules"
        label-width="90px"
        @keyup.enter="handleRegister"
      >
        <el-form-item label="账号" prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="6-18位，数字/字母/下划线"
            clearable
            maxlength="18"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="6-18位，数字/字母/下划线"
            show-password
            maxlength="18"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
            maxlength="18"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-alert
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <div style="font-size: 12px;">
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
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>
        
        <el-form-item>
          <el-button
            text
            type="primary"
            style="width: 100%"
            @click="goToLogin"
          >
            已有账号？立即登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.register-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-card {
  width: 400px;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0;
  color: var(--el-text-color-primary);
}
</style>
