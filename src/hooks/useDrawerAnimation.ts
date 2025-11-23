import { useState, useEffect, useCallback } from 'react';

/**
 * Drawer/Modal 动画配置选项
 */
interface UseDrawerAnimationOptions {
    /** 是否打开 */
    isOpen: boolean;
    /** 关闭回调 */
    onClose: () => void;
    /** 动画持续时间 (ms)，默认 350ms */
    duration?: number;
    /** 是否启用 ESC 键关闭，默认 true */
    enableEscapeKey?: boolean;
}

/**
 * Drawer/Modal 动画 Hook 返回值
 */
interface UseDrawerAnimationReturn {
    /** 组件是否已挂载 (用于条件渲染) */
    isMounted: boolean;
    /** 组件是否可见 (用于动画类名) */
    isVisible: boolean;
    /** 处理关闭 (带动画) */
    handleClose: () => void;
}

/**
 * 通用 Drawer/Modal 动画 Hook
 *
 * 提供进入/退出动画状态管理和 ESC 键关闭功能
 *
 * @example
 * ```tsx
 * const { isMounted, isVisible, handleClose } = useDrawerAnimation({
 *     isOpen,
 *     onClose,
 *     duration: 350,
 * });
 *
 * if (!isMounted) return null;
 *
 * return (
 *     <div className={isVisible ? 'opacity-100' : 'opacity-0'}>
 *         <button onClick={handleClose}>Close</button>
 *     </div>
 * );
 * ```
 */
export function useDrawerAnimation({
    isOpen,
    onClose,
    duration = 350,
    enableEscapeKey = true,
}: UseDrawerAnimationOptions): UseDrawerAnimationReturn {
    const [isMounted, setIsMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // 处理打开/关闭状态变化
    useEffect(() => {
        if (isOpen) {
            setIsMounted(true);
            // 双重 requestAnimationFrame 确保动画在下一帧开始
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setIsVisible(true));
            });
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setIsMounted(false), duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, duration]);

    // ESC 键关闭
    useEffect(() => {
        if (!enableEscapeKey || !isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose, enableEscapeKey]);

    // 带动画的关闭处理
    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    return {
        isMounted,
        isVisible,
        handleClose,
    };
}
