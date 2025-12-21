<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useRouter } from 'vue-router'

import { login, register } from '@/api/auth'
import { useUserStore } from '@/stores/user'
import { useAuthModalStore, type AuthModalTab } from '@/stores/authModal'

const router = useRouter()
const userStore = useUserStore()
const authModalStore = useAuthModalStore()

const { visible, activeTab, redirectPath } = storeToRefs(authModalStore)

const dialogVisible = computed({
  get: () => visible.value,
  set: (val: boolean) => {
    visible.value = val
    if (!val) authModalStore.clearRedirect()
  }
})

const currentTab = computed({
  get: () => activeTab.value,
  set: (val: AuthModalTab) => {
    activeTab.value = val
  }
})

// ========== Login ==========
const loginFormRef = ref<FormInstance>()
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})
const loginLoading = ref(false)

// ========== Register ==========
const registerFormRef = ref<FormInstance>()
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})
const registerLoading = ref(false)

const usernamePattern = /^[a-zA-Z0-9_]{6,18}$/

const validateUsername = (rule: any, value: string, callback: any) => {
  if (!value) callback(new Error('请输入账号'))
  else if (!usernamePattern.test(value)) callback(new Error('账号必须为6-18位，且仅包含数字、英文字母、下划线'))
  else callback()
}

const validatePassword = (rule: any, value: string, callback: any) => {
  if (!value) callback(new Error('请输入密码'))
  else if (!usernamePattern.test(value)) callback(new Error('密码必须为6-18位，且仅包含数字、英文字母、下划线'))
  else callback()
}

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (!value) callback(new Error('请再次输入密码'))
  else if (value !== registerForm.password) callback(new Error('两次输入的密码不一致'))
  else callback()
}

const loginRules: FormRules = {
  username: [{ required: true, validator: validateUsername, trigger: 'blur' }],
  password: [{ required: true, validator: validatePassword, trigger: 'blur' }]
}

const registerRules: FormRules = {
  username: [{ required: true, validator: validateUsername, trigger: 'blur' }],
  password: [{ required: true, validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }]
}

onMounted(() => {
  const rememberedUsername = localStorage.getItem('remembered_username')
  if (rememberedUsername) {
    loginForm.username = rememberedUsername
    loginForm.remember = true
  }
})

watch(
  () => dialogVisible.value,
  (val) => {
    if (!val) return

    // 打开弹窗时：尽量清理验证状态，避免上次错误残留
    queueMicrotask(() => {
      loginFormRef.value?.clearValidate()
      registerFormRef.value?.clearValidate()
    })
  }
)

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    loginLoading.value = true
    try {
      const res = await login({ username: loginForm.username, password: loginForm.password })
      if (res.code === 200) {
        userStore.setTokens(res.data)
        const ok = await userStore.fetchProfile()
        if (!ok) {
          ElMessage.error('获取用户信息失败')
          return
        }

        if (loginForm.remember) localStorage.setItem('remembered_username', loginForm.username)
        else localStorage.removeItem('remembered_username')

        ElMessage.success('登录成功')
        authModalStore.close()

        const target = redirectPath.value
        if (target) {
          await router.push(target)
          authModalStore.clearRedirect()
        }
      }
    } catch (e: any) {
      // 统一错误提示已在 request.ts 中处理
      console.error('[AuthModal] login error:', e)
    } finally {
      loginLoading.value = false
    }
  })
}

const handleRegister = async () => {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return

    registerLoading.value = true
    try {
      const res = await register({ username: registerForm.username, password: registerForm.password })
      if (res.code === 201) {
        ElMessage.success('注册成功，请登录')
        currentTab.value = 'login'

        // 预填账号
        loginForm.username = registerForm.username
        loginForm.password = ''

        // 清理注册表单
        registerForm.password = ''
        registerForm.confirmPassword = ''
        registerFormRef.value?.resetFields()
      }
    } catch (e: any) {
      console.error('[AuthModal] register error:', e)
    } finally {
      registerLoading.value = false
    }
  })
}

const handleDialogClose = () => {
  authModalStore.close()
  authModalStore.clearRedirect()
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    width="720px"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    :show-close="true"
    align-center
    destroy-on-close
    class="auth-modal"
    modal-class="auth-modal__overlay"
    @close="handleDialogClose"
  >
    <template #header>
      <div class="auth-modal__header">
        <div class="auth-modal__brand">
          <el-icon size="18"><Reading /></el-icon>
          <span>诗词社区</span>
        </div>
        <div class="auth-modal__subtitle">登录后解锁互动与创作</div>
      </div>
    </template>

    <div class="auth-modal__body">
      <section class="auth-modal__main">
        <el-tabs v-model="currentTab" class="auth-modal__tabs">
          <el-tab-pane label="账号登录" name="login">
            <el-form
              ref="loginFormRef"
              :model="loginForm"
              :rules="loginRules"
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
                <div class="auth-modal__options">
                  <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
                </div>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" :loading="loginLoading" style="width: 100%" size="large" @click="handleLogin">
                  登录
                </el-button>
              </el-form-item>

              <el-form-item>
                <div class="auth-modal__switch">
                  还没有账号？
                  <el-link type="primary" :underline="false" @click="currentTab = 'register'">立即注册</el-link>
                </div>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="新用户注册" name="register">
            <el-form
              ref="registerFormRef"
              :model="registerForm"
              :rules="registerRules"
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
                <el-alert type="info" :closable="false" show-icon>
                  <template #default>
                    <div class="auth-modal__tips">账号和密码只能使用数字、字母、下划线，且长度在6-18位</div>
                  </template>
                </el-alert>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" :loading="registerLoading" style="width: 100%" size="large" @click="handleRegister">
                  注册
                </el-button>
              </el-form-item>

              <el-form-item>
                <el-button text type="primary" style="width: 100%" @click="currentTab = 'login'">
                  已有账号？立即登录
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </section>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.auth-modal {
  :deep(.el-dialog) {
    padding: 0;
    border-radius: $radius-2xl;
    overflow: hidden;
    background: $gradient-card-bg;
    box-shadow: $shadow-glass;
    border: 1px solid rgba(107, 144, 128, 0.12);
    backdrop-filter: $blur-md;
    -webkit-backdrop-filter: $blur-md;
  }

  :deep(.el-dialog__header) {
    padding: $spacing-lg $spacing-xl;
    margin-right: 0;
    border-bottom: 1px solid rgba(107, 144, 128, 0.1);
  }

  :deep(.el-dialog__headerbtn) {
    top: 16px;
    right: 16px;
  }

  :deep(.el-dialog__close) {
    color: $color-ink-gray;
    transition: color $transition-base;
  }

  :deep(.el-dialog__headerbtn:hover .el-dialog__close) {
    color: $color-bamboo-primary;
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }
}

:global(.auth-modal__overlay) {
  background: rgba(58, 79, 92, 0.55) !important;
  backdrop-filter: $blur-md saturate(120%);
  -webkit-backdrop-filter: $blur-md saturate(120%);
}

.auth-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-md;

  .auth-modal__brand {
    display: inline-flex;
    align-items: center;
    gap: $spacing-xs;
    color: $color-bamboo-primary;
    font-family: $font-family-chinese;
    font-weight: 600;
  }

  .auth-modal__title {
    color: $color-ink-gray;
    font-size: $font-size-sm;
    font-family: $font-family-chinese;
  }

  .auth-modal__subtitle {
    color: $color-ink-light;
    font-size: $font-size-sm;
    font-family: $font-family-chinese;
  }
}

.auth-modal__body {
  display: flex;
  justify-content: center;
  padding: $spacing-xl;
}

.auth-modal__main {
  width: 100%;
  max-width: 560px;
}

.auth-modal__tabs {
  :deep(.el-tabs__header) {
    margin: 0 0 $spacing-lg 0;
  }

  :deep(.el-tabs__nav-wrap::after) {
    background-color: rgba(107, 144, 128, 0.12);
  }

  :deep(.el-tabs__active-bar) {
    background-color: $color-bamboo-primary;
  }

  :deep(.el-tabs__item) {
    font-family: $font-family-chinese;
    font-weight: 600;
    color: $color-ink-gray;
  }

  :deep(.el-tabs__item.is-active) {
    color: $color-bamboo-primary;
  }
}

.auth-modal__options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.auth-modal__switch {
  width: 100%;
  text-align: center;
  color: $color-ink-gray;
  font-size: $font-size-sm;
}

.auth-modal__tips {
  font-size: $font-size-xs;
  color: $color-ink-gray;
}

:deep(.el-form-item) {
  margin-bottom: $spacing-lg;
}
</style>
