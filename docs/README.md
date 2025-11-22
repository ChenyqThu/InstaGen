# InstaGen 技术文档

> InstaGen Polaroid - 基于 AI 的拍立得相机 Web 应用

## 文档索引

| 文档 | 说明 | 状态 |
|------|------|------|
| [系统架构](./ARCHITECTURE.md) | 整体架构设计、技术栈、模块划分 | ✅ |
| [UI 风格指南](./UI_STYLE_GUIDE.md) | 视觉设计规范、色彩、组件样式 | ✅ |
| [认证系统](./AUTH_SYSTEM.md) | 用户认证、OAuth 登录、会话管理 | ✅ |
| [照片存储系统](./PHOTO_STORAGE.md) | 个人照片库、公共画廊、数据模型 | ✅ |
| [使用限制系统](./USAGE_LIMIT_SYSTEM.md) | API 配额、自定义 Key、计费逻辑 | ✅ |
| [API 参考](./API_REFERENCE.md) | 后端接口、数据库表、RLS 策略 | ✅ |

## 版本路线图

> 详细开发计划请查看 [roadmap/](./roadmap/)

| Phase | 版本 | 名称 | 任务数 | 状态 |
|-------|------|------|--------|------|
| 1 | v1.1.0 | [认证基础设施](./roadmap/PHASE_1.md) | 8 | 📋 待开发 |
| 2 | v1.2.0 | [个人照片库](./roadmap/PHASE_2.md) | 7 | 📋 待开发 |
| 3 | v1.3.0 | [账户管理](./roadmap/PHASE_3.md) | 5 | 📋 待开发 |
| 4 | v1.4.0 | [使用限制系统](./roadmap/PHASE_4.md) | 6 | 📋 待开发 |

**总计**: 26 个开发任务

## 快速链接

- **开发指南**: 参见项目根目录 [CLAUDE.md](../CLAUDE.md)
- **部署指南**: 参见 [DEPLOY.md](../DEPLOY.md)
- **Supabase 设置**: 参见 [SUPABASE_SETUP.md](../SUPABASE_SETUP.md)
