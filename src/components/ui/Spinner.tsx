import React from 'react';

/**
 * Spinner 组件属性
 */
interface SpinnerProps {
    /** 尺寸: sm (16px), md (20px), lg (24px) */
    size?: 'sm' | 'md' | 'lg';
    /** 颜色: white, primary, muted */
    color?: 'white' | 'primary' | 'muted';
    /** 额外的 CSS 类名 */
    className?: string;
}

const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
};

const colorClasses = {
    white: 'border-white border-t-transparent',
    primary: 'border-brand-primary border-t-transparent',
    muted: 'border-text-muted border-t-transparent',
};

/**
 * 加载动画 Spinner 组件
 *
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner size="lg" color="primary" />
 * <Spinner size="sm" color="white" className="ml-2" />
 * ```
 */
export function Spinner({
    size = 'md',
    color = 'white',
    className = '',
}: SpinnerProps) {
    return (
        <div
            className={`
                ${sizeClasses[size]}
                border-2 rounded-full animate-spin
                ${colorClasses[color]}
                ${className}
            `}
            role="status"
            aria-label="Loading"
        />
    );
}
