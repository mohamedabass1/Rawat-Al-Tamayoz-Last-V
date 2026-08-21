import React from 'react';
import type { Product, Category } from '../../types';
import { ImagePlaceholder } from '../common/ImagePlaceholder';
import { Images, ArrowLeft, MessageSquare } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  category?: Category;
  onViewDetails: (product: Product) => void;
  onDirectWhatsapp?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  category,
  onViewDetails,
  onDirectWhatsapp
}) => {
  const displayImage = product.coverImage || product.images?.[0]?.url || '';
  const imagesCount = product.images?.length || (displayImage ? 1 : 0);

  return (
    <div
      onClick={() => onViewDetails(product)}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-[#131D18] border border-[#C5A880]/20 hover:border-[#C5A880]/70 shadow-sm hover:shadow-xl transition-all cursor-pointer"
      dir="rtl"
    >
      {/* Visual Image container with 4:3 ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 dark:bg-stone-900">
        {displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <ImagePlaceholder title={product.name} className="w-full h-full" iconSize={28} />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />

        {/* Category Tag & Image count badge */}
        <div className="absolute top-3 right-3 left-3 flex items-center justify-between pointer-events-none">
          {category && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-[#12261E]/80 text-[#E8EFEA] backdrop-blur-md border border-[#C5A880]/30 shadow-xs">
              {category.name}
            </span>
          )}
          {imagesCount > 1 && (
            <span className="text-[11px] font-mono font-semibold px-2 py-1 rounded-md bg-black/60 text-white backdrop-blur-md flex items-center gap-1 border border-white/10 mr-auto">
              <Images className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>{imagesCount}</span>
            </span>
          )}
        </div>
      </div>

      {/* Product Content */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#12261E] dark:text-[#FAF8F5] group-hover:text-[#A88758] dark:group-hover:text-[#C5A880] transition-colors line-clamp-1 mb-1.5">
            {product.name}
          </h3>

          {product.shortDescription && (
            <p className="text-xs sm:text-sm text-[#5B6F62] dark:text-[#9FB2A5] line-clamp-2 leading-relaxed mb-4">
              {product.shortDescription}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
          <span className="text-xs font-bold text-[#12261E] dark:text-[#C5A880] flex items-center gap-1.5 group-hover:translate-x-[-3px] transition-transform">
            <span>عرض التفاصيل</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </span>

          <span className="text-xs font-medium text-[#7C9183] dark:text-[#8B9F92]">
            استفسار فوري
          </span>
        </div>
      </div>
    </div>
  );
};
