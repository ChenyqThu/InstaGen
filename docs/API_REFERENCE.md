# API 参考文档

> InstaGen 后端接口与数据库设计参考

## API 端点

### POST /api/generate

AI 图像编辑接口 (Gemini API 代理)

**请求头**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**请求体**:
```json
{
  "base64Image": "string",  // Base64 编码的图片 (不含 data:image/... 前缀)
  "prompt": "string",       // 编辑提示词
  "customKey": "string"     // 可选，用户自定义 API Key
}
```

**成功响应** (200):
```json
{
  "image": "data:image/png;base64,..."  // 编辑后的图片
}
```

**错误响应**:

| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| 401 | `auth_required` | 未提供认证 token |
| 401 | `invalid_token` | token 无效或过期 |
| 429 | `quota_exceeded` | 每日配额已用完 |
| 400 | `invalid_api_key` | 自定义 Key 无效 |
| 500 | `generation_failed` | 生成失败 |

```json
{
  "error": "quota_exceeded",
  "message": "Daily limit reached",
  "limit": 3,
  "used": 3
}
```

---

### POST /api/validate-key

验证 Gemini API Key 有效性

**请求体**:
```json
{
  "apiKey": "string"
}
```

**成功响应** (200):
```json
{
  "valid": true
}
```

**错误响应** (400):
```json
{
  "valid": false,
  "error": "Invalid API key"
}
```

---

## 数据库表结构

### auth.users (Supabase 内置)

用户认证表，由 Supabase Auth 管理。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| email | text | 邮箱 |
| created_at | timestamp | 创建时间 |
| raw_user_meta_data | jsonb | OAuth 元数据 |

---

### user_profiles

用户扩展信息表。

```sql
create table user_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  avatar_url text,
  custom_gemini_key text,
  created_at timestamp with time zone default timezone('utc', now()) not null,
  updated_at timestamp with time zone default timezone('utc', now()) not null
);
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | uuid | ✅ | 关联 auth.users.id |
| display_name | text | | 显示名称 |
| avatar_url | text | | 头像 URL |
| custom_gemini_key | text | | 自定义 API Key |
| created_at | timestamp | ✅ | 创建时间 |
| updated_at | timestamp | ✅ | 更新时间 |

**RLS 策略**:
- SELECT: `auth.uid() = id`
- INSERT: `auth.uid() = id`
- UPDATE: `auth.uid() = id`

---

### user_photos

用户个人照片库。

```sql
create table user_photos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  data_url text not null,
  caption text,
  frame_style text not null default 'classic',
  filter_id text,
  pokemon_id text,
  prompt_used text,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc', now()) not null
);
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | uuid | ✅ | 主键 |
| user_id | uuid | ✅ | 关联用户 |
| data_url | text | ✅ | Base64 图片数据 |
| caption | text | | 照片标题 |
| frame_style | text | ✅ | 相框风格 |
| filter_id | text | | Instagram 滤镜 ID |
| pokemon_id | text | | Pokemon 特效 ID |
| prompt_used | text | | AI 编辑提示词 |
| is_public | boolean | | 是否已公开 |
| created_at | timestamp | ✅ | 创建时间 |

**RLS 策略**:
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`

**索引**:
```sql
create index idx_user_photos_user_id on user_photos(user_id);
create index idx_user_photos_created_at on user_photos(created_at desc);
```

---

### public_photos

公共画廊照片表 (已存在，需修改)。

```sql
-- 现有表结构
create table public_photos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc', now()) not null,
  data_url text not null,
  caption text,
  frame_style text not null,
  timestamp bigint not null,
  prompt_used text,
  pokemon_id text,
  filter_id text
);

-- 新增字段
alter table public_photos
  add column user_id uuid references auth.users(id) on delete set null,
  add column source_photo_id uuid references user_photos(id) on delete set null;
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | uuid | ✅ | 主键 |
| created_at | timestamp | ✅ | 创建时间 |
| data_url | text | ✅ | Base64 图片数据 |
| caption | text | | 照片标题 |
| frame_style | text | ✅ | 相框风格 |
| timestamp | bigint | ✅ | 原始拍摄时间戳 |
| prompt_used | text | | AI 编辑提示词 |
| pokemon_id | text | | Pokemon 特效 ID |
| filter_id | text | | Instagram 滤镜 ID |
| user_id | uuid | | 上传用户 (新增) |
| source_photo_id | uuid | | 源照片 ID (新增) |

**RLS 策略**:
- SELECT: `true` (公开可读)
- INSERT: `true` (允许插入)

---

### user_usage

用户使用量追踪表。

```sql
create table user_usage (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  usage_date date not null,
  gemini_calls integer default 0,
  created_at timestamp with time zone default timezone('utc', now()) not null,
  constraint unique_user_date unique (user_id, usage_date)
);
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | uuid | ✅ | 主键 |
| user_id | uuid | ✅ | 关联用户 |
| usage_date | date | ✅ | 使用日期 |
| gemini_calls | integer | ✅ | Gemini 调用次数 |
| created_at | timestamp | ✅ | 创建时间 |

**约束**:
- `unique_user_date`: 每用户每天只有一条记录

**RLS 策略**:
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`

**索引**:
```sql
create index idx_user_usage_user_date on user_usage(user_id, usage_date);
```

---

## 数据库函数

### handle_new_user()

新用户注册时自动创建 profile。

```sql
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

-- 触发器
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

### increment_usage()

增加用户使用计数。

```sql
create or replace function increment_usage(p_user_id uuid, p_date date)
returns void as $$
begin
  insert into user_usage (user_id, usage_date, gemini_calls)
  values (p_user_id, p_date, 1)
  on conflict (user_id, usage_date)
  do update set gemini_calls = user_usage.gemini_calls + 1;
end;
$$ language plpgsql security definer;
```

**调用示例**:
```sql
select increment_usage('user-uuid', '2024-01-15');
```

---

## 前端服务 API

### authService

```typescript
// 认证服务方法签名
signInWithEmail(email: string, password: string): Promise<AuthResponse>
signUpWithEmail(email: string, password: string): Promise<AuthResponse>
signInWithOAuth(provider: 'google' | 'github'): Promise<OAuthResponse>
signOut(): Promise<void>
getCurrentUser(): Promise<User | null>
getUserProfile(userId: string): Promise<UserProfile | null>
updateUserProfile(userId: string, updates: ProfileUpdate): Promise<UserProfile>
```

### photoService

```typescript
// 照片服务方法签名
savePhoto(photo: PhotoData, userId: string): Promise<SavedPhoto>
getUserPhotos(userId: string): Promise<SavedPhoto[]>
deletePhoto(photoId: string, userId: string): Promise<void>
shareToPublic(photoId: string, userId: string): Promise<void>
unshareFromPublic(photoId: string, userId: string): Promise<void>
updatePhotoCaption(photoId: string, userId: string, caption: string): Promise<void>
```

### usageService

```typescript
// 使用量服务方法签名
getTodayUsage(userId: string): Promise<UsageInfo>
getCustomKey(userId: string): Promise<string | null>
validateApiKey(apiKey: string): Promise<boolean>
```

### geminiService

```typescript
// Gemini 服务方法签名 (现有)
editImageWithGemini(base64Image: string, prompt: string): Promise<string>

// 更新后支持自定义 Key
editImageWithGemini(
  base64Image: string,
  prompt: string,
  options?: { customKey?: string; authToken?: string }
): Promise<string>
```

---

## 环境变量

### 服务端 (.env)

```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # 服务端专用

# Gemini
GEMINI_API_KEY=AIza...
```

### 客户端 (.env)

```bash
# Supabase (公开)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## 错误码速查

| 错误码 | HTTP 状态 | 说明 |
|--------|-----------|------|
| `auth_required` | 401 | 需要认证 |
| `invalid_token` | 401 | 无效 token |
| `quota_exceeded` | 429 | 配额超限 |
| `invalid_api_key` | 400 | API Key 无效 |
| `generation_failed` | 500 | 生成失败 |
| `not_found` | 404 | 资源不存在 |
| `forbidden` | 403 | 无权访问 |

---

## SQL 迁移脚本

完整的数据库初始化脚本：

```sql
-- ============================================
-- InstaGen 数据库迁移脚本
-- ============================================

-- 1. user_profiles 表
create table if not exists user_profiles (
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

-- 2. user_photos 表
create table if not exists user_photos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  data_url text not null,
  caption text,
  frame_style text not null default 'classic',
  filter_id text,
  pokemon_id text,
  prompt_used text,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc', now()) not null
);

create index if not exists idx_user_photos_user_id on user_photos(user_id);
create index if not exists idx_user_photos_created_at on user_photos(created_at desc);

alter table user_photos enable row level security;

create policy "Users can view own photos" on user_photos
  for select using (auth.uid() = user_id);
create policy "Users can insert own photos" on user_photos
  for insert with check (auth.uid() = user_id);
create policy "Users can update own photos" on user_photos
  for update using (auth.uid() = user_id);
create policy "Users can delete own photos" on user_photos
  for delete using (auth.uid() = user_id);

-- 3. public_photos 表更新
alter table public_photos
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists source_photo_id uuid references user_photos(id) on delete set null;

create index if not exists idx_public_photos_user_id on public_photos(user_id);

-- 4. user_usage 表
create table if not exists user_usage (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  usage_date date not null,
  gemini_calls integer default 0,
  created_at timestamp with time zone default timezone('utc', now()) not null,
  constraint unique_user_date unique (user_id, usage_date)
);

create index if not exists idx_user_usage_user_date on user_usage(user_id, usage_date);

alter table user_usage enable row level security;

create policy "Users can view own usage" on user_usage
  for select using (auth.uid() = user_id);
create policy "Users can insert own usage" on user_usage
  for insert with check (auth.uid() = user_id);
create policy "Users can update own usage" on user_usage
  for update using (auth.uid() = user_id);

-- 5. 函数和触发器
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function increment_usage(p_user_id uuid, p_date date)
returns void as $$
begin
  insert into user_usage (user_id, usage_date, gemini_calls)
  values (p_user_id, p_date, 1)
  on conflict (user_id, usage_date)
  do update set gemini_calls = user_usage.gemini_calls + 1;
end;
$$ language plpgsql security definer;
```
