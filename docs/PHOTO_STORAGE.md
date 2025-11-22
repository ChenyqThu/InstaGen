# 照片存储系统设计

> 用户照片库与公共画廊数据模型设计

## 概述

InstaGen 的照片存储分为两个层级：
1. **个人照片库** (`user_photos`) - 登录用户保存的私人照片
2. **公共画廊** (`public_photos`) - 用户分享的公开照片

## 数据模型

### PhotoData (前端类型)

```typescript
// types.ts

interface PhotoData {
  id: string;              // UUID
  x: number;               // 画布 X 坐标
  y: number;               // 画布 Y 坐标
  rotation: number;        // 旋转角度
  dataUrl: string;         // Base64 图片数据
  timestamp: number;       // 拍摄时间戳
  status: PhotoStatus;     // 状态
  frameStyle: PhotoFrameStyle;  // 相框风格
  promptUsed?: string;     // AI 编辑提示词
  caption?: string;        // 照片标题
  pokemonId?: string;      // Pokemon 特效 ID
  filterId?: string;       // Instagram 滤镜 ID
}

enum PhotoStatus {
  DEVELOPING = 'developing',  // 显影中
  DONE = 'done',             // 就绪
  EDITING = 'editing',       // AI 编辑中
}

enum PhotoFrameStyle {
  CLASSIC = 'classic',
  BLACK = 'black',
  COLORFUL = 'colorful',
  VINTAGE = 'vintage',
}
```

### user_photos (数据库表)

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

-- 索引
create index idx_user_photos_user_id on user_photos(user_id);
create index idx_user_photos_created_at on user_photos(created_at desc);

-- 启用 RLS
alter table user_photos enable row level security;

-- RLS 策略
create policy "Users can view own photos"
  on user_photos for select
  using (auth.uid() = user_id);

create policy "Users can insert own photos"
  on user_photos for insert
  with check (auth.uid() = user_id);

create policy "Users can update own photos"
  on user_photos for update
  using (auth.uid() = user_id);

create policy "Users can delete own photos"
  on user_photos for delete
  using (auth.uid() = user_id);
```

### public_photos (数据库表更新)

```sql
-- 修改现有表，添加用户关联字段
alter table public_photos
  add column user_id uuid references auth.users(id) on delete set null,
  add column source_photo_id uuid references user_photos(id) on delete set null;

-- 索引
create index idx_public_photos_user_id on public_photos(user_id);
```

## 照片生命周期

```
┌─────────────┐
│   拍摄      │
│  Camera     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  DEVELOPING │ ← 5秒显影动画
│  (前端状态)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    DONE     │ ← 可交互状态
│  (前端状态)  │
└──────┬──────┘
       │
       ├───────────────────┐
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│   编辑      │     │   保存      │
│  EDITING    │     │  (登录)     │
└──────┬──────┘     └──────┬──────┘
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│  Gemini AI  │     │ user_photos │
│  处理       │     │  (数据库)   │
└──────┬──────┘     └──────┬──────┘
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│    DONE     │     │   分享?     │
│  (更新图片)  │     └──────┬──────┘
└─────────────┘            │
                           ▼
                    ┌─────────────┐
                    │public_photos│
                    │  (公共画廊)  │
                    └─────────────┘
```

## 组件设计

### MyGallery (个人卡片库)

```typescript
// components/gallery/MyGallery.tsx

interface MyGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**UI 结构**:

```
┌─────────────────────────────────────────────────────────┐
│  ←  我的照片库                             筛选 ▼  🔍  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│    📸 共 24 张照片                                      │
│                                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │         │  │         │  │         │  │         │   │
│  │  照片1  │  │  照片2  │  │  照片3  │  │  照片4  │   │
│  │         │  │         │  │         │  │         │   │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │
│                                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │         │  │         │  │         │  │         │   │
│  │  照片5  │  │  照片6  │  │  照片7  │  │  照片8  │   │
│  │         │  │         │  │         │  │         │   │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │
│                                                         │
│                        ...                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**功能特性**:
- 网格展示所有个人照片
- 按时间/滤镜/相框筛选
- 点击查看大图
- 支持删除、下载、分享到公共画廊

### PhotoActions (照片操作菜单)

```typescript
// components/gallery/PhotoActions.tsx

interface PhotoActionsProps {
  photo: SavedPhoto;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
  onDownload: (photo: SavedPhoto) => void;
}
```

**菜单选项**:

```
┌─────────────────────┐
│  📥 下载            │
├─────────────────────┤
│  🌍 分享到画廊      │
├─────────────────────┤
│  🗑️ 删除           │
└─────────────────────┘
```

### SavePhotoButton (保存按钮)

在 PolaroidPhoto 组件上添加保存按钮。

```typescript
// 添加到 components/PolaroidPhoto.tsx

interface SavePhotoButtonProps {
  photo: PhotoData;
  onSave: (photo: PhotoData) => void;
}
```

**交互逻辑**:

```
点击保存按钮
      │
      ▼
┌─────────────┐
│  已登录?    │
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
  Yes      No
   │       │
   ▼       ▼
┌──────┐  ┌──────────┐
│ 保存 │  │ 显示登录  │
│ 成功 │  │ 弹窗     │
└──────┘  └──────────┘
```

## 服务层

### photoService

```typescript
// services/photoService.ts

import { supabase } from './supabaseClient';

// 类型定义
interface SavedPhoto {
  id: string;
  userId: string;
  dataUrl: string;
  caption?: string;
  frameStyle: string;
  filterId?: string;
  pokemonId?: string;
  promptUsed?: string;
  isPublic: boolean;
  createdAt: string;
}

// 保存照片到个人库
export const savePhoto = async (photo: PhotoData, userId: string): Promise<SavedPhoto> => {
  const { data, error } = await supabase
    .from('user_photos')
    .insert({
      user_id: userId,
      data_url: photo.dataUrl,
      caption: photo.caption,
      frame_style: photo.frameStyle,
      filter_id: photo.filterId,
      pokemon_id: photo.pokemonId,
      prompt_used: photo.promptUsed,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// 获取用户所有照片
export const getUserPhotos = async (userId: string): Promise<SavedPhoto[]> => {
  const { data, error } = await supabase
    .from('user_photos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// 删除照片
export const deletePhoto = async (photoId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_photos')
    .delete()
    .eq('id', photoId)
    .eq('user_id', userId);

  if (error) throw error;
};

// 分享照片到公共画廊
export const shareToPublic = async (photoId: string, userId: string): Promise<void> => {
  // 1. 获取照片信息
  const { data: photo, error: fetchError } = await supabase
    .from('user_photos')
    .select('*')
    .eq('id', photoId)
    .eq('user_id', userId)
    .single();

  if (fetchError) throw fetchError;

  // 2. 插入公共画廊
  const { error: insertError } = await supabase
    .from('public_photos')
    .insert({
      data_url: photo.data_url,
      caption: photo.caption,
      frame_style: photo.frame_style,
      timestamp: Date.now(),
      prompt_used: photo.prompt_used,
      pokemon_id: photo.pokemon_id,
      filter_id: photo.filter_id,
      user_id: userId,
      source_photo_id: photoId,
    });

  if (insertError) throw insertError;

  // 3. 更新原照片为已公开
  await supabase
    .from('user_photos')
    .update({ is_public: true })
    .eq('id', photoId);
};

// 取消公开分享
export const unshareFromPublic = async (photoId: string, userId: string): Promise<void> => {
  // 1. 从公共画廊删除
  await supabase
    .from('public_photos')
    .delete()
    .eq('source_photo_id', photoId)
    .eq('user_id', userId);

  // 2. 更新原照片状态
  await supabase
    .from('user_photos')
    .update({ is_public: false })
    .eq('id', photoId);
};

// 更新照片标题
export const updatePhotoCaption = async (
  photoId: string,
  userId: string,
  caption: string
): Promise<void> => {
  const { error } = await supabase
    .from('user_photos')
    .update({ caption })
    .eq('id', photoId)
    .eq('user_id', userId);

  if (error) throw error;
};
```

### useMyPhotos Hook

```typescript
// hooks/useMyPhotos.ts

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import * as photoService from '@/services/photoService';

export function useMyPhotos() {
  const { user, isAuthenticated } = useAuth();
  const [photos, setPhotos] = useState<SavedPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 加载照片
  const loadPhotos = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await photoService.getUserPhotos(user.id);
      setPhotos(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 保存照片
  const savePhoto = useCallback(async (photo: PhotoData) => {
    if (!user) throw new Error('Must be logged in');

    const saved = await photoService.savePhoto(photo, user.id);
    setPhotos(prev => [saved, ...prev]);
    return saved;
  }, [user]);

  // 删除照片
  const deletePhoto = useCallback(async (photoId: string) => {
    if (!user) return;

    await photoService.deletePhoto(photoId, user.id);
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  }, [user]);

  // 分享到公共画廊
  const shareToPublic = useCallback(async (photoId: string) => {
    if (!user) return;

    await photoService.shareToPublic(photoId, user.id);
    setPhotos(prev =>
      prev.map(p => p.id === photoId ? { ...p, isPublic: true } : p)
    );
  }, [user]);

  // 初始加载
  useEffect(() => {
    if (isAuthenticated) {
      loadPhotos();
    } else {
      setPhotos([]);
      setLoading(false);
    }
  }, [isAuthenticated, loadPhotos]);

  return {
    photos,
    loading,
    error,
    savePhoto,
    deletePhoto,
    shareToPublic,
    refresh: loadPhotos,
  };
}
```

## 用户界面流程

### 保存照片流程

```
1. 用户拍照或编辑照片
2. 点击照片上的 "保存" 按钮
3. 检查登录状态
   - 未登录: 显示登录弹窗
   - 已登录: 继续
4. 调用 photoService.savePhoto()
5. 显示成功提示 ✨
6. 照片出现在个人库中
```

### 查看个人库流程

```
1. 点击用户菜单 → "我的照片库"
2. 打开 MyGallery 组件
3. 加载用户照片列表
4. 网格展示所有照片
5. 点击照片查看详情
6. 可进行下载/分享/删除操作
```

### 分享到公共画廊流程

```
1. 在个人库中选择照片
2. 点击 "分享到画廊" 按钮
3. 确认分享 (可选添加标题)
4. 照片复制到 public_photos
5. 显示分享成功，照片标记为 "已公开"
6. 可在公共画廊中看到该照片
```

## 存储考虑

### 图片大小

- **格式**: Base64 编码的 PNG/JPEG
- **预估大小**: 拍立得尺寸约 200-500KB/张
- **数据库限制**: Supabase 免费版 500MB 数据库存储

### 优化建议

1. **图片压缩**: 上传前压缩到合理质量
2. **懒加载**: 画廊使用虚拟滚动
3. **缩略图**: 列表展示使用缩略图
4. **定期清理**: 可设置自动删除超过一定时间的照片

### 未来扩展

如需更大存储容量，可考虑：
1. 使用 Supabase Storage 存储图片文件
2. 数据库只存储图片 URL
3. 添加 CDN 加速
