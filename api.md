# 系统功能概述

1.用户系统

* 权限：登录、注册；
* 个人主页：个人信息查询、网名修改、头像上传、修改密码、登出、自己发的作品集等；
* 他人主页：他人基本信息、作品集；
* 经验系统：发帖、评论、被收藏、被点赞会提升经验，不同经验展示不同段位；

2.创作社区系统

* 创作诗歌、删除诗歌、根据关键词、标签分页查询、热点诗词；
* 互动功能：点赞、评论、收藏、查看他人主页；
* 收藏夹：收藏夹的展示、取消收藏、收藏内容模糊查询；

3.诗词学习系统

* 诗词学习系统；
* 诗词分页查询、单个诗词书法鉴赏；
* 根据标题、作者、标签、内容模糊查询；
* 对诗；
* 智能解析；
* 智能背诵；
* 每日一首；

4.智能体问答系统
== 基本功能 ==

* 会话管理：会话列表、重命名、模糊查询、会话详情、会话删除；
* 对话管理：对话折叠、导出、删除、中断、继续；
* 流式响应；
* 上下文记忆；
* 多模态输入；
* 推荐系统：爬取外部资源、相关诗词推荐；
  == 智能体操作 ==
* 批量点赞和评论；
* 智能推荐诗单；
* 热点联播（娱乐）；
* 数据分析：分析今日发布的诗词统计信息；

# 前端必看

1.关于注册的提示

* 只需要传入账号密码即可；
* 提示用户：<u>账号和密码只能使用数字、字母、下划线，且长度在6~18位数</u>；

2.关于修改网名

	网名是全网唯一的，而且有限制，修改的时候需要提示用户：<u>长度2-20位，支持中文、数字、字母、下划线</u>。

# 权限管理

## 用户注册接口

### 功能描述
	用户通过提供用户名和密码进行注册。系统会检查用户名是否已存在，并对密码进行加密存储。

### 请求地址
```
POST /api/auth/register
```

### 请求头
| 参数名称     | 类型   | 必填 | 描述                      |
| ------------ | ------ | ---- | ------------------------- |
| Content-Type | string | 是   | 必须为 `application/json` |

### 请求参数（Body）
| 参数名称 | 类型   | 必填 | 默认值 | 描述                         |
| -------- | ------ | ---- | ------ | ---------------------------- |
| username | string | 是   | 无     | 用户名（用于登录的唯一标识） |
| password | string | 是   | 无     | 登录密码                     |

### 请求示例
```http
POST /api/auth/register HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "username": "test10",
  "password": "123456"
}
```

### 成功响应
**状态码：** 201 Created
```json
{
    "code": 201,
    "message": "注册成功！",
    "data": {
        "id": 4,
        "username": "test10",
        "name": "482ca6f7c2",
        "photo_url": "https://math-qa-photos.oss-cn-beijing.aliyuncs.com/default-photo.png",
        "exp": 0,
        "level": "小白"
    }
}
```

### 失败响应
| 状态码 | 错误信息                   | 描述                     |
| ------ | -------------------------- | ------------------------ |
| 400    | "该账户已存在！"           | 用户名已被其他用户注册   |
| 400    | "参数校验失败：[错误详情]" | 请求参数格式不正确       |
| 500    | "注册失败：[错误详情]"     | 服务器内部错误，注册失败 |

---

### 请求示例-失败

// 账号或者密码不符合要求：只能包含数字、字母、下划线且长度在`[6,18]`范围内；

```http
POST /api/auth/register HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "username": "test1",
  "password": "123456"
}
```

失败响应：

```json
{
    "code": 400,
    "message": "账号格式错误：必须为6-18位，且仅包含数字、英文字母、下划线",
    "data": []
}
```

## 用户登录接口

### 功能描述
用户通过用户名和密码进行登录，成功登录后返回访问令牌（access_token）和刷新令牌（refresh_token）。

### 请求地址
```
POST /api/auth/login
```

### 请求头
| 参数名称     | 类型   | 必填 | 描述                      |
| ------------ | ------ | ---- | ------------------------- |
| Content-Type | string | 是   | 必须为 `application/json` |

### 请求参数（Body）
| 参数名称 | 类型   | 必填 | 默认值 | 描述     |
| -------- | ------ | ---- | ------ | -------- |
| username | string | 是   | 无     | 用户名   |
| password | string | 是   | 无     | 登录密码 |

### 请求示例
```http
POST /api/auth/login HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "username": "testuser",
  "password": "Test123456"
}
```

### 成功响应
**状态码：** 200 OK
```json
{
  "code": 200,
  "message": "登陆成功！",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
  }
}
```

### 失败响应
| 状态码 | 错误信息          | 描述                     |
| ------ | ----------------- | ------------------------ |
| 401    | "账号或密码错误!" | 用户名不存在或密码不正确 |

```json
{
    "code": 401,
    "message": "账号或密码错误!",
    "data": []
}
```

## 刷新令牌接口

### 功能描述
使用刷新令牌（refresh_token）获取新的访问令牌（access_token）。刷新令牌的有效期通常比访问令牌更长。

### 请求地址
```
POST /api/auth/refresh
```

### 请求头
| 参数名称      | 类型   | 必填 | 描述                                 |
| ------------- | ------ | ---- | ------------------------------------ |
| Content-Type  | string | 是   | 必须为 `application/json`            |
| Authorization | string | 是   | Bearer Token（访问令牌已过期时使用） |

### 请求参数（Body）
| 参数名称      | 类型   | 必填 | 默认值 | 描述                     |
| ------------- | ------ | ---- | ------ | ------------------------ |
| refresh_token | string | 是   | 无     | 之前登录时获取的刷新令牌 |

### 请求示例
```http
POST /api/auth/refresh HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 成功响应
**状态码：** 200 OK
```json
{
  "code": 200,
  "message": "刷新令牌成功！",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
  }
}
```

### 失败响应
| 状态码 | 错误信息               | 描述                               |
| ------ | ---------------------- | ---------------------------------- |
| 401    | "无效的刷新令牌"       | 刷新令牌格式不正确或类型错误       |
| 401    | "用户不存在"           | 刷新令牌中的用户ID在数据库中不存在 |
| 401    | "刷新令牌已过期或无效" | 刷新令牌已过期或无法解码           |

```json
{
    "code": 401,
    "message": "刷新令牌已过期或无效",
    "data": []
}
```

## 通用响应格式

### Result 响应模型
所有接口都遵循统一的响应格式：

```json
{
  "code": 200,
  "message": "操作描述",
  "data": { ... }
}
```

### 字段说明
- **code**: HTTP 状态码
- **message**: 操作结果的描述信息
- **data**: 返回的业务数据，不同接口返回的数据结构不同

# 用户管理

## 查询登录用户

### 功能描述

查询当前登录用户的基本信息，包括用户名、网名、头像URL、经验值和等级。

### 请求地址

```
GET /api/user/info
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                                        |
| ------------- | ------ | ---- | ------------------------------------------- |
| Authorization | string | 是   | Bearer Token，格式：`Bearer <access_token>` |
| Content-Type  | string | 否   | 默认 `application/json`                     |

### 请求示例

```http
GET /api/user/info HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "查询用户信息成功",
    "data": {
        "username": "test01",
        "name": "诗仙爱好者",
        "photo_url": "https://math-qa-photos.oss-cn-beijing.aliyuncs.com/avatars/1/55eaaeb31d004d0795760c5e65df4e55.png",
        "exp": 0,
        "level": "小白"
    }
}
```

### 响应字段说明

| 字段名称  | 类型    | 描述                               |
| --------- | ------- | ---------------------------------- |
| username  | string  | 用户名（登录账号）                 |
| name      | string  | 用户网名/昵称                      |
| photo_url | string  | 头像图片的URL地址                  |
| exp       | integer | 用户经验值                         |
| level     | string  | 用户等级（如：小白、新手、高手等） |

### 失败响应

| 状态码 | 错误信息                    | 描述                              |
| ------ | --------------------------- | --------------------------------- |
| 401    | "未提供 Authorization 头！" | 请求头中未提供 Authorization 字段 |
| 401    | "无效的token!"              | 提供的 token 无效或已过期         |

---

## 查询用户主页

### 功能描述

根据用户ID查询指定用户的主页信息，包括用户基础信息和其发布的帖子列表。用于展示其他用户的个人主页（如点击用户名进入个人主页）。

### 请求地址

```
GET /api/user/info/{user_id}
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                                        |
| ------------- | ------ | ---- | ------------------------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json`                   |
| Authorization | string | 是   | Bearer Token，格式：`Bearer <access_token>` |

### 请求参数（Path）

| 参数名称 | 类型 | 必填 | 默认值 | 描述           | 约束条件     |
| -------- | ---- | ---- | ------ | -------------- | ------------ |
| user_id  | int  | 是   | 无     | 要查询的用户ID | 必须是正整数 |

### 请求参数（Header）

| 参数名称      | 类型   | 必填 | 默认值 | 描述                   |
| ------------- | ------ | ---- | ------ | ---------------------- |
| Authorization | string | 是   | 无     | 访问令牌，用于身份验证 |

### 请求示例

```http
GET /api/user/info/123 HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "查询当前用户信息（含作品）成功",
    "data": {
        "username": "test01",
        "name": "李白真是个小天才",
        "photo_url": "https://math-qa-photos.oss-cn-beijing.aliyuncs.com/avatars/1/34dc451efaec4571bc490a64b6e12c19.png",
        "exp": 22,
        "level": "诗童",
        "poems": [
            {
                "id": "01265316-0899-414f-b02c-2259971802b5",
                "title": "我的第十一首现代诗",
                "publish_time": 1765252984.0910108,
                "like_count": 0,
                "collect_count": 0
            },
            {
                "id": "f41b0906-7164-424d-b445-18974b244277",
                "title": "我的第十首现代诗",
                "publish_time": 1765252980.5327666,
                "like_count": 0,
                "collect_count": 0
            },
            ...
        ],
        "poem_count": 12
    }
}
```

### 失败响应

| 状态码 | 错误信息                             | 描述                       |
| ------ | ------------------------------------ | -------------------------- |
| 401    | "未提供认证令牌" 或 "无效的认证令牌" | 未登录或Token无效/过期     |
| 403    | "权限不足"                           | 当前用户无权访问此资源     |
| 404    | "用户ID {user_id} 不存在"            | 指定的用户ID在系统中不存在 |
| 500    | "查询用户主页信息失败：[错误详情]"   | 服务器内部错误，查询失败   |

---

### 请求示例-失败

#### 示例1：用户不存在

```http
GET /api/user/info/99999 HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

失败响应：

```json
{
    "code": 404,
    "message": "用户ID 99999 不存在",
    "data": null
}
```

#### 示例2：未提供认证令牌

```http
GET /api/user/info/123 HTTP/1.1
Host: localhost:8000
Content-Type: application/json
```

失败响应：

```json
{
    "code": 401,
    "message": "未提供认证令牌",
    "data": null
}
```

#### 示例3：参数格式错误（非正整数）

```http
GET /api/user/info/0 HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

失败响应：

```json
{
    "detail": [
        {
            "loc": ["path", "user_id"],
            "msg": "ensure this value is greater than or equal to 1",
            "type": "value_error.number.not_ge",
            "ctx": {"limit_value": 1}
        }
    ]
}
```

---

### 接口说明

1. **身份验证**：需要有效的访问令牌（Token）才能调用此接口
2. **数据来源**：
   - 用户基础信息（ID、网名、头像、段位）来自MySQL数据库
   - 用户发布的帖子信息来自MongoDB，按发布时间降序排列
3. **帖子字段**：返回的帖子列表仅包含核心字段（ID、标题、发布时间、点赞数、收藏数）
4. **权限控制**：虽然需要登录验证，但任何登录用户都可以查看其他用户的主页信息

## 修改网名

### 功能描述

修改当前登录用户的网名（昵称），网名需符合格式要求且全局唯一。

### 请求地址

```
PUT /api/user/name
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                                        |
| ------------- | ------ | ---- | ------------------------------------------- |
| Authorization | string | 是   | Bearer Token，格式：`Bearer <access_token>` |
| Content-Type  | string | 是   | 必须为 `application/json`                   |

### 请求参数（Body）

| 参数名称 | 类型   | 必填 | 默认值 | 描述                                             |
| -------- | ------ | ---- | ------ | ------------------------------------------------ |
| new_name | string | 是   | 无     | 新网名，长度2-20位，支持中文、数字、字母、下划线 |

### 请求示例

```http
PUT /api/user/name HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "new_name": "李白真是个小天才"
}
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "网名修改成功",
    "data": {
        "name": "李白真是个小天才"
    }
}
```

### 失败响应

| 状态码 | 错误信息                             | 描述                      |
| ------ | ------------------------------------ | ------------------------- |
| 400    | "网名长度必须为2-20位"               | 新网名长度不符合要求      |
| 400    | "网名仅支持中文、数字、字母、下划线" | 新网名包含非法字符        |
| 400    | "该网名已被占用，请更换"             | 新网名已被其他用户使用    |
| 401    | "无效的token!"                       | 提供的 token 无效或已过期 |

### 请求示例-失败

```http
PUT /api/user/name HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "new_name": "天"
}
```

失败响应：

```json
{
    "code": 400,
    "message": "网名长度必须为2-20位",
    "data": []
}
```

---

## 上传头像

### 功能描述

上传并更新当前登录用户的头像图片。

### 请求地址

```
PUT /api/user/avatar
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                                        |
| ------------- | ------ | ---- | ------------------------------------------- |
| Authorization | string | 是   | Bearer Token，格式：`Bearer <access_token>` |
| Content-Type  | string | 是   | 必须为 `multipart/form-data`                |

### 请求参数（Form Data）

| 参数名称 | 类型 | 必填 | 默认值 | 描述                                      |
| -------- | ---- | ---- | ------ | ----------------------------------------- |
| file     | file | 是   | 无     | 头像文件，支持格式：jpg/png/webp，最大2MB |

### 请求示例

```http
PUT /api/user/avatar HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

----WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="avatar.jpg"
Content-Type: image/jpeg

(binary file content)
----WebKitFormBoundary7MA4YWxkTrZu0gW
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "头像上传成功",
    "data": {
        "photo_url": "https://math-qa-photos.oss-cn-beijing.aliyuncs.com/avatars/1/34dc451efaec4571bc490a64b6e12c19.png"
    }
}
```

### 失败响应

| 状态码 | 错误信息           | 描述                        |
| ------ | ------------------ | --------------------------- |
| 400    | "文件大小超过限制" | 上传的文件超过2MB限制       |
| 400    | "不支持的文件格式" | 文件格式不是jpg/png/webp    |
| 401    | "无效的token!"     | 提供的 token 无效或已过期   |
| 500    | "文件上传失败"     | OSS上传失败或服务器内部错误 |

### 请求示例-失败

```http
PUT /api/user/avatar HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

----WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="large_avatar.jpg"
Content-Type: image/jpeg

(5MB的二进制文件内容)
----WebKitFormBoundary7MA4YWxkTrZu0gW
```

失败响应：

```json
{
    "code": 400,
    "message": "文件大小超过限制",
    "data": []
}
```

---

## 修改密码

### 功能描述

修改当前登录用户的登录密码，需要验证旧密码。

### 请求地址

```
PUT /api/user/password
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                                        |
| ------------- | ------ | ---- | ------------------------------------------- |
| Authorization | string | 是   | Bearer Token，格式：`Bearer <access_token>` |
| Content-Type  | string | 是   | 必须为 `application/json`                   |

### 请求参数（Body）

| 参数名称     | 类型   | 必填 | 默认值 | 描述                                         |
| ------------ | ------ | ---- | ------ | -------------------------------------------- |
| old_password | string | 是   | 无     | 当前登录密码（旧密码）                       |
| new_password | string | 是   | 无     | 新密码，长度6-18位，仅包含数字、字母、下划线 |

### 请求示例

```http
PUT /api/user/password HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
    "old_password": "new_654321",
    "new_password": "123456"
}
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "密码修改成功，请重新登录",
    "data": null
}
```

### 失败响应

| 状态码 | 错误信息                                         | 描述                      |
| ------ | ------------------------------------------------ | ------------------------- |
| 401    | "旧密码错误"                                     | 输入的旧密码不正确        |
| 400    | "新密码必须为6-18位，且仅包含数字、字母、下划线" | 新密码格式不符合要求      |
| 400    | "新密码不能与旧密码一致"                         | 新旧密码相同              |
| 401    | "无效的token!"                                   | 提供的 token 无效或已过期 |

### 请求示例-失败

```http
PUT /api/user/password HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

样例1
{
    "old_password": "123456",
    "new_password": "123456"
}
样例2
{
    "old_password": "1234567",
    "new_password": "1236"
}
```

失败响应：

```json
样例1
{
    "code": 401,
    "message": "旧密码错误",
    "data": []
}
样例2
{
    "code": 400,
    "message": "新密码必须为6-18位，且仅包含数字、字母、下划线",
    "data": []
}
```

---

## 通用说明

### 权限要求
所有用户管理接口都需要用户已登录并携带有效的访问令牌（access_token）。

### 安全提示
1. **密码安全**：
   - 修改密码后，原有的access_token和refresh_token将失效
   - 用户需要重新登录获取新的令牌
   - 建议定期更换密码以提高账户安全性

2. **文件上传限制**：
   - 头像文件大小：≤ 2MB
   - 支持格式：jpg, png, webp
   - 系统会自动处理图片优化和格式转换

3. **数据验证**：
   - 所有输入数据都会在服务器端进行严格验证
   - 客户端也应进行初步验证以提供更好的用户体验
   - 敏感操作（如修改密码）需要二次确认

### 错误处理建议
1. **401错误**：引导用户重新登录
2. **400错误**：根据错误信息提示用户修改输入
3. **500错误**：提示用户稍后重试，并记录错误日志

### 状态码说明
| 状态码 | 含义             | 处理建议                 |
| ------ | ---------------- | ------------------------ |
| 200    | 操作成功         | 正常处理响应数据         |
| 400    | 客户端请求错误   | 检查请求参数格式和内容   |
| 401    | 未授权或令牌失效 | 重新登录获取新令牌       |
| 500    | 服务器内部错误   | 联系系统管理员或稍后重试 |

# 诗歌管理

## 分页查询诗歌接口

### 功能描述

	分页查询诗歌基础信息（不含诗歌内容段落），支持Token鉴权，每页默认20条，最大100条。

### 请求地址

```
GET /api/poem/page
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                               |
| ------------- | ------ | ---- | ---------------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json`          |
| Authorization | string | 是   | Bearer Token，格式：Bearer [token] |

### 查询参数（Query）

| 参数名称  | 类型 | 必填 | 默认值 | 描述              |
| --------- | ---- | ---- | ------ | ----------------- |
| page_size | int  | 否   | 20     | 每页数量（1-100） |
| page_num  | int  | 否   | 1      | 页码，从1开始     |

### 请求示例

```http
GET /api/poem/page?page_size=5&page_num=2 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "分页查询诗歌成功",
    "data": {
        "list": [
            {
                "id": 5,
                "title": "春思",
                "author": "皇甫冉",
                "tags": [
                    "思念",
                    "七言律诗",
                    "春天",
                    "妇女",
                    "闺怨"
                ]
            },
            {
                "id": 6,
                "title": "夜月",
                "author": "刘方平",
                "tags": [
                    "月亮",
                    "春天",
                    "田园",
                    "七言绝句"
                ]
            },
            {
                "id": 7,
                "title": "春怨",
                "author": "刘方平",
                "tags": [
                    "孤独",
                    "七言绝句",
                    "宫怨"
                ]
            },
            {
                "id": 8,
                "title": "登鹳雀楼",
                "author": "王之涣",
                "tags": [
                    "黄河",
                    "励志",
                    "写景",
                    "哲理",
                    "名楼、庙宇",
                    "五言绝句"
                ]
            },
            {
                "id": 9,
                "title": "凉州词二首 一",
                "author": "王之涣",
                "tags": [
                    "黄河",
                    "写景",
                    "乐府",
                    "思乡",
                    "边塞",
                    "将士"
                ]
            }
        ],
        "total": 328,
        "page_size": 5,
        "page_num": 2,
        "total_pages": 66
    }
}
```

### 失败响应

| 状态码 | 错误信息                       | 描述            |
| ------ | ------------------------------ | --------------- |
| 401    | "认证失败，请重新登录"         | Token无效或过期 |
| 500    | "分页查询诗歌失败：[错误详情]" | 服务器内部错误  |

---

## 标签查询诗歌接口

### 功能描述

	根据多个标签查询诗歌，必须同时包含所有标签。返回诗歌基础信息（不含内容）。

### 请求地址

```
GET /api/poem/tags
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                      |
| ------------- | ------ | ---- | ------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json` |
| Authorization | string | 是   | Bearer Token              |

### 查询参数（Query）

| 参数名称 | 类型     | 必填 | 默认值 | 描述                                          |
| -------- | -------- | ---- | ------ | --------------------------------------------- |
| tags     | string[] | 是   | 无     | 标签列表，多个用&重复，如?tags=边塞&tags=思乡 |

### 请求示例

```http
GET /api/poem/tags?tags=思乡&tags=秋天 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "根据标签查询诗歌成功（必须同时包含所有标签）",
    "data": {
        "list": [
            {
                "id": 65,
                "title": "枫桥夜泊",
                "author": "张继",
                "tags": [
                    "写景",
                    "秋天",
                    "七言绝句",
                    "思乡"
                ]
            },
            {
                "id": 321,
                "title": "月夜忆舍弟",
                "author": "杜甫",
                "tags": [
                    "月夜",
                    "秋天",
                    "边塞",
                    "思乡",
                    "五言律诗",
                    "怀人"
                ]
            }
        ],
        "total": 2
    }
}
```

### 失败响应

| 状态码 | 错误信息                           | 描述            |
| ------ | ---------------------------------- | --------------- |
| 401    | "认证失败，请重新登录"             | Token无效或过期 |
| 500    | "根据标签查询诗歌失败：[错误详情]" | 服务器内部错误  |

---

## 作者查询诗歌接口

### 功能描述

	根据作者名精确查询诗歌，返回诗歌基础信息（不含内容）。

### 请求地址

```
GET /api/poem/author
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                      |
| ------------- | ------ | ---- | ------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json` |
| Authorization | string | 是   | Bearer Token              |

### 查询参数（Query）

| 参数名称 | 类型   | 必填 | 默认值 | 描述             |
| -------- | ------ | ---- | ------ | ---------------- |
| author   | string | 是   | 无     | 作者名，如：李白 |

### 请求示例

```http
GET /api/poem/author?author=王之涣 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "查询作者王之涣的诗歌成功",
    "data": {
        "list": [
            {
                "id": 8,
                "title": "登鹳雀楼",
                "author": "王之涣",
                "tags": [
                    "黄河",
                    "励志",
                    "写景",
                    "哲理",
                    "名楼、庙宇",
                    "五言绝句"
                ]
            },
            {
                "id": 9,
                "title": "凉州词二首 一",
                "author": "王之涣",
                "tags": [
                    "黄河",
                    "写景",
                    "乐府",
                    "思乡",
                    "边塞",
                    "将士"
                ]
            },
            {
                "id": 130,
                "title": "横吹曲辞 出塞",
                "author": "王之涣",
                "tags": [
                    "写景",
                    "乐府",
                    "思乡",
                    "边塞",
                    "将士"
                ]	
            }
        ],
        "total": 3
    }
}
```

### 失败响应

| 状态码 | 错误信息                           | 描述            |
| ------ | ---------------------------------- | --------------- |
| 401    | "认证失败，请重新登录"             | Token无效或过期 |
| 500    | "根据作者查询诗歌失败：[错误详情]" | 服务器内部错误  |

---

## 诗句模糊查询接口

### 功能描述

	根据诗句关键词模糊查询诗歌（忽略大小写），返回诗歌基础信息（不含内容）。

### 请求地址

```
GET /api/poem/paragraphs/search
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                      |
| ------------- | ------ | ---- | ------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json` |
| Authorization | string | 是   | Bearer Token              |

### 查询参数（Query）

| 参数名称 | 类型   | 必填 | 默认值 | 描述                       |
| -------- | ------ | ---- | ------ | -------------------------- |
| keyword  | string | 是   | 无     | 诗句关键词，如：举头望明月 |

### 请求示例

```http
GET /api/poem/paragraphs/search?keyword=朝辞白帝彩云 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "根据诗句模糊查询诗歌成功",
    "data": {
        "list": [
            {
                "id": 14,
                "title": "早发白帝城",
                "author": "李白",
                "tags": [
                    "长江",
                    "山",
                    "喜悦",
                    "七言绝句",
                    "描写山",
                    "地名"
                ]
            }
        ],
        "total": 1
    }
}
```

### 失败响应

| 状态码 | 错误信息                               | 描述            |
| ------ | -------------------------------------- | --------------- |
| 401    | "认证失败，请重新登录"                 | Token无效或过期 |
| 500    | "根据诗句模糊查询诗歌失败：[错误详情]" | 服务器内部错误  |

---

## 标题模糊查询接口

### 功能描述

	根据标题关键词模糊查询诗歌（忽略大小写），返回诗歌基础信息（不含内容）。

### 请求地址

```
GET /api/poem/title/search
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                      |
| ------------- | ------ | ---- | ------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json` |
| Authorization | string | 是   | Bearer Token              |

### 查询参数（Query）

| 参数名称 | 类型   | 必填 | 默认值 | 描述                   |
| -------- | ------ | ---- | ------ | ---------------------- |
| keyword  | string | 是   | 无     | 标题关键词，如：静夜思 |

### 请求示例

```http
GET /api/poem/title/search?keyword=静夜 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "根据标题模糊查询诗歌成功",
    "data": {
        "list": [
            {
                "id": 48,
                "title": "静夜思",
                "author": "李白",
                "tags": [
                    "新乐府辞",
                    "思乡",
                    "月亮",
                    "五言绝句"
                ]
            }
        ],
        "total": 1
    }
}			
```

### 失败响应

| 状态码 | 错误信息                               | 描述            |
| ------ | -------------------------------------- | --------------- |
| 401    | "认证失败，请重新登录"                 | Token无效或过期 |
| 500    | "根据标题模糊查询诗歌失败：[错误详情]" | 服务器内部错误  |

---

## 对诗接口

### 功能描述

	对诗功能：支持单句/多句输入，返回对应数量的下一句。输入1个子句返回1个下一句子句，输入2个子句返回2个下一句子句，无下句时返回"对诗结束。"

### 请求地址

```
POST /api/poem/respond
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                      |
| ------------- | ------ | ---- | ------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json` |
| Authorization | string | 是   | Bearer Token              |

### 请求参数（Body）

| 参数名称      | 类型   | 必填 | 默认值 | 描述           |
| ------------- | ------ | ---- | ------ | -------------- |
| user_sentence | string | 是   | 无     | 用户输入的诗句 |

### 请求示例

```http
POST /api/poem/respond HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
    "user_sentence": "床前明月光"
}
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "对诗成功，返回1个下一句子句",
    "data": {
        "user_input": "床前明月光",
        "matched_clauses": ["床前明月光，"],
        "next_sentence": "疑是地上霜。",
        "poem_title": "静夜思",
        "poem_author": "李白"
    }
}
```

### 多句输入示例

```http
POST /api/poem/respond HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
    "user_sentence": "床前明月光，疑是地上霜。"
}
```

### 成功响应（多句）

```json
{
    "code": 200,
    "message": "对诗成功，返回2个下一句子句",
    "data": {
        "user_input": "床前明月光，疑是地上霜。",
        "matched_clauses": ["床前明月光，", "疑是地上霜。"],
        "next_sentence": "举头望明月，低头思故乡。",
        "poem_title": "静夜思",
        "poem_author": "李白"
    }
}
```

### 对诗结束示例

```http
POST /api/poem/respond HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
    "user_sentence": "举头望明月，低头思故乡。"
}
```

### 成功响应（结束）

```json
{
    "code": 200,
    "message": "当前为最后一句，对诗结束",
    "data": {
        "user_input": "举头望明月，低头思故乡。",
        "matched_clauses": ["举头望明月，", "低头思故乡。"],
        "next_sentence": "对诗结束。",
        "poem_title": "静夜思",
        "poem_author": "李白"
    }
}
```

### 失败响应

| 状态码 | 错误信息                      | 描述                   |
| ------ | ----------------------------- | ---------------------- |
| 400    | "输入的诗句不能为空"          | 用户输入为空           |
| 400    | "未查询到包含'xxx'的诗歌"     | 诗句不存在于数据库中   |
| 400    | "输入的诗句不存在于《xxx》中" | 诗句不匹配该诗歌的子句 |
| 400    | "输入的第N个子句与诗歌不匹配" | 多句输入时子句不连续   |
| 401    | "认证失败，请重新登录"        | Token无效或过期        |
| 500    | "对诗功能异常：[错误详情]"    | 服务器内部错误         |

---

## 智能解析构造Prompt接口

### 功能描述

	智能解析构造Prompt接口：优先匹配标题，构造"赏析诗歌《标题》"；标题匹配失败则匹配诗句，构造"赏析《标题》中的完整诗句"；均匹配失败返回400。

### 请求地址

```
GET /api/poem/parse/prompt
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                      |
| ------------- | ------ | ---- | ------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json` |
| Authorization | string | 是   | Bearer Token              |

### 查询参数（Query）

| 参数名称 | 类型   | 必填 | 默认值 | 描述                             |
| -------- | ------ | ---- | ------ | -------------------------------- |
| content  | string | 是   | 无     | 用户选中的内容（标题/诗句/段落） |

### 请求示例（标题匹配）

```http
GET /api/poem/parse/prompt?content=静夜思 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 成功响应（标题匹配）

```json
{
    "code": 200,
    "message": "匹配到诗歌标题，生成赏析Prompt成功",
    "data": {
        "prompt": "赏析诗歌《静夜思》",
        "poem_title": "静夜思"
    }
}
```

### 请求示例（诗句匹配）

```http
GET /api/poem/parse/prompt?content=明月光 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 成功响应（诗句匹配）

```json
{
    "code": 200,
    "message": "匹配到诗歌诗句，生成赏析Prompt成功",
    "data": {
        "prompt": "赏析《静夜思》中的床前明月光，疑是地上霜。",
        "poem_title": "静夜思",
        "user_input": "明月光",
        "matched_sentence": "床前明月光，疑是地上霜。"
    }
}
```

### 失败响应

| 状态码 | 错误信息                                       | 描述                 |
| ------ | ---------------------------------------------- | -------------------- |
| 400    | "未匹配到对应的诗歌标题或诗句，请检查输入内容" | 内容无法匹配任何诗歌 |
| 400    | "该诗歌无有效诗句，无法生成Prompt"             | 诗歌无有效诗句       |
| 400    | "未在诗歌中找到包含该内容的完整句子"           | 内容无法匹配完整句子 |
| 401    | "认证失败，请重新登录"                         | Token无效或过期      |
| 500    | "生成智能解析Prompt异常：[错误详情]"           | 服务器内部错误       |

---

## 每日一首接口

### 功能描述

	每日一首接口：将当前年月日转换为数值，映射到诗歌ID范围，返回映射后的诗歌完整信息。

### 请求地址

```
GET /api/poem/daily
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                      |
| ------------- | ------ | ---- | ------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json` |
| Authorization | string | 是   | Bearer Token              |

### 请求示例

```http
GET /api/poem/daily HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "获取2025年12月07日每日一首成功",
    "data": {
        "id": 42,
        "title": "登高",
        "author": "杜甫",
        "paragraphs": ["风急天高猿啸哀，渚清沙白鸟飞回。", "无边落木萧萧下，不尽长江滚滚来。", "万里悲秋常作客，百年多病独登台。", "艰难苦恨繁霜鬓，潦倒新停浊酒杯。"],
        "tags": ["写景", "抒情", "秋天"]
    }
}
```

### 失败响应

| 状态码 | 错误信息                       | 描述             |
| ------ | ------------------------------ | ---------------- |
| 400    | "诗词库为空，无法获取每日一首" | 数据库中没有诗歌 |
| 401    | "认证失败，请重新登录"         | Token无效或过期  |
| 500    | "获取每日一首异常：[错误详情]" | 服务器内部错误   |

---

## 根据ID查询诗歌详情接口

### 功能描述

	根据ID查询单首诗歌完整信息（含内容），支持Token鉴权。

### 请求地址

```
GET /api/poem/{poem_id}
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                      |
| ------------- | ------ | ---- | ------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json` |
| Authorization | string | 是   | Bearer Token              |

### 路径参数（Path）

| 参数名称 | 类型 | 必填 | 默认值 | 描述            |
| -------- | ---- | ---- | ------ | --------------- |
| poem_id  | int  | 是   | 无     | 诗歌ID，从0开始 |

### 请求示例

```http
GET /api/poem/1 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "查询诗歌详情成功",
    "data": {
        "id": 1,
        "title": "静夜思",
        "author": "李白",
        "paragraphs": ["床前明月光，疑是地上霜。", "举头望明月，低头思故乡。"],
        "tags": ["思乡", "抒情"]
    }
}
```

### 失败响应

| 状态码 | 错误信息                       | 描述            |
| ------ | ------------------------------ | --------------- |
| 401    | "认证失败，请重新登录"         | Token无效或过期 |
| 404    | "未找到ID为xxx的诗歌"          | 诗歌不存在      |
| 500    | "查询诗歌详情失败：[错误详情]" | 服务器内部错误  |

---

# 帖子管理

       本模块提供诗歌帖子的完整管理功能，包括帖子发布、查询、点赞、收藏、评论和删除等操作。所有接口均需用户认证（Bearer Token）。

## 查询帖子详情

### 功能描述
根据帖子ID查询帖子详情，包含完整的评论列表，评论中会显示评论人的昵称（name）。

### 请求地址
```
GET /api/work/detail/{work_id}
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                                        |
| ------------- | ------ | ---- | ------------------------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json`                   |
| Authorization | string | 是   | Bearer Token，格式：`Bearer <access_token>` |

### 请求参数（Path）

| 参数名称 | 类型   | 必填 | 默认值 | 描述   |
| -------- | ------ | ---- | ------ | ------ |
| work_id  | string | 是   | 无     | 帖子ID |

### 请求示例

```http
GET /api/work/detail/poem_001 HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "帖子详情查询成功！",
    "data": {
        "detail": {
            "id": "poem_001",
            "title": "一道几何题的解法",
            "content": "详细的解题过程...",
            "user_id": "123",
            "publish_time": 1640995200,
            "like_count": 24,
            "collect_count": 5,
            "styles": ["数学", "几何"],
            "comment_total": 3,
            "comments": [
                {
                    "comment_id": "comment_001",
                    "user_id": "456",
                    "user_name": "数学爱好者",
                    "content": "这个解法很巧妙！",
                    "comment_time": 1640998800
                },
                {
                    "comment_id": "comment_002",
                    "user_id": "789",
                    "user_name": "学霸小王",
                    "content": "我有个更简单的方法",
                    "comment_time": 1640998500
                }
            ]
        }
    }
}
```

### 失败响应

| 状态码 | 错误信息                             | 描述               |
| ------ | ------------------------------------ | ------------------ |
| 401    | "未提供认证令牌" 或 "无效的认证令牌" | 未登录或Token无效  |
| 404    | "帖子不存在！"                       | 指定的帖子ID不存在 |
| 500    | "帖子详情查询失败：[错误详情]"       | 服务器内部错误     |

---

## 发布帖子

### 功能描述
发布新的诗歌帖子，成功发布后用户经验值+1，并根据新经验值更新用户段位。

### 请求地址
```
POST /api/work/poem
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                                        |
| ------------- | ------ | ---- | ------------------------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json`                   |
| Authorization | string | 是   | Bearer Token，格式：`Bearer <access_token>` |

### 请求参数（Body）

| 参数名称 | 类型      | 必填 | 默认值 | 描述                                     |
| -------- | --------- | ---- | ------ | ---------------------------------------- |
| title    | string    | 是   | 无     | 帖子标题                                 |
| content  | string    | 是   | 无     | 帖子内容                                 |
| styles   | List[str] | 否   | []     | 风格标签列表，如：["抒情诗", "浪漫主义"] |

### 请求示例

```http
POST /api/work/poem HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
    "title": "数学之美",
    "content": "数学是一门美丽的语言...",
    "styles": ["数学", "哲学"]
}
```

### 成功响应

**状态码：** 201 Created

```json
{
    "code": 201,
    "message": "帖子发布成功！经验+1，当前段位：学霸",
    "data": {
        "poem": {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "title": "数学之美",
            "content": "数学是一门美丽的语言...",
            "user_id": "123",
            "publish_time": 1640995200.123,
            "like_count": 0,
            "collect_count": 0,
            "styles": ["数学", "哲学"]
        },
        "user_exp": 101,
        "user_level": "学霸",
        "level_updated": true,
        "original_exp": 100
    }
}
```

### 失败响应

| 状态码 | 错误信息                             | 描述                      |
| ------ | ------------------------------------ | ------------------------- |
| 401    | "未提供认证令牌" 或 "无效的认证令牌" | 未登录或Token无效         |
| 404    | "用户不存在"                         | 当前用户ID在MySQL中不存在 |
| 500    | "发布失败：[错误详情]"               | 服务器内部错误            |

---

## 主页帖子分页查询

### 功能描述
获取主页帖子列表，按发布时间降序排列，每页20条，包含帖子的评论列表（含评论人昵称）。

### 请求地址
```
GET /api/work/home/page
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                                        |
| ------------- | ------ | ---- | ------------------------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json`                   |
| Authorization | string | 是   | Bearer Token，格式：`Bearer <access_token>` |

### 请求参数（Query）

| 参数名称 | 类型 | 必填 | 默认值 | 描述 | 约束条件 |
| -------- | ---- | ---- | ------ | ---- | -------- |
| page     | int  | 否   | 1      | 页码 | 必须 ≥ 1 |

### 请求示例

```http
GET /api/work/home/page?page=1 HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "主页帖子查询成功！",
    "data": {
        "items": [
            {
                "id": "poem_001",
                "title": "数学之美",
                "content": "数学是一门美丽的语言...",
                "user_id": "123",
                "publish_time": 1640995200,
                "like_count": 24,
                "collect_count": 5,
                "styles": ["数学", "哲学"],
                "comments": [
                    {
                        "comment_id": "comment_001",
                        "user_id": "456",
                        "user_name": "数学爱好者",
                        "content": "写得真好！",
                        "comment_time": 1640998800
                    }
                ]
            },
            {
                "id": "poem_002",
                "title": "几何的奥秘",
                "content": "从欧几里得到非欧几何...",
                "user_id": "456",
                "publish_time": 1640994900,
                "like_count": 18,
                "collect_count": 3,
                "styles": ["数学", "几何"],
                "comments": []
            }
        ],
        "page": 1,
        "page_size": 20,
        "total": 150,
        "total_pages": 8
    }
}
```

### 失败响应

| 状态码 | 错误信息                             | 描述              |
| ------ | ------------------------------------ | ----------------- |
| 401    | "未提供认证令牌" 或 "无效的认证令牌" | 未登录或Token无效 |
| 500    | "主页帖子查询失败：[错误详情]"       | 服务器内部错误    |

---

## 按关键词分页搜索帖子

### 功能描述
根据关键词模糊搜索帖子，匹配标题或内容中包含关键词的帖子，按发布时间降序排列，每页10条。

### 请求地址
```
GET /api/work/page/keyword
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                                        |
| ------------- | ------ | ---- | ------------------------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json`                   |
| Authorization | string | 是   | Bearer Token，格式：`Bearer <access_token>` |

### 请求参数（Query）

| 参数名称 | 类型   | 必填 | 默认值 | 描述                         |
| -------- | ------ | ---- | ------ | ---------------------------- |
| keyword  | string | 否   | 无     | 搜索关键词（标题或内容包含） |
| page     | int    | 否   | 1      | 页码，必须 ≥ 1               |

### 请求示例

```http
GET /api/work/page/keyword?keyword=数学&page=1 HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "查询成功！",
    "data": {
        "items": [
            {
                "id": "poem_001",
                "title": "数学之美",
                "content": "数学是一门美丽的语言...",
                "user_id": "123",
                "publish_time": 1640995200,
                "like_count": 24,
                "collect_count": 5,
                "styles": ["数学", "哲学"]
            },
            {
                "id": "poem_003",
                "title": "高等数学学习心得",
                "content": "学习微积分的一些体会...",
                "user_id": "456",
                "publish_time": 1640994000,
                "like_count": 15,
                "collect_count": 2,
                "styles": ["数学", "学习"]
            }
        ],
        "page": 1,
        "page_size": 10,
        "total": 25,
        "total_pages": 3
    }
}
```

### 失败响应

| 状态码 | 错误信息                             | 描述              |
| ------ | ------------------------------------ | ----------------- |
| 401    | "未提供认证令牌" 或 "无效的认证令牌" | 未登录或Token无效 |
| 500    | "查询失败：[错误详情]"               | 服务器内部错误    |

---

## 按风格分页查询帖子

### 功能描述
根据指定的风格标签查询帖子，匹配帖子styles列表中包含该风格的帖子，按发布时间降序排列，每页10条。

### 请求地址
```
GET /api/work/page/style
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                                        |
| ------------- | ------ | ---- | ------------------------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json`                   |
| Authorization | string | 是   | Bearer Token，格式：`Bearer <access_token>` |

### 请求参数（Query）

| 参数名称 | 类型   | 必填 | 默认值 | 描述                                   |
| -------- | ------ | ---- | ------ | -------------------------------------- |
| style    | string | 是   | 无     | 诗歌风格标签，如："抒情诗"、"浪漫主义" |
| page     | int    | 否   | 1      | 页码，必须 ≥ 1                         |

### 请求示例

```http
GET /api/work/page/style?style=数学&page=1 HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "查询【数学】风格帖子成功！",
    "data": {
        "items": [
            {
                "id": "poem_001",
                "title": "数学之美",
                "content": "数学是一门美丽的语言...",
                "user_id": "123",
                "publish_time": 1640995200,
                "like_count": 24,
                "collect_count": 5,
                "styles": ["数学", "哲学"]
            },
            {
                "id": "poem_004",
                "title": "数学思维训练",
                "content": "如何培养数学思维...",
                "user_id": "789",
                "publish_time": 1640993500,
                "like_count": 12,
                "collect_count": 3,
                "styles": ["数学", "教育"]
            }
        ],
        "page": 1,
        "page_size": 10,
        "total": 18,
        "total_pages": 2
    }
}
```

### 失败响应

| 状态码 | 错误信息                             | 描述              |
| ------ | ------------------------------------ | ----------------- |
| 401    | "未提供认证令牌" 或 "无效的认证令牌" | 未登录或Token无效 |
| 500    | "风格查询失败：[错误详情]"           | 服务器内部错误    |

---

## 获取热力榜Top10

### 功能描述
获取Redis中存储的热力榜前10名帖子，按热力值降序排列（热力值可能为负数）。

### 请求地址
```
GET /api/work/hot
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                                        |
| ------------- | ------ | ---- | ------------------------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json`                   |
| Authorization | string | 是   | Bearer Token，格式：`Bearer <access_token>` |

### 请求示例

```http
GET /api/work/hot HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "获取热力榜 Top10 成功",
    "data": {
        "top10": [
            {
                "id": "poem_001",
                "title": "数学之美",
                "heat_score": 95.5
            },
            {
                "id": "poem_002",
                "title": "几何的奥秘",
                "heat_score": 87.2
            },
            {
                "id": "poem_003",
                "title": "高等数学学习心得",
                "heat_score": 75.8
            },
            {
                "id": "poem_004",
                "title": "数学思维训练",
                "heat_score": 68.4
            }
        ],
        "total": 25
    }
}
```

### 空数据响应

```json
{
    "code": 200,
    "message": "当前热力榜暂无数据",
    "data": {
        "top10": []
    }
}
```

### 失败响应

| 状态码 | 错误信息                             | 描述              |
| ------ | ------------------------------------ | ----------------- |
| 401    | "未提供认证令牌" 或 "无效的认证令牌" | 未登录或Token无效 |
| 500    | "获取热力榜失败：[错误详情]"         | 服务器内部错误    |

---

## 点赞帖子

### 功能描述
给指定帖子点赞，一个用户只能给一个帖子点赞一次。点赞后帖子点赞数+1，帖子作者经验值+1并可能更新段位。

### 请求地址
```
POST /api/work/like/{poem_id}
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                                        |
| ------------- | ------ | ---- | ------------------------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json`                   |
| Authorization | string | 是   | Bearer Token，格式：`Bearer <access_token>` |

### 请求参数（Path）

| 参数名称 | 类型   | 必填 | 默认值 | 描述   |
| -------- | ------ | ---- | ------ | ------ |
| poem_id  | string | 是   | 无     | 帖子ID |

### 请求示例

```http
POST /api/work/like/poem_001 HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "点赞成功！帖子作者经验+1，当前段位：学霸",
    "data": {
        "poem_id": "poem_001",
        "like_count": 25,
        "post_user_id": 123,
        "user_original_exp": 100,
        "user_new_exp": 101,
        "user_original_level": "高手",
        "user_new_level": "学霸",
        "level_updated": true
    }
}
```

### 失败响应

| 状态码 | 错误信息                             | 描述                    |
| ------ | ------------------------------------ | ----------------------- |
| 400    | "你已给该帖子点赞，不可重复点赞！"   | 用户已经给该帖子点过赞  |
| 401    | "未提供认证令牌" 或 "无效的认证令牌" | 未登录或Token无效       |
| 404    | "帖子不存在"                         | 指定的帖子ID不存在      |
| 404    | "帖子所属用户不存在"                 | 帖子作者在MySQL中不存在 |
| 500    | "点赞失败：[错误详情]"               | 服务器内部错误          |

---

## 收藏帖子

### 功能描述
收藏指定帖子，一个用户只能收藏一个帖子一次。收藏后帖子收藏数+1，帖子作者经验值+1并可能更新段位。

### 请求地址
```
POST /api/work/collect/{poem_id}/
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                                        |
| ------------- | ------ | ---- | ------------------------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json`                   |
| Authorization | string | 是   | Bearer Token，格式：`Bearer <access_token>` |

### 请求参数（Path）

| 参数名称 | 类型   | 必填 | 默认值 | 描述   |
| -------- | ------ | ---- | ------ | ------ |
| poem_id  | string | 是   | 无     | 帖子ID |

### 请求示例

```http
POST /api/work/collect/poem_001/ HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "收藏成功！帖子作者经验+1，当前段位：学霸",
    "data": {
        "poem_id": "poem_001",
        "collect_count": 6,
        "post_user_id": 123,
        "user_original_exp": 100,
        "user_new_exp": 101,
        "user_original_level": "高手",
        "user_new_level": "学霸",
        "level_updated": true
    }
}
```

### 失败响应

| 状态码 | 错误信息                             | 描述                    |
| ------ | ------------------------------------ | ----------------------- |
| 400    | "你已收藏该帖子，不可重复收藏！"     | 用户已经收藏该帖子      |
| 401    | "未提供认证令牌" 或 "无效的认证令牌" | 未登录或Token无效       |
| 404    | "帖子不存在"                         | 指定的帖子ID不存在      |
| 404    | "帖子所属用户不存在"                 | 帖子作者在MySQL中不存在 |
| 500    | "收藏失败：[错误详情]"               | 服务器内部错误          |

---

## 发布评论

### 功能描述
给指定帖子发布评论。评论后帖子评论数+1，帖子作者经验值+1并可能更新段位。

### 请求地址
```
POST /api/work/comment
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                                        |
| ------------- | ------ | ---- | ------------------------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json`                   |
| Authorization | string | 是   | Bearer Token，格式：`Bearer <access_token>` |

### 请求参数（Body）

| 参数名称 | 类型   | 必填 | 默认值 | 描述     | 约束条件             |
| -------- | ------ | ---- | ------ | -------- | -------------------- |
| work_id  | string | 是   | 无     | 帖子ID   |                      |
| content  | string | 是   | 无     | 评论内容 | 不能为空，长度 ≤ 500 |

### 请求示例

```http
POST /api/work/comment HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
    "work_id": "poem_001",
    "content": "这个解法非常巧妙，学到了！"
}
```

### 成功响应

**状态码：** 201 Created

```json
{
    "code": 201,
    "message": "评论发布成功！帖子作者经验+1，当前段位：学霸",
    "data": {
        "comment_id": "550e8400-e29b-41d4-a716-446655440000",
        "work_id": "poem_001",
        "content": "这个解法非常巧妙，学到了！",
        "comment_time": 1640999000.123,
        "user_id": 456,
        "comment_count": 4,
        "post_user_id": 123,
        "user_original_exp": 100,
        "user_new_exp": 101,
        "user_original_level": "高手",
        "user_new_level": "学霸",
        "level_updated": true
    }
}
```

### 失败响应

| 状态码 | 错误信息                             | 描述                    |
| ------ | ------------------------------------ | ----------------------- |
| 400    | "评论内容不能为空！"                 | 评论内容为空            |
| 400    | "评论内容长度不能超过500字！"        | 评论内容超长            |
| 401    | "未提供认证令牌" 或 "无效的认证令牌" | 未登录或Token无效       |
| 404    | "帖子不存在"                         | 指定的帖子ID不存在      |
| 404    | "帖子所属用户不存在"                 | 帖子作者在MySQL中不存在 |
| 500    | "发布评论失败：[错误详情]"           | 服务器内部错误          |

---

## 删除帖子

### 功能描述
删除自己发布的帖子，会级联删除该帖子的所有关联数据（点赞记录、收藏记录、评论记录）。

### 请求地址
```
DELETE /api/work/poem/{poem_id}
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                                        |
| ------------- | ------ | ---- | ------------------------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json`                   |
| Authorization | string | 是   | Bearer Token，格式：`Bearer <access_token>` |

### 请求参数（Path）

| 参数名称 | 类型   | 必填 | 默认值 | 描述   |
| -------- | ------ | ---- | ------ | ------ |
| poem_id  | string | 是   | 无     | 帖子ID |

### 请求示例

```http
DELETE /api/work/poem/poem_001 HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "帖子及关联的点赞、收藏、评论已全部删除成功！",
    "data": null
}
```

### 失败响应

| 状态码 | 错误信息                             | 描述                       |
| ------ | ------------------------------------ | -------------------------- |
| 401    | "未提供认证令牌" 或 "无效的认证令牌" | 未登录或Token无效          |
| 404    | "帖子不存在或你无删除权限"           | 帖子不存在或不属于当前用户 |
| 500    | "删除失败：[错误详情]"               | 服务器内部错误             |

---

## 注意事项

1. **认证要求**：所有接口都需要通过Authorization头传递有效的Bearer Token
2. **数据一致性**：点赞、收藏、评论操作会同时更新MongoDB和MySQL数据
3. **防重复操作**：点赞和收藏都有防重复机制，一个用户只能操作一次
4. **级联删除**：删除帖子时会级联删除所有关联数据
5. **经验系统**：发布帖子、点赞、收藏、评论都会给相关用户增加经验值并可能提升段位
6. **分页规则**：
   - 主页分页：每页20条
   - 搜索/风格分页：每页10条
   - 页码从1开始

# 收藏夹管理

## 收藏列表查询

### 功能描述

	分页展示当前登录用户的收藏内容，支持根据收藏帖子标题进行模糊查询。每页固定显示10条数据，按收藏时间降序排列（最新收藏在前）。

### 请求地址

```
GET /api/collect/list
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                               |
| ------------- | ------ | ---- | ---------------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json`          |
| Authorization | string | 是   | Bearer Token，格式：Bearer [token] |

### 查询参数（Query）

| 参数名称 | 类型   | 必填 | 默认值 | 描述                                     |
| -------- | ------ | ---- | ------ | ---------------------------------------- |
| page     | int    | 否   | 1      | 页码，从1开始                            |
| title    | string | 否   | 无     | 收藏帖子标题模糊查询关键词，不区分大小写 |

### 请求示例

**基础查询（第一页）：**
```http
GET /api/collect/list?page=1 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**带标题模糊查询：**
```http
GET /api/collect/list?page=1&title=诗歌 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "收藏列表查询成功",
    "data": {
        "items": [
            {
                "collect_id": "collect_001",
                "collect_time": "2025-12-07T10:30:00",
                "work_info": {
                    "id": "work_001",
                    "title": "唐代诗歌赏析",
                    "content": "唐诗是中国古典文学的瑰宝...",
                    "publish_time": "2025-12-06T15:45:00",
                    "like_count": 25,
                    "collect_count": 10,
                    "styles": ["文学", "诗歌"]
                }
            },
            {
                "collect_id": "collect_002",
                "collect_time": "2025-12-07T09:15:00",
                "work_info": {
                    "id": "work_002",
                    "title": "宋词精选",
                    "content": "宋词以其婉约的风格著称...",
                    "publish_time": "2025-12-05T14:20:00",
                    "like_count": 18,
                    "collect_count": 8,
                    "styles": ["文学", "诗歌"]
                }
            }
        ],
        "page": 1,
        "page_size": 10,
        "total": 15,
        "total_pages": 2
    }
}
```

### 无数据响应

**状态码：** 200 OK

**无收藏内容：**
```json
{
    "code": 200,
    "message": "当前页无收藏内容",
    "data": {
        "items": [],
        "page": 1,
        "page_size": 10,
        "total": 0,
        "total_pages": 0
    }
}
```

**无匹配标题：**
```json
{
    "code": 200,
    "message": "暂无匹配的收藏内容",
    "data": {
        "items": [],
        "page": 1,
        "page_size": 10,
        "total": 0,
        "total_pages": 0
    }
}
```

### 失败响应

| 状态码 | 错误信息                       | 描述            |
| ------ | ------------------------------ | --------------- |
| 401    | "认证失败，请重新登录"         | Token无效或过期 |
| 500    | "查询收藏列表失败：[错误详情]" | 服务器内部错误  |

---

## 取消收藏

### 功能描述

	取消当前用户的收藏记录。取消成功后，系统会同步更新对应帖子的收藏计数（减少1，确保不会小于0）。

### 请求地址

```
DELETE /api/collect/{collect_id}
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                      |
| ------------- | ------ | ---- | ------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json` |
| Authorization | string | 是   | Bearer Token              |

### 路径参数（Path）

| 参数名称   | 类型   | 必填 | 默认值 | 描述       |
| ---------- | ------ | ---- | ------ | ---------- |
| collect_id | string | 是   | 无     | 收藏记录ID |

### 请求示例

```http
DELETE /api/collect/collect_001 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "取消收藏成功",
    "data": {
        "collect_id": "collect_001",
        "work_id": "work_001",
        "new_collect_count": 9
    }
}
```

### 失败响应

| 状态码 | 错误信息                       | 描述                   |
| ------ | ------------------------------ | ---------------------- |
| 401    | "认证失败，请重新登录"         | Token无效或过期        |
| 404    | "收藏记录不存在或你无权限取消" | 收藏记录不存在或无权限 |
| 500    | "取消收藏失败：[错误详情]"     | 服务器内部错误         |

---

## 接口使用说明

### 分页规则
- 每页固定显示10条数据，无需在请求中指定page_size
- 页码从1开始（page=1表示第一页）
- 返回的total_pages字段表示总页数，可用于前端分页器

### 标题模糊查询
- 查询不区分大小写
- 支持中文、英文、数字等字符
- 如果查询无匹配结果，会直接返回空列表和相应提示

### 权限控制
- 所有接口都需要有效的Bearer Token认证
- 用户只能查看和操作自己的收藏记录
- 无法查看或修改其他用户的收藏

### 数据联动
- 取消收藏时，系统会自动更新对应帖子的收藏计数
- 收藏计数减少1，但不会小于0（确保数据合理性）

### 排序规则
- 收藏列表默认按收藏时间降序排列（最新收藏在前）
- 无法通过参数修改排序方式

---

## 错误处理

### 常见错误场景及建议处理方式

1. **认证失败（401）**
   - 检查Token是否有效、是否过期
   - 重新登录获取新的Token
2. **无权限操作（404）**
   - 用户尝试取消不属于自己的收藏记录
   - 前端应确保只显示用户自己的收藏列表
3. **查询无结果**
   - 分页超出范围时返回空列表
   - 标题查询无匹配时返回"暂无匹配的收藏内容"提示
4. **服务器错误（500）**
   - 联系系统管理员检查日志
   - 前端可显示友好的错误提示页面

根据您提供的代码和文档格式，以下是为会话管理接口生成的详细文档：

# 会话管理

## 创建会话

### 功能描述

	用户创建新的聊天会话。前端需要生成唯一的会话ID并传入，同时必须指定会话名称。系统会校验会话ID的唯一性，确保每个用户的会话ID不重复。

### 请求地址

```
POST /api/session/create
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                      |
| ------------- | ------ | ---- | ------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json` |
| Authorization | string | 是   | Bearer Token（用户认证）  |

### 请求参数（Body）

| 参数名称   | 类型   | 必填 | 默认值 | 描述                               |
| ---------- | ------ | ---- | ------ | ---------------------------------- |
| session_id | string | 是   | 无     | 前端生成的会话ID（必须为UUID格式） |
| name       | string | 是   | 无     | 会话名称（不能为空或纯空白字符）   |

### 请求示例

```http
POST /api/session/create HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "数学问题讨论"
}
```

### 成功响应

**状态码：** 201 Created

```json
{
    "code": 201,
    "message": "创建会话成功",
    "data": {
        "session_id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "数学问题讨论"
    }
}
```

### 失败响应

| 状态码 | 错误信息                   | 描述                             |
| ------ | -------------------------- | -------------------------------- |
| 400    | "会话名称不能为空"         | 会话名称参数为空或仅包含空白字符 |
| 400    | "会话ID已存在"             | 该会话ID在当前用户下已存在       |
| 401    | 认证失败相关错误           | 用户未认证或Token无效            |
| 500    | "创建会话失败：[错误详情]" | 服务器内部错误，创建会话失败     |

---

## 会话列表

### 功能描述

	获取当前用户的所有会话列表，按创建时间降序排列（最新创建的排在前面）。

### 请求地址

```
GET /api/session/list
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                     |
| ------------- | ------ | ---- | ------------------------ |
| Authorization | string | 是   | Bearer Token（用户认证） |

### 请求参数

无

### 请求示例

```http
GET /api/session/list HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "获取会话列表成功",
    "data": [
        {
            "session_id": "550e8400-e29b-41d4-a716-446655440000",
            "name": "数学问题讨论",
            "create_time": 1717042800.123456
        },
        {
            "session_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
            "name": "物理问题",
            "create_time": 1716956400.654321
        }
    ]
}
```

### 失败响应

| 状态码 | 错误信息                       | 描述                         |
| ------ | ------------------------------ | ---------------------------- |
| 401    | 认证失败相关错误               | 用户未认证或Token无效        |
| 500    | "获取会话列表失败：[错误详情]" | 服务器内部错误，获取列表失败 |

---

## 重命名会话

### 功能描述

	对指定的会话进行重命名操作，更新会话名称。

### 请求地址

```
PUT /api/session/rename
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                      |
| ------------- | ------ | ---- | ------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json` |
| Authorization | string | 是   | Bearer Token（用户认证）  |

### 请求参数（Body）

| 参数名称   | 类型   | 必填 | 默认值 | 描述                             |
| ---------- | ------ | ---- | ------ | -------------------------------- |
| session_id | string | 是   | 无     | 要重命名的会话ID                 |
| name       | string | 是   | 无     | 新的会话名称（不能为空或纯空白） |

### 请求示例

```http
PUT /api/session/rename HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "数学问题讨论-高级"
}
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "重命名会话成功",
    "data": {
        "session_id": "550e8400-e29b-41d4-a716-446655440000",
        "new_name": "数学问题讨论-高级"
    }
}
```

### 失败响应

| 状态码 | 错误信息                     | 描述                               |
| ------ | ---------------------------- | ---------------------------------- |
| 400    | "会话名不能为空"             | 新会话名称参数为空或仅包含空白字符 |
| 401    | 认证失败相关错误             | 用户未认证或Token无效              |
| 404    | "会话不存在"                 | 指定的会话ID在当前用户下不存在     |
| 500    | "重命名会话失败：[错误详情]" | 服务器内部错误，重命名操作失败     |

---

## 删除会话

### 功能描述

	删除指定的会话，并级联删除该会话下的所有对话记录（QA记录）。

### 请求地址

```
DELETE /api/session/delete/{session_id}
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                     |
| ------------- | ------ | ---- | ------------------------ |
| Authorization | string | 是   | Bearer Token（用户认证） |

### 请求参数（Path）

| 参数名称   | 类型   | 必填 | 描述           |
| ---------- | ------ | ---- | -------------- |
| session_id | string | 是   | 要删除的会话ID |

### 请求示例

```http
DELETE /api/session/delete/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "删除会话成功",
    "data": {
        "session_id": "550e8400-e29b-41d4-a716-446655440000"
    }
}
```

### 失败响应

| 状态码 | 错误信息                   | 描述                           |
| ------ | -------------------------- | ------------------------------ |
| 401    | 认证失败相关错误           | 用户未认证或Token无效          |
| 404    | "会话不存在"               | 指定的会话ID在当前用户下不存在 |
| 500    | "删除会话失败：[错误详情]" | 服务器内部错误，删除操作失败   |

---

### 注意事项

1. **会话ID生成**：所有会话ID必须由前端生成并保证为有效的UUID格式
2. **会话名称**：会话名称不能为空，前后空白字符会被自动去除
3. **数据关联**：
   - 每个会话属于特定的用户
   - 删除会话时会自动删除该会话下的所有对话记录（QA记录）
4. **权限控制**：用户只能操作自己的会话，无法访问或修改其他用户的会话
5. **排序规则**：会话列表默认按创建时间降序排列（最新创建的在前）

根据您提供的代码和文档格式，以下是为对话管理接口生成的详细文档：

# 对话管理

## 中断回答

### 功能描述

	中断当前正在进行的AI回答。当用户主动点击停止按钮时，系统会记录当前已渲染的字数作为中断点，并更新对话状态为"stopped"。该接口使用线程安全的锁机制确保中断操作的原子性。

### 请求地址

```
POST /api/qa/stop
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                      |
| ------------- | ------ | ---- | ------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json` |
| Authorization | string | 是   | Bearer Token（用户认证）  |

### 请求参数（Body）

| 参数名称    | 类型   | 必填 | 默认值 | 描述                             |
| ----------- | ------ | ---- | ------ | -------------------------------- |
| session_id  | string | 是   | 无     | 当前会话ID                       |
| question_id | string | 是   | 无     | 当前对话ID                       |
| num_render  | int    | 是   | 无     | 已渲染字数（中断点，不能为负数） |

### 请求示例

```http
POST /api/qa/stop HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "question_id": "q1234567890",
  "num_render": 150
}
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "中断回答成功",
    "data": {
        "session_id": "550e8400-e29b-41d4-a716-446655440000",
        "num_render": 150
    }
}
```

### 失败响应

| 状态码 | 错误信息                          | 描述                           |
| ------ | --------------------------------- | ------------------------------ |
| 400    | "参数错误：会话ID/对话ID不能为空" | 必填参数为空或仅包含空白字符   |
| 400    | "参数错误：已渲染字数不能为负数"  | num_render参数为负数           |
| 401    | 认证失败相关错误                  | 用户未认证或Token无效          |
| 404    | "会话不存在"                      | 指定的会话ID在当前用户下不存在 |
| 404    | "对话不存在"                      | 指定的对话ID在当前会话下不存在 |
| 500    | "更新对话中断状态失败"            | 并发场景下对话可能已被删除     |
| 500    | "中断回答失败：[错误详情]"        | 服务器内部错误，中断操作失败   |

---

## 继续回答

### 功能描述

	重置对话的中断状态，使被中断的对话可以继续生成回答。该接口会清除会话的中断标记，并将对话状态更新为"normal"。

### 请求地址

```
PUT /api/qa/continue
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                      |
| ------------- | ------ | ---- | ------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json` |
| Authorization | string | 是   | Bearer Token（用户认证）  |

### 请求参数（Body）

| 参数名称    | 类型   | 必填 | 默认值 | 描述   |
| ----------- | ------ | ---- | ------ | ------ |
| session_id  | string | 是   | 无     | 会话ID |
| question_id | string | 是   | 无     | 对话ID |

### 请求示例

```http
PUT /api/qa/continue HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "question_id": "q0987654321"
}
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "可继续回答",
    "data": {
        "session_id": "550e8400-e29b-41d4-a716-446655440000",
        "question_id": "q0987654321"
    }
}
```

### 失败响应

| 状态码 | 错误信息                          | 描述                           |
| ------ | --------------------------------- | ------------------------------ |
| 400    | "参数错误：会话ID/对话ID不能为空" | 必填参数为空或仅包含空白字符   |
| 401    | 认证失败相关错误                  | 用户未认证或Token无效          |
| 404    | "会话不存在"                      | 指定的会话ID在当前用户下不存在 |
| 404    | "对话不存在"                      | 指定的对话ID在当前会话下不存在 |
| 500    | "更新对话状态失败"                | 并发场景下对话可能已被删除     |
| 500    | "恢复回答失败：[错误详情]"        | 服务器内部错误，恢复操作失败   |

---

### 注意事项

1. **中断机制**：
   - 中断操作会记录当前已渲染字数 (`num_render`)
   - 中断状态存储在全局变量 `session_states` 中，重启服务会丢失
   - 使用异步锁 (`session_lock`) 确保中断操作的线程安全

2. **数据关联**：
   - 每个对话必须属于一个已存在的会话
   - 删除会话时会级联删除所有关联对话（见会话管理接口）

3. **状态管理**：
   - `status` 字段：`normal`（正常）或 `stopped`（已中断）
   - `num_render` 字段：记录中断时已渲染的字数，默认为0

4. **权限控制**：
   - 用户只能操作自己的对话和会话
   - 所有操作都会验证用户身份和资源归属

5. **排序规则**：
   - 对话列表按 `timestamp` 升序排列（时间最早的在前面）
   - 会话列表按 `timestamp` 降序排列（与对话列表排序方向相反）

6. **错误处理**：
   - 400错误：参数格式错误
   - 404错误：资源不存在或用户无权限访问
   - 500错误：服务器内部异常

## 删除对话

### 功能描述

	删除用户指定的单条对话记录。该操作仅删除对话本身，不会影响会话和其他对话。

### 请求地址

```
DELETE /api/qa/delete
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                      |
| ------------- | ------ | ---- | ------------------------- |
| Content-Type  | string | 是   | 必须为 `application/json` |
| Authorization | string | 是   | Bearer Token（用户认证）  |

### 请求参数（Body）

| 参数名称    | 类型   | 必填 | 默认值 | 描述           |
| ----------- | ------ | ---- | ------ | -------------- |
| question_id | string | 是   | 无     | 要删除的对话ID |

### 请求示例

```http
DELETE /api/qa/delete HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "question_id": "q1234567890"
}
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "删除对话成功",
    "data": {
        "question_id": "q1234567890"
    }
}
```

### 失败响应

| 状态码 | 错误信息                   | 描述                           |
| ------ | -------------------------- | ------------------------------ |
| 401    | 认证失败相关错误           | 用户未认证或Token无效          |
| 404    | "对话不存在"               | 指定的对话ID在当前用户下不存在 |
| 500    | "删除对话失败：[错误详情]" | 服务器内部错误，删除操作失败   |

---

## 对话列表

### 功能描述

	查询指定会话下的所有对话列表，按创建时间升序排列（最早的对话在前）。

### 请求地址

```
GET /api/qa/list
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                     |
| ------------- | ------ | ---- | ------------------------ |
| Authorization | string | 是   | Bearer Token（用户认证） |

### 请求参数（Query）

| 参数名称   | 类型   | 必填 | 默认值 | 描述   |
| ---------- | ------ | ---- | ------ | ------ |
| session_id | string | 是   | 无     | 会话ID |

### 请求示例

```http
GET /api/qa/list?session_id=550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "获取对话列表成功",
    "data": [
        {
            "question_id": "q1234567890",
            "question": "什么是微积分？",
            "answer": "微积分是数学的一个分支...",
            "num_render": 200,
            "status": "normal",
            "timestamp": 1717042800.123456
        },
        {
            "question_id": "q0987654321",
            "question": "如何计算导数？",
            "answer": "导数是函数在某一点的变化率...",
            "num_render": 0,
            "status": "stopped",
            "timestamp": 1717042900.654321
        }
    ]
}
```

### 失败响应

| 状态码 | 错误信息                       | 描述                           |
| ------ | ------------------------------ | ------------------------------ |
| 401    | 认证失败相关错误               | 用户未认证或Token无效          |
| 404    | "会话不存在"                   | 指定的会话ID在当前用户下不存在 |
| 500    | "获取对话列表失败：[错误详情]" | 服务器内部错误，获取列表失败   |

---

## 对话详情

### 功能描述

	根据对话ID查询单条对话的详细信息，包括关联的会话ID、问题内容、回答内容、中断状态等。

### 请求地址

```
GET /api/qa/detail
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                     |
| ------------- | ------ | ---- | ------------------------ |
| Authorization | string | 是   | Bearer Token（用户认证） |

### 请求参数（Query）

| 参数名称    | 类型   | 必填 | 默认值 | 描述   |
| ----------- | ------ | ---- | ------ | ------ |
| question_id | string | 是   | 无     | 对话ID |

### 请求示例

```http
GET /api/qa/detail?question_id=q1234567890 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 成功响应

**状态码：** 200 OK

```json
{
    "code": 200,
    "message": "获取对话详情成功",
    "data": {
        "question_id": "q1234567890",
        "session_id": "550e8400-e29b-41d4-a716-446655440000",
        "question": "什么是微积分？",
        "answer": "微积分是数学的一个分支...",
        "num_render": 200,
        "status": "normal",
        "timestamp": 1717042800.123456
    }
}
```

### 失败响应

| 状态码 | 错误信息                       | 描述                           |
| ------ | ------------------------------ | ------------------------------ |
| 401    | 认证失败相关错误               | 用户未认证或Token无效          |
| 404    | "对话不存在"                   | 指定的对话ID在当前用户下不存在 |
| 500    | "获取对话详情失败：[错误详情]" | 服务器内部错误，获取详情失败   |

根据您提供的代码，以下是为AI问答流式接口生成的详细文档：

# AI问答

## 流式对话接口

### 功能描述

&emsp;&emsp;提供AI对话的流式响应功能，支持用户提问并实时获取AI的回答。该接口实现了完整的SSE（Server-Sent Events）流式响应，具备以下核心特性：

1. **流式响应**：AI回答内容分片实时返回，实现打字机效果
2. **中断控制**：支持用户手动中断AI回答，记录中断点
3. **会话管理**：自动创建或复用会话，维护对话上下文
4. **智能路由**：根据问题内容自动选择普通问答或诗词解析模式
5. **容错处理**：完善的异常处理和资源清理机制

### 请求地址

```
GET /api/chat/dialog/stream
```

### 请求头

| 参数名称      | 类型   | 必填 | 描述                     |
| ------------- | ------ | ---- | ------------------------ |
| Authorization | string | 是   | Bearer Token（用户认证） |

### 请求参数（Query）

| 参数名称   | 类型   | 必填 | 默认值 | 描述                           |
| ---------- | ------ | ---- | ------ | ------------------------------ |
| query      | string | 是   | 无     | 用户提问内容                   |
| session_id | string | 是   | 无     | 会话ID（必须为有效的UUID格式） |

### 请求示例

```http
GET /api/chat/dialog/stream?query=什么是微积分&session_id=550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 流式响应格式

#### 1. 正常分片响应（非最终）

每次返回一个SSE事件，包含当前分片的内容：

```json
data: {
  "code": 200,
  "message": "流式响应成功",
  "data": {
    "content": "这是AI返回的当前分片内容...",
    "final": false,
    "full_content": ""
  }
}

data: {
  "code": 200,
  "message": "流式响应成功",
  "data": {
    "content": "继续返回的内容...",
    "final": false,
    "full_content": ""
  }
}
```

#### 2. 最终响应（流式结束）

```json
data: {
  "code": 200,
  "message": "流式响应完成",
  "data": {
    "content": "",
    "final": true,
    "full_content": "这是完整的AI回答内容..."
  }
}

data: [DONE]
```

#### 3. 中断响应

当用户主动中断时，返回中断状态：

```json
data: {
  "code": 200,
  "message": "流式响应完成",
  "data": {
    "content": "",
    "final": true,
    "full_content": "这是中断前的部分内容..."
  }
}

data: [DONE]
```

#### 4. 错误响应

```json
data: {
  "code": 401,
  "message": "缺少Authorization Token",
  "data": {
    "content": "",
    "final": true,
    "full_content": ""
  }
}

data: [DONE]
```

### 失败响应

| 状态码 | 错误信息                  | 描述                         |
| ------ | ------------------------- | ---------------------------- |
| 401    | "缺少Authorization Token" | 请求头中未携带认证Token      |
| 500    | "接口异常：[错误详情]"    | 服务器内部错误，流式响应失败 |

---

### 注意事项

#### 前端实现要点

- **SSE连接管理**：正确设置EventSource的headers，处理连接断开
- **内容拼接**：前端需要将分片内容逐步拼接显示
- **中断检测**：监听 `final=true` 标志确定流式结束
- **错误处理**：正确处理 `[DONE]` 信号和异常情况

#### 2. 会话ID要求

- 必须由前端生成有效的UUID格式
- 同一用户下的会话ID必须唯一
- 如果会话不存在，系统会自动创建"未命名会话"

#### 3. 性能考虑

- **流式延迟**：每个分片响应约100-500毫秒
- **连接超时**：建议前端设置合理的超时时间（如5分钟）
- **内存管理**：大模型响应时注意内存使用

#### 4. 并发控制

- **锁机制**：使用异步锁确保中断操作的线程安全
- **状态隔离**：每个用户的会话状态独立管理
- **资源清理**：finally块确保数据库记录正确更新
