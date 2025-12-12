## 方法一：通过环境变量切换（推荐）

**修改 .env.mock文件：**

> VITE_USE_MOCK=false  # 改为 false

或者直接使用正常模式启动：

> npm run dev  # 不使用 dev:mock



## 方法二：完全移除 Mock 系统（生产环境）

如果要彻底删除 Mock 代码，可以：

### 1. 删除 Mock 相关文件

> \# 删除整个 mock 目录
>
> rm -r src/mock

### 2. 修改 main.ts

读取 main.ts，行 10 到 25

删除这段代码：

> // 删除这部分
>
> if (useMock) {
>
>  console.log('[App] Mock 模式已启用')
>
>  const { setupMock } = await import('./mock')
>
>  await setupMock()
>
> } else {
>
>  console.log('[App] 使用真实 API')
>
> }

### 3. 修改 package.json（可选）

删除 Mock 相关脚本：

{

 "scripts": {

  "dev:mock": "vite --mode mock"  // 删除这行

 }

}

## 推荐做法

**开发阶段：** 保留 Mock 系统，通过环境变量切换

- Mock 模式：`npm run dev:mock`
- 真实 API：`npm run dev`

**生产环境：** Mock 代码会被自动 Tree-shaking 移除（因为使用了动态 import），不会打包进去，所以不需要手动删除。

只要确保生产环境的 `.env.production` 中没有设置 VITE_USE_MOCK=true即可。
