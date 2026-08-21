import React from 'react';
import { Layers } from 'lucide-react';

interface ImagePlaceholderProps {
  title?: string;
  className?: string;
  iconSize?: number;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  title = 'روعة التميز',
  className = 'w-full h-full min-h-[220px]',
  iconSize = 36
}) => {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-[#162B22]/10 via-[#233C31]/5 to-[#C5A880]/15 dark:from-[#111A15] dark:via-[#16231D] dark:to-[#1F2C25] flex flex-col items-center justify-center p-6 text-center select-none border border-[#C5A880]/10 ${className}`}
      dir="rtl"
    >
      {/* Architectural subtle background grid */}
      <svg className="absolute inset-0 w-full h-full opacity-15 dark:opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="arch-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.75" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#arch-grid)" className="text-[#C5A880]" />
      </svg>

      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-[#12261E]/80 dark:bg-[#0D1813] text-[#C5A880] flex items-center justify-center shadow-lg border border-[#C5A880]/20 backdrop-blur-sm">
          <Layers style={{ width: iconSize, height: iconSize }} strokeWidth={1.5} />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-semibold text-[#C5A880] tracking-wider uppercase">روعة التميز للحلول المعمارية</span>
          {title && <span className="text-sm font-medium text-[#2E3C33] dark:text-[#BAC9BE] line-clamp-1">{title}</span>}
        </div>
      </div>
    </div>
  );
};
