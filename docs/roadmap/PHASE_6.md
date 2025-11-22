# Phase 6: 照片库 UI/UX 优化

> 版本: v1.6.0 | 状态: 📋 待开发 | 依赖: Phase 5

## 目标

优化照片库的用户体验：响应式适配、加载状态、操作反馈、交互细节。

## 核心功能

- [ ] 移动端搜索适配
- [ ] 排序功能
- [ ] 加载骨架屏
- [ ] Toast 通知系统
- [ ] 分享确认弹窗
- [ ] 空状态优化
- [ ] 字体修复

## 前置条件

- ✅ Phase 5 完成（照片库增强）

## 任务清单

### 任务 6.1: 移动端搜索适配
**状态**: 📋 待开发

**目标**: 让搜索功能在移动端可用

**修改文件**: `src/components/gallery/MyGallery.tsx`

**方案**: 折叠式搜索栏

**UI 设计**:
```
桌面端（保持现状）:
┌─────────────────────────────────────────────────────────┐
│  ←  我的照片库 (24)        [🔍 Search...]  [全部|公开|私密] │
└─────────────────────────────────────────────────────────┘

移动端（新增搜索图标）:
┌─────────────────────────────────────────────────────────┐
│  ←  我的照片库 (24)                            🔍  ≡    │
└─────────────────────────────────────────────────────────┘
点击 🔍 展开搜索栏:
┌─────────────────────────────────────────────────────────┐
│  [🔍 搜索照片...                                    ×]  │
└─────────────────────────────────────────────────────────┘
```

**实现**:
```tsx
const [showMobileSearch, setShowMobileSearch] = useState(false);

// 移动端搜索图标
<button
  className="md:hidden p-2 hover:bg-gray-100 rounded-full"
  onClick={() => setShowMobileSearch(true)}
>
  <Search className="w-5 h-5" />
</button>

// 移动端搜索栏（展开时）
{showMobileSearch && (
  <div className="md:hidden absolute inset-x-0 top-0 bg-white p-4 shadow-md z-10">
    <div className="flex items-center gap-2">
      <Search className="w-5 h-5 text-gray-400" />
      <input
        autoFocus
        type="text"
        placeholder={t.searchPlaceholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1 outline-none"
      />
      <button onClick={() => setShowMobileSearch(false)}>
        <X className="w-5 h-5" />
      </button>
    </div>
  </div>
)}
```

**验收标准**:
- [ ] 移动端显示搜索图标
- [ ] 点击展开搜索输入框
- [ ] 搜索功能正常工作
- [ ] 可关闭搜索栏

---

### 任务 6.2: 排序功能
**状态**: 📋 待开发

**目标**: 支持按时间排序照片

**修改文件**: `src/components/gallery/MyGallery.tsx`

**UI 设计**:
```
筛选栏增加排序下拉:
┌──────────────────────────────────────────────────────┐
│  [全部|公开|私密]                    排序: [最新优先 ▼] │
└──────────────────────────────────────────────────────┘

下拉选项:
┌─────────────┐
│ 最新优先  ✓ │
│ 最早优先    │
└─────────────┘
```

**实现**:
```tsx
type SortOrder = 'newest' | 'oldest';
const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

const sortedPhotos = useMemo(() => {
  const filtered = [...filteredPhotos];
  return filtered.sort((a, b) => {
    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();
    return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
  });
}, [filteredPhotos, sortOrder]);
```

**验收标准**:
- [ ] 默认最新优先
- [ ] 可切换排序方式
- [ ] 列表实时更新

---

### 任务 6.3: 加载骨架屏
**状态**: 📋 待开发

**目标**: 加载时显示 Polaroid 风格骨架屏

**新建文件**: `src/components/gallery/PhotoCardSkeleton.tsx`

**UI 设计**:
```
┌─────────────────┐
│ ░░░░░░░░░░░░░░░ │  ← 图片区域闪烁
│ ░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░ │
│                 │
│   ░░░░░░░░░     │  ← 标题区域
│   ░░░░░░░       │  ← 日期区域
└─────────────────┘
```

**实现**:
```tsx
export const PhotoCardSkeleton: React.FC = () => (
  <div className="bg-white p-3 pb-12 shadow-md animate-pulse">
    {/* 图片占位 */}
    <div className="aspect-square bg-gray-200 rounded" />
    {/* 标题占位 */}
    <div className="mt-4 mx-auto w-2/3 h-4 bg-gray-200 rounded" />
    {/* 日期占位 */}
    <div className="mt-2 mx-auto w-1/2 h-3 bg-gray-100 rounded" />
  </div>
);

// 在 MyGallery 中使用
{loading ? (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <PhotoCardSkeleton key={i} />
    ))}
  </div>
) : (
  // 正常渲染
)}
```

**验收标准**:
- [ ] 加载时显示骨架屏
- [ ] 骨架屏有闪烁动画
- [ ] 风格与卡片一致

---

### 任务 6.4: Toast 通知系统
**状态**: 📋 待开发

**目标**: 操作成功/失败时显示 Toast 通知

**方案**: 轻量级实现，不引入第三方库

**新建文件**: `src/components/ui/Toast.tsx`

**类型定义**:
```typescript
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;  // 默认 3000ms
  onClose: () => void;
}
```

**UI 设计**:
```
成功: ┌─────────────────────────┐
      │ ✅ 照片已更新！         │
      └─────────────────────────┘

错误: ┌─────────────────────────┐
      │ ❌ 操作失败，请重试      │
      └─────────────────────────┘
```

**实现**:
```tsx
export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[type];

  const icon = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  }[type];

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200]
                     ${bgColor} text-white px-6 py-3 rounded-xl shadow-lg
                     animate-in slide-in-from-bottom-4 duration-300`}>
      <span className="mr-2">{icon}</span>
      {message}
    </div>
  );
};
```

**使用方式**:
```tsx
// 在 GalleryPhotoModal 中
const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

// 操作成功后
setToast({ message: t.updateSuccess, type: 'success' });

// 渲染
{toast && (
  <Toast
    message={toast.message}
    type={toast.type}
    onClose={() => setToast(null)}
  />
)}
```

**验收标准**:
- [ ] 保存成功显示绿色 Toast
- [ ] 操作失败显示红色 Toast
- [ ] 自动消失（3秒）
- [ ] 从底部滑入动画

---

### 任务 6.5: 分享确认弹窗
**状态**: 📋 待开发

**目标**: 分享到公共画廊前二次确认

**修改文件**: `src/components/gallery/GalleryPhotoModal.tsx`

**UI 设计**:
```
┌─────────────────────────────────────┐
│        分享到公共画廊？              │
├─────────────────────────────────────┤
│                                     │
│  分享后，所有人都可以看到这张照片。   │
│                                     │
│     [取消]          [确认分享]       │
└─────────────────────────────────────┘
```

**实现**:
```tsx
const [showShareConfirm, setShowShareConfirm] = useState(false);

// 分享按钮点击
const handleShareClick = () => {
  if (photo.is_public) {
    // 取消分享直接执行
    onUnshare();
  } else {
    // 分享需要确认
    setShowShareConfirm(true);
  }
};

// 确认弹窗
{showShareConfirm && (
  <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50">
    <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl">
      <h3 className="text-lg font-bold mb-2">{t.shareConfirmTitle}</h3>
      <p className="text-gray-600 mb-6">{t.shareConfirmMessage}</p>
      <div className="flex gap-3">
        <button
          onClick={() => setShowShareConfirm(false)}
          className="flex-1 py-2 border border-gray-200 rounded-xl"
        >
          {t.cancel}
        </button>
        <button
          onClick={() => {
            onShare();
            setShowShareConfirm(false);
          }}
          className="flex-1 py-2 bg-blue-500 text-white rounded-xl"
        >
          {t.confirmShare}
        </button>
      </div>
    </div>
  </div>
)}
```

**验收标准**:
- [ ] 分享前显示确认弹窗
- [ ] 取消分享不需要确认
- [ ] 确认后执行分享

---

### 任务 6.6: 空状态优化
**状态**: 📋 待开发

**目标**: 让空状态更活泼、有引导性

**修改文件**: `src/components/gallery/MyGallery.tsx`

**UI 设计**:
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                        📸                               │
│                                                         │
│              还没有保存任何照片                           │
│                                                         │
│         拍摄一张照片，点击保存按钮即可收藏               │
│                                                         │
│              ┌─────────────────────┐                    │
│              │   去拍照 →          │                    │
│              └─────────────────────┘                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**实现**:
```tsx
{filteredPhotos.length === 0 && !loading && (
  <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4 py-20">
    <div className="text-7xl animate-bounce">📸</div>
    <h3 className="text-xl font-bold text-gray-700">{t.noPhotosTitle}</h3>
    <p className="text-center max-w-xs">{t.noPhotosDescription}</p>
    <button
      onClick={onClose}
      className="mt-4 px-6 py-3 bg-gradient-to-r from-[#E76F51] to-[#F4A261]
                 text-white rounded-xl font-medium hover:shadow-lg transition-all"
    >
      {t.goTakePhoto} →
    </button>
  </div>
)}
```

**验收标准**:
- [ ] 空状态有引导文案
- [ ] 有"去拍照"按钮
- [ ] 点击按钮关闭画廊

---

### 任务 6.7: 手写字体修复
**状态**: 📋 待开发

**目标**: 确保 font-hand 字体正确生效

**检查项目**:
1. Tailwind 配置中是否定义了 `font-hand`
2. 字体是否正确加载

**修改文件**: `index.html` 或 `tailwind.config.js`

**方案 A**: 在 index.html 添加字体
```html
<style>
  .font-hand {
    font-family: 'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', cursive, sans-serif;
  }
</style>
```

**方案 B**: 使用 Google Fonts (可选)
```html
<link href="https://fonts.googleapis.com/css2?family=Caveat&display=swap" rel="stylesheet">
<style>
  .font-hand {
    font-family: 'Caveat', cursive;
  }
</style>
```

**验收标准**:
- [ ] 卡片标题使用手写字体
- [ ] 日期使用手写字体
- [ ] 中英文都能正常显示

---

### 任务 6.8: 按钮 Loading 状态
**状态**: 📋 待开发

**目标**: 操作中按钮显示 loading spinner

**修改文件**: `src/components/gallery/GalleryPhotoModal.tsx`

**涉及按钮**:
- 保存修改
- 下载卡片
- 分享/取消分享
- 删除

**实现**:
```tsx
// Loading 状态
const [savingChanges, setSavingChanges] = useState(false);
const [downloading, setDownloading] = useState(false);
const [sharing, setSharing] = useState(false);

// 按钮组件
<button
  disabled={savingChanges}
  onClick={handleSaveChanges}
  className="... disabled:opacity-50"
>
  {savingChanges ? (
    <>
      <Spinner className="w-4 h-4 mr-2 animate-spin" />
      {t.saving}
    </>
  ) : (
    t.saveChanges
  )}
</button>
```

**Spinner 组件**:
```tsx
const Spinner = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);
```

**验收标准**:
- [ ] 所有操作按钮有 loading 状态
- [ ] loading 时按钮禁用
- [ ] 有 spinner 动画

---

### 任务 6.9: 翻译文本补充
**状态**: 📋 待开发

**目标**: 添加 Phase 6 新增功能的翻译

**修改文件**: `constants.ts`

**新增翻译**:
```typescript
// English
{
  searchPlaceholder: 'Search photos...',
  sortNewest: 'Newest first',
  sortOldest: 'Oldest first',
  noPhotosTitle: 'No photos yet',
  noPhotosDescription: 'Take a photo and tap save to add it to your collection',
  goTakePhoto: 'Take a photo',
  shareConfirmTitle: 'Share to public gallery?',
  shareConfirmMessage: 'Once shared, everyone can see this photo.',
  confirmShare: 'Share',
  saving: 'Saving...',
}

// Chinese
{
  searchPlaceholder: '搜索照片...',
  sortNewest: '最新优先',
  sortOldest: '最早优先',
  noPhotosTitle: '还没有照片',
  noPhotosDescription: '拍摄一张照片，点击保存按钮即可收藏',
  goTakePhoto: '去拍照',
  shareConfirmTitle: '分享到公共画廊？',
  shareConfirmMessage: '分享后，所有人都可以看到这张照片。',
  confirmShare: '确认分享',
  saving: '保存中...',
}
```

**验收标准**:
- [ ] 所有新文本有中英翻译
- [ ] 无硬编码文本

---

## 文件创建清单

| 文件路径 | 任务 | 说明 |
|----------|------|------|
| `src/components/gallery/PhotoCardSkeleton.tsx` | 6.3 | 骨架屏组件 |
| `src/components/ui/Toast.tsx` | 6.4 | Toast 通知组件 |

## 修改文件清单

| 文件路径 | 任务 | 修改内容 |
|----------|------|----------|
| `src/components/gallery/MyGallery.tsx` | 6.1, 6.2, 6.3, 6.6 | 移动端搜索、排序、骨架屏、空状态 |
| `src/components/gallery/GalleryPhotoModal.tsx` | 6.4, 6.5, 6.8 | Toast、分享确认、Loading |
| `index.html` | 6.7 | 手写字体样式 |
| `constants.ts` | 6.9 | 翻译文本 |

## 完成标准

Phase 6 完成的标志：
- [ ] 移动端可以搜索照片
- [ ] 可以切换排序方式
- [ ] 加载时显示骨架屏
- [ ] 操作有 Toast 反馈
- [ ] 分享有确认弹窗
- [ ] 空状态有引导
- [ ] 手写字体正常显示
- [ ] 按钮有 Loading 状态
