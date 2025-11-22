# Phase 4: 使用限制系统

> 版本: v1.4.0 | 状态: ✅ 已完成 | 依赖: Phase 1

## 目标

实现 Magic Edit (Gemini API) 的使用限制系统，保护 API 成本，同时提供自定义 Key 无限使用的选项。

## 核心功能

- [x] 每日 3 次免费配额
- [x] 使用量追踪和显示
- [x] 服务端配额检查
- [x] 自定义 Key 绕过限制
- [x] 配额刷新 (UTC 00:00)

## 配额规则

| 用户类型 | 每日限额 | 说明 |
|----------|----------|------|
| 未登录 | 0 次 | 必须登录才能使用 |
| 登录用户 | 3 次/天 | 使用系统 API Key |
| 自定义 Key | 无限制 | 使用用户自己的 Key |

## 前置条件

- ✅ Phase 1 完成 (用户认证系统)
- ⬜ Phase 3 的 API Key 配置功能 (可并行开发)

## 任务清单

### 任务 4.1: 数据库表创建
**状态**: ✅ 已完成（已存在）

**验收标准**:
- [x] 表创建成功
- [x] 唯一约束生效
- [x] RLS 策略正确
- [x] increment_usage 函数可用

---

### 任务 4.2: usageService 服务层
**状态**: ✅ 已完成

**验收标准**:
- [x] 正确获取使用量
- [x] 正确判断自定义 Key
- [x] 错误处理完善

---

### 任务 4.3: useUsageLimit Hook
**状态**: ✅ 已完成

**验收标准**:
- [x] 状态正确计算
- [x] 未登录时返回合理默认值
- [x] refresh 方法正常工作

---

### 任务 4.4: 修改 /api/generate 接口
**状态**: ✅ 已完成

**验收标准**:
- [x] 未登录返回 401
- [x] 配额超限返回 429
- [x] 自定义 Key 不检查配额
- [x] 成功调用后更新计数

**目标**: 在服务端添加配额检查

**修改文件**: `api/generate.js`

**修改流程**:
```
接收请求
    │
    ▼
┌─────────────┐
│ 验证 JWT    │ → 失败 → 401 Unauthorized
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 有自定义Key? │
└──────┬──────┘
       │
   ┌───┴───┐
  Yes      No
   │       │
   │       ▼
   │  ┌─────────────┐
   │  │ 检查配额    │ → 超限 → 429 Quota Exceeded
   │  └──────┬──────┘
   │         │
   ▼         ▼
┌─────────────────────┐
│ 调用 Gemini API     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 更新使用计数        │ (仅使用系统 Key 时)
└──────────┬──────────┘
           │
           ▼
     返回结果
```

**关键代码**:
```javascript
// 验证用户身份
const authHeader = req.headers.authorization;
const token = authHeader?.replace('Bearer ', '');
const { data: { user } } = await supabase.auth.getUser(token);

if (!user) {
  return res.status(401).json({ error: 'auth_required' });
}

// 确定使用哪个 Key
let apiKey = process.env.GEMINI_API_KEY;
let useCustomKey = false;

// 检查自定义 Key
const { data: profile } = await supabase
  .from('user_profiles')
  .select('custom_gemini_key')
  .eq('id', user.id)
  .single();

if (profile?.custom_gemini_key) {
  apiKey = profile.custom_gemini_key;
  useCustomKey = true;
} else {
  // 检查配额
  const today = new Date().toISOString().split('T')[0];
  const { data: usage } = await supabase
    .from('user_usage')
    .select('gemini_calls')
    .eq('user_id', user.id)
    .eq('usage_date', today)
    .single();

  if ((usage?.gemini_calls || 0) >= 3) {
    return res.status(429).json({
      error: 'quota_exceeded',
      message: 'Daily limit reached',
      limit: 3,
      used: usage.gemini_calls,
    });
  }
}

// 调用 Gemini...

// 更新使用计数 (仅使用系统 Key 时)
if (!useCustomKey) {
  await supabase.rpc('increment_usage', {
    p_user_id: user.id,
    p_date: today,
  });
}
```

**验收标准**:
- [ ] 未登录返回 401
- [ ] 配额超限返回 429
- [ ] 自定义 Key 不检查配额
- [ ] 成功调用后更新计数

---

### 任务 4.5: PhotoModal 集成
**状态**: ✅ 已完成

**验收标准**:
- [x] 正确显示剩余次数
- [x] 配额用尽时按钮禁用
- [x] 显示友好提示
- [x] 调用后数字更新

**目标**: 在编辑弹窗中显示配额信息和限制

**修改文件**: `src/components/PhotoModal.tsx`

**添加内容**:

1. **配额显示**:
```tsx
const { canUseService, remainingCalls, hasCustomKey, refresh } = useUsageLimit();

// UI
{isAuthenticated && (
  <div className="text-sm">
    {hasCustomKey ? (
      <span className="text-green-500">✨ 无限制使用</span>
    ) : (
      <span className="text-gray-500">
        今日剩余: {remainingCalls}/3 次
      </span>
    )}
  </div>
)}
```

2. **按钮禁用**:
```tsx
<button
  onClick={handleAIEdit}
  disabled={!canUseService || isProcessing}
  className={cn(
    'px-4 py-2 rounded-xl',
    !canUseService && 'opacity-50 cursor-not-allowed'
  )}
>
  ✨ Magic Edit
</button>
```

3. **提示信息**:
```tsx
{!canUseService && isAuthenticated && (
  <div className="text-sm text-orange-500">
    💡 今日配额已用完，添加自己的 API Key 可无限使用
  </div>
)}

{!isAuthenticated && (
  <div className="text-sm text-blue-500">
    🔑 登录后可使用 Magic Edit
  </div>
)}
```

4. **调用后刷新**:
```tsx
const handleAIEdit = async () => {
  // ...编辑逻辑
  await editImageWithGemini(/*...*/);
  refresh(); // 刷新使用量
};
```

**验收标准**:
- [ ] 正确显示剩余次数
- [ ] 配额用尽时按钮禁用
- [ ] 显示友好提示
- [ ] 调用后数字更新

---

### 任务 4.6: geminiService 认证支持
**状态**: ✅ 已完成

**验收标准**:
- [x] 请求带上 Authorization header
- [x] 正确处理各类错误
- [x] 错误信息友好

**目标**: 修改 geminiService 支持认证

**修改文件**: `src/services/geminiService.ts`

**修改内容**:
```typescript
export const editImageWithGemini = async (
  base64Image: string,
  prompt: string
): Promise<string> => {
  // 获取当前用户 token
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('auth_required');
  }

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ base64Image, prompt }),
  });

  if (!response.ok) {
    const error = await response.json();

    if (response.status === 401) {
      throw new Error('auth_required');
    }
    if (response.status === 429) {
      throw new Error('quota_exceeded');
    }
    throw new Error(error.message || 'generation_failed');
  }

  const data = await response.json();
  return data.image;
};
```

**错误处理**:
```typescript
// 在 PhotoModal 中
try {
  await editImageWithGemini(/*...*/);
} catch (error) {
  if (error.message === 'auth_required') {
    setShowLogin(true);
  } else if (error.message === 'quota_exceeded') {
    alert(t.quotaExceeded);
  } else {
    alert(t.error);
  }
}
```

**验收标准**:
- [ ] 请求带上 Authorization header
- [ ] 正确处理各类错误
- [ ] 错误信息友好

---

## 文件创建清单

| 文件路径 | 任务 | 说明 |
|----------|------|------|
| `src/services/usageService.ts` | 4.2 | 使用量服务 |
| `src/hooks/useUsageLimit.ts` | 4.3 | 使用限制 Hook |
| `src/config/usageConfig.ts` | 4.2 | 配额配置 |

## 修改文件清单

| 文件路径 | 任务 | 修改内容 |
|----------|------|----------|
| `api/generate.js` | 4.4 | 添加配额检查 |
| `src/services/geminiService.ts` | 4.6 | 添加认证支持 |
| `src/components/PhotoModal.tsx` | 4.5 | 集成配额显示 |
| `src/constants.ts` | 4.5 | 添加翻译文本 |

## 配置文件

**文件**: `src/config/usageConfig.ts`

```typescript
export const USAGE_CONFIG = {
  // 每日免费配额
  DAILY_FREE_LIMIT: 3,

  // 配额重置时间 (UTC)
  RESET_HOUR_UTC: 0,
};
```

## 翻译文本

```typescript
// constants.ts 新增
const TRANSLATIONS = {
  en: {
    // 使用限制
    remainingToday: 'Remaining today',
    quotaExceeded: 'Daily limit reached. Add your API key for unlimited use!',
    unlimitedUse: 'Unlimited use',
    loginToUse: 'Log in to use Magic Edit',
    addApiKeyTip: 'Add your API key for unlimited Magic Edit',
  },
  zh: {
    // 使用限制
    remainingToday: '今日剩余',
    quotaExceeded: '今日配额已用完，添加自己的 API Key 可无限使用！',
    unlimitedUse: '无限制使用',
    loginToUse: '登录后可使用 Magic Edit',
    addApiKeyTip: '添加自己的 API Key 可无限使用 Magic Edit',
  },
};
```

## 测试用例

### 功能测试
- [ ] 未登录时无法使用
- [ ] 首次使用成功
- [ ] 使用 3 次后被限制
- [ ] 自定义 Key 不受限制
- [ ] UTC 0 点后配额重置
- [ ] 配额显示正确

### 边界测试
- [ ] 并发请求处理
- [ ] 时区边界测试
- [ ] 网络错误处理

### 安全测试
- [ ] 无法绕过服务端检查
- [ ] Token 验证有效
- [ ] RLS 权限正确

## 监控与运维

### 使用量统计 SQL

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

-- 查看配额使用分布
select
  gemini_calls,
  count(*) as user_count
from user_usage
where usage_date = current_date
group by gemini_calls
order by gemini_calls;
```

## 注意事项

1. **时区处理**
   - 使用 UTC 时间计算配额日期
   - 前端可显示本地时间

2. **并发控制**
   - `increment_usage` 函数使用 `ON CONFLICT` 保证原子性
   - 考虑使用数据库事务

3. **性能优化**
   - 配额信息可缓存几分钟
   - 避免每次都查询数据库

4. **用户体验**
   - 配额即将用尽时提前提示
   - 提供清晰的升级路径

## 完成标准

Phase 4 完成的标志：
- [x] 未登录用户无法使用 Magic Edit
- [x] 登录用户有每日 3 次限额
- [x] 配额用尽时显示提示
- [x] 自定义 Key 用户不受限制
- [x] 配额每日 UTC 0 点重置
