# Phase 1: 认证基础设施

> 版本: v1.1.0 | 状态: 📋 待开发

## 目标

建立完整的用户认证系统，支持 OAuth 第三方登录，为后续功能提供用户身份基础。

## 核心功能

- [ ] Google OAuth 登录
- [ ] GitHub OAuth 登录
- [ ] 用户状态管理 (Context)
- [ ] 登录 UI 组件
- [ ] 用户菜单组件
- [ ] 登录状态持久化

## 任务清单

### 任务 1.1: 数据库表创建
**状态**: 📋 待开发

**目标**: 创建 user_profiles 表存储用户扩展信息

**SQL 脚本**:
```sql
create table user_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  avatar_url text,
  custom_gemini_key text,
  created_at timestamp with time zone default timezone('utc', now()) not null,
  updated_at timestamp with time zone default timezone('utc', now()) not null
);

alter table user_profiles enable row level security;

create policy "Users can view own profile" on user_profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on user_profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on user_profiles
  for insert with check (auth.uid() = id);

-- 自动创建 profile 触发器
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

**验收标准**:
- [ ] 表创建成功
- [ ] RLS 策略生效
- [ ] 触发器正常工作

---

### 任务 1.2: Supabase OAuth 配置
**状态**: 📋 待开发

**目标**: 在 Supabase Dashboard 配置 Google 和 GitHub OAuth

**步骤**:

1. **Google OAuth 配置**
   - 前往 [Google Cloud Console](https://console.cloud.google.com/)
   - 创建 OAuth 2.0 客户端
   - 添加授权重定向 URI: `https://<project>.supabase.co/auth/v1/callback`
   - 复制 Client ID 和 Secret

2. **GitHub OAuth 配置**
   - 前往 [GitHub Developer Settings](https://github.com/settings/developers)
   - 创建 OAuth App
   - 添加回调 URL: `https://<project>.supabase.co/auth/v1/callback`
   - 复制 Client ID 和 Secret

3. **Supabase 配置**
   - Authentication → Providers → Google → 启用并填入凭据
   - Authentication → Providers → GitHub → 启用并填入凭据
   - Authentication → URL Configuration → 设置 Site URL

**验收标准**:
- [ ] Google 登录可用
- [ ] GitHub 登录可用
- [ ] 回调正确重定向

---

### 任务 1.3: 类型定义
**状态**: 📋 待开发

**目标**: 创建认证相关的 TypeScript 类型

**文件**: `src/types/auth.ts`

```typescript
// 用户信息
export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  customGeminiKey: string | null;
  createdAt: string;
}

// 用户配置更新
export interface ProfileUpdate {
  displayName?: string;
  avatarUrl?: string;
  customGeminiKey?: string;
}

// 认证状态
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

// OAuth 提供商
export type OAuthProvider = 'google' | 'github';
```

**验收标准**:
- [ ] 类型文件创建
- [ ] 无 TypeScript 错误

---

### 任务 1.4: 认证服务层
**状态**: 📋 待开发

**目标**: 封装 Supabase Auth API 调用

**文件**: `src/services/authService.ts`

**实现内容**:
```typescript
// 核心方法
signInWithOAuth(provider: OAuthProvider): Promise<void>
signInWithEmail(email: string, password: string): Promise<void>
signUpWithEmail(email: string, password: string): Promise<void>
signOut(): Promise<void>
getCurrentUser(): Promise<User | null>
getUserProfile(userId: string): Promise<UserProfile | null>
updateUserProfile(userId: string, updates: ProfileUpdate): Promise<void>
onAuthStateChange(callback: (user: User | null) => void): () => void
```

**验收标准**:
- [ ] 所有方法实现
- [ ] 错误处理完善
- [ ] 类型正确

---

### 任务 1.5: AuthContext 状态管理
**状态**: 📋 待开发

**目标**: 创建全局认证状态 Context

**文件**: `src/contexts/AuthContext.tsx`

**Context 接口**:
```typescript
interface AuthContextType {
  // 状态
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  // 方法
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<void>;
}
```

**实现要点**:
- 使用 `createContext` + `useReducer`
- 监听 `onAuthStateChange`
- 初始化时检查已有 session
- 提供 `useAuth` hook

**验收标准**:
- [ ] Context 创建成功
- [ ] 状态正确更新
- [ ] 页面刷新保持登录

---

### 任务 1.6: LoginModal 组件
**状态**: 📋 待开发

**目标**: 创建登录弹窗 UI

**文件**: `src/components/auth/LoginModal.tsx`

**Props**:
```typescript
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
```

**UI 设计**:
```
┌────────────────────────────────────┐
│           ╳                        │
├────────────────────────────────────┤
│                                    │
│     ✨ 欢迎来到 InstaGen           │
│     登录以保存你的作品              │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  🔑 使用 Google 登录         │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  🐙 使用 GitHub 登录         │  │
│  └──────────────────────────────┘  │
│                                    │
└────────────────────────────────────┘
```

**样式要求** (参考 UI_STYLE_GUIDE.md):
- 背景遮罩: `bg-black/50 backdrop-blur-sm`
- Modal 容器: `bg-[#FDF8F5] rounded-3xl shadow-2xl`
- 按钮: 渐变背景 + hover 放大效果
- 动画: `animate-in zoom-in-95`

**验收标准**:
- [ ] Modal 正常显示/隐藏
- [ ] OAuth 按钮可点击
- [ ] 登录成功后关闭
- [ ] i18n 支持中英文

---

### 任务 1.7: UserMenu 组件
**状态**: 📋 待开发

**目标**: 创建用户菜单下拉组件

**文件**: `src/components/auth/UserMenu.tsx`

**UI 设计**:

未登录:
```
┌───────────────┐
│  🔑 登录      │
└───────────────┘
```

已登录:
```
┌──────┐
│ 头像 │ ▼
└──────┘
    │
    ▼
┌─────────────────────┐
│  👤 我的账户        │
├─────────────────────┤
│  📸 我的照片库      │
├─────────────────────┤
│  ⚙️ 设置           │
├─────────────────────┤
│  🚪 退出登录        │
└─────────────────────┘
```

**实现要点**:
- 使用 `useState` 控制下拉显示
- 点击外部关闭菜单
- 头像使用用户 avatarUrl 或首字母

**验收标准**:
- [ ] 未登录显示登录按钮
- [ ] 已登录显示头像菜单
- [ ] 下拉菜单交互正常
- [ ] 菜单项点击事件

---

### 任务 1.8: App.tsx 集成
**状态**: 📋 待开发

**目标**: 在主应用中集成认证系统

**修改文件**: `src/App.tsx`, `src/index.tsx`

**修改内容**:

1. **index.tsx** - 添加 AuthProvider
```tsx
import { AuthProvider } from '@/contexts/AuthContext';

root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
```

2. **App.tsx** - 添加 UserMenu
```tsx
import { UserMenu } from '@/components/auth/UserMenu';

// 在 header 区域添加
<header className="...">
  <h1>InstaGen</h1>
  <div className="flex items-center gap-4">
    <LanguageToggle />
    <UserMenu />
  </div>
</header>
```

**验收标准**:
- [ ] AuthProvider 包裹应用
- [ ] UserMenu 显示在右上角
- [ ] 登录状态全局可用

---

## 文件创建清单

| 文件路径 | 任务 | 说明 |
|----------|------|------|
| `src/types/auth.ts` | 1.3 | 类型定义 |
| `src/services/authService.ts` | 1.4 | 认证服务 |
| `src/contexts/AuthContext.tsx` | 1.5 | 状态管理 |
| `src/hooks/useAuth.ts` | 1.5 | 认证 Hook |
| `src/components/auth/LoginModal.tsx` | 1.6 | 登录弹窗 |
| `src/components/auth/UserMenu.tsx` | 1.7 | 用户菜单 |

## 修改文件清单

| 文件路径 | 任务 | 修改内容 |
|----------|------|----------|
| `src/index.tsx` | 1.8 | 添加 AuthProvider |
| `src/App.tsx` | 1.8 | 添加 UserMenu |
| `src/constants.ts` | 1.6 | 添加认证相关翻译 |

## 测试用例

### 单元测试
- [ ] authService 各方法测试
- [ ] AuthContext 状态变更测试

### 集成测试
- [ ] Google OAuth 完整流程
- [ ] GitHub OAuth 完整流程
- [ ] 登出后状态清除
- [ ] 页面刷新保持登录

### E2E 测试
- [ ] 用户从未登录到登录的完整流程
- [ ] 用户菜单交互

## 依赖项

**npm 包** (已有):
- `@supabase/supabase-js` - Supabase 客户端

**环境变量** (已有):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 注意事项

1. **OAuth 回调处理**
   - Supabase 会自动处理 OAuth 回调
   - 需要在 Supabase Dashboard 配置正确的 Site URL

2. **Session 管理**
   - Supabase 自动管理 JWT token
   - 使用 `onAuthStateChange` 监听状态变化

3. **错误处理**
   - OAuth 失败时显示友好提示
   - 网络错误时提示重试

4. **安全考虑**
   - 不在前端存储敏感信息
   - 使用 Supabase RLS 保护数据

## 完成标准

Phase 1 完成的标志：
- [ ] 用户可以使用 Google 账号登录
- [ ] 用户可以使用 GitHub 账号登录
- [ ] 登录后显示用户头像和菜单
- [ ] 刷新页面保持登录状态
- [ ] 可以正常登出
