import React, { useState, useEffect } from 'react';
import type { Product, Category, SiteSettings } from '../../types';
import { ImagePlaceholder } from '../common/ImagePlaceholder';
import { ImageViewerModal } from '../common/ImageViewerModal';
import { X, MessageSquare, Maximize2, Check, Sparkles, ChevronRight, ChevronLeft, Layers, ShieldCheck, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDetailModalProps {
  product: Product | null;
  category?: Category;
  settings: SiteSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  category,
  settings,
  isOpen,
  onClose
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      setSelectedImageIndex(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const imagesList = product.images && product.images.length > 0
    ? product.images.map(img => ({ url: img.url, alt: img.alt || product.name }))
    : product.coverImage
    ? [{ url: product.coverImage, alt: product.name }]
    : [];

  const currentImage = imagesList[selectedImageIndex] || imagesList[0];

  // WhatsApp Inquiry URL generation
  const cleanNumber = settings.whatsappNumber?.replace(/\D/g, '');
  const customMessage = product.whatsappMessage || `السلام عليكم ورحمة الله، أرغب في الاستفسار عن منتج [${product.name}] والمواصفات المتاحة لديكم.`;
  const whatsappUrl = cleanNumber
    ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(customMessage)}`
    : '';

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-sm" dir="rtl">
          {/* Backdrop Click */}
          <div className="fixed inset-0" onClick={onClose} />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#FAF8F5] dark:bg-[#111A15] border border-[#C5A880]/30 shadow-2xl overflow-hidden z-10 my-auto text-right"
          >
            {/* Header with Close */}
            <div className="flex items-center justify-between p-4 sm:px-6 border-b border-[#C5A880]/20 bg-white/50 dark:bg-black/20">
              <div className="flex items-center gap-2">
                {category && (
                  <span className="text-xs font-bold px-3 py-1 rounded-lg bg-[#C5A880]/20 text-[#12261E] dark:text-[#EAE0D0]">
                    {category.name}
                  </span>
                )}
                <span className="text-xs text-[#7B8F82] font-mono">تفاصيل ومواصفات</span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-white bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                aria-label="إغلاق النافذة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with Scroll */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-8">
              {/* Image Gallery Showcase */}
              <div className="space-y-3">
                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-[#C5A880]/20 group">
                  {currentImage ? (
                    <img
                      src={currentImage.url}
                      alt={currentImage.alt}
                      className="w-full h-full object-cover transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <ImagePlaceholder title={product.name} className="w-full h-full" iconSize={40} />
                  )}

                  {/* Lightbox trigger button */}
                  {imagesList.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsLightboxOpen(true)}
                      className="absolute top-4 left-4 p-2.5 rounded-xl bg-black/60 hover:bg-[#C5A880] text-white hover:text-black transition-all backdrop-blur-md shadow-lg flex items-center gap-1.5 text-xs font-bold"
                    >
                      <Maximize2 className="w-4 h-4" />
                      <span className="hidden sm:inline">عرض مكبّر</span>
                    </button>
                  )}
                </div>

                {/* Thumbnails strip */}
                {imagesList.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {imagesList.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                          idx === selectedImageIndex
                            ? 'border-[#C5A880] scale-105 shadow-md'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={`مصغرة ${idx + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title & Short Bio */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#12261E] dark:text-[#FAF8F5] mb-3 leading-tight">
                  {product.name}
                </h2>
                {product.shortDescription && (
                  <p className="text-base sm:text-lg text-[#55695D] dark:text-[#A4B8AB] leading-relaxed">
                    {product.shortDescription}
                  </p>
                )}
              </div>

              {/* Full Description */}
              {product.fullDescription && (
                <div className="p-6 rounded-2xl bg-white dark:bg-[#15201A] border border-[#C5A880]/20 space-y-3">
                  <h4 className="text-sm font-bold text-[#A88758] dark:text-[#C5A880] uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>الوصف الهندسي والمواصفات</span>
                  </h4>
                  <div className="text-sm sm:text-base text-[#38483E] dark:text-[#CADACA] leading-relaxed whitespace-pre-line">
                    {product.fullDescription}
                  </div>
                </div>
              )}

              {/* Features List */}
              {product.features && product.features.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-[#12261E] dark:text-[#FAF8F5] mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#A88758] dark:text-[#C5A880]" />
                    <span>أبرز المميزات والمواصفات الفنية:</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F0ECE1]/50 dark:bg-[#16221C] border border-[#C5A880]/15 text-xs sm:text-sm font-medium text-[#2E3C33] dark:text-[#D1E0D4]"
                      >
                        <Check className="w-4 h-4 text-[#A88758] dark:text-[#C5A880] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Usages / Applications */}
              {product.usages && product.usages.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-[#12261E] dark:text-[#FAF8F5] mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#A88758] dark:text-[#C5A880]" />
                    <span>الاستخدامات والتطبيقات المقترحة:</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {product.usages.map((usage, idx) => (
                      <span
                        key={idx}
                        className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#12261E]/5 dark:bg-white/5 border border-[#C5A880]/20 text-[#3C4E43] dark:text-[#BACBBF]"
                      >
                        {usage}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Sticky Action / WhatsApp CTA */}
            <div className="p-4 sm:p-6 border-t border-[#C5A880]/20 bg-white/80 dark:bg-[#0E1612]/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-[#12261E] dark:text-[#FAF8F5]">
                  استفسار عن هذا المنتج
                </p>
                <p className="text-xs text-[#6A7E71] dark:text-[#8D9F93]">
                  تواصل مباشرة مع المستشار الفني للحصول على التفاصيل والمقاسات.
                </p>
              </div>

              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#12261E] dark:bg-[#C5A880] text-[#FAF8F5] dark:text-[#0D1411] font-bold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all"
                >
                  <MessageSquare className="w-4 h-4 text-[#C5A880] dark:text-[#0D1411]" />
                  <span>استفسر عن هذا المنتج عبر واتساب</span>
                </a>
              ) : (
                <div className="text-xs text-[#A88758] font-semibold bg-[#C5A880]/10 px-4 py-2 rounded-xl">
                  يرجى إضافة رقم واتساب في إعدادات الموقع لتفعيل الزر المباشر
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Fullscreen Lightbox */}
      <ImageViewerModal
        images={imagesList}
        initialIndex={selectedImageIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        title={product.name}
      />
    </>
  );
};
