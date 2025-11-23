import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helperText?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    helperText,
    error,
    leftIcon,
    rightIcon,
    className = '',
    id,
    value,
    onFocus,
    onBlur,
    ...props
}) => {
    const inputId = id || React.useId();
    const [isFocused, setIsFocused] = useState(false);

    // Label floats when focused or has value
    const hasValue = value !== undefined && value !== '';
    const isFloating = isFocused || hasValue;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        onBlur?.(e);
    };

    return (
        <div className="w-full">
            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted z-10">
                        {leftIcon}
                    </div>
                )}
                <input
                    id={inputId}
                    value={value}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={`
                        w-full bg-white border-2 rounded-xl text-text-main
                        transition-all outline-none peer
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${leftIcon ? 'pl-10' : 'px-4'}
                        ${rightIcon ? 'pr-10' : 'px-4'}
                        ${error
                            ? 'border-status-error focus:border-status-error focus:ring-2 focus:ring-status-error/20'
                            : 'border-border-default focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20'
                        }
                        ${label ? 'pt-5 pb-2' : 'py-3'}
                        ${className}
                    `}
                    placeholder=""
                    {...props}
                />
                {label && (
                    <label
                        htmlFor={inputId}
                        className={`
                            absolute pointer-events-none transition-all duration-200 ease-out
                            ${leftIcon ? 'left-10' : 'left-4'}
                            ${isFloating
                                ? 'top-1.5 text-[10px] font-medium'
                                : 'top-1/2 -translate-y-1/2 text-sm'
                            }
                            ${isFocused
                                ? 'text-brand-primary'
                                : error
                                    ? 'text-status-error'
                                    : 'text-text-muted'
                            }
                        `}
                    >
                        {label}
                    </label>
                )}
                {rightIcon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                        {rightIcon}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1 text-xs text-status-error ml-1">{error}</p>
            )}
            {helperText && !error && (
                <p className="mt-1 text-xs text-text-muted ml-1">{helperText}</p>
            )}
        </div>
    );
};
