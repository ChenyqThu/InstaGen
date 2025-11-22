export enum PhotoStatus {
  DEVELOPING = 'developing',
  DONE = 'done',
  EDITING = 'editing',
}

export enum PhotoFrameStyle {
  CLASSIC = 'classic',
  BLACK = 'black',
  COLORFUL = 'colorful',
  VINTAGE = 'vintage',
}

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
  pokemonId?: string;
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