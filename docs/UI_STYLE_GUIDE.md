# UI 风格指南

> **InstaGen Polaroid 视觉设计系统 v2.0**
>
> *温暖，现代，优雅，流畅*

## 1. 设计 Token

### 1.1 颜色
代码中应使用语义化颜色名称以确保一致性。

| Token 名称 | 色值 | Tailwind 类名 | 用途 |
|------------|------|---------------|------|
| **Brand Primary (品牌主色)** | `#E76F51` | `bg-brand-primary` / `text-brand-primary` | 主要操作，激活状态，图标 |
| **Brand Secondary (品牌次色)** | `#F4A261` | `bg-brand-secondary` | 渐变，强调 |
| **Brand Accent (品牌装饰色)** | `#FFB5BA` | `bg-brand-accent` | 装饰元素，选中状态 |
| **Surface Muted (柔和背景)** | `#F5F5F4` | `bg-surface-muted` | 页面背景，次要背景 |
| **Surface Card (卡片背景)** | `#FFFFFF` | `bg-surface-card` / `bg-white` | 卡片，输入框 |
| **Surface Modal (模态背景)** | `#FFFFFF` | `bg-surface-modal` | 模态框，抽屉背景 |
| **Text Main (主要文字)** | `#1F2937` | `text-text-main` | 标题，主要内容 |
| **Text Muted (次要文字)** | `#6B7280` | `text-text-muted` | 副标题，占位符，图标 |
| **Border Default (默认边框)** | `#E5E5E5` | `border-border-default` | 卡片边框，分割线 |
| **Status Success (状态成功)** | `#10B981` | `text-status-success` | 成功消息 |
| **Status Error (状态错误)** | `#EF4444` | `text-status-error` | 错误消息，删除操作 |

### 1.2 排版
**字体家族**:
- 正文/UI: `system-ui`, `-apple-system`, sans-serif
- 标题/装饰: `Comic Sans MS`, `Chalkboard SE` (仅用于应用名称)

**字号阶梯**:
- **H1**: `text-2xl` (24px) font-bold
- **H2**: `text-xl` (20px) font-bold
- **H3**: `text-lg` (18px) font-semibold
- **Body**: `text-base` (16px) / `text-sm` (14px)
- **Caption**: `text-xs` (12px) font-medium

### 1.3 圆角与阴影
- **圆角**:
    - `rounded-full`: 按钮（药丸形）、头像、控件
    - `rounded-xl` (12px): 卡片内部元素、输入框、小按钮
    - `rounded-2xl` (16px): 卡片、面板
    - `rounded-3xl` (24px): 模态框（已弃用，改用抽屉）
- **阴影**:
    - `shadow-sm`: 默认控件
    - `shadow-md`: hover 状态
    - `shadow-lg`: 激活状态
    - `shadow-2xl`: 模态框、抽屉

### 1.4 毛玻璃效果
现代 UI 的核心视觉特征：
- **控件背景**: `bg-white/80 backdrop-blur-md`
- **Header 背景**: `bg-white/80 backdrop-blur-xl`
- **卡片背景**: `bg-white/80 backdrop-blur-md`
- **边框**: `border border-white/50`

---

## 2. 布局模式

### 2.1 右侧抽屉 (Side Drawer)
用于：My Photos、Public Gallery、Settings

**特征**：
- 从右侧滑入
- 响应式宽度：
  - 移动端：全屏
  - sm: 480-520px
  - md: 520-640px
  - lg: 640-800px
- 遮罩：`bg-black/30 backdrop-blur-sm`
- 动画曲线：`ease-[cubic-bezier(0.32,0.72,0,1)]`（Apple 风格）
- ESC 键 + 点击遮罩关闭

**Header 结构**：
```tsx
<div className="px-4 md:px-6 py-4 border-b border-border-default/50 bg-white/80 backdrop-blur-xl">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-brand-primary/10">
        <Icon className="w-5 h-5 text-brand-primary" />
      </div>
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
    <button className="p-2 rounded-full bg-black/5 hover:bg-black/10">
      <X />
    </button>
  </div>
</div>
```

### 2.2 居中模态框 (Modal)
用于：Login Modal

**特征**：
- 居中显示
- 缩放 + 淡入动画
- 背景模糊遮罩
- 弹性缓动曲线：`cubic-bezier(0.34,1.56,0.64,1)`

---

## 3. 交互范式

### 3.1 按钮

#### 药丸形按钮 (Pill Buttons)
所有顶部控件统一使用 `rounded-full`：
```tsx
className="
  flex items-center gap-2 px-3 py-2
  bg-white/80 backdrop-blur-md
  rounded-full
  border border-white/50
  shadow-sm hover:shadow-md
  hover:-translate-y-0.5 active:translate-y-0
  transition-all duration-200
"
```

#### 主按钮 (Primary Button)
```tsx
className="
  px-4 py-2
  bg-gradient-to-r from-brand-primary to-brand-secondary
  text-white font-medium rounded-full
  shadow-sm hover:shadow-md
  hover:-translate-y-0.5 active:translate-y-0
  transition-all duration-200
"
```

#### 次要按钮 (Secondary Button)
```tsx
className="
  px-3 py-2
  bg-surface-muted border border-border-default
  rounded-lg hover:bg-white
  transition-all
"
```

### 3.2 输入框

#### 浮动标签输入框 (Floating Label Input)
- 空状态：标签在框内居中
- 聚焦/有值：标签缩小浮动到左上角
- 聚焦边框：品牌色 + 光环效果

```tsx
<div className="relative">
  <input className="pt-5 pb-2 px-4" />
  <label className={`
    absolute left-4 transition-all
    ${isFloating ? 'top-1.5 text-[10px]' : 'top-1/2 -translate-y-1/2'}
  `} />
</div>
```

### 3.3 图标容器
统一使用圆角方块背景：
```tsx
<div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
  <Icon className="w-4 h-4 text-brand-primary" />
</div>
```

### 3.4 用户头像
```tsx
// 登录后头像按钮（药丸形）
<button className="
  flex items-center gap-2 p-1 pr-2
  bg-white/80 backdrop-blur-md
  rounded-full
  border border-white/50
">
  <div className="w-8 h-8 rounded-full">
    {/* Avatar */}
  </div>
  <ChevronDown />
</button>

// 头像 + 在线状态
<div className="relative">
  <img className="w-8 h-8 rounded-full" />
  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
</div>
```

---

## 4. 动画规范

### 4.1 时间与曲线

| 用途 | 时长 | 缓动曲线 |
|------|------|----------|
| 微交互 (hover) | `200ms` | `ease-out` |
| 模态框/抽屉 | `350ms` | `cubic-bezier(0.32,0.72,0,1)` (Apple) |
| 弹性动画 | `350ms` | `cubic-bezier(0.34,1.56,0.64,1)` (Spring) |
| 模式切换 | `200ms` | `ease-out` |

### 4.2 入场动画

#### 抽屉滑入
```tsx
className={`
  transition-transform duration-350 ease-[cubic-bezier(0.32,0.72,0,1)]
  ${isVisible ? 'translate-x-0' : 'translate-x-full'}
`}
```

#### 模态框弹入
```tsx
className={`
  transition-all duration-350 ease-[cubic-bezier(0.34,1.56,0.64,1)]
  ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-8'}
`}
```

#### 内容交错入场
```tsx
{sections.map((section, i) => (
  <section
    className={`transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    style={{ transitionDelay: `${i * 100}ms` }}
  />
))}
```

#### 照片卡片交错
```tsx
{photos.map((photo, index) => (
  <div
    className={`transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    style={{ transitionDelay: `${Math.min(index * 50, 400)}ms` }}
  />
))}
```

### 4.3 Hover 微动效

#### 上浮效果
```tsx
hover:-translate-y-0.5 active:translate-y-0
```

#### 缩放效果
```tsx
hover:scale-110 active:scale-95
```

#### 图标动画
```tsx
// 邮件图标
group-hover:scale-110

// 箭头图标
group-hover:translate-y-0.5  // 下移
group-hover:-translate-x-0.5 // 左移
```

---

## 5. 色彩应用规范

### 5.1 图标颜色
- **品牌操作**: `text-brand-primary` (My Photos, Settings, Public Gallery)
- **危险操作**: `text-status-error` (Logout, Delete)
- **中性操作**: `text-text-muted`

### 5.2 状态颜色
- **成功**: `text-status-success` / `bg-status-success/10`
- **错误**: `text-status-error` / `bg-status-error/10`
- **警告**: `text-yellow-600` / `bg-yellow-50`
- **信息**: `text-brand-primary` / `bg-brand-primary/10`

### 5.3 渐变应用
```tsx
// 主按钮
bg-gradient-to-r from-brand-primary to-brand-secondary

// 标题文字
bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent

// Logo 容器 (已弃用)
bg-gradient-to-br from-brand-primary to-brand-secondary
```

---

## 6. 响应式设计

### 6.1 断点
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px

### 6.2 间距
- 移动端：`p-4`, `gap-2`
- 桌面端：`md:p-6`, `md:gap-3`

### 6.3 抽屉宽度
```tsx
w-full sm:w-[480px] md:w-[560px] lg:w-[640px]
```

---

## 7. 可访问性

### 7.1 键盘导航
- ESC 键关闭模态框/抽屉
- Tab 键聚焦顺序合理
- Enter 键提交表单

### 7.2 焦点状态
```tsx
focus:outline-none focus:ring-2 focus:ring-brand-primary/20
```

### 7.3 禁用状态
```tsx
disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
```

---

## 8. 实现清单

使用本指南时的检查项：

- [ ] 所有按钮使用 `rounded-full` (顶部控件) 或 `rounded-xl` (表单)
- [ ] 抽屉使用 Apple 风格缓动曲线
- [ ] 毛玻璃效果：`backdrop-blur-md` + `bg-white/80`
- [ ] 图标容器统一样式：`bg-brand-primary/10` + `text-brand-primary`
- [ ] Hover 动效：上浮 + 阴影增强
- [ ] 交错入场动画：每项延迟 50-100ms
- [ ] 语义化颜色变量：`text-text-main`, `bg-surface-muted`
- [ ] 用户不可选中：`select-none`, `pointer-events-none`
- [ ] 响应式布局测试：移动端 + 桌面端

---

## 9. 变更日志

### v2.0 (Phase 8 - UI/UX 全面优化)
- 统一右侧抽屉设计模式 (My Photos, Public Gallery, Settings)
- 登录弹窗 OAuth 优先 + 浮动标签输入框
- 所有控件改为药丸形 `rounded-full`
- 引入毛玻璃效果 (`backdrop-blur`)
- 统一品牌色图标容器样式
- Apple 风格动画曲线
- 相机位置下调 100px，照片出场位置优化

### v1.0 (Phase 1-7)
- 初始设计系统
- 温暖复古风格
- 基础组件库
