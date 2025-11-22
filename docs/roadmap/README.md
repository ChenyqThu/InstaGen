# InstaGen v1.x Roadmap

> 版本 1.1.0 - 1.4.0 开发路线图

## 版本规划总览

```
v1.0.0 (当前)          v1.1.0              v1.2.0              v1.3.0              v1.4.0
    │                    │                   │                   │                   │
    ▼                    ▼                   ▼                   ▼                   ▼
┌─────────┐        ┌─────────┐        ┌─────────┐        ┌─────────┐        ┌─────────┐
│ 基础功能 │  ───▶  │ 认证系统 │  ───▶  │ 照片库  │  ───▶  │ 账户管理 │  ───▶  │ 使用限制 │
│         │        │         │        │         │        │         │        │         │
│ • 拍照   │        │ • 登录   │        │ • 保存   │        │ • 设置   │        │ • 配额   │
│ • 滤镜   │        │ • OAuth  │        │ • 个人库 │        │ • 资料   │        │ • 统计   │
│ • AI编辑 │        │ • 状态   │        │ • 分享   │        │ • API Key│        │ • 自定义 │
│ • 公共廊 │        │         │        │         │        │         │        │         │
└─────────┘        └─────────┘        └─────────┘        └─────────┘        └─────────┘
```

## Phase 详情

| Phase | 版本 | 名称 | 任务数 | 状态 | 文档 |
|-------|------|------|--------|------|------|
| 1 | v1.1.0 | 认证基础设施 | 8 | 📋 待开发 | [PHASE_1.md](./PHASE_1.md) |
| 2 | v1.2.0 | 个人照片库 | 7 | ✅ 已完成 | [PHASE_2.md](./PHASE_2.md) |
| 3 | v1.3.0 | 账户管理 | 5 | 📋 待开发 | [PHASE_3.md](./PHASE_3.md) |
| 4 | v1.4.0 | 使用限制系统 | 6 | 📋 待开发 | [PHASE_4.md](./PHASE_4.md) |

**总计**: 26 个开发任务

## 状态图例

| 图标 | 含义 |
|------|------|
| 📋 | 待开发 |
| 🚧 | 开发中 |
| ✅ | 已完成 |
| ⏸️ | 暂停 |

## 依赖关系

```
Phase 1 (认证)
    │
    ├──────────────────┐
    ▼                  ▼
Phase 2 (照片库)    Phase 4 (使用限制)
    │                  │
    ▼                  │
Phase 3 (账户管理) ◀───┘
```

**说明**:
- Phase 1 是基础，必须首先完成
- Phase 2 和 Phase 4 可并行开发 (无直接依赖)
- Phase 3 依赖 Phase 1 的认证基础

## 新增文件预览

完成所有 Phase 后，项目将新增以下文件：

```
src/
├── contexts/
│   └── AuthContext.tsx           # Phase 1
│
├── components/
│   ├── auth/
│   │   ├── LoginModal.tsx        # Phase 1
│   │   ├── UserMenu.tsx          # Phase 1
│   │   └── AccountSettings.tsx   # Phase 3
│   ├── gallery/
│   │   ├── MyGallery.tsx         # Phase 2
│   │   └── PhotoActions.tsx      # Phase 2
│   └── common/
│       ├── Button.tsx            # Phase 1
│       └── Modal.tsx             # Phase 1
│
├── services/
│   ├── authService.ts            # Phase 1
│   ├── photoService.ts           # Phase 2
│   └── usageService.ts           # Phase 4
│
├── hooks/
│   ├── useAuth.ts                # Phase 1
│   ├── useMyPhotos.ts            # Phase 2
│   └── useUsageLimit.ts          # Phase 4
│
├── config/
│   └── usageConfig.ts            # Phase 4
│
└── types/
    └── auth.ts                   # Phase 1
```

## 数据库变更

| Phase | 表名 | 操作 |
|-------|------|------|
| 1 | `user_profiles` | 新建 |
| 2 | `user_photos` | 新建 |
| 2 | `public_photos` | 修改 (添加字段) |
| 4 | `user_usage` | 新建 |

## 里程碑目标

### v1.1.0 - 认证基础设施
> 用户可以登录/注册，系统识别用户身份

- 支持 Google/GitHub OAuth 登录
- 显示用户头像和菜单
- 登录状态持久化

### v1.2.0 - 个人照片库
> 登录用户可以保存和管理自己的照片

- 照片保存到云端
- 个人照片库界面
- 照片分享到公共画廊

### v1.3.0 - 账户管理
> 用户可以管理个人资料和 API 设置

- 修改显示名称/头像
- 配置自定义 Gemini API Key
- 账户删除功能

### v1.4.0 - 使用限制系统
> 合理控制 API 使用，保护系统资源

- 每日 3 次免费配额
- 使用量统计显示
- 自定义 Key 无限使用

## 开发优先级

建议按以下顺序开发：

1. **Phase 1** (必须) - 认证是所有后续功能的基础
2. **Phase 2** (高) - 照片保存是核心用户价值
3. **Phase 4** (中) - 保护 API 成本
4. **Phase 3** (低) - 增强功能，可延后

## 快速链接

- [系统架构](../ARCHITECTURE.md)
- [UI 风格指南](../UI_STYLE_GUIDE.md)
- [认证系统设计](../AUTH_SYSTEM.md)
- [照片存储设计](../PHOTO_STORAGE.md)
- [使用限制设计](../USAGE_LIMIT_SYSTEM.md)
- [API 参考](../API_REFERENCE.md)
