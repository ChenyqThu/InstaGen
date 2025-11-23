import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const ModalContext = React.createContext<{ onClose: () => void }>({ onClose: () => { } });

export const Modal: React.FC<ModalProps> & {
    Header: React.FC<ModalHeaderProps>;
    Body: React.FC<ModalBodyProps>;
    Footer: React.FC<ModalFooterProps>;
} = ({ isOpen, onClose, children, className = '', size = 'md' }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsMounted(true);
            // Small delay to allow mounting before animation
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setIsVisible(true));
            });
            document.body.style.overflow = 'hidden';
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setIsMounted(false), 350);
            document.body.style.overflow = '';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isMounted) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'max-w-full m-4',
    };

    return createPortal(
        <ModalContext.Provider value={{ onClose }}>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop with blur */}
                <div
                    className={`
                        absolute inset-0 bg-black/40 backdrop-blur-md
                        transition-all duration-350 ease-out
                        ${isVisible ? 'opacity-100' : 'opacity-0'}
                    `}
                    onClick={onClose}
                />

                {/* Modal Content with spring-like animation */}
                <div
                    className={`
                        relative w-full bg-surface-modal rounded-3xl shadow-2xl overflow-hidden
                        transform transition-all duration-350 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                        ${isVisible
                            ? 'opacity-100 scale-100 translate-y-0'
                            : 'opacity-0 scale-90 translate-y-8'
                        }
                        ${sizeClasses[size]}
                        ${className}
                    `}
                    style={{
                        boxShadow: isVisible
                            ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                            : 'none'
                    }}
                >
                    {children}
                </div>
            </div>
        </ModalContext.Provider>,
        document.body
    );
};

interface ModalHeaderProps {
    children: React.ReactNode;
    className?: string;
    showCloseButton?: boolean;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ children, className = '', showCloseButton = true }) => {
    const { onClose } = React.useContext(ModalContext);

    return (
        <div className={`relative p-6 pb-2 ${className}`}>
            {showCloseButton && (
                <button
                    onClick={onClose}
                    className="
                        absolute top-4 right-4 p-2 rounded-full
                        bg-black/5 hover:bg-black/10
                        transition-all duration-200 ease-out
                        hover:scale-110 active:scale-95
                        z-10 text-text-muted hover:text-text-main
                    "
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
            {children}
        </div>
    );
};

interface ModalBodyProps {
    children: React.ReactNode;
    className?: string;
}

const ModalBody: React.FC<ModalBodyProps> = ({ children, className = '' }) => {
    return (
        <div className={`p-6 pt-2 ${className}`}>
            {children}
        </div>
    );
};

interface ModalFooterProps {
    children: React.ReactNode;
    className?: string;
}

const ModalFooter: React.FC<ModalFooterProps> = ({ children, className = '' }) => {
    return (
        <div className={`p-6 pt-0 flex items-center justify-end gap-3 ${className}`}>
            {children}
        </div>
    );
};

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
