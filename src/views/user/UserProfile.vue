<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { getUserInfoById } from '@/api/user'
import { updateName, uploadAvatar, updatePassword } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Edit, 
  Lock, 
  SwitchButton, 
  Camera, 
  Clock, 
  Star, 
  Collection 
} from '@element-plus/icons-vue'
import type { UploadProps, FormInstance, FormRules } from 'element-plus'
import type { UserPoem, UserProfileData } from '@/api/type'
import { useRoute, useRouter } from 'vue-router'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const viewedUser = ref<UserProfileData | null>(null)
const isSelf = computed(() => !route.params.id)
const profile = computed(() => (isSelf.value ? userStore.userInfo : viewedUser.value))

// 用户作品列表
const myWorks = ref<UserPoem[]>([])
const myWorksLoading = ref(false)

// 对话框控制
const editNameDialog = ref(false)
const changePasswordDialog = ref(false)

// 修改网名表单
const nameFormRef = ref<FormInstance>()
const nameForm = reactive({
  new_name: ''
})

// 修改密码表单
const passwordFormRef = ref<FormInstance>()
const passwordForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

// 网名验证规则
const validateName = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入新网名'))
  } else if (value.length < 2 || value.length > 20) {
    callback(new Error('网名长度必须为2-20位'))
  } else if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(value)) {
    callback(new Error('网名仅支持中文、数字、字母、下划线'))
  } else {
    callback()
  }
}

// 密码验证规则
const validateOldPassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入当前密码'))
  } else {
    callback()
  }
}

const validateNewPassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入新密码'))
  } else if (!/^[a-zA-Z0-9_]{6,18}$/.test(value)) {
    callback(new Error('新密码必须为6-18位，且仅包含数字、字母、下划线'))
  } else if (value === passwordForm.old_password) {
    callback(new Error('新密码不能与旧密码相同'))
  } else {
    callback()
  }
}

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请再次输入新密码'))
  } else if (value !== passwordForm.new_password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const nameRules: FormRules = {
  new_name: [{ required: true, validator: validateName, trigger: 'blur' }]
}

const passwordRules: FormRules = {
  old_password: [{ required: true, validator: validateOldPassword, trigger: 'blur' }],
  new_password: [{ required: true, validator: validateNewPassword, trigger: 'blur' }],
  confirm_password: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }]
}

// 计算经验进度
const expProgress = computed(() => {
  const exp = profile.value?.exp || 0
  // 简单的等级系统：每100经验升一级
  const expInCurrentLevel = exp % 100
  return expInCurrentLevel
})

// 上传头像
const handleAvatarUpload: UploadProps['onChange'] = async (uploadFile) => {
  if (!isSelf.value) return
  if (!uploadFile.raw) return

  // 验证文件类型
  const isImage = uploadFile.raw.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return
  }

  // 验证文件大小（2MB）
  const isLt2M = uploadFile.raw.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return
  }

  try {
    const res = await uploadAvatar(uploadFile.raw)
    if (res.code === 200) {
      ElMessage.success('头像上传成功')
      // 刷新用户信息
      await userStore.fetchProfile()
    }
  } catch (error) {
    console.error('上传头像失败:', error)
  }
}

// 打开修改网名对话框
const openEditNameDialog = () => {
  if (!isSelf.value) return
  nameForm.new_name = userStore.userInfo?.name || ''
  editNameDialog.value = true
}

// 提交修改网名
const submitNameChange = async () => {
  if (!nameFormRef.value) return

  await nameFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      const res = await updateName({ new_name: nameForm.new_name })
      if (res.code === 200) {
        ElMessage.success('网名修改成功')
        editNameDialog.value = false
        // 刷新用户信息
        await userStore.fetchProfile()
      }
    } catch (error) {
      console.error('修改网名失败:', error)
    }
  })
}

// 打开修改密码对话框
const openChangePasswordDialog = () => {
  if (!isSelf.value) return
  passwordForm.old_password = ''
  passwordForm.new_password = ''
  passwordForm.confirm_password = ''
  changePasswordDialog.value = true
}

// 提交修改密码
const submitPasswordChange = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      const res = await updatePassword({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      })
      if (res.code === 200) {
        ElMessage.success('密码修改成功，请重新登录')
        changePasswordDialog.value = false
        // 退出登录
        userStore.logout()
      }
    } catch (error) {
      console.error('修改密码失败:', error)
    }
  })
}

// 加载我的作品
const loadWorks = async () => {
  myWorksLoading.value = true
  try {
    if (isSelf.value) {
      // 当前用户：每次都重新获取最新的用户信息和作品列表
      await userStore.fetchProfile()
      myWorks.value = userStore.userInfo?.poems || []
      return
    }

    // 查看他人主页
    const userId = String(route.params.id)
    const res = await getUserInfoById(userId)
    if (res.code === 200) {
      viewedUser.value = res.data
      myWorks.value = res.data.poems || []
    } else {
      ElMessage.error(res.message || '加载用户主页失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载作品失败')
  } finally {
    myWorksLoading.value = false
  }
}

// 格式化发布时间
const formatPublishTime = (timestamp: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp * 1000)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 跳转到作品详情
const goToWorkDetail = (workId: string) => {
  router.push(`/forum/post/${workId}`)
}

// 登出
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
  }).catch(() => {
    // 取消操作
  })
}

// 初始化
onMounted(() => {
  loadWorks()
})

watch(
  () => route.params.id,
  () => {
    viewedUser.value = null
    myWorks.value = []
    loadWorks()
  }
)
</script>

<template>
  <div class="user-profile">
    <el-card v-if="profile">
      <!-- 用户信息区 -->
      <div class="profile-header">
        <!-- 头像：本人可更换，他人只展示 -->
        <el-upload
          v-if="isSelf"
          :show-file-list="false"
          :on-change="handleAvatarUpload"
          :auto-upload="false"
          accept="image/*"
        >
          <div class="avatar-container">
            <el-avatar :src="profile.photo_url" :size="120" />
            <div class="avatar-overlay">
              <el-icon><Camera /></el-icon>
              <span>更换头像</span>
            </div>
          </div>
        </el-upload>
        <div v-else class="avatar-container">
          <el-avatar :src="profile.photo_url" :size="120" />
        </div>

        <!-- 用户信息 -->
        <div class="user-info">
          <div class="user-name-row">
            <h2>{{ profile.name }}</h2>
            <el-button
              v-if="isSelf"
              size="small" 
              :icon="Edit" 
              @click="openEditNameDialog"
            >
              修改网名
            </el-button>
          </div>
          
          <div class="user-meta">
            <el-tag type="success" size="large">{{ profile.level }}</el-tag>
            <span class="exp-text">经验值: {{ profile.exp }}</span>
          </div>

          <!-- 经验进度条 -->
          <div class="exp-progress">
            <el-progress 
              :percentage="expProgress" 
              :show-text="false"
              :stroke-width="8"
            />
            <span class="progress-text">{{ expProgress }}/100</span>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons" v-if="isSelf">
            <el-button :icon="Lock" @click="openChangePasswordDialog">
              修改密码
            </el-button>
            <el-button type="danger" :icon="SwitchButton" @click="handleLogout">
              退出登录
            </el-button>
          </div>
        </div>
      </div>

      <el-divider />

      <!-- 我的作品 -->
      <div class="works-section">
        <div class="section-header">
          <h3>{{ isSelf ? '我的作品' : 'TA的作品' }}</h3>
          <el-tag v-if="profile" type="info">共 {{ profile.poem_count }} 篇</el-tag>
        </div>

        <el-skeleton v-if="myWorksLoading" :rows="3" animated />
        
        <el-empty v-else-if="myWorks.length === 0" description="暂无作品" />
        
        <div v-else class="works-list">
          <el-card
            v-for="work in myWorks"
            :key="work.id"
            shadow="hover"
            class="work-card"
            @click="goToWorkDetail(work.id)"
          >
            <h3>{{ work.title }}</h3>
            <div class="work-meta">
              <span>
                <el-icon><Clock /></el-icon>
                {{ formatPublishTime(work.publish_time) }}
              </span>
              <span>
                <el-icon><Star /></el-icon>
                {{ work.like_count ?? 0 }} 点赞
              </span>
              <span>
                <el-icon><Collection /></el-icon>
                {{ work.collect_count ?? 0 }} 收藏
              </span>
            </div>
          </el-card>
        </div>
      </div>
    </el-card>

    <!-- 修改网名对话框 -->
    <el-dialog
      v-if="isSelf"
      v-model="editNameDialog"
      title="修改网名"
      width="400px"
    >
      <el-form
        ref="nameFormRef"
        :model="nameForm"
        :rules="nameRules"
        label-width="80px"
      >
        <el-form-item label="新网名" prop="new_name">
          <el-input
            v-model="nameForm.new_name"
            placeholder="2-20位，中文/数字/字母/下划线"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item>
          <el-alert
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <div style="font-size: 12px;">
                网名长度2-20位，支持中文、数字、字母、下划线
              </div>
            </template>
          </el-alert>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editNameDialog = false">取消</el-button>
        <el-button type="primary" @click="submitNameChange">确定</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-if="isSelf"
      v-model="changePasswordDialog"
      title="修改密码"
      width="400px"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="90px"
      >
        <el-form-item label="当前密码" prop="old_password">
          <el-input
            v-model="passwordForm.old_password"
            type="password"
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="new_password">
          <el-input
            v-model="passwordForm.new_password"
            type="password"
            placeholder="6-18位，数字/字母/下划线"
            show-password
            maxlength="18"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirm_password">
          <el-input
            v-model="passwordForm.confirm_password"
            type="password"
            placeholder="请再次输入新密码"
            show-password
            maxlength="18"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="changePasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="submitPasswordChange">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.user-profile {
  max-width: 1200px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  gap: 40px;
  margin-bottom: 20px;
}

.avatar-container {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  color: white;
  font-size: 12px;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay .el-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.user-info {
  flex: 1;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.user-name-row h2 {
  margin: 0;
  font-size: 28px;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.exp-text {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.exp-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.exp-progress .el-progress {
  flex: 1;
  max-width: 300px;
}

.progress-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.works-section {
  margin-top: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.works-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.work-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.work-card:hover {
  transform: translateY(-4px);
}

.work-card h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.work-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.work-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
