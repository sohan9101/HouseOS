import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#43E5D2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101116] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

  const variantStyles = {
    primary:
      'bg-[#43E5D2] hover:bg-[#35D6C3] active:bg-[#28C2B0] text-[#101116] font-bold shadow-sm hover:shadow-[0_0_14px_rgba(67,229,210,0.2)] border border-[#43E5D2]',
    secondary:
      'bg-[#202631] hover:bg-[#28303E] active:bg-[#1B202A] text-[#F3F0E8] border border-[#343A49] shadow-xs',
    outline:
      'bg-transparent hover:bg-[#43E5D2]/10 active:bg-[#43E5D2]/20 text-[#43E5D2] border border-[#43E5D2]/40 hover:border-[#43E5D2]',
    ghost:
      'bg-transparent hover:bg-[#202631] active:bg-[#28303E] text-[#9EA8B6] hover:text-[#F3F0E8]',
    danger:
      'bg-[#FF896D]/15 hover:bg-[#FF896D]/25 text-[#FF896D] border border-[#FF896D]/30',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2 gap-2 h-9.5',
    lg: 'text-base px-5 py-2.5 gap-2.5 h-11 font-semibold',
  };

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
