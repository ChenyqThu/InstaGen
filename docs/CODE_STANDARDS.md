# 代码规范指南

> InstaGen 项目代码规范与注释标准

**版本**: v1.0.0
**创建日期**: 2025-01-23
**状态**: ✅ 生效中

---

## 1. 硬性指标

### 1.1 文件行数限制

| 语言类型 | 最大行数 | 说明 |
|----------|----------|------|
| TypeScript/JavaScript | **500 行** | 包括注释和空行 |
| CSS/SCSS | **400 行** | 建议拆分为多个模块 |
| JSON 配置 | **300 行** | 超出应考虑拆分 |

**违规处理**: 超出限制的文件必须拆分为更小的模块。

### 1.2 文件夹文件数限制

| 规则 | 限制 |
|------|------|
| 每层文件夹最大文件数 | **8 个** |
| 超出处理方式 | 创建子文件夹分类 |

**例外**: `docs/` 和静态资源目录不受此限制。

### 1.3 导入路径规范

```typescript
// ✅ 推荐: 使用路径别名
import { Camera } from '@/components/Camera';
import { useAuth } from '@/contexts/AuthContext';
import { TRANSLATIONS } from '@/constants';

// ❌ 避免: 过深的相对路径
import { Camera } from '../../../components/Camera';
```

**路径别名配置** (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## 2. 命名规范

### 2.1 文件命名

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| React 组件 | PascalCase | `PhotoModal.tsx`, `UserMenu.tsx` |
| Hooks | camelCase + use 前缀 | `useDrawerAnimation.ts` |
| 服务 | camelCase + Service 后缀 | `authService.ts` |
| 工具函数 | camelCase + Utils 后缀 | `pokemonUtils.ts`, `dateUtils.ts` |
| 类型定义 | camelCase | `auth.ts`, `types.ts` |
| 配置文件 | camelCase + Config 后缀 | `filterConfig.ts` |
| 常量文件 | camelCase | `constants.ts` |

### 2.2 变量/函数命名

```typescript
// ✅ 组件: PascalCase
function PhotoModal() {}
const UserMenu = () => {};

// ✅ 函数/变量: camelCase
const handleClick = () => {};
const isLoading = true;
const userName = 'John';

// ✅ 常量: SCREAMING_SNAKE_CASE
const MAX_PHOTOS = 100;
const API_ENDPOINT = '/api/generate';

// ✅ 类型/接口: PascalCase
interface PhotoModalProps {}
type Language = 'en' | 'zh';

// ✅ 枚举: PascalCase (值也用 PascalCase)
enum PhotoStatus {
  Developing = 'developing',
  Done = 'done',
  Editing = 'editing'
}
```

### 2.3 CSS 类名

使用 Tailwind CSS，遵循以下规则:

```typescript
// ✅ 3 个以下类: 单行
<div className="flex items-center gap-2">

// ✅ 3 个以上类: 多行模板字符串
<button
  className={`
    w-full px-4 py-2
    bg-brand-primary text-white
    rounded-full font-medium
    hover:bg-brand-primary/90
    transition-all duration-200
  `}
>
```

---

## 3. 注释规范

### 3.1 JSDoc 注释

**适用场景**: 导出的函数、复杂工具函数、公共 API

```typescript
/**
 * 获取 Pokemon 卡片配置
 * @param pokemonId - Pokemon ID，可为 null
 * @returns Pokemon 配置对象，如果 ID 无效则返回 null
 * @example
 * const config = getPokemonConfig('pikachu');
 * // => { id: 'pikachu', name: 'Pikachu', ... }
 */
export function getPokemonConfig(pokemonId: string | null): PokemonConfig | null {
  if (!pokemonId) return null;
  return pokemonData.find(p => p.id === pokemonId) || pokemonData[0];
}
```

### 3.2 行内注释

**适用场景**: 复杂业务逻辑、非显而易见的代码

```typescript
// ✅ 解释"为什么"而非"做什么"
// Supabase 在快速连续操作时可能产生死锁，需要延迟处理
setTimeout(async () => {
  await updateProfile(userId, data);
}, 100);

// ✅ 标注特殊处理
// 双重 requestAnimationFrame 确保动画在下一帧开始
requestAnimationFrame(() => {
  requestAnimationFrame(() => setIsVisible(true));
});

// ❌ 避免: 描述显而易见的代码
// 设置 loading 为 true
setLoading(true);
```

### 3.3 TODO/FIXME 注释

```typescript
// TODO: 添加虚拟滚动优化长列表性能
// FIXME: Safari 下动画闪烁问题
// HACK: 临时解决方案，等待上游库修复
// NOTE: 此处依赖特定的 API 响应格式
```

### 3.4 文件头注释 (可选)

仅用于复杂模块或需要特别说明的文件:

```typescript
/**
 * @file 照片服务模块
 * @description 处理用户照片的 CRUD 操作，包括个人库和公共画廊
 * @module services/photoService
 */
```

---

## 4. 代码组织

### 4.1 导入顺序

```typescript
// 1. React 相关
import React, { useState, useEffect, useCallback } from 'react';

// 2. 第三方库
import { createPortal } from 'react-dom';

// 3. 内部模块 (按字母顺序)
import { useAuth } from '@/contexts/AuthContext';
import { photoService } from '@/services/photoService';

// 4. 组件
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

// 5. 类型
import type { Photo, Language } from '@/types';

// 6. 常量/配置
import { TRANSLATIONS } from '@/constants';

// 7. 样式 (如果有)
import './styles.css';
```

### 4.2 组件结构

```typescript
// 1. 类型定义
interface PhotoModalProps {
  photo: Photo;
  isOpen: boolean;
  onClose: () => void;
}

// 2. 组件函数
export function PhotoModal({ photo, isOpen, onClose }: PhotoModalProps) {
  // 2.1 Hooks (按依赖顺序)
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // 2.2 派生状态
  const canEdit = user && photo.userId === user.id;

  // 2.3 Effects
  useEffect(() => {
    // ...
  }, [isOpen]);

  // 2.4 事件处理函数
  const handleSave = useCallback(async () => {
    // ...
  }, [photo]);

  // 2.5 渲染
  return (
    // JSX
  );
}
```

---

## 5. 代码质量

### 5.1 DRY 原则 (Don't Repeat Yourself)

```typescript
// ❌ 重复代码
const config1 = pokemonData.find(p => p.id === photo1.pokemonId) || pokemonData[0];
const config2 = pokemonData.find(p => p.id === photo2.pokemonId) || pokemonData[0];

// ✅ 提取为工具函数
import { getPokemonConfig } from '@/utils/pokemonUtils';
const config1 = getPokemonConfig(photo1.pokemonId);
const config2 = getPokemonConfig(photo2.pokemonId);
```

### 5.2 单一职责原则

```typescript
// ❌ 一个组件做太多事情
function GalleryPhotoModal() {
  // 500+ 行代码，包含编辑、下载、分享、删除...
}

// ✅ 拆分为更小的组件
function GalleryPhotoModal() {
  return (
    <Modal>
      <PhotoEditor />
      <PhotoActions />
      <DownloadButton />
    </Modal>
  );
}
```

### 5.3 避免的代码坏味道

| 坏味道 | 描述 | 解决方案 |
|--------|------|----------|
| 僵化 (Rigidity) | 小改动引发大量修改 | 解耦模块，使用接口 |
| 冗余 (Redundancy) | 相同逻辑多处重复 | 提取共享函数/组件 |
| 循环依赖 | A 依赖 B，B 依赖 A | 重构为单向依赖或提取公共模块 |
| 脆弱性 (Fragility) | 改一处坏多处 | 增加测试，隔离副作用 |
| 晦涩性 (Obscurity) | 代码难以理解 | 添加注释，改善命名 |
| 数据泥团 (Data Clump) | 多参数总是一起出现 | 封装为对象/类型 |
| 不必要的复杂性 | 过度设计 | YAGNI - 不需要就不做 |

---

## 6. TypeScript 规范

### 6.1 类型定义

```typescript
// ✅ 优先使用 interface (可扩展)
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ 联合类型使用 type
type PhotoStatus = 'developing' | 'done' | 'editing';

// ✅ Props 类型紧跟组件定义
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  // ...
}
```

### 6.2 避免 any

```typescript
// ❌ 避免
const data: any = fetchData();

// ✅ 使用具体类型
const data: Photo[] = fetchData();

// ✅ 实在不确定时使用 unknown
const data: unknown = fetchData();
if (isPhotoArray(data)) {
  // data 现在是 Photo[]
}
```

---

## 7. 目录结构规范

```
src/
├── components/           # React 组件
│   ├── auth/            # 认证相关组件
│   ├── editor/          # 编辑器组件
│   ├── gallery/         # 画廊组件
│   └── ui/              # 通用 UI 组件
├── contexts/            # React Context
├── hooks/               # 自定义 Hooks
├── services/            # API 服务
├── utils/               # 工具函数
├── config/              # 配置文件
└── types/               # TypeScript 类型
```

---

## 8. Git 提交规范

### 8.1 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 8.2 类型 (type)

| 类型 | 描述 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `refactor` | 代码重构 (不改变功能) |
| `style` | 代码格式 (不影响功能) |
| `docs` | 文档更新 |
| `test` | 测试相关 |
| `chore` | 构建/工具相关 |

### 8.3 示例

```
feat(gallery): add photo download functionality

- Implement high-resolution export (4x scaling)
- Add aspect ratio cropping for Polaroid frame
- Support PNG format output

Closes #123
```

---

## 9. 审查清单

每次代码审查时检查:

- [ ] 文件行数 ≤ 500
- [ ] 文件夹文件数 ≤ 8
- [ ] 无重复代码
- [ ] 使用路径别名导入
- [ ] 复杂函数有 JSDoc 注释
- [ ] 遵循命名规范
- [ ] TypeScript 类型完整
- [ ] 无 `any` 类型
- [ ] CSS 类名格式正确

---

## 变更历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.0.0 | 2025-01-23 | 初始版本 |
