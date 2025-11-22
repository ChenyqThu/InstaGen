# 使用限制系统设计

> Magic Edit (Gemini API) 配额管理与自定义 Key 支持

## 概述

为了控制 API 成本并提供公平的使用体验，InstaGen 对 Magic Edit 功能实施使用限制：

- **未登录用户**: 无法使用 Magic Edit
- **登录用户**: 每日 3 次免费额度
- **自定义 Key**: 无限制使用

## 配额规则

| 用户类型 | 每日限额 | 说明 |
|----------|----------|------|
| 未登录 | 0 | 需登录后使用 |
| 登录用户 | 3 次/天 | 使用系统 API Key |
| 自定义 Key | 无限制 | 使用用户自己的 Key |

**重置时间**: UTC 00:00

## 数据模型

### user_usage 表

```sql
create table user_usage (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  usage_date date not null,
  gemini_calls integer default 0,
  created_at timestamp with time zone default timezone('utc', now()) not null,

  -- 每个用户每天只有一条记录
  constraint unique_user_date unique (user_id, usage_date)
);

-- 索引
create index idx_user_usage_user_date on user_usage(user_id, usage_date);

-- 启用 RLS
alter table user_usage enable row level security;

-- RLS 策略
create policy "Users can view own usage"
  on user_usage for select
  using (auth.uid() = user_id);

create policy "Users can insert own usage"
  on user_usage for insert
  with check (auth.uid() = user_id);

create policy "Users can update own usage"
  on user_usage for update
  using (auth.uid() = user_id);
```

### 配额常量

```typescript
// config/usageConfig.ts

export const USAGE_CONFIG = {
  // 每日免费配额
  DAILY_FREE_LIMIT: 3,

  // 配额重置时间 (UTC)
  RESET_HOUR: 0,

  // 错误消息
  MESSAGES: {
    en: {
      quotaExceeded: 'Daily limit reached. Add your own API key for unlimited use!',
      loginRequired: 'Please log in to use Magic Edit',
    },
    zh: {
      quotaExceeded: '今日配额已用完，添加自己的 API Key 即可无限使用！',
      loginRequired: '请登录后使用 Magic Edit',
    },
  },
};
```

## 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                          前端                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PhotoModal.tsx                                          │   │
│  │  ┌────────────────────┐  ┌────────────────────────────┐  │   │
│  │  │  剩余次数: 2/3     │  │  ✨ Magic Edit 按钮        │  │   │
│  │  └────────────────────┘  └────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  useUsageLimit Hook                                      │   │
│  │  - remainingCalls                                        │   │
│  │  - canUseService                                         │   │
│  │  - hasCustomKey                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────┐
│                        API 层                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  /api/generate                                              │  │
│  │  1. 验证用户身份 (JWT)                                       │  │
│  │  2. 检查自定义 Key                                          │  │
│  │  3. 检查配额                                                │  │
│  │  4. 调用 Gemini API                                         │  │
│  │  5. 更新使用计数                                            │  │
│  └─────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

## API 设计

### /api/generate 修改

```javascript
// api/generate.js

import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI, Modality } from '@google/genai';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // 服务端使用 service role key
);

const DAILY_LIMIT = 3;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { base64Image, prompt, customKey } = req.body;

  // 1. 验证用户身份
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // 2. 确定使用哪个 API Key
  let apiKey = process.env.GEMINI_API_KEY;
  let useCustomKey = false;

  if (customKey) {
    // 用户提供了自定义 Key
    apiKey = customKey;
    useCustomKey = true;
  } else {
    // 使用系统 Key，需要检查配额
    const today = new Date().toISOString().split('T')[0];

    // 获取今日使用量
    const { data: usage } = await supabase
      .from('user_usage')
      .select('gemini_calls')
      .eq('user_id', user.id)
      .eq('usage_date', today)
      .single();

    const currentCalls = usage?.gemini_calls || 0;

    if (currentCalls >= DAILY_LIMIT) {
      return res.status(429).json({
        error: 'quota_exceeded',
        message: 'Daily limit reached',
        limit: DAILY_LIMIT,
        used: currentCalls,
      });
    }
  }

  // 3. 调用 Gemini API
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/png' } },
          { text: prompt },
        ],
      },
      config: { responseModalities: [Modality.IMAGE] },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      p => p.inlineData
    );

    if (!imagePart) {
      return res.status(500).json({ error: 'No image generated' });
    }

    // 4. 更新使用计数 (仅使用系统 Key 时)
    if (!useCustomKey) {
      const today = new Date().toISOString().split('T')[0];
      await supabase.rpc('increment_usage', {
        p_user_id: user.id,
        p_date: today,
      });
    }

    return res.status(200).json({
      image: `data:image/png;base64,${imagePart.inlineData.data}`,
    });
  } catch (error) {
    console.error('Gemini API error:', error);

    if (error.message?.includes('API key')) {
      return res.status(400).json({ error: 'invalid_api_key' });
    }

    return res.status(500).json({ error: 'Generation failed' });
  }
}
```

### 数据库函数

```sql
-- 增加使用计数的函数
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

## 前端实现

### usageService

```typescript
// services/usageService.ts

import { supabase } from './supabaseClient';

export interface UsageInfo {
  used: number;
  limit: number;
  remaining: number;
  hasCustomKey: boolean;
}

// 获取今日使用情况
export const getTodayUsage = async (userId: string): Promise<UsageInfo> => {
  const today = new Date().toISOString().split('T')[0];

  const { data: usage } = await supabase
    .from('user_usage')
    .select('gemini_calls')
    .eq('user_id', userId)
    .eq('usage_date', today)
    .single();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('custom_gemini_key')
    .eq('id', userId)
    .single();

  const used = usage?.gemini_calls || 0;
  const limit = 3;
  const hasCustomKey = !!profile?.custom_gemini_key;

  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    hasCustomKey,
  };
};

// 获取用户自定义 Key
export const getCustomKey = async (userId: string): Promise<string | null> => {
  const { data } = await supabase
    .from('user_profiles')
    .select('custom_gemini_key')
    .eq('id', userId)
    .single();

  return data?.custom_gemini_key || null;
};

// 验证 API Key 有效性
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/validate-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    return response.ok;
  } catch {
    return false;
  }
};
```

### useUsageLimit Hook

```typescript
// hooks/useUsageLimit.ts

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import * as usageService from '@/services/usageService';

export function useUsageLimit() {
  const { user, isAuthenticated } = useAuth();
  const [usageInfo, setUsageInfo] = useState<usageService.UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // 加载使用情况
  const loadUsage = useCallback(async () => {
    if (!user) {
      setUsageInfo(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const info = await usageService.getTodayUsage(user.id);
      setUsageInfo(info);
    } catch (error) {
      console.error('Failed to load usage:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 初始加载
  useEffect(() => {
    loadUsage();
  }, [loadUsage]);

  // 是否可以使用服务
  const canUseService = isAuthenticated && (
    usageInfo?.hasCustomKey || (usageInfo?.remaining ?? 0) > 0
  );

  // 刷新使用情况
  const refresh = useCallback(() => {
    loadUsage();
  }, [loadUsage]);

  return {
    // 状态
    isAuthenticated,
    loading,
    usageInfo,

    // 计算属性
    canUseService,
    remainingCalls: usageInfo?.remaining ?? 0,
    hasCustomKey: usageInfo?.hasCustomKey ?? false,

    // 方法
    refresh,
  };
}
```

### PhotoModal 集成

```tsx
// components/PhotoModal.tsx 修改

import { useUsageLimit } from '@/hooks/useUsageLimit';
import { useAuth } from '@/hooks/useAuth';

function PhotoModal({ photo, onClose, onUpdate }) {
  const { isAuthenticated } = useAuth();
  const { canUseService, remainingCalls, hasCustomKey, refresh } = useUsageLimit();
  const [showLogin, setShowLogin] = useState(false);

  const handleAIEdit = async (option) => {
    // 检查登录状态
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }

    // 检查配额
    if (!canUseService) {
      alert(t.quotaExceeded);
      return;
    }

    // 执行 AI 编辑...
    try {
      const result = await editImageWithGemini(photo.dataUrl, option.prompt);
      onUpdate(photo.id, { dataUrl: result });

      // 刷新使用情况
      refresh();
    } catch (error) {
      if (error.code === 'quota_exceeded') {
        alert(t.quotaExceeded);
      }
    }
  };

  return (
    <div>
      {/* 配额显示 */}
      {isAuthenticated && !hasCustomKey && (
        <div className="text-sm text-gray-500">
          今日剩余: {remainingCalls}/3 次
        </div>
      )}

      {hasCustomKey && (
        <div className="text-sm text-green-500">
          ✨ 使用自定义 Key，无限制
        </div>
      )}

      {/* Magic Edit 按钮 */}
      <button
        onClick={() => handleAIEdit(selectedOption)}
        disabled={!canUseService}
        className={!canUseService ? 'opacity-50 cursor-not-allowed' : ''}
      >
        ✨ Magic Edit
      </button>

      {/* 登录弹窗 */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
      />
    </div>
  );
}
```

## 自定义 Key 配置

### UI 设计

```
┌─────────────────────────────────────────────────────────────┐
│  ⚙️ API 设置                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  当前状态: 使用系统 Key (剩余 2/3 次)                        │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  💡 添加自己的 Gemini API Key 即可无限使用 Magic Edit       │
│                                                             │
│  获取 Key: https://makersuite.google.com/app/apikey         │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  AIza...                                              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │  验证 Key   │  │   保存      │                          │
│  └─────────────┘  └─────────────┘                          │
│                                                             │
│  ⚠️ 你的 Key 将加密存储，仅用于你的 Magic Edit 请求         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key 验证 API

```javascript
// api/validate-key.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { apiKey } = req.body;

  try {
    const ai = new GoogleGenAI({ apiKey });

    // 使用简单请求验证 Key
    await ai.models.list();

    return res.status(200).json({ valid: true });
  } catch (error) {
    return res.status(400).json({
      valid: false,
      error: 'Invalid API key',
    });
  }
}
```

## 错误处理

| 错误码 | 说明 | 用户提示 |
|--------|------|----------|
| `401` | 未认证 | 请先登录 |
| `429` | 配额超限 | 今日配额已用完 |
| `invalid_api_key` | Key 无效 | API Key 无效，请检查 |
| `500` | 服务错误 | 生成失败，请稍后重试 |

## 监控与分析

### 使用量统计查询

```sql
-- 查看每日使用量
select
  usage_date,
  count(distinct user_id) as unique_users,
  sum(gemini_calls) as total_calls
from user_usage
group by usage_date
order by usage_date desc
limit 30;

-- 查看高频用户
select
  user_id,
  sum(gemini_calls) as total_calls
from user_usage
where usage_date >= current_date - interval '7 days'
group by user_id
order by total_calls desc
limit 10;
```

## 未来扩展

1. **付费订阅**: 提供更高配额的付费方案
2. **动态限额**: 根据用户等级调整配额
3. **使用历史**: 展示用户的使用趋势图表
4. **配额预警**: 接近限额时发送提醒
