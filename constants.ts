import { Language, PhotoFrameStyle } from "./types";
import { MAGIC_EDIT_OPTIONS } from "./config/magicEditConfig";

// Re-export MAGIC_EDIT_OPTIONS as EDIT_OPTIONS for backward compatibility
export const EDIT_OPTIONS = MAGIC_EDIT_OPTIONS;

export const TRANSLATIONS = {
  en: {
    title: 'InstaGen',
    takePhoto: 'Take Photo',
    developing: 'Developing...',
    dragHint: 'Drag photos to board ->',
    editHint: 'Expand to Edit',
    delete: 'Delete',
    processing: 'Gemini is painting...',
    error: 'Failed to process',
    downloadError: 'Download failed, please try again',
    styles: 'Frame Styles',
    magic: 'Magic Edit',
    save: 'Close',
    download: 'Download',
    expand: 'Edit Photo',
    customPromptPlaceholder: 'Describe your edit...',
    go: 'Generate',
    defaultCaption: 'May I meet you',
    cardEffect: 'Card Effect',
    cardEffectNone: 'None',
    pinToGallery: 'Pin to Gallery',
    pinSuccess: 'Pinned to public gallery!',
    pinError: 'Failed to pin photo. Check console for details.',
    publicGallery: 'Public Gallery',
    publicPinboard: 'Public Pinboard',
    globalGallery: 'Global Gallery',
    emptyGallery: 'No photos pinned yet. Be the first!',
  },
  zh: {
    title: 'InstaGen',
    takePhoto: '拍摄',
    developing: '显影中...',
    dragHint: '将照片拖到右侧 ->',
    editHint: '点击编辑',
    delete: '删除',
    processing: 'Gemini 正在绘制...',
    error: '处理失败',
    downloadError: '下载失败，请重试',
    styles: '相纸风格',
    magic: '魔法编辑',
    save: '关闭',
    download: '下载',
    expand: '编辑照片',
    customPromptPlaceholder: '描述你想怎么改...',
    go: '生成',
    defaultCaption: '愿与你相遇',
    cardEffect: '卡片特效',
    cardEffectNone: '无',
    pinToGallery: '添加到画廊',
    pinSuccess: '已添加到公共画廊！',
    pinError: '钉图失败，请查看控制台了解详情。',
    publicGallery: '公共画廊',
    publicPinboard: '公共展板',
    globalGallery: '全球画廊',
    emptyGallery: '还没有照片，成为第一个分享的人吧！',
  }
};

export const FRAME_STYLES = {
  [PhotoFrameStyle.CLASSIC]: 'bg-[#fdfdfd] text-gray-800',
  [PhotoFrameStyle.BLACK]: 'bg-[#1a1a1a] text-gray-200',
  [PhotoFrameStyle.COLORFUL]: 'bg-gradient-to-br from-pink-100 to-yellow-100 text-pink-800',
  [PhotoFrameStyle.VINTAGE]: 'bg-[#f4e4bc] text-[#5c4033]',
};