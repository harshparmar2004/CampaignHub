import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  let variantStyles = 'bg-brand text-white hover:bg-brand-hover border-transparent';

  if (variant === 'secondary') {
    variantStyles = 'bg-bg-surface text-txt-primary border-border hover:bg-bg-accentSoft hover:border-border-strong';
  } else if (variant === 'danger') {
    variantStyles = 'bg-bg-surface text-status-failed border-border hover:bg-red-50 hover:border-red-200';
  } else if (variant === 'ghost') {
    variantStyles = 'bg-transparent text-txt-muted hover:text-txt-primary hover:bg-bg-accentSoft border-transparent';
  }

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-element min-h-[44px] border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
      ) : null}
      {children}
    </button>
  );
}
