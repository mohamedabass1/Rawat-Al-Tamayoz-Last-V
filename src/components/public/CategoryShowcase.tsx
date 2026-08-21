import React from 'react';
import type { Category } from '../../types';
import { ImagePlaceholder } from '../common/ImagePlaceholder';
import { EmptyState } from '../common/EmptyState';
import { ArrowLeft, Layers, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface CategoryShowcaseProps {
  categories: Category[];
  onSelectCategory: (categoryId: string) => void;
  onOpenAdmin?: () => void;
}

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({
  categories,
  onSelectCategory,
  onOpenAdmin
}) => {
  return (
    <section id="categories" className="py-20 bg-[#F4F0E8]/40 dark:bg-[#0B110E]/40 border-y border-[#C5A880]/15" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A88758] dark:text-[#C5A880] mb-2">
              <Layers className="w-4 h-4" />
              <span>الأصناف والخدمات الرئيسية</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#12261E] dark:text-[#FAF8F5] tracking-tight">
              حلول معمارية متخصصة ومصممة بعناية
            </h2>
          </div>
          <p className="text-sm text-[#5B6F62] dark:text-[#9FB2A5] max-w-md">
            نقدم مجموعة متكاملة من حلول التظليل والتغطية والبرجولات والخيام بأعلى معايير الحرفية.
          </p>
        </div>

        {/* Categories Grid or Empty State */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                onClick={() => onSelectCategory(cat.id)}
                className="group relative flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-[#141F1A] border border-[#C5A880]/20 hover:border-[#C5A880]/60 shadow-sm hover:shadow-xl transition-all cursor-pointer"
              >
                {/* Image Container with 16:10 aspect ratio */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100 dark:bg-stone-900">
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <ImagePlaceholder title={cat.name} className="w-full h-full" iconSize={32} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  
                  <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between">
                    <span className="text-xs font-bold px-3 py-1 rounded-lg bg-black/60 text-[#FAF8F5] backdrop-blur-sm border border-white/10">
                      استكشف الأعمال
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#12261E] dark:text-[#FAF8F5] group-hover:text-[#A88758] dark:group-hover:text-[#C5A880] transition-colors mb-2">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-sm text-[#5C7063] dark:text-[#A0B3A6] line-clamp-2 leading-relaxed mb-4">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  <div className="inline-flex items-center gap-2 text-xs font-bold text-[#A88758] dark:text-[#C5A880] group-hover:translate-x-[-4px] transition-transform">
                    <span>عرض التفاصيل والمواصفات</span>
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="لا توجد أصناف مضافة حالياً"
            description="لم يقم مالك الموقع بإضافة أصناف حتى الآن. يمكنك إضافة الأصناف والصور الخاصة بالشركة من لوحة التحكم."
            actionText={onOpenAdmin ? "إضافة أول صنف من لوحة التحكم" : undefined}
            onAction={onOpenAdmin}
          />
        )}
      </div>
    </section>
  );
};
