# InstaGen 认证系统配置指南

本指南将协助你完成 Phase 1 认证系统的必要配置。请按顺序执行以下操作。

## 第一步：数据库迁移

你需要执行 SQL 脚本来创建必要的数据表和触发器。

1.  **获取 SQL 脚本**
    打开项目中的文件：`supabase/migrations/20240101000000_init_auth.sql`
    或者直接复制以下内容：

    ```sql
    -- Create user_profiles table
    create table if not exists public.user_profiles (
      id uuid references auth.users(id) on delete cascade primary key,
      display_name text,
      avatar_url text,
      custom_gemini_key text,
      created_at timestamp with time zone default timezone('utc', now()) not null,
      updated_at timestamp with time zone default timezone('utc', now()) not null
    );

    -- Enable RLS
    alter table public.user_profiles enable row level security;

    -- Create policies
    create policy "Users can view own profile" on public.user_profiles
      for select using (auth.uid() = id);
    create policy "Users can update own profile" on public.user_profiles
      for update using (auth.uid() = id);
    create policy "Users can insert own profile" on public.user_profiles
      for insert with check (auth.uid() = id);

    -- Create handle_new_user function
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

    -- Create trigger for new user
    drop trigger if exists on_auth_user_created on auth.users;
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();

    -- Create user_usage table
    create table if not exists public.user_usage (
      id uuid default gen_random_uuid() primary key,
      user_id uuid references auth.users(id) on delete cascade not null,
      usage_date date not null,
      gemini_calls integer default 0,
      created_at timestamp with time zone default timezone('utc', now()) not null,
      constraint unique_user_date unique (user_id, usage_date)
    );

    -- Create index for user_usage
    create index if not exists idx_user_usage_user_date on public.user_usage(user_id, usage_date);

    -- Enable RLS for user_usage
    alter table public.user_usage enable row level security;

    -- Create policies for user_usage
    create policy "Users can view own usage" on public.user_usage
      for select using (auth.uid() = user_id);
    create policy "Users can insert own usage" on public.user_usage
      for insert with check (auth.uid() = user_id);
    create policy "Users can update own usage" on public.user_usage
      for update using (auth.uid() = user_id);

    -- Create increment_usage function
    create or replace function public.increment_usage(p_user_id uuid, p_date date)
    returns void as $$
    begin
      insert into public.user_usage (user_id, usage_date, gemini_calls)
      values (p_user_id, p_date, 1)
      on conflict (user_id, usage_date)
      do update set gemini_calls = user_usage.gemini_calls + 1;
    end;
    $$ language plpgsql security definer;
    ```

2.  **执行脚本**
    - 登录 [Supabase Dashboard](https://supabase.com/dashboard)。
    - 进入你的项目。
    - 点击左侧菜单的 **SQL Editor**。
    - 点击 **New query**。
    - 粘贴上述 SQL 代码。
    - 点击 **Run**。
    - 确认右下角显示 "Success" 且无错误。

---

## 第二步：配置 URL

为了确保 OAuth 登录后能正确跳转回应用，需要配置 Site URL。

1.  在 Supabase Dashboard 中，点击左侧菜单的 **Authentication** -> **URL Configuration**。
2.  **Site URL**: 设置为你的应用地址。
    - 本地开发: `http://localhost:3000` (或你的实际端口)
    - 生产环境: `https://your-app.vercel.app`
3.  **Redirect URLs**: 确保包含 `http://localhost:3000/**` (本地开发需要)。
4.  点击 **Save**。

---

## 第三步：配置 Google OAuth

1.  **创建 Google Cloud 项目**
    - 访问 [Google Cloud Console](https://console.cloud.google.com/)。
    - 创建一个新项目或选择现有项目。

2.  **配置 OAuth 同意屏幕 (Consent Screen)**
    - 搜索并进入 "APIs & Services" -> "OAuth consent screen"。
    - User Type 选择 **External** (外部)。
    - 填写应用名称 (InstaGen)、用户支持邮箱等必填项。
    - 点击保存并继续。

3.  **创建凭据**
    - 进入 "Credentials" (凭据)。
    - 点击 **Create Credentials** -> **OAuth client ID**。
    - Application type 选择 **Web application**。
    - Name 填 "Supabase Auth"。
    - **Authorized redirect URIs** (已获授权的重定向 URI):
        - 填入: `https://<YOUR_PROJECT_ID>.supabase.co/auth/v1/callback`
        - *注意: 将 `<YOUR_PROJECT_ID>` 替换为你的 Supabase 项目 ID (可在 Project Settings -> General 中找到 Reference ID)*。
    - 点击 Create。

4.  **填入 Supabase**
    - 复制生成的 **Client ID** 和 **Client Secret**。
    - 回到 Supabase Dashboard -> **Authentication** -> **Providers**。
    - 选择 **Google**。
    - 启用 (Enable Google)。
    - 粘贴 Client ID 和 Client Secret。
    - 点击 **Save**。

---

## 第四步：配置 GitHub OAuth

1.  **创建 GitHub OAuth App**
    - 访问 [GitHub Developer Settings](https://github.com/settings/developers)。
    - 点击 **New OAuth App**。
    - **Application name**: InstaGen
    - **Homepage URL**: `http://localhost:3000` (或生产环境 URL)
    - **Authorization callback URL**: `https://<YOUR_PROJECT_ID>.supabase.co/auth/v1/callback`
        - *同样替换 `<YOUR_PROJECT_ID>` 为你的 Supabase 项目 ID*。
    - 点击 **Register application**。

2.  **生成 Client Secret**
    - 在 App 详情页，点击 **Generate a new client secret**。

3.  **填入 Supabase**
    - 复制 **Client ID** 和 **Client Secret**。
    - 回到 Supabase Dashboard -> **Authentication** -> **Providers**。
    - 选择 **GitHub**。
    - 启用 (Enable GitHub)。
    - 粘贴 Client ID 和 Client Secret。
    - 点击 **Save**。

---

## 第五步：验证

1.  启动本地开发服务器: `npm run dev`
2.  打开浏览器访问 `http://localhost:3000`。
3.  点击右上角的 "登录" 按钮。
4.  尝试使用 Google 或 GitHub 登录。
5.  如果成功跳转并显示你的头像，则配置完成！
