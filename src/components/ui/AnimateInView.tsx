import React, { useEffect, useRef, useState } from 'react';

interface AnimateInViewProps {
    children: React.ReactNode;
    animation?: 'fade-up' | 'fade-down' | 'scale' | 'slide-right';
    delay?: number;
    duration?: number;
    threshold?: number;
    className?: string;
}

export const AnimateInView: React.FC<AnimateInViewProps> = ({
    children,
    animation = 'fade-up',
    delay = 0,
    duration = 500,
    threshold = 0.1,
    className = '',
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold,
                rootMargin: '50px',
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [threshold]);

    const getAnimationClass = () => {
        switch (animation) {
            case 'fade-up':
                return 'translate-y-8 opacity-0';
            case 'fade-down':
                return '-translate-y-8 opacity-0';
            case 'scale':
                return 'scale-95 opacity-0';
            case 'slide-right':
                return '-translate-x-8 opacity-0';
            default:
                return 'opacity-0';
        }
    };

    const getVisibleClass = () => {
        switch (animation) {
            case 'fade-up':
            case 'fade-down':
                return 'translate-y-0 opacity-100';
            case 'scale':
                return 'scale-100 opacity-100';
            case 'slide-right':
                return 'translate-x-0 opacity-100';
            default:
                return 'opacity-100';
        }
    };

    return (
        <div
            ref={ref}
            className={`${className} transition-all ease-out ${isVisible ? getVisibleClass() : getAnimationClass()}`}
            style={{
                transitionDuration: `${duration}ms`,
                transitionDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    );
};
