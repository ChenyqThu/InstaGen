# 系统架构

> InstaGen Polaroid 整体架构设计文档

## 技术栈概览

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| **前端框架** | React 18 + TypeScript | SPA 单页应用 |
| **构建工具** | Vite | 快速开发和构建 |
| **样式方案** | Tailwind CSS (CDN) | 原子化 CSS |
| **后端服务** | Vercel Serverless | API 路由 |
| **数据库** | Supabase (PostgreSQL) | 数据存储 + 认证 |
| **AI 服务** | Google Gemini 2.5 Flash | 图像编辑 |
| **部署平台** | Vercel | 自动部署 |

## 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         客户端 (Browser)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  Camera  │  │  Photo   │  │  Gallery │  │  Auth Context    │ │
│  │Component │  │  Modal   │  │  Views   │  │  (用户状态管理)   │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │
│       │             │             │                  │          │
│  ┌────┴─────────────┴─────────────┴──────────────────┴────────┐ │
│  │                    Services Layer                          │ │
│  │  geminiService │ photoService │ authService │ usageService │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
          ┌─────────▼─────────┐   ┌─────────▼─────────┐
          │  Vercel Serverless │   │     Supabase      │
          │   /api/generate    │   │                   │
          │   (Gemini 调用)     │   │  ┌─────────────┐  │
          └─────────┬─────────┘   │  │   Auth      │  │
                    │             │  │   Module    │  │
          ┌─────────▼─────────┐   │  └─────────────┘  │
          │   Google Gemini   │   │  ┌─────────────┐  │
          │   2.5 Flash API   │   │  │  PostgreSQL │  │
          └───────────────────┘   │  │   Tables    │  │
                                  │  └─────────────┘  │
                                  └───────────────────┘
```

## 目录结构

```
/
├── api/                          # Vercel Serverless Functions
│   └── generate.js               # Gemini API 代理
│
├── components/                   # React 组件
│   ├── auth/                     # 认证相关组件
│   │   ├── LoginModal.tsx        # 登录弹窗
│   │   ├── UserMenu.tsx          # 用户菜单
│   │   └── AccountSettings.tsx   # 账户设置
│   ├── gallery/                  # 画廊相关组件
│   │   ├── MyGallery.tsx         # 个人卡片库
│   │   └── PhotoActions.tsx      # 照片操作菜单
│   ├── common/                   # 通用组件
│   │   ├── Button.tsx            # 按钮组件
│   │   └── Modal.tsx             # Modal 组件
│   ├── pokemon-css/              # Pokemon 卡片特效
│   ├── Camera.tsx                # 相机组件
│   ├── FilterWheel.tsx           # 滤镜轮组件
│   ├── PhotoModal.tsx            # 照片编辑弹窗
│   ├── PolaroidFrame.tsx         # 相框组件
│   ├── PolaroidPhoto.tsx         # 可拖拽照片
│   └── PublicGallery.tsx         # 公共画廊
│
├── config/                       # 配置文件
│   ├── filterConfig.ts           # 滤镜配置
│   └── magicEditConfig.ts        # AI 编辑配置
│
├── contexts/                     # React Context
│   └── AuthContext.tsx           # 认证状态管理
│
├── hooks/                        # 自定义 Hooks
│   ├── useAuth.ts                # 认证 Hook
│   ├── useMyPhotos.ts            # 个人照片 Hook
│   └── useUsageLimit.ts          # 使用限制 Hook
│
├── services/                     # 服务层
│   ├── authService.ts            # 认证服务
│   ├── geminiService.ts          # Gemini API 服务
│   ├── photoService.ts           # 照片存储服务
│   ├── supabaseClient.ts         # Supabase 客户端
│   └── usageService.ts           # 使用量服务
│
├── types/                        # 类型定义
│   └── auth.ts                   # 认证类型
│
├── docs/                         # 技术文档
│
├── public/                       # 静态资源
│   ├── instagram.css             # Instagram 滤镜
│   └── assets/                   # 图片资源
│
├── App.tsx                       # 主应用组件
├── index.tsx                     # 入口文件
├── index.html                    # HTML 模板
├── types.ts                      # 全局类型
├── constants.ts                  # 常量定义
└── vite.config.ts                # Vite 配置
```

## 核心模块

### 1. 认证模块 (Auth)

**职责**: 用户身份认证和会话管理

```
AuthContext
    │
    ├── 状态: user, loading, isAuthenticated
    ├── 方法: signIn, signOut, signInWithOAuth
    └── 监听: onAuthStateChange
```

详见 [AUTH_SYSTEM.md](./AUTH_SYSTEM.md)

### 2. 照片模块 (Photo)

**职责**: 照片的拍摄、编辑、存储和展示

```
照片生命周期:
  拍摄 → DEVELOPING → DONE → [EDITING] → 保存/分享
```

详见 [PHOTO_STORAGE.md](./PHOTO_STORAGE.md)

### 3. AI 编辑模块 (Gemini)

**职责**: 调用 Gemini API 进行图像编辑

```
调用流程:
  前端 → /api/generate → Gemini API → 返回编辑后图片
```

### 4. 使用限制模块 (Usage)

**职责**: 管理用户 API 调用配额

```
配额检查:
  请求 → 验证用户 → 检查配额 → [通过/拒绝]
```

详见 [USAGE_LIMIT_SYSTEM.md](./USAGE_LIMIT_SYSTEM.md)

## 数据流

### 拍照流程

```
1. 用户点击快门
2. Camera 组件捕获视频帧
3. 应用当前滤镜
4. 创建 PhotoData 对象 (status: DEVELOPING)
5. 5秒后状态变为 DONE
6. 用户可拖拽、编辑、保存
```

### AI 编辑流程

```
1. 用户选择编辑选项
2. 检查登录状态 (必须已登录)
3. 检查使用配额 (或自定义 Key)
4. 调用 /api/generate
5. 服务端调用 Gemini API
6. 返回编辑后的图片
7. 更新照片状态
```

### 保存照片流程

```
1. 用户点击保存
2. 检查登录状态
3. 调用 photoService.savePhoto()
4. 写入 user_photos 表
5. 可选: 分享到 public_photos
```

## 状态管理策略

| 状态类型 | 管理方式 | 说明 |
|----------|----------|------|
| **用户认证** | AuthContext | 全局状态，持久化 |
| **照片列表** | App.tsx useState | 本地状态，刷新丢失 |
| **用户照片** | useMyPhotos Hook | 从 Supabase 获取 |
| **UI 状态** | 组件内 useState | 局部状态 |
| **语言设置** | App.tsx useState | 可考虑持久化 |

## 国际化 (i18n)

### 策略
InstaGen 采用轻量级的国际化方案，不依赖第三方重型库。

### 实现方式
1.  **资源文件**: 所有翻译字符串集中管理在 `src/constants.ts` 的 `TRANSLATIONS` 对象中。
2.  **类型安全**: 使用 TypeScript 确保所有语言包的键值对一致。
3.  **状态管理**: 语言状态 (`lang`) 由根组件 (`App.tsx`) 管理并通过 Props 下发。
4.  **动态切换**: 支持运行时动态切换语言，无需刷新页面。

### 支持语言
- **English (`en`)**: 默认语言
- **中文 (`zh`)**: 简体中文

### 开发规范
- UI 中的所有静态文本 **必须** 使用 `TRANSLATIONS` 变量。
- 禁止在组件中硬编码文本字符串。
- 新增功能时，需同步在 `constants.ts` 中添加中英双语翻译。

## 安全考虑

1. **API Key 保护**: Gemini Key 仅存于服务端环境变量
2. **用户 Key 加密**: 自定义 Key 加密存储
3. **RLS 策略**: 用户只能访问自己的数据
4. **输入校验**: 服务端校验所有输入
5. **CORS 配置**: 限制允许的源
