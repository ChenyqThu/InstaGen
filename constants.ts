import { EditOption, Language, PhotoFrameStyle } from "./types";

export const EDIT_OPTIONS: EditOption[] = [
  { 
    key: 'cartoon', 
    label: { en: 'Cartoon', zh: '卡通化' }, 
    prompt: 'Transform this photo into a vibrant cartoon style illustration, maintaining the composition.' 
  },
  { 
    key: 'sketch', 
    label: { en: 'Sketch', zh: '素描' }, 
    prompt: 'Convert this photo into a detailed pencil sketch on paper.' 
  },
  { 
    key: 'anime', 
    label: { en: 'Anime', zh: '新海诚风' }, 
    prompt: 'Reimagine this photo in the style of a Makoto Shinkai anime background, vibrant blue skies, cinematic lighting, high detail.' 
  },
  { 
    key: 'retro', 
    label: { en: 'Retro 80s', zh: '80年代复古' }, 
    prompt: 'Apply a 1980s retro aesthetic filter, slightly grainy, neon accents, synthwave vibe.' 
  },
  { 
    key: 'cyberpunk', 
    label: { en: 'Cyberpunk', zh: '赛博朋克' }, 
    prompt: 'Give this photo a futuristic cyberpunk look with neon lights, pink and blue glow, and dark tones.' 
  },
  {
    key: 'watercolor',
    label: { en: 'Watercolor', zh: '水彩画' },
    prompt: 'Turn this image into a soft, artistic watercolor painting with bleeding edges and paper texture.'
  }
];

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
    styles: 'Frame Styles',
    magic: 'Magic Edit',
    save: 'Close',
    download: 'Download',
    expand: 'Edit / Zoom',
    customPromptPlaceholder: 'Describe your edit...',
    go: 'Generate',
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
    styles: '相纸风格',
    magic: '魔法编辑',
    save: '关闭',
    download: '下载',
    expand: '编辑 / 放大',
    customPromptPlaceholder: '描述你想怎么改...',
    go: '生成',
  }
};

export const FRAME_STYLES = {
  [PhotoFrameStyle.CLASSIC]: 'bg-white text-gray-800',
  [PhotoFrameStyle.BLACK]: 'bg-gray-900 text-gray-200 border-gray-800',
  [PhotoFrameStyle.COLORFUL]: 'bg-gradient-to-br from-pink-100 to-yellow-100 text-pink-800',
  [PhotoFrameStyle.VINTAGE]: 'bg-[#f4e4bc] text-[#5c4033] sepia-[.3]',
};