# Phase 5: 照片库增强

> 版本: v1.5.0 | 状态: ✅ 已完成 | 依赖: Phase 2

## 目标

完善个人照片库体验：照片卡片完整渲染（Frame Style + Card Effect）、支持 Magic Edit 编辑、下载完整卡片图片。

## 问题分析

当前照片库存在以下问题：

| 问题 | 现状 | 期望 |
|------|------|------|
| 卡片渲染 | 仅显示原图 `<img>` | 显示完整 PolaroidFrame + PokemonCard |
| 详情预览 | PhotoActions 显示原图 | 显示完整卡片视图 |
| 下载功能 | 下载原图 | 下载渲染后的卡片图片 |
| 编辑功能 | 不支持 | 复用 PhotoModal 的 Magic Edit |
| 保存编辑 | 不支持 | 更新数据库中的照片 |

## 核心功能

- [x] 照片库卡片完整渲染
- [x] 详情页卡片视图预览
- [x] 卡片截图下载
- [x] Magic Edit 编辑功能
- [x] 编辑后保存/更新

## 前置条件

- ✅ Phase 2 完成 (个人照片库)
- ✅ PolaroidFrame 组件可用
- ✅ PokemonCard 组件可用
- ✅ PhotoModal 编辑逻辑可复用

## 任务清单

### 任务 5.1: PhotoCard 缩略图组件
**状态**: ✅ 已完成

**目标**: 创建可复用的照片卡片缩略图组件

**文件**: `src/components/gallery/PhotoCard.tsx`

**Props**:
```typescript
interface PhotoCardProps {
  photo: SavedPhoto;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';  // 缩略图尺寸
  showStatus?: boolean;       // 显示公开/私密状态
  lang: Language;
}
```

**渲染逻辑**:
```
if (photo.pokemon_id) {
  return <PokemonCard><PolaroidFrame /></PokemonCard>
} else {
  return <PolaroidFrame />
}
```

**尺寸映射**:
| Size | PolaroidFrame Scale | 容器宽度 |
|------|---------------------|----------|
| sm | 0.25 | ~85px |
| md | 0.35 | ~120px |
| lg | 0.5 | ~170px |

**验收标准**:
- [x] 正确渲染 frame_style
- [x] 正确渲染 pokemon_id 特效
- [x] 响应式尺寸适配
- [x] 悬浮交互效果

---

### 任务 5.2: MyGallery 卡片渲染升级
**状态**: ✅ 已完成

**目标**: 使用 PhotoCard 替换简单 img 渲染

**修改文件**: `src/components/gallery/MyGallery.tsx`

**修改内容**:
```tsx
// Before
<img src={photo.data_url} className="..." />

// After
<PhotoCard
  photo={photo}
  size="md"
  onClick={() => setSelectedPhoto(photo)}
  showStatus={true}
  lang={lang}
/>
```

**布局调整**:
- 网格间距适配卡片尺寸
- 移除原有的 aspect-ratio 容器
- 调整 hover 效果（卡片自带阴影）

**验收标准**:
- [x] 所有照片正确显示相框风格
- [x] Pokemon 特效正常渲染
- [x] 网格布局美观
- [x] 性能无明显下降

---

### 任务 5.3: GalleryPhotoModal 编辑弹窗
**状态**: ✅ 已完成

**目标**: 创建照片库专用的编辑弹窗，复用 PhotoModal 逻辑

**文件**: `src/components/gallery/GalleryPhotoModal.tsx`

**Props**:
```typescript
interface GalleryPhotoModalProps {
  photo: SavedPhoto;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (photo: SavedPhoto) => void;  // 更新后回调
  onDelete: () => void;
  onLoginRequest: () => void;
  lang: Language;
}
```

**UI 布局**: 复用 PhotoModal 的双栏布局
```
┌─────────────────────────────────────────────────────────────┐
│                           ×                                  │
├──────────────────────────┬──────────────────────────────────┤
│                          │  编辑照片                         │
│                          │                                   │
│     [完整卡片预览]        │  相框风格: ○ ○ ○ ○               │
│     PolaroidFrame        │                                   │
│     + PokemonCard        │  卡片特效: □ □ □ □               │
│                          │                                   │
│                          │  Magic Edit [GEMINI]              │
│                          │  ┌────┐ ┌────┐ ┌────┐            │
│                          │  │    │ │    │ │    │            │
│                          │  └────┘ └────┘ └────┘            │
│                          │                                   │
│                          │  [自定义提示词输入...]            │
├──────────────────────────┼──────────────────────────────────┤
│                          │  [下载卡片] [保存修改]            │
│                          │  [分享/取消分享]                  │
│                          │  [删除照片]                       │
└──────────────────────────┴──────────────────────────────────┘
```

**复用 PhotoModal 的功能**:
- Frame Style 选择器
- Card Effect 选择器
- Magic Edit 预设选项
- 自定义 Prompt 输入
- 使用配额显示

**新增功能**:
- 保存修改（更新数据库）
- 下载卡片图片（截图）

**验收标准**:
- [x] 完整卡片预览正确
- [x] 所有编辑功能可用
- [x] Magic Edit 正常工作
- [x] 保存修改更新数据库

---

### 任务 5.4: photoService 更新方法
**状态**: ✅ 已完成

**目标**: 添加照片更新服务方法

**修改文件**: `src/services/photoService.ts`

**新增方法**:
```typescript
// 更新照片（编辑后保存）
updatePhoto(
  photoId: string,
  userId: string,
  updates: {
    data_url?: string;      // AI 编辑后的新图片
    caption?: string;       // 标题
    frame_style?: string;   // 相框风格
    pokemon_id?: string;    // 卡片特效
    prompt_used?: string;   // 使用的 AI 提示词
  }
): Promise<SavedPhoto>
```

**实现**:
```typescript
export const updatePhoto = async (
  photoId: string,
  userId: string,
  updates: Partial<SavedPhoto>
): Promise<SavedPhoto> => {
  const { data, error } = await supabase
    .from('user_photos')
    .update({
      data_url: updates.data_url,
      caption: updates.caption,
      frame_style: updates.frame_style,
      pokemon_id: updates.pokemon_id,
      prompt_used: updates.prompt_used,
    })
    .eq('id', photoId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

**验收标准**:
- [x] 更新方法正常工作
- [x] RLS 权限验证
- [x] 部分更新支持

---

### 任务 5.5: useMyPhotos Hook 扩展
**状态**: ✅ 已完成

**目标**: 添加照片更新能力

**修改文件**: `src/hooks/useMyPhotos.ts`

**新增返回值**:
```typescript
function useMyPhotos() {
  return {
    // ... 现有
    updatePhoto: (photoId: string, updates: Partial<SavedPhoto>) => Promise<SavedPhoto>;
  };
}
```

**实现**:
```typescript
const updatePhoto = async (photoId: string, updates: Partial<SavedPhoto>) => {
  if (!user) return;

  const updated = await photoService.updatePhoto(photoId, user.id, updates);
  setPhotos(prev => prev.map(p =>
    p.id === photoId ? updated : p
  ));
  return updated;
};
```

**验收标准**:
- [x] 更新后列表自动刷新
- [x] 状态同步正确

---

### 任务 5.6: 卡片截图下载
**状态**: ✅ 已完成

**目标**: 将渲染的卡片截图并下载

**方案**: 使用 html2canvas 库

**安装依赖**:
```bash
npm install html2canvas
```

**实现位置**: `src/components/gallery/GalleryPhotoModal.tsx`

**实现逻辑**:
```typescript
import html2canvas from 'html2canvas';

const handleDownloadCard = async () => {
  const cardRef = document.getElementById('gallery-card-preview');
  if (!cardRef) return;

  try {
    setIsDownloading(true);
    const canvas = await html2canvas(cardRef, {
      backgroundColor: null,
      scale: 2,  // 高清
      useCORS: true,
    });

    const link = document.createElement('a');
    link.download = `instagen-${photo.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error('Download failed:', err);
    alert(t.downloadError);
  } finally {
    setIsDownloading(false);
  }
};
```

**验收标准**:
- [x] 下载图片包含完整相框
- [x] 下载图片包含 Pokemon 特效
- [x] 图片质量清晰
- [x] 下载过程有 loading 状态

---

### 任务 5.7: PhotoActions 移除
**状态**: ✅ 已完成

**目标**: 用 GalleryPhotoModal 替换 PhotoActions

**修改文件**: `src/components/gallery/MyGallery.tsx`

**修改内容**:
```tsx
// Before
{selectedPhoto && (
  <PhotoActions
    photo={selectedPhoto}
    ...
  />
)}

// After
{selectedPhoto && (
  <GalleryPhotoModal
    photo={selectedPhoto}
    isOpen={!!selectedPhoto}
    onClose={() => setSelectedPhoto(null)}
    onUpdate={(updated) => {
      // 更新本地状态
    }}
    onDelete={async () => {
      await deletePhoto(selectedPhoto.id);
      setSelectedPhoto(null);
    }}
    onLoginRequest={onLoginRequest}
    lang={lang}
  />
)}
```

**验收标准**:
- [x] 所有原有功能保留
- [x] 新增编辑功能可用
- [x] UI 风格一致

---

### 任务 5.8: 翻译文本补充
**状态**: ✅ 已完成

**目标**: 添加新功能的翻译文本

**修改文件**: `constants.ts`

**新增翻译**:
```typescript
// English
{
  editPhoto: 'Edit Photo',
  saveChanges: 'Save Changes',
  downloadCard: 'Download Card',
  downloadingCard: 'Generating image...',
  updateSuccess: 'Photo updated!',
  updateError: 'Failed to update photo',
}

// Chinese
{
  editPhoto: '编辑照片',
  saveChanges: '保存修改',
  downloadCard: '下载卡片',
  downloadingCard: '正在生成图片...',
  updateSuccess: '照片已更新！',
  updateError: '更新照片失败',
}
```

**验收标准**:
- [x] 所有新文本有中英翻译
- [x] 无硬编码文本

---

## 文件创建清单

| 文件路径 | 任务 | 说明 |
|----------|------|------|
| `src/components/gallery/PhotoCard.tsx` | 5.1 | 缩略图卡片组件 |
| `src/components/gallery/GalleryPhotoModal.tsx` | 5.3 | 编辑弹窗组件 |

## 修改文件清单

| 文件路径 | 任务 | 修改内容 |
|----------|------|----------|
| `src/components/gallery/MyGallery.tsx` | 5.2, 5.7 | 使用 PhotoCard，替换 PhotoActions |
| `src/services/photoService.ts` | 5.4 | 添加 updatePhoto 方法 |
| `src/hooks/useMyPhotos.ts` | 5.5 | 添加 updatePhoto |
| `constants.ts` | 5.8 | 添加翻译文本 |
| `package.json` | 5.6 | 添加 html2canvas 依赖 |

## 可删除文件

| 文件路径 | 说明 |
|----------|------|
| `src/components/gallery/PhotoActions.tsx` | 被 GalleryPhotoModal 替代 |

## 用户流程

### 查看照片库
```
1. 用户点击头像 → 我的照片库
2. 照片以完整卡片形式展示
   - 显示相框风格 (classic/black/colorful/vintage)
   - 显示 Pokemon 特效 (如有)
   - 显示公开/私密状态图标
3. 悬浮卡片有轻微抬起效果
```

### 编辑照片
```
1. 点击照片卡片
2. 打开 GalleryPhotoModal
3. 左侧：完整卡片预览（实时更新）
4. 右侧：编辑选项
   - 切换相框风格 → 预览实时更新
   - 切换卡片特效 → 预览实时更新
   - 使用 Magic Edit → AI 处理 → 预览更新
5. 点击"保存修改" → 更新数据库
```

### 下载卡片
```
1. 在 GalleryPhotoModal 中点击"下载卡片"
2. 显示 loading 状态
3. html2canvas 截图卡片预览区域
4. 生成 PNG 并触发下载
5. 文件名: instagen-{photo.id}.png
```

## 技术注意事项

### 1. PolaroidFrame 缩放
- 使用 `scale` prop 控制尺寸
- 缩略图建议 scale=0.35（约 120px 宽）
- 详情预览使用 scale=1（340px 宽）

### 2. PokemonCard 嵌套
- PokemonCard 包裹 PolaroidFrame
- 确保特效层级正确
- 注意 CSS 动画性能

### 3. html2canvas 限制
- 需要 `useCORS: true` 处理跨域图片
- Pokemon 特效可能需要额外处理
- 建议 `scale: 2` 保证清晰度

### 4. 状态同步
- 编辑时使用本地状态预览
- 保存时才更新数据库
- 关闭弹窗时提示未保存更改

## 完成标准

Phase 5 完成的标志：
- [x] 照片库正确显示相框风格
- [x] 照片库正确显示卡片特效
- [x] 可以编辑已保存的照片
- [x] Magic Edit 对已保存照片可用
- [x] 下载的是完整卡片图片
- [x] 编辑后可保存更新
