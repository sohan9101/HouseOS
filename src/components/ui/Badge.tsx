import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'acid'
    | 'violet'
    | 'cyan'
    | 'coral'
    | 'paper'
    | 'dark'
    | 'forest'
    | 'indigo'
    | 'slate'
    | 'emerald'
    | 'amber'
    | 'rose'
    | 'sky'
    | 'gold';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'slate',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-bold tracking-wider rounded-md uppercase transition-colors';

  const variantStyles = {
    acid: 'bg-[#43E5D2]/15 text-[#43E5D2] border border-[#43E5D2]/40',
    violet: 'bg-[#8B7CFF]/15 text-[#8B7CFF] border border-[#8B7CFF]/40',
    cyan: 'bg-[#43E5D2]/15 text-[#43E5D2] border border-[#43E5D2]/40',
    coral: 'bg-[#FF896D]/15 text-[#FF896D] border border-[#FF896D]/40',
    paper: 'bg-[#F3F0E8] text-[#101116] border border-[#E0DDD3]',
    dark: 'bg-[#202631] text-[#F3F0E8] border border-[#343A49]',
    forest: 'bg-[#43E5D2]/15 text-[#43E5D2] border border-[#43E5D2]/40',
    emerald: 'bg-[#43E5D2]/15 text-[#43E5D2] border border-[#43E5D2]/40',
    gold: 'bg-[#FF896D]/15 text-[#FF896D] border border-[#FF896D]/40',
    amber: 'bg-[#FF896D]/15 text-[#FF896D] border border-[#FF896D]/40',
    slate: 'bg-[#202631] text-[#9EA8B6] border border-[#343A49]',
    rose: 'bg-[#FF896D]/20 text-[#FF896D] border border-[#FF896D]/50',
    sky: 'bg-[#43E5D2]/15 text-[#43E5D2] border border-[#43E5D2]/40',
    indigo: 'bg-[#8B7CFF]/15 text-[#8B7CFF] border border-[#8B7CFF]/40',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={twMerge(clsx(baseStyles, variantStyles[variant], sizeStyles[size], className))}
      {...props}
    >
      {children}
    </span>
  );
};
