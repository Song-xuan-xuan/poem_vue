# Mock 系统快速开始

## ✅ Mock 系统完成

Mock 基础设施和业务数据已完成，包括：

### 已完成的工作

1. **环境配置** ✅
   - `.env.development` - 添加 `VITE_USE_MOCK=false`
   - `.env.mock` - Mock 专用环境配置

2. **目录结构** ✅
   ```
   src/mock/
   ├── index.ts          # Mock 系统入口
   ├── adapter.ts        # Axios Adapter 实现
   ├── types.ts          # 类型定义
   ├── data/             # Mock 数据目录
   │   ├── _example.ts   # 测试示例（可删除）
   │   ├── auth.ts       # 认证模块 Mock ✅
   │   ├── user.ts       # 用户模块 Mock ✅
   │   ├── poem.ts       # 诗词模块 Mock ✅
   │   ├── favorite.ts   # 收藏模块 Mock ✅
   │   └── work.ts       # 论坛模块 Mock ✅
   └── README.md         # 完整文档
   ```

3. **核心功能** ✅
   - ✅ Axios Adapter 拦截器
   - ✅ 路径参数匹配（如 `/api/user/:id`）
   - ✅ Passthrough 模式（未匹配的请求透传）
   - ✅ 延迟控制（全局 + 单个 Handler）
   - ✅ 环境开关（通过 `VITE_USE_MOCK` 控制）

4. **启动逻辑** ✅
   - `main.ts` - 根据环境变量动态加载 Mock 系统
   - `request.ts` - 导出 service 实例供 Mock 使用

## 🚀 如何使用

### 启动 Mock 模式

```bash
# 方式 1: 使用 npm 脚本
npm run dev:mock

# 方式 2: 指定 mode
npm run dev -- --mode mock
```

### 启动正常模式（真实 API）

```bash
npm run dev
```

## 🧪 测试 Mock 系统

Mock 系统已包含测试端点：

1. **启动 Mock 模式**
   ```bash
   npm run dev:mock
   ```

2. **在浏览器控制台测试**
   ```javascript
   // 测试简单请求
   fetch('/api/test/hello').then(r => r.json()).then(console.log)
   
   // 测试路径参数
   fetch('/api/test/user/123').then(r => r.json()).then(console.log)
   ```

3. **查看控制台日志**
   - `[Mock] 正在初始化 Mock 系统...` - Mock 启动
   - `[Mock] Matched: GET /api/test/hello` - 使用 Mock 数据
   - `[Mock] Passthrough: POST /api/real/endpoint` - 透传到真实 API

## ✅ 已实现的 Mock 模块

### 认证模块 (`src/mock/data/auth.ts`)

- ✅ `POST /api/auth/register` - 用户注册
- ✅ `POST /api/auth/login` - 用户登录
- ✅ `POST /api/auth/refresh` - 刷新 Token

**测试账号：**
- 用户名: `test01` / 密码: `123456`
- 用户名: `test02` / 密码: `123456`

**功能说明：**
- 自动生成随机网名
- 用户名格式验证（6-18位，数字、字母、下划线）
- 密码格式验证（6-18位，数字、字母、下划线）
- Token 生成和验证（Mock 版 JWT）

### 用户模块 (`src/mock/data/user.ts`)

- ✅ `GET /api/user/info` - 查询当前用户信息
- ✅ `GET /api/user/info/:id` - 查询用户主页
- ✅ `PUT /api/user/name` - 修改网名
- ✅ `PUT /api/user/avatar` - 上传头像
- ✅ `PUT /api/user/password` - 修改密码

**功能说明：**
- Token 验证（从 Authorization Header）
- 网名格式验证（2-20位，中文、数字、字母、下划线）
- 网名占用检查
- 密码修改验证（旧密码、新旧密码不同、格式验证）
- 用户主页包含诗词作品列表（test02 用户有 3 首诗）

### 诗词模块 (`src/mock/data/poem.ts`)

- ✅ `GET /api/poem/page` - 分页查询诗词列表
- ✅ `GET /api/poem/paragraphs/search` - 诗句模糊查询
- ✅ `GET /api/poem/title/search` - 标题模糊查询
- ✅ `GET /api/poem/daily` - 每日一首
- ✅ `GET /api/poem/:id` - 查询诗词详情
- ✅ `POST /api/poem/respond` - 对诗接口
- ✅ `GET /api/poem/parse/prompt` - 智能解析构造 Prompt

**功能说明：**
- 20 条精选唐诗数据（李白、杜甫、王维等名家作品）
- 分页支持（page_size, page_num）
- 关键词搜索（标题、诗句）
- 每日一首（根据日期计算）
- 对诗逻辑（基于《静夜思》的示例实现）
- 智能 Prompt 生成（标题优先，诗句匹配）

### 收藏模块 (`src/mock/data/favorite.ts`)

- ✅ `GET /api/collect/list` - 查询收藏列表
- ✅ `DELETE /api/collect/:id` - 取消收藏

**功能说明：**
- 10 条收藏记录（test01 用户有 9 条）
- 分页支持（每页 10 条）
- 标题模糊查询
- 用户隔离（只能查看自己的收藏）
- 取消收藏自动更新计数

### 论坛模块 (`src/mock/data/work.ts`)

- ✅ `GET /api/work/home/page` - 主页帖子分页查询
- ✅ `GET /api/work/hot` - 热力榜 Top10
- ✅ `GET /api/work/detail/:id` - 查询帖子详情
- ✅ `POST /api/work/poem` - 发布帖子
- ✅ `DELETE /api/work/poem/:id` - 删除帖子
- ✅ `POST /api/work/like/:id` - 点赞帖子
- ✅ `POST /api/work/collect/:id/` - 收藏帖子
- ✅ `POST /api/work/comment` - 发布评论

**功能说明：**
- 20 条论坛帖子（关于唐诗的各类讨论）
- 状态变更支持（发布、删除、点赞、收藏、评论）
- 分页支持（主页 20 条/页）
- 热力值计算（点赞×2 + 收藏×3 + 评论×1.5）
- 防重复点赞和收藏
- 评论包含用户昵称
- 经验值系统（发布、点赞、收藏、评论都增加经验）
- 内存状态管理（支持动态增删）

## 🧪 测试示例

### 1. 测试注册

```bash
# 在浏览器控制台或测试工具中
fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'test03',
    password: '123456'
  })
}).then(r => r.json()).then(console.log)
```

### 2. 测试登录

```javascript
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'test01',
    password: '123456'
  })
}).then(r => r.json()).then(data => {
  console.log(data)
  // 保存 token 以便后续请求使用
  window.mockToken = data.data.access_token
})
```

### 3. 测试查询用户信息

```javascript
fetch('/api/user/info', {
  headers: { 
    'Authorization': `Bearer ${window.mockToken}` 
  }
}).then(r => r.json()).then(console.log)
```

### 4. 测试查询用户主页

```javascript
fetch('/api/user/info/2', {
  headers: { 
    'Authorization': `Bearer ${window.mockToken}` 
  }
}).then(r => r.json()).then(console.log)
```

### 5. 测试修改网名

```javascript
fetch('/api/user/name', {
  method: 'PUT',
  headers: { 
    'Authorization': `Bearer ${window.mockToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ new_name: '李白粉丝团长' })
}).then(r => r.json()).then(console.log)
```

### 6. 测试诗词分页查询

```javascript
fetch('/api/poem/page?page_size=5&page_num=1', {
  headers: { 
    'Authorization': `Bearer ${window.mockToken}` 
  }
}).then(r => r.json()).then(console.log)
```

### 7. 测试诗词搜索

```javascript
// 标题搜索
fetch('/api/poem/title/search?keyword=静夜', {
  headers: { 
    'Authorization': `Bearer ${window.mockToken}` 
  }
}).then(r => r.json()).then(console.log)

// 诗句搜索
fetch('/api/poem/paragraphs/search?keyword=床前明月光', {
  headers: { 
    'Authorization': `Bearer ${window.mockToken}` 
  }
}).then(r => r.json()).then(console.log)
```

### 8. 测试每日一首

```javascript
fetch('/api/poem/daily', {
  headers: { 
    'Authorization': `Bearer ${window.mockToken}` 
  }
}).then(r => r.json()).then(console.log)
```

### 9. 测试对诗功能

```javascript
fetch('/api/poem/respond', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${window.mockToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ user_sentence: '床前明月光' })
}).then(r => r.json()).then(console.log)
```

### 10. 测试收藏列表

```javascript
fetch('/api/collect/list?page=1', {
  headers: { 
    'Authorization': `Bearer ${window.mockToken}` 
  }
}).then(r => r.json()).then(console.log)
```

### 11. 测试取消收藏

```javascript
fetch('/api/collect/collect_001', {
  method: 'DELETE',
  headers: { 
    'Authorization': `Bearer ${window.mockToken}` 
  }
}).then(r => r.json()).then(console.log)
```

### 12. 测试论坛帖子列表

```javascript
fetch('/api/work/home/page?page=1', {
  headers: { 
    'Authorization': `Bearer ${window.mockToken}` 
  }
}).then(r => r.json()).then(console.log)
```

### 13. 测试热力榜

```javascript
fetch('/api/work/hot', {
  headers: { 
    'Authorization': `Bearer ${window.mockToken}` 
  }
}).then(r => r.json()).then(data => {
  console.log('热力榜 Top10:', data)
  data.data.top10.forEach((item, index) => {
    console.log(`${index + 1}. ${item.title} (热力值: ${item.heat_score})`)
  })
})
```

### 14. 测试发布帖子

```javascript
fetch('/api/work/poem', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${window.mockToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: '我对《静夜思》的理解',
    content: '这首诗表达了游子的思乡之情，意境深远...',
    styles: ['文学', '诗歌', '赏析']
  })
}).then(r => r.json()).then(console.log)
```

### 15. 测试点赞帖子

```javascript
fetch('/api/work/like/work_001', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${window.mockToken}`,
    'Content-Type': 'application/json'
  }
}).then(r => r.json()).then(console.log)
```

### 16. 测试收藏帖子

```javascript
fetch('/api/work/collect/work_001/', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${window.mockToken}`,
    'Content-Type': 'application/json'
  }
}).then(r => r.json()).then(console.log)
```

### 17. 测试发布评论

```javascript
fetch('/api/work/comment', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${window.mockToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    work_id: 'work_001',
    content: '写得很好，学到了很多！'
  })
}).then(r => r.json()).then(console.log)
```

### 18. 测试帖子详情

```javascript
fetch('/api/work/detail/work_001', {
  headers: { 
    'Authorization': `Bearer ${window.mockToken}` 
  }
}).then(r => r.json()).then(console.log)
```

### 19. 测试删除帖子

```javascript
// 先发布一条帖子，然后删除
fetch('/api/work/poem', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${window.mockToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: '测试帖子',
    content: '这是一条测试帖子',
    styles: ['测试']
  })
})
.then(r => r.json())
.then(data => {
  const newWorkId = data.data.poem.id
  console.log('发布成功，帖子ID:', newWorkId)
  
  // 删除刚发布的帖子
  return fetch(`/api/work/poem/${newWorkId}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${window.mockToken}` 
    }
  })
})
.then(r => r.json())
.then(console.log)
```

## 📊 Mock 数据统计

### 已实现接口数量
- **认证模块**: 3 个接口
- **用户模块**: 5 个接口
- **诗词模块**: 7 个接口
- **收藏模块**: 2 个接口
- **论坛模块**: 8 个接口
- **总计**: 25 个业务接口

### 数据规模
- **用户数据**: 2 个测试用户
- **诗词数据**: 20 首唐诗
- **收藏数据**: 10 条收藏记录
- **论坛帖子**: 20 条帖子（含 14 条评论）

## 🎯 特色功能

### 状态管理
- ✅ 内存状态持久化（发布的帖子会保留在内存中）
- ✅ 防重复操作（点赞、收藏记录保存）
- ✅ 动态数据变更（点赞数、收藏数、评论实时更新）

### 经验系统
- ✅ 发布帖子：经验 +1
- ✅ 收到点赞：作者经验 +1
- ✅ 收到收藏：作者经验 +1
- ✅ 收到评论：作者经验 +1

### 热力值算法
```
热力值 = 点赞数 × 2 + 收藏数 × 3 + 评论数 × 1.5
```

## 📝 下一步

继续添加其他业务模块的 Mock 数据：

1. **AI 模块** (`src/mock/data/chat.ts`)
   - Session 创建、问答、流式对话（SSE）

## 📚 参考文档

- 完整说明: `src/mock/README.md`
- API 文档: `api.md`
- 示例代码: `src/mock/data/_example.ts`
