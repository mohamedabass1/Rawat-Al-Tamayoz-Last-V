import React, { useEffect, useState, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageViewerModalProps {
  images: Array<{ url: string; alt?: string }>;
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  title
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsZoomed(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialIndex]);

  const handleNext = useCallback(() => {
    setIsZoomed(false);
    setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setIsZoomed(false);
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handlePrev(); // RTL: Right arrow goes to previous
      if (e.key === 'ArrowLeft') handleNext();  // RTL: Left arrow goes to next
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex flex-col justify-between bg-black/95 backdrop-blur-lg select-none" dir="rtl">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 md:px-8 text-white/90 z-20">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm md:text-base tracking-wide text-[#C5A880]">
              {title || 'معرض الصور'}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 font-mono">
              {currentIndex + 1} / {images.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={isZoomed ? 'تصغير' : 'تكبير'}
              aria-label="تكبير أو تصغير"
            >
              {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/80 text-white transition-colors"
              title="إغلاق (Esc)"
              aria-label="إغلاق نافذة المعرض"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main Image Area */}
        <div className="relative flex-1 flex items-center justify-center p-2 md:p-8 overflow-hidden">
          {images.length > 1 && (
            <>
              {/* RTL Previous button (Right side) */}
              <button
                type="button"
                onClick={handlePrev}
                className="absolute right-4 md:right-8 z-20 p-3 rounded-full bg-black/60 hover:bg-[#C5A880] text-white hover:text-black transition-all backdrop-blur-md shadow-lg"
                aria-label="الصورة السابقة"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* RTL Next button (Left side) */}
              <button
                type="button"
                onClick={handleNext}
                className="absolute left-4 md:left-8 z-20 p-3 rounded-full bg-black/60 hover:bg-[#C5A880] text-white hover:text-black transition-all backdrop-blur-md shadow-lg"
                aria-label="الصورة التالية"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </>
          )}

          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`max-h-full max-w-full flex items-center justify-center transition-transform duration-300 ${
              isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <img
              src={currentImage.url}
              alt={currentImage.alt || title || 'صورة المعرض'}
              className="max-h-[75vh] md:max-h-[80vh] max-w-[95vw] md:max-w-[85vw] object-contain rounded-lg shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>

        {/* Bottom Thumbnail Strip */}
        {images.length > 1 && (
          <div className="p-4 z-20 bg-black/60 backdrop-blur-md flex items-center justify-center gap-2 overflow-x-auto max-w-full">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setIsZoomed(false);
                  setCurrentIndex(idx);
                }}
                className={`relative shrink-0 w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  idx === currentIndex
                    ? 'border-[#C5A880] scale-105 opacity-100 shadow-md ring-2 ring-[#C5A880]/30'
                    : 'border-transparent opacity-40 hover:opacity-80'
                }`}
              >
                <img
                  src={img.url}
                  alt={img.alt || `صورة ${idx + 1}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
