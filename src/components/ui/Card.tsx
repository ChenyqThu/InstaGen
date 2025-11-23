import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hoverable?: boolean;
    padded?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hoverable = false,
    padded = true,
    ...props
}) => {
    return (
        <div
            className={`
        bg-surface-card rounded-2xl border border-border-default shadow-sm overflow-hidden
        ${hoverable ? 'transition-all duration-300 hover:shadow-md hover:-translate-y-1' : ''}
        ${padded ? 'p-6' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
};
