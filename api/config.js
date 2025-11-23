/**
 * @file API 配置常量
 * @description 用于 Vercel Serverless Functions 的共享配置
 */

// 每日免费配额 (与 src/config/usageConfig.ts 保持同步)
export const DAILY_FREE_LIMIT = 3;

// AI 模型配置
export const GEMINI_MODEL = 'gemini-2.5-flash-image';

// 允许的域名 (生产环境 CORS)
export const ALLOWED_ORIGINS = [
    'https://instagen.vercel.app',
    'https://instagen-polaroid.vercel.app',
    'http://localhost:3000',
    'http://0.0.0.0:3000',
];

/**
 * 获取 CORS 允许的 Origin
 * @param {string} origin - 请求来源
 * @returns {string} 允许的 origin，如果不在白名单则返回通配符 '*'
 */
export function getAllowedOrigin(origin) {
    if (!origin) return '*';
    if (ALLOWED_ORIGINS.includes(origin)) return origin;
    // 开发环境允许 localhost
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return origin;
    }
    // 允许其他 Vercel 预览部署域名
    if (origin.endsWith('.vercel.app')) {
        return origin;
    }
    // 默认返回通配符允许所有请求（API 已有 token 验证保护）
    return '*';
}

/**
 * 获取今日日期字符串 (UTC)
 * @returns {string} YYYY-MM-DD 格式
 */
export function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
}
