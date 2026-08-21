import React, { useState, useMemo } from 'react';
import type { Product, Category } from '../../types';
import { ProductCard } from './ProductCard';
import { EmptyState } from '../common/EmptyState';
import { Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onViewProduct: (product: Product) => void;
  onOpenAdmin?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  categories,
  selectedCategoryId,
  onSelectCategory,
  onViewProduct,
  onOpenAdmin
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category filter
      if (selectedCategoryId && product.categoryId !== selectedCategoryId) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchShort = product.shortDescription?.toLowerCase().includes(q);
        const matchFull = product.fullDescription?.toLowerCase().includes(q);
        const matchFeatures = product.features?.some(f => f.toLowerCase().includes(q));
        if (!matchName && !matchShort && !matchFull && !matchFeatures) {
          return false;
        }
      }
      return true;
    });
  }, [products, selectedCategoryId, searchQuery]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach(c => map.set(c.id, c));
    return map;
  }, [categories]);

  const activeCategory = selectedCategoryId ? categoryMap.get(selectedCategoryId) : null;

  return (
    <section id="products" className="py-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A88758] dark:text-[#C5A880] mb-2">
              <Sparkles className="w-4 h-4" />
              <span>معرض الأعمال والمواصفات</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#12261E] dark:text-[#FAF8F5] tracking-tight">
              استكشف حلولنا المصممة بدقة
            </h2>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#7B8F82] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في المنتجات والحلول..."
              className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white dark:bg-[#141E19] border border-[#C5A880]/30 focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none transition-all placeholder:text-[#889B8F]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-white"
                aria-label="مسح البحث"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Filter */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedCategoryId === null
                  ? 'bg-[#12261E] dark:bg-[#C5A880] text-[#FAF8F5] dark:text-[#0D1411] shadow-md'
                  : 'bg-white dark:bg-[#141F1A] text-[#4A5E51] dark:text-[#A0B3A6] border border-[#C5A880]/20 hover:border-[#C5A880]/50'
              }`}
            >
              الكل ({products.length})
            </button>

            {categories.map(cat => {
              const isSelected = selectedCategoryId === cat.id;
              const count = products.filter(p => p.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(isSelected ? null : cat.id)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#12261E] dark:bg-[#C5A880] text-[#FAF8F5] dark:text-[#0D1411] shadow-md'
                      : 'bg-white dark:bg-[#141F1A] text-[#4A5E51] dark:text-[#A0B3A6] border border-[#C5A880]/20 hover:border-[#C5A880]/50'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[11px] opacity-70 font-mono">({count})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Active Category Banner if filtered */}
        {activeCategory && (
          <div className="mb-6 p-4 rounded-xl bg-[#C5A880]/10 border border-[#C5A880]/25 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#A88758] dark:text-[#C5A880]">عرض منتجات صنف:</span>
              <span className="text-sm font-bold text-[#12261E] dark:text-[#FAF8F5]">{activeCategory.name}</span>
            </div>
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              className="text-xs font-semibold text-[#A88758] dark:text-[#C5A880] hover:underline"
            >
              عرض جميع الأصناف
            </button>
          </div>
        )}

        {/* Products Grid or Empty States */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                category={categoryMap.get(product.categoryId)}
                onViewDetails={onViewProduct}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={
              searchQuery
                ? 'لا توجد نتائج مطابقة لبحثك'
                : selectedCategoryId
                ? 'لا توجد منتجات مضافة في هذا الصنف حالياً'
                : 'لا توجد منتجات مضافة حالياً'
            }
            description={
              searchQuery
                ? 'جرب البحث بكلمات أخرى أو اختر صنفاً مختلفاً.'
                : 'يتم إضافة وتحديث المنتجات والمواصفات والصور من لوحة التحكم.'
            }
            actionText={
              searchQuery
                ? 'إعادة تعيين البحث'
                : onOpenAdmin
                ? 'إضافة منتج جديد من لوحة التحكم'
                : undefined
            }
            onAction={
              searchQuery
                ? () => setSearchQuery('')
                : onOpenAdmin
            }
          />
        )}
      </div>
    </section>
  );
};
