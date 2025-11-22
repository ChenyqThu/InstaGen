# 认证系统设计

> 基于 Supabase Auth 的用户认证系统

## 概述

InstaGen 使用 Supabase Auth 提供用户认证功能，支持邮箱注册和第三方 OAuth 登录（Google、GitHub）。

## 认证流程

### OAuth 登录流程

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│   用户      │    │   InstaGen   │    │   Supabase  │    │  OAuth Provider
│             │    │   前端       │    │   Auth      │    │  (Google/GitHub)
└──────┬──────┘    └──────┬───────┘    └──────┬──────┘    └──────┬───────┘
       │                   │                   │                  │
       │  1. 点击登录      │                   │                  │
       │──────────────────>│                   │                  │
       │                   │                   │                  │
       │                   │ 2. signInWithOAuth│                  │
       │                   │──────────────────>│                  │
       │                   │                   │                  │
       │                   │  3. 重定向到 OAuth│                  │
       │<──────────────────────────────────────│                  │
       │                                       │                  │
       │  4. 用户授权      │                   │                  │
       │──────────────────────────────────────────────────────────>
       │                                       │                  │
       │                   │  5. 回调 + code   │                  │
       │<──────────────────────────────────────│<─────────────────│
       │                   │                   │                  │
       │                   │ 6. 处理回调       │                  │
       │                   │──────────────────>│                  │
       │                   │                   │                  │
       │                   │ 7. 返回 session   │                  │
       │                   │<──────────────────│                  │
       │                   │                   │                  │
       │  8. 登录成功      │                   │                  │
       │<──────────────────│                   │                  │
```

## 组件设计

### AuthContext

认证状态的全局 Context，管理用户信息和认证方法。

```typescript
// contexts/AuthContext.tsx

interface AuthContextType {
  // 状态
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  // 方法
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: ProfileUpdate) => Promise<void>;
}

interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  customGeminiKey: string | null;
  createdAt: string;
}
```

### LoginModal

登录弹窗组件，提供多种登录方式。

```typescript
// components/auth/LoginModal.tsx

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'login' | 'signup';
}
```

**UI 结构**:

```
┌────────────────────────────────────┐
│  ╳                          关闭   │
├────────────────────────────────────┤
│                                    │
│        ✨ 欢迎来到 InstaGen        │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  🔑 使用 Google 登录         │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  🐙 使用 GitHub 登录         │  │
│  └──────────────────────────────┘  │
│                                    │
│  ─────────── 或 ───────────        │
│                                    │
│  邮箱                              │
│  ┌──────────────────────────────┐  │
│  │  example@email.com           │  │
│  └──────────────────────────────┘  │
│                                    │
│  密码                              │
│  ┌──────────────────────────────┐  │
│  │  ••••••••                    │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │         登录                 │  │
│  └──────────────────────────────┘  │
│                                    │
│    还没有账号？立即注册            │
│                                    │
└────────────────────────────────────┘
```

### UserMenu

用户菜单下拉组件，显示在页面右上角。

```typescript
// components/auth/UserMenu.tsx

interface UserMenuProps {
  user: User;
  onSignOut: () => void;
}
```

**UI 结构**:

```
未登录状态:
┌─────────────────┐
│  🔑 登录        │
└─────────────────┘

已登录状态:
┌──────┐
│  头像 │ ▼
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

### AccountSettings

账户设置页面组件。

```typescript
// components/auth/AccountSettings.tsx

interface AccountSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**功能模块**:

1. **个人资料**
   - 修改显示名称
   - 更换头像

2. **API 设置**
   - 配置自定义 Gemini API Key
   - 测试 Key 有效性

3. **使用统计**
   - 今日使用次数
   - 剩余配额

4. **账户操作**
   - 退出登录
   - 删除账户

## 服务层

### authService

封装 Supabase Auth API 调用。

```typescript
// services/authService.ts

// OAuth 登录
export const signInWithOAuth = async (provider: 'google' | 'github') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      // Redirect to origin root - Supabase handles hash fragment
      redirectTo: window.location.origin,
    },
  });
  if (error) throw error;
  return data;
};

// 邮箱登录
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

// 注册
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

// 登出
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// 获取当前用户 (使用 getSession 确保 token 自动刷新)
export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  return session.user;
};

// 获取用户配置
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// 监听认证状态变化
// 重要：回调中不能直接 await Supabase 调用，会导致死锁
// 参考: https://github.com/supabase/gotrue-js/issues/762
export const onAuthStateChange = (callback) => {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      callback(null);
      return;
    }

    if (session?.user) {
      // 立即返回基本用户信息
      callback(buildUserFromSession(session.user));

      // 延迟加载 profile，避免死锁
      setTimeout(async () => {
        const profile = await getUserProfile(session.user.id);
        if (profile) {
          callback(buildUserWithProfile(session.user, profile));
        }
      }, 0);
    }
  });
};
```

## 数据库表

### user_profiles

存储用户扩展信息。

```sql
create table user_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  avatar_url text,
  custom_gemini_key text,  -- 加密存储
  created_at timestamp with time zone default timezone('utc', now()) not null,
  updated_at timestamp with time zone default timezone('utc', now()) not null
);

-- 启用 RLS
alter table user_profiles enable row level security;

-- 用户只能访问自己的 profile
create policy "Users can view own profile"
  on user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on user_profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on user_profiles for insert
  with check (auth.uid() = id);

-- 创建触发器：新用户注册时自动创建 profile
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

## Supabase 配置

### 启用 OAuth Providers

在 Supabase Dashboard 中配置：

**Google OAuth**:
1. 前往 Authentication → Providers → Google
2. 启用 Google Provider
3. 填入 Google Cloud Console 获取的 Client ID 和 Secret
4. 配置授权回调 URL

**GitHub OAuth**:
1. 前往 Authentication → Providers → GitHub
2. 启用 GitHub Provider
3. 填入 GitHub OAuth App 的 Client ID 和 Secret
4. 配置授权回调 URL

### 回调 URL 配置

OAuth 登录使用 `window.location.origin` 动态获取当前域名，确保本地开发和生产环境都能正常工作。

**Supabase Dashboard 配置** (Authentication → URL Configuration → Redirect URLs):

```
# 添加以下 URL
https://instagen.chenge.ink
https://localhost:3000
```

**Google Cloud Console** (OAuth 2.0 Client ID → Authorized redirect URIs):

```
https://<your-project-ref>.supabase.co/auth/v1/callback
```

## 使用示例

### 在组件中使用

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, signInWithOAuth, signOut } = useAuth();

  if (!isAuthenticated) {
    return (
      <button onClick={() => signInWithOAuth('google')}>
        登录以继续
      </button>
    );
  }

  return (
    <div>
      <p>欢迎, {user.displayName || user.email}!</p>
      <button onClick={signOut}>退出</button>
    </div>
  );
}
```

### 保护需要登录的功能

```tsx
function MagicEditButton({ onEdit }) {
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const handleClick = () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    onEdit();
  };

  return (
    <>
      <button onClick={handleClick}>✨ Magic Edit</button>
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={onEdit}
      />
    </>
  );
}
```

## 安全考虑

1. **Session 管理**: Supabase 自动处理 JWT token 刷新
2. **PKCE 流程**: OAuth 使用 PKCE 增强安全性
3. **RLS 策略**: 确保用户只能访问自己的数据
4. **敏感数据**: 自定义 API Key 应加密存储
5. **错误处理**: 不暴露敏感的错误信息给用户

## Session 持久化

### 关键配置

Supabase 客户端配置 (supabaseClient.ts):

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: window.localStorage,      // 使用 localStorage 持久化
        autoRefreshToken: true,            // 自动刷新 token
        persistSession: true,              // 持久化 session
        detectSessionInUrl: true,          // 检测 URL 中的 OAuth 回调
    },
});
```

### 已知问题与解决方案

**问题**: 在 `onAuthStateChange` 回调中直接 await Supabase API 调用会导致死锁。

**原因**: Supabase JS 客户端内部使用自定义 fetch 方法，在回调中调用会形成循环等待。

**解决方案**: 使用 `setTimeout(fn, 0)` 延迟执行异步操作，让回调先完成。

```typescript
// ❌ 错误写法 - 会导致死锁
onAuthStateChange(async (event, session) => {
  const profile = await getUserProfile(session.user.id);  // 卡住!
});

// ✅ 正确写法 - 延迟执行
onAuthStateChange((event, session) => {
  callback(basicUser);  // 立即返回基本信息

  setTimeout(async () => {
    const profile = await getUserProfile(session.user.id);
    callback(userWithProfile);  // 更新完整信息
  }, 0);
});
```

**参考**: [supabase/gotrue-js#762](https://github.com/supabase/gotrue-js/issues/762)
