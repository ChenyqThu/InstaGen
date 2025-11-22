// Instagram filter configuration based on instagram.css

export interface FilterConfig {
  id: string;
  name: { en: string; zh: string };
  className: string;
}

// Selected filters from Instagram.css - these provide good variety
export const INSTAGRAM_FILTERS: FilterConfig[] = [
  { id: 'normal', name: { en: 'Normal', zh: '原图' }, className: '' },
  { id: '1977', name: { en: '1977', zh: '复古1977' }, className: 'filter-1977' },
  { id: 'aden', name: { en: 'Aden', zh: '亚丁' }, className: 'filter-aden' },
  { id: 'amaro', name: { en: 'Amaro', zh: '阿马罗' }, className: 'filter-amaro' },
  { id: 'brannan', name: { en: 'Brannan', zh: '布兰南' }, className: 'filter-brannan' },
  { id: 'brooklyn', name: { en: 'Brooklyn', zh: '布鲁克林' }, className: 'filter-brooklyn' },
  { id: 'clarendon', name: { en: 'Clarendon', zh: '克拉伦登' }, className: 'filter-clarendon' },
  { id: 'earlybird', name: { en: 'Earlybird', zh: '早起鸟' }, className: 'filter-earlybird' },
  { id: 'gingham', name: { en: 'Gingham', zh: '格纹' }, className: 'filter-gingham' },
  { id: 'hudson', name: { en: 'Hudson', zh: '哈德逊' }, className: 'filter-hudson' },
  { id: 'inkwell', name: { en: 'Inkwell', zh: '墨水' }, className: 'filter-inkwell' },
  { id: 'lofi', name: { en: 'Lo-Fi', zh: '低保真' }, className: 'filter-lofi' },
  { id: 'maven', name: { en: 'Maven', zh: '行家' }, className: 'filter-maven' },
  { id: 'mayfair', name: { en: 'Mayfair', zh: '梅菲尔' }, className: 'filter-mayfair' },
  { id: 'moon', name: { en: 'Moon', zh: '月光' }, className: 'filter-moon' },
  { id: 'nashville', name: { en: 'Nashville', zh: '纳什维尔' }, className: 'filter-nashville' },
  { id: 'perpetua', name: { en: 'Perpetua', zh: '永恒' }, className: 'filter-perpetua' },
  { id: 'reyes', name: { en: 'Reyes', zh: '雷耶斯' }, className: 'filter-reyes' },
  { id: 'rise', name: { en: 'Rise', zh: '日出' }, className: 'filter-rise' },
  { id: 'slumber', name: { en: 'Slumber', zh: '沉睡' }, className: 'filter-slumber' },
  { id: 'toaster', name: { en: 'Toaster', zh: '暖阳' }, className: 'filter-toaster' },
  { id: 'valencia', name: { en: 'Valencia', zh: '瓦伦西亚' }, className: 'filter-valencia' },
  { id: 'walden', name: { en: 'Walden', zh: '瓦尔登' }, className: 'filter-walden' },
  { id: 'xpro-ii', name: { en: 'X-Pro II', zh: '交叉冲印' }, className: 'filter-xpro-ii' },
];

// Map filter ID to CSS filter values (for canvas rendering)
export const FILTER_CSS_VALUES: Record<string, string> = {
  'normal': 'none',
  '1977': 'sepia(0.5) hue-rotate(-30deg) saturate(1.4)',
  'aden': 'sepia(0.2) brightness(1.15) saturate(1.4)',
  'amaro': 'sepia(0.35) contrast(1.1) brightness(1.2) saturate(1.3)',
  'brannan': 'sepia(0.4) contrast(1.25) brightness(1.1) saturate(0.9) hue-rotate(-2deg)',
  'brooklyn': 'sepia(0.25) contrast(1.25) brightness(1.25) hue-rotate(5deg)',
  'clarendon': 'sepia(0.15) contrast(1.25) brightness(1.25) hue-rotate(5deg)',
  'earlybird': 'sepia(0.25) contrast(1.25) brightness(1.15) saturate(0.9) hue-rotate(-5deg)',
  'gingham': 'contrast(1.1) brightness(1.1)',
  'hudson': 'sepia(0.25) contrast(1.2) brightness(1.2) saturate(1.05) hue-rotate(-15deg)',
  'inkwell': 'brightness(1.25) contrast(0.85) grayscale(1)',
  'lofi': 'saturate(1.1) contrast(1.5)',
  'maven': 'sepia(0.35) contrast(1.05) brightness(1.05) saturate(1.75)',
  'mayfair': 'contrast(1.1) brightness(1.15) saturate(1.1)',
  'moon': 'brightness(1.4) contrast(0.95) saturate(0) sepia(0.35)',
  'nashville': 'sepia(0.25) contrast(1.5) brightness(0.9) hue-rotate(-15deg)',
  'perpetua': 'contrast(1.1) brightness(1.25) saturate(1.1)',
  'reyes': 'sepia(0.75) contrast(0.75) brightness(1.25) saturate(1.4)',
  'rise': 'sepia(0.25) contrast(1.25) brightness(1.2) saturate(0.9)',
  'slumber': 'sepia(0.35) contrast(1.25) saturate(1.25)',
  'toaster': 'sepia(0.25) contrast(1.5) brightness(0.95) hue-rotate(-15deg)',
  'valencia': 'sepia(0.25) contrast(1.1) brightness(1.1)',
  'walden': 'sepia(0.35) contrast(0.8) brightness(1.25) saturate(1.4)',
  'xpro-ii': 'sepia(0.45) contrast(1.25) brightness(1.75) saturate(1.3) hue-rotate(-5deg)',
};
