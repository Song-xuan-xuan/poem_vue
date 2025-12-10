# 认证模块开发文档

## 📦 完成的功能

### 1. **API 实现** (`src/api/auth.ts`)

已实现完整的认证 API：

```typescript
// 用户注册
export const register = (params: RegisterParams): Promise<Result<RegisterData>>

// 用户登录
export const login = (params: LoginParams): Promise<Result<TokenData>>

// 刷新令牌
export const refreshToken = (params: RefreshTokenParams): Promise<Result<TokenData>>
```

### 2. **注册页面** (`src/views/auth/RegisterView.vue`)

#### ✅ 完整功能
- **el-form 表单**：包含用户名、密码、确认密码
- **实时验证**：使用 Element Plus 的表单验证系统
- **自定义验证规则**：
  - 用户名：6-18位，仅数字/字母/下划线
  - 密码：6-18位，仅数字/字母/下划线
  - 确认密码：必须与密码一致
- **友好提示**：显示格式要求的提醒
- **图标装饰**：输入框带图标前缀
- **字数限制**：maxlength 防止超长输入
- **键盘支持**：Enter 键提交表单
- **错误处理**：显示后端返回的错误信息

#### 📝 验证规则详解

```typescript
// 用户名验证
const validateUsername = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入账号'))
  } else if (!/^[a-zA-Z0-9_]{6,18}$/.test(value)) {
    callback(new Error('账号必须为6-18位，且仅包含数字、英文字母、下划线'))
  } else {
    callback()
  }
}

// 密码验证
const validatePassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (!/^[a-zA-Z0-9_]{6,18}$/.test(value)) {
    callback(new Error('密码必须为6-18位，且仅包含数字、英文字母、下划线'))
  } else {
    callback()
  }
}

// 确认密码验证
const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}
```

#### 🎯 注册流程

```typescript
const handleRegister = async () => {
  // 1. 验证表单
  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    // 2. 调用注册 API
    const res = await register({
      username: registerForm.username,
      password: registerForm.password
    })
    
    // 3. 注册成功
    if (res.code === 201) {
      ElMessage.success('注册成功，请登录')
      router.push('/auth/login')
    }
  })
}
```

### 3. **登录页面** (`src/views/auth/LoginView.vue`)

#### ✅ 完整功能
- **el-form 表单**：包含用户名、密码
- **实时验证**：表单验证系统
- **记住我功能**：
  - 勾选后保存用户名到 localStorage
  - 下次自动填充用户名
  - 取消勾选时清除保存的用户名
- **友好界面**：
  - 欢迎标语
  - 大尺寸输入框
  - 图标装饰
  - 加载状态提示
- **键盘支持**：Enter 键提交
- **重定向功能**：登录后跳转到原目标页面
- **错误处理**：显示后端返回的错误信息

#### 🔐 记住我功能实现

```typescript
// 初始化：读取保存的用户名
onMounted(() => {
  const rememberedUsername = localStorage.getItem('remembered_username')
  if (rememberedUsername) {
    loginForm.username = rememberedUsername
    loginForm.remember = true
  }
})

// 登录时：处理记住我
if (loginForm.remember) {
  localStorage.setItem('remembered_username', loginForm.username)
} else {
  localStorage.removeItem('remembered_username')
}
```

#### 🎯 登录流程

```typescript
const handleLogin = async () => {
  // 1. 验证表单
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    // 2. 调用登录 API
    const res = await login({
      username: loginForm.username,
      password: loginForm.password
    })
    
    // 3. 保存 Token
    if (res.code === 200) {
      userStore.setTokens(res.data)
      
      // 4. 获取用户信息
      await userStore.fetchProfile()
      
      // 5. 处理"记住我"
      if (loginForm.remember) {
        localStorage.setItem('remembered_username', loginForm.username)
      }
      
      // 6. 跳转到目标页面
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    }
  })
}
```

## 🎨 UI 设计

### 页面布局
- **居中卡片式**：登录/注册表单居中显示
- **渐变背景**：紫色渐变背景
- **阴影效果**：卡片带阴影提升层次感

### 表单元素
- **大尺寸输入框**：size="large" 提升体验
- **图标前缀**：User、Lock 图标
- **显示密码**：show-password 功能
- **清除按钮**：clearable 快速清空
- **字数限制**：maxlength 防止超长

### 交互体验
- **实时验证**：blur 触发验证
- **错误提示**：表单项下方显示错误
- **加载状态**：登录/注册按钮显示加载动画
- **友好链接**：快速切换登录/注册页面

## 📋 API 响应处理

### 成功响应

**注册成功**：
```json
{
  "code": 201,
  "message": "注册成功！",
  "data": {
    "id": 4,
    "username": "test10",
    "name": "482ca6f7c2",
    "photo_url": "https://...",
    "exp": 0,
    "level": "小白"
  }
}
```

**登录成功**：
```json
{
  "code": 200,
  "message": "登陆成功！",
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "token_type": "bearer"
  }
}
```

### 失败响应

所有错误已在 `src/utils/request.ts` 中统一处理：
- `400`：显示后端返回的 message
- `401`：显示"账号或密码错误"
- `500`：显示"服务器错误"

## 🔧 使用示例

### 访问页面

```typescript
// 跳转到登录页
router.push('/auth/login')

// 跳转到注册页
router.push('/auth/register')

// 带重定向的登录（从路由守卫跳转）
router.push({
  path: '/auth/login',
  query: { redirect: '/user/profile' }
})
```

### 测试账号格式

✅ **合法账号**：
- `test01`
- `user_123`
- `ABC123`
- `test_user_01`

❌ **非法账号**：
- `test` (太短)
- `test@123` (包含特殊字符)
- `测试账号` (包含中文)
- `test-user` (包含连字符)

## 🎯 核心特性总结

### 表单验证
- ✅ 使用 Element Plus 验证系统
- ✅ 自定义验证规则
- ✅ 实时错误提示
- ✅ 符合 api.md 规范

### 用户体验
- ✅ 记住我功能
- ✅ 自动填充用户名
- ✅ Enter 键提交
- ✅ 加载状态提示
- ✅ 友好的错误信息

### 安全性
- ✅ 密码输入隐藏
- ✅ 格式严格验证
- ✅ Token 自动保存
- ✅ 持久化到 localStorage

### 集成完整
- ✅ 调用 UserStore
- ✅ 保存 Token
- ✅ 获取用户信息
- ✅ 自动跳转
- ✅ 错误统一处理

## 📝 后续优化建议

1. **忘记密码**：添加找回密码功能
2. **第三方登录**：微信、QQ 等社交登录
3. **验证码**：图形验证码或滑块验证
4. **自动登录**：记住Token，自动保持登录状态
5. **密码强度**：显示密码强度指示器

所有功能已完成并测试通过，可以直接使用！🎉
