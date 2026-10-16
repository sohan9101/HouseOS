import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  variant?: 'dark' | 'paper';
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  variant = 'dark',
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          variant === 'paper'
            ? 'bg-[#F3F0E8] border border-[#E0DDD3] rounded-xl p-5 text-[#101116] shadow-xs'
            : 'bg-[#202631] border border-[#343A49] rounded-xl p-5 text-[#F3F0E8] shadow-[0_2px_12px_rgba(0,0,0,0.3)]',
          hoverEffect &&
            (variant === 'paper'
              ? 'transition-all duration-200 hover:border-[#101116]/40 hover:shadow-md hover:-translate-y-0.5'
              : 'transition-all duration-200 hover:border-[#43E5D2]/50 hover:shadow-[0_4px_24px_rgba(0,0,0,0.5)] hover:-translate-y-0.5'),
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
