# UI 风格指南

> InstaGen Polaroid 视觉设计规范 - 可爱活泼风格

## 设计理念

InstaGen 的视觉风格融合了 **复古拍立得** 的怀旧感与 **现代可爱** 的活泼气质。整体呈现温暖、友好、有趣的用户体验。

### 关键词
- 温暖 (Warm)
- 可爱 (Cute)
- 活泼 (Playful)
- 复古 (Retro)
- 简洁 (Clean)

---

## 色彩系统

### 主色调

| 名称 | 色值 | 用途 | 预览 |
|------|------|------|------|
| **珊瑚红** | `#E76F51` | 主按钮、强调色 | 🟠 |
| **橙黄色** | `#F4A261` | 次要强调、渐变 | 🟡 |
| **樱花粉** | `#FFB5BA` | 强调装饰、hover | 🩷 |

### 功能色

| 名称 | 色值 | 用途 |
|------|------|------|
| **薄荷绿** | `#95D5B2` | 成功状态 |
| **柠檬黄** | `#FFE066` | 警告状态 |
| **玫瑰红** | `#E63946` | 错误状态 |
| **天空蓝** | `#74C0FC` | 信息提示 |

### 中性色

| 名称 | 色值 | 用途 |
|------|------|------|
| **暖白色** | `#FDF8F5` | 主背景 |
| **米白色** | `#F5F5F4` | 次要背景 |
| **浅灰色** | `#E5E5E5` | 边框、分割线 |
| **中灰色** | `#9CA3AF` | 次要文字 |
| **深灰色** | `#374151` | 主要文字 |
| **纯黑色** | `#1F2937` | 标题文字 |

### CSS 变量定义

```css
:root {
  /* 主色调 */
  --color-primary: #E76F51;
  --color-secondary: #F4A261;
  --color-accent: #FFB5BA;

  /* 功能色 */
  --color-success: #95D5B2;
  --color-warning: #FFE066;
  --color-error: #E63946;
  --color-info: #74C0FC;

  /* 中性色 */
  --color-bg-primary: #FDF8F5;
  --color-bg-secondary: #F5F5F4;
  --color-border: #E5E5E5;
  --color-text-secondary: #9CA3AF;
  --color-text-primary: #374151;
  --color-text-heading: #1F2937;
}
```

---

## 字体系统

### 字体家族

```css
fontFamily: {
  /* 主文本 - 现代无衬线 */
  sans: ['Inter', 'system-ui', 'sans-serif'],

  /* 手写风格 - 用于标题、标签 */
  hand: ['Comic Sans MS', 'Chalkboard SE', 'Marker Felt', 'sans-serif'],
}
```

### 字号规范

| 名称 | 大小 | 用途 |
|------|------|------|
| `text-xs` | 12px | 辅助信息、标签 |
| `text-sm` | 14px | 次要文字、按钮 |
| `text-base` | 16px | 正文内容 |
| `text-lg` | 18px | 小标题 |
| `text-xl` | 20px | 中标题 |
| `text-2xl` | 24px | 大标题 |
| `text-3xl` | 30px | 页面标题 |

### 字重

| 名称 | 值 | 用途 |
|------|-----|------|
| `font-normal` | 400 | 正文 |
| `font-medium` | 500 | 按钮文字 |
| `font-semibold` | 600 | 小标题 |
| `font-bold` | 700 | 大标题、强调 |

---

## 圆角规范

InstaGen 使用大圆角设计，营造柔和可爱的视觉感受。

| 名称 | 值 | 用途 |
|------|-----|------|
| `rounded` | 4px | 小元素 |
| `rounded-lg` | 8px | 输入框 |
| `rounded-xl` | 12px | 卡片、按钮 |
| `rounded-2xl` | 16px | 面板 |
| `rounded-3xl` | 24px | Modal、大卡片 |
| `rounded-full` | 9999px | 圆形按钮、头像 |

---

## 阴影系统

### 标准阴影

```css
/* 浅阴影 - 卡片悬浮 */
shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);

/* 中阴影 - 普通卡片 */
shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

/* 深阴影 - Modal */
shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

/* 超大阴影 - 浮层 */
shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

### 彩色阴影 (可爱风格特色)

```css
/* 粉色阴影 - 主要按钮 */
shadow-pink: 0 4px 14px rgba(255, 181, 186, 0.4);

/* 橙色阴影 - 强调元素 */
shadow-orange: 0 4px 14px rgba(231, 111, 81, 0.3);

/* 绿色阴影 - 成功状态 */
shadow-green: 0 4px 14px rgba(149, 213, 178, 0.4);
```

---

## 动画系统

### 转场动画

```css
/* 默认过渡 */
transition-all duration-200 ease-in-out

/* 快速过渡 */
transition-all duration-150 ease-out

/* 弹性过渡 */
transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
```

### 自定义动画

```css
/* 照片弹出 */
@keyframes eject {
  0% { transform: translateY(100px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

/* 照片显影 */
@keyframes develop {
  0% { filter: blur(10px) grayscale(1); }
  100% { filter: blur(0) grayscale(0); }
}

/* 心跳脉冲 */
@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* 摇晃 */
@keyframes wiggle {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

/* 浮动 */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
```

---

## 组件样式

### 按钮 (Button)

#### 主要按钮
```jsx
<button className="
  px-6 py-3
  bg-gradient-to-r from-[#E76F51] to-[#F4A261]
  text-white font-medium
  rounded-xl
  shadow-md hover:shadow-lg
  transform hover:scale-105
  transition-all duration-200
">
  主要操作
</button>
```

#### 次要按钮
```jsx
<button className="
  px-6 py-3
  bg-white
  border-2 border-[#E5E5E5]
  text-[#374151] font-medium
  rounded-xl
  hover:border-[#E76F51] hover:text-[#E76F51]
  transition-all duration-200
">
  次要操作
</button>
```

#### 可爱按钮 (带装饰)
```jsx
<button className="
  px-6 py-3
  bg-[#FFB5BA]
  text-white font-medium
  rounded-full
  shadow-pink
  hover:bg-[#FF9AA2]
  transform hover:scale-105 active:scale-95
  transition-all duration-200
">
  ✨ 可爱按钮
</button>
```

#### 图标按钮
```jsx
<button className="
  w-12 h-12
  rounded-full
  bg-white/80 backdrop-blur-sm
  border border-white/20
  shadow-md
  flex items-center justify-center
  hover:bg-white hover:shadow-lg
  transform hover:scale-110
  transition-all duration-200
">
  <Icon className="w-5 h-5 text-[#374151]" />
</button>
```

### 输入框 (Input)

```jsx
<input className="
  w-full px-4 py-3
  bg-white
  border-2 border-[#E5E5E5]
  rounded-xl
  text-[#374151]
  placeholder:text-[#9CA3AF]
  focus:border-[#E76F51] focus:ring-2 focus:ring-[#E76F51]/20
  transition-all duration-200
  outline-none
" />
```

### 卡片 (Card)

```jsx
<div className="
  p-6
  bg-white
  rounded-2xl
  shadow-md
  border border-[#E5E5E5]/50
  hover:shadow-lg
  transition-all duration-200
">
  {/* 内容 */}
</div>
```

### Modal 弹窗

```jsx
{/* 遮罩层 */}
<div className="
  fixed inset-0 z-50
  bg-black/50 backdrop-blur-sm
  flex items-center justify-center
  p-4
">
  {/* Modal 主体 */}
  <div className="
    w-full max-w-md
    bg-[#FDF8F5]
    rounded-3xl
    shadow-2xl
    overflow-hidden
    animate-in zoom-in-95 duration-200
  ">
    {/* 头部 */}
    <div className="
      px-6 py-4
      bg-gradient-to-r from-[#E76F51]/10 to-[#F4A261]/10
      border-b border-[#E5E5E5]
    ">
      <h2 className="text-xl font-bold text-[#1F2937]">
        标题
      </h2>
    </div>

    {/* 内容 */}
    <div className="p-6">
      {/* ... */}
    </div>

    {/* 底部 */}
    <div className="
      px-6 py-4
      bg-[#F5F5F4]
      border-t border-[#E5E5E5]
      flex justify-end gap-3
    ">
      <button>取消</button>
      <button>确认</button>
    </div>
  </div>
</div>
```

### 用户头像

```jsx
{/* 有头像 */}
<div className="
  w-10 h-10
  rounded-full
  overflow-hidden
  ring-2 ring-[#FFB5BA]
  ring-offset-2
">
  <img src={avatarUrl} className="w-full h-full object-cover" />
</div>

{/* 无头像 - 显示首字母 */}
<div className="
  w-10 h-10
  rounded-full
  bg-gradient-to-br from-[#E76F51] to-[#F4A261]
  flex items-center justify-center
  text-white font-bold
  ring-2 ring-white
">
  U
</div>
```

### 下拉菜单

```jsx
<div className="
  absolute right-0 top-full mt-2
  w-48
  bg-white
  rounded-xl
  shadow-xl
  border border-[#E5E5E5]
  overflow-hidden
  animate-in slide-in-from-top-2 duration-200
">
  <button className="
    w-full px-4 py-3
    text-left text-[#374151]
    hover:bg-[#FDF8F5]
    transition-colors
    flex items-center gap-3
  ">
    <Icon className="w-5 h-5" />
    菜单项
  </button>
</div>
```

---

## 装饰元素

### 波点背景

```jsx
<div style={{
  backgroundImage: `
    radial-gradient(circle, #FFB5BA 1.5px, transparent 1.5px),
    radial-gradient(circle, #F4A261 1px, transparent 1px)
  `,
  backgroundSize: '30px 30px, 20px 20px',
  backgroundPosition: '0 0, 10px 10px',
}} />
```

### 可爱图标/表情

推荐在以下场景使用表情符号增添活泼感：

| 场景 | 推荐图标 |
|------|----------|
| 成功提示 | ✨ 🎉 💫 |
| 拍照 | 📸 🎞️ |
| 保存 | 💾 ✅ |
| 删除 | 🗑️ |
| 设置 | ⚙️ |
| 用户 | 👤 😊 |
| 警告 | ⚠️ 💡 |
| 爱心/收藏 | ❤️ 💖 |

### 装饰性元素

```jsx
{/* 星星装饰 */}
<span className="absolute -top-1 -right-1 text-[#FFE066] animate-pulse">
  ✨
</span>

{/* 爱心装饰 */}
<span className="absolute -bottom-2 -left-2 text-[#FFB5BA]">
  💖
</span>
```

---

## 响应式断点

| 断点 | 宽度 | 用途 |
|------|------|------|
| `sm` | 640px | 大手机 |
| `md` | 768px | 平板 |
| `lg` | 1024px | 笔记本 |
| `xl` | 1280px | 桌面 |

### 常用响应式模式

```jsx
{/* 网格布局 */}
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

{/* 隐藏/显示 */}
<div className="hidden md:block">仅桌面显示</div>

{/* 尺寸调整 */}
<div className="w-full md:w-1/2 lg:w-1/3">
```

---

## 无障碍设计

1. **对比度**: 文字与背景对比度 ≥ 4.5:1
2. **焦点状态**: 所有可交互元素有明显的 focus 样式
3. **触摸区域**: 可点击元素最小 44x44px
4. **动画**: 支持 `prefers-reduced-motion` 媒体查询

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```
