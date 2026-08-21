import React from 'react';
import { PackageOpen, Sparkles, Plus, ArrowLeft } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-2xl border border-dashed border-[#C5A880]/30 bg-[#F5F2EB]/50 dark:bg-[#121A16]/50 transition-all ${className}`}
      dir="rtl"
    >
      <div className="w-16 h-16 rounded-2xl bg-[#12261E]/10 dark:bg-[#1C2C24] text-[#C5A880] flex items-center justify-center mb-4 shadow-sm">
        {icon || <PackageOpen className="w-8 h-8" strokeWidth={1.5} />}
      </div>
      
      <h3 className="text-lg md:text-xl font-bold text-[#12261E] dark:text-[#E8EFE9] mb-2">
        {title}
      </h3>
      
      <p className="text-sm md:text-base text-[#526458] dark:text-[#9FB0A4] max-w-md leading-relaxed mb-6">
        {description}
      </p>

      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#12261E] dark:bg-[#C5A880] text-[#FAF8F5] dark:text-[#0D1813] font-semibold text-sm hover:opacity-90 transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
