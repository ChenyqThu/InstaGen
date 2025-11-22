# Phase 4 环境变量配置

为了让使用限制系统正常工作，需要在 Vercel 部署环境中配置以下环境变量：

## 必需的环境变量

### 1. GEMINI_API_KEY
- **说明**: Google Gemini API 密钥（系统默认使用）
- **获取方式**: https://aistudio.google.com/app/apikey
- **示例**: `AIza...`

### 2. SUPABASE_URL
- **说明**: Supabase 项目 URL
- **获取方式**: Supabase Dashboard → Project Settings → API
- **示例**: `https://xxxxx.supabase.co`

### 3. SUPABASE_SERVICE_ROLE_KEY
- **说明**: Supabase 服务端密钥（用于服务端操作，绕过 RLS）
- **获取方式**: Supabase Dashboard → Project Settings → API → service_role key
- **示例**: `eyJ...`
- **⚠️ 警告**: 这是敏感密钥，只能在服务端使用，不要暴露到客户端

## 配置方式

### 本地开发
`.env` 文件已包含前两个变量，需要添加：
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Vercel 部署
1. 进入 Vercel 项目设置
2. 导航到 Settings → Environment Variables
3. 添加以上三个环境变量
4. 重新部署项目

## 验证

环境变量配置完成后，API 端点 `/api/generate` 应该能够：
- 验证用户 JWT token
- 查询用户配置文件
- 检查使用配额
- 更新使用记录
