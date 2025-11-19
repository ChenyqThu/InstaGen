import { EditOption } from '../types';

/**
 * Magic Edit Configuration
 *
 * Each edit option includes:
 * - key: unique identifier
 * - label: display name in multiple languages
 * - prompt: text prompt sent to the AI model
 * - previewImage: path to preview image (you can generate these with your preferred model)
 * - model: AI model to use (currently only gemini-2.5-flash-image is supported)
 *
 * To add new styles:
 * 1. Generate a preview image using your prompt
 * 2. Save it to public/assets/previews/
 * 3. Add a new entry below
 */

export const MAGIC_EDIT_OPTIONS: EditOption[] = [
  {
    key: 'cartoon',
    label: { en: 'Cartoon', zh: '卡通化' },
    prompt: 'Transform this photo into a vibrant cartoon style illustration, maintaining the composition.',
    previewImage: '/assets/previews/cartoon.png',
    model: 'gemini-2.5-flash-image'
  },
  {
    key: 'sketch',
    label: { en: 'Sketch', zh: '素描' },
    prompt: 'Convert this photo into a detailed pencil sketch on paper.',
    previewImage: '/assets/previews/sketch.png',
    model: 'gemini-2.5-flash-image'
  },
  {
    key: 'anime',
    label: { en: 'Anime', zh: '新海诚风' },
    prompt: 'Reimagine this photo in the style of a Makoto Shinkai anime background, vibrant blue skies, cinematic lighting, high detail.',
    previewImage: '/assets/previews/anime.png',
    model: 'gemini-2.5-flash-image'
  },
  {
    key: 'retro',
    label: { en: 'Retro 80s', zh: '80年代复古' },
    prompt: 'Apply a 1980s retro aesthetic filter, slightly grainy, neon accents, synthwave vibe.',
    previewImage: '/assets/previews/retro80s.png',
    model: 'gemini-2.5-flash-image'
  },
  {
    key: 'cyberpunk',
    label: { en: 'Cyberpunk', zh: '赛博朋克' },
    prompt: 'Give this photo a futuristic cyberpunk look with neon lights, pink and blue glow, and dark tones.',
    previewImage: '/assets/previews/cyberpunk.png',
    model: 'gemini-2.5-flash-image'
  },
  {
    key: 'watercolor',
    label: { en: 'Watercolor', zh: '水彩画' },
    prompt: 'Turn this image into a soft, artistic watercolor painting with bleeding edges and paper texture.',
    previewImage: '/assets/previews/watercolor.png',
    model: 'gemini-2.5-flash-image'
  },
  {
    key: 'oil-painting',
    label: { en: 'Oil Painting', zh: '油画' },
    prompt: 'Transform into a classical oil painting with rich textures',
    previewImage: '/assets/previews/oil-painting.png',
    model: 'gemini-2.5-flash-image'
  }
];

/**
 * Example prompts for generating preview images:
 *
 * Cartoon: "A vibrant cartoon-style portrait with bold outlines and bright colors"
 * Sketch: "A detailed pencil sketch drawing with soft shading and artistic strokes"
 * Anime: "A Makoto Shinkai anime-style scene with vibrant sky, cinematic lighting"
 * Retro 80s: "A 1980s retro aesthetic photo with neon accents and synthwave vibe"
 * Cyberpunk: "A futuristic cyberpunk scene with neon pink and blue lights, dark atmosphere"
 * Watercolor: "A soft watercolor painting with bleeding edges and paper texture"
 */
