import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-[#343A49] bg-[#202631]/60 ${className}`}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#43E5D2]/15 border border-[#43E5D2]/30 text-[#43E5D2] mb-3">
        <Icon className="w-5 h-5 text-[#43E5D2]" />
      </div>
      <h3 className="text-base font-bold text-[#F3F0E8] mb-1">{title}</h3>
      <p className="text-sm text-[#8E92A4] max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
