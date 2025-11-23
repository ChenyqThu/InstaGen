# UI 风格指南

> **InstaGen Polaroid 视觉设计系统**
>
> *温暖，复古，活泼，优质*

## 1. 设计 Token

### 1.1 颜色
代码中应使用语义化颜色名称以确保一致性。

| Token 名称 | 色值 | Tailwind 类名 | 用途 |
|------------|------|---------------|------|
| **Brand Primary (品牌主色)** | `#E76F51` | `bg-brand-primary` | 主要操作，激活状态 |
| **Brand Secondary (品牌次色)** | `#F4A261` | `bg-brand-secondary` | 渐变，强调 |
| **Brand Accent (品牌装饰色)** | `#FFB5BA` | `bg-brand-accent` | 装饰元素，“可爱”变体 |
| **Surface Base (基础背景)** | `#FDF8F5` | `bg-surface-base` | 页面背景 |
| **Surface Card (卡片背景)** | `#FFFFFF` | `bg-surface-card` | 卡片，模态框，气泡 |
| **Surface Muted (柔和背景)** | `#F5F5F4` | `bg-surface-muted` | 次要背景，输入框 |
| **Text Main (主要文字)** | `#1F2937` | `text-main` | 标题，主要内容 |
| **Text Muted (次要文字)** | `#6B7280` | `text-muted` | 副标题，占位符 |
| **Border Default (默认边框)** | `#E5E5E5` | `border-default` | 卡片边框，分割线 |
| **Status Success (状态成功)** | `#95D5B2` | `text-success` | 成功消息，Toast |
| **Status Error (状态错误)** | `#E63946` | `text-error` | 错误消息，破坏性操作 |

### 1.2 排版
**字体家族**:
- 正文/UI: `Inter`, system-ui, sans-serif
- 标题/创意: `Comic Sans MS`, `Chalkboard SE`, sans-serif (仅用于营造“拍立得”感，少量使用)

**字号阶梯**:
- **Display**: `text-3xl` (30px) font-bold
- **H1**: `text-2xl` (24px) font-bold
- **H2**: `text-xl` (20px) font-semibold
- **Body**: `text-base` (16px) font-normal
- **Small**: `text-sm` (14px) font-medium
- **Tiny**: `text-xs` (12px) font-bold uppercase tracking-wide

### 1.3 间距与圆角
- **圆角**:
    - `rounded-xl` (12px): 按钮，输入框
    - `rounded-2xl` (16px): 卡片
    - `rounded-3xl` (24px): 模态框，大容器
- **间距**: 基础单位 4px (Tailwind 默认)。
    - 章节间距: `gap-8` (32px)
    - 元素间距: `gap-4` (16px)
    - 内部内边距: `p-6` (24px) 用于卡片

---

## 2. 交互范式

### 2.1 按钮
所有按钮必须提供即时、触觉般的反馈。

- **Hover (悬停)**:
    - 轻微上浮: `translate-y-[-1px]`
    - 阴影扩散: `shadow-lg`
    - 亮度提升: `brightness-105`
- **Active (按压)**:
    - 缩小: `scale-[0.98]`
    - 重置阴影: `shadow-sm`
- **Focus (聚焦)**:
    - 可见光环: `ring-2 ring-brand-primary/50 ring-offset-2`

### 2.2 卡片 (画廊/内容)
可交互卡片应具有物理感。

- **Hover**:
    - 放大: `scale-[1.02]`
    - 阴影增强: `shadow-xl`
    - **手电筒特效**: 跟随光标的微妙径向渐变（推荐用于提升品质感）。

### 2.3 输入框
- **默认**: 灰色边框 `border-gray-200`，背景 `surface-muted`。
- **聚焦**: 白色背景，品牌色边框 `border-brand-primary`，微妙光环。
- **错误**: 红色边框 `border-status-error`，提交时震动动画。
- **Toast**: 
    - 成功: `bg-green-50` + 绿色图标
    - 错误: `bg-red-50` + 红色图标
    - 警告: `bg-yellow-50` + 黄色图标
- **Skeleton**: 灰色脉冲动画 `animate-pulse bg-gray-200`。

---

## 3. 动画规范

### 3.1 时间 Token
| Token | 时长 | 缓动曲线 | 用途 |
|-------|------|----------|------|
| **Fast** | `150ms` | `ease-out` | 悬停状态，微交互 |
| **Normal** | `300ms` | `cubic-bezier(0.4, 0, 0.2, 1)` | 模态框，页面过渡，卡片展开 |
| **Slow** | `500ms` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | 复杂入场，布局变换 |
| **Deliberate** | `1000ms+` | `linear` / `ease-in-out` | 背景循环，“显影”照片特效 |

### 3.2 入场动画
元素不应只是“出现”，而应“登场”。

- **Fade Up (上浮淡入)**: `opacity-0 translate-y-4` -> `opacity-100 translate-y-0`
- **Scale In (缩放进入)**: `opacity-0 scale-95` -> `opacity-100 scale-100` (最适合模态框/弹窗)
- **Stagger (交错)**: 展示列表（如画廊）时，每项延迟 `50ms` * index。

### 3.3 离场动画
- **Fade Out (淡出)**: `opacity-0`
- **Scale Out (缩放退出)**: `scale-95 opacity-0`
- **Swipe Away (滑动消失)**: 用于 Toast，滑向最近的边缘。

### 3.4 特效
- **Border Beam (流光边框)**: 主要“行动号召”按钮的移动渐变边框。
- **Shimmer (微光)**: 加载骨架屏应有对角线微光效果。
- **Confetti (彩带)**: 用于重大成功操作（如“照片已保存”）。

---

## 4. 实现指南

1.  **使用 Tailwind**: 优先使用工具类而非自定义 CSS。
2.  **组件优先**: 将样式封装在可复用组件 (`<Button>`, `<Card>`) 中，而不是重复写类名。
3.  **减弱动态**: 尊重 `prefers-reduced-motion` 媒体查询，禁用大幅度运动。
4.  **深色模式**: 为所有语义颜色定义深色模式 Token（如 `dark:bg-gray-900`）（面向未来）。
