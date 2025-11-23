import React from 'react';

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
    ...props
}) => {
    const inputId = id || React.useId();

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block text-xs font-medium text-text-main mb-1 ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                        {leftIcon}
                    </div>
                )}
                <input
                    id={inputId}
                    className={`
            w-full bg-white border-2 rounded-xl text-text-main placeholder:text-text-muted 
            transition-all outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${leftIcon ? 'pl-10' : 'px-4'}
            ${rightIcon ? 'pr-10' : 'px-4'}
            ${error
                            ? 'border-status-error focus:border-status-error focus:ring-2 focus:ring-status-error/20'
                            : 'border-border-default focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20'
                        }
            py-3
            ${className}
          `}
                    {...props}
                />
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
