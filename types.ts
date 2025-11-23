export enum PhotoStatus {
  DEVELOPING = 'developing',
  DONE = 'done',
  EDITING = 'editing',
}

export enum PhotoFrameStyle {
  // Classic Series
  CLASSIC = 'classic',
  BLACK = 'black',
  VINTAGE = 'vintage',
  KRAFT = 'kraft',
  // Colorful Series
  SKY_BLUE = 'sky_blue',
  PINK = 'pink',
  MINT = 'mint',
  COLORFUL = 'colorful',
  RAINBOW = 'rainbow',
  // Creative Series
  ROSE_GOLD = 'rose_gold',
  MARBLE = 'marble',
  WOOD = 'wood',
  STARRY = 'starry',
  BEACH = 'beach',
  DUOCHROME = 'duochrome',
  CONFETTI = 'confetti',
}

// Frame style categories for UI grouping
export type FrameStyleCategory = 'classic' | 'colorful' | 'creative';

export const FRAME_STYLE_CATEGORIES: Record<FrameStyleCategory, PhotoFrameStyle[]> = {
  classic: [PhotoFrameStyle.CLASSIC, PhotoFrameStyle.BLACK, PhotoFrameStyle.VINTAGE, PhotoFrameStyle.KRAFT],
  colorful: [PhotoFrameStyle.SKY_BLUE, PhotoFrameStyle.PINK, PhotoFrameStyle.MINT, PhotoFrameStyle.COLORFUL, PhotoFrameStyle.RAINBOW],
  creative: [PhotoFrameStyle.ROSE_GOLD, PhotoFrameStyle.MARBLE, PhotoFrameStyle.WOOD, PhotoFrameStyle.STARRY, PhotoFrameStyle.BEACH, PhotoFrameStyle.DUOCHROME, PhotoFrameStyle.CONFETTI],
};

export interface PhotoData {
  id: string;
  x: number;
  y: number;
  rotation: number;
  dataUrl: string; // Base64 image
  timestamp: number;
  status: PhotoStatus;
  frameStyle: PhotoFrameStyle;
  promptUsed?: string;
  caption?: string;
  customGeminiKey?: string | null;
  language?: Language;
  pokemonId?: string;
  filterId?: string; // Instagram filter ID
}

export type Language = 'en' | 'zh';

export interface Point {
  x: number;
  y: number;
}

export interface EditOption {
  key: string;
  label: { en: string; zh: string };
  prompt: string;
  previewImage?: string;
  model?: string;
}