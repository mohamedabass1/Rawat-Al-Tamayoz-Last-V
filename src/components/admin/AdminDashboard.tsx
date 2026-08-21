import React, { useState } from 'react';
import type { DashboardStats, Category, Product } from '../../types';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Layers, Package, CheckCircle2, Image as ImageIcon, Plus, Settings, Sparkles, ExternalLink, RefreshCw, Briefcase } from 'lucide-react';

interface AdminDashboardProps {
  stats: DashboardStats | null;
  onNavigateTab: (tab: string) => void;
  onRefreshStats: () => void;
  onOpenAddProduct: () => void;
  onOpenAddCategory: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  onNavigateTab,
  onRefreshStats,
  onOpenAddProduct,
  onOpenAddCategory
}) => {
  const { showToast } = useToast();
  const [seeding, setSeeding] = useState(false);

  const handleSeedStarterCategories = async () => {
    setSeeding(true);
    try {
      const res = await api.seedStarterCategories();
      showToast(`تمت إضافة ${res.count} تصنيفات هيكلية مقترحة بنجاح!`, 'success');
      onRefreshStats();
    } catch (err: any) {
      showToast(err.message || 'فشلت إضافة التصنيفات', 'error');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#131D18] border border-[#C5A880]/20 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#12261E] dark:text-[#FAF8F5] mb-1">
            مرحباً بك في لوحة تحكم مؤسسة روعة التميز
          </h1>
          <p className="text-xs sm:text-sm text-[#5B6F62] dark:text-[#9FB2A5]">
            تحكم بالكامل في محتوى الموقع، الأصناف، صور المنتجات، ورسائل الواتساب.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefreshStats}
            className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#12261E] dark:text-white transition-colors"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onOpenAddProduct}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#12261E] dark:bg-[#C5A880] text-white dark:text-[#0D1411] font-bold text-xs sm:text-sm shadow-md hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج جديد</span>
          </button>
        </div>
      </div>

      {/* Metrics Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => onNavigateTab('categories')}
          className="p-6 rounded-2xl bg-white dark:bg-[#131D18] border border-[#C5A880]/20 hover:border-[#C5A880]/60 shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#6D8073]">إجمالي الأصناف</span>
            <div className="w-10 h-10 rounded-xl bg-[#12261E]/5 dark:bg-white/5 text-[#A88758] dark:text-[#C5A880] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#12261E] dark:text-[#FAF8F5] mb-1 font-mono">
            {stats?.totalCategories ?? 0}
          </div>
          <span className="text-xs text-[#A88758] dark:text-[#C5A880] font-semibold">إدارة الأصناف ←</span>
        </div>

        <div
          onClick={() => onNavigateTab('products')}
          className="p-6 rounded-2xl bg-white dark:bg-[#131D18] border border-[#C5A880]/20 hover:border-[#C5A880]/60 shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#6D8073]">إجمالي المنتجات</span>
            <div className="w-10 h-10 rounded-xl bg-[#12261E]/5 dark:bg-white/5 text-[#A88758] dark:text-[#C5A880] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#12261E] dark:text-[#FAF8F5] mb-1 font-mono">
            {stats?.totalProducts ?? 0}
          </div>
          <span className="text-xs text-[#A88758] dark:text-[#C5A880] font-semibold">إدارة المنتجات ←</span>
        </div>

        <div
          onClick={() => onNavigateTab('products')}
          className="p-6 rounded-2xl bg-white dark:bg-[#131D18] border border-[#C5A880]/20 hover:border-[#C5A880]/60 shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#6D8073]">المنتجات النشطة (الظاهرة)</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400 mb-1 font-mono">
            {stats?.activeProducts ?? 0}
          </div>
          <span className="text-xs text-emerald-600 font-semibold">تصفح المعروض ←</span>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#131D18] border border-[#C5A880]/20 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#6D8073]">الصور المرفوعة</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#12261E] dark:text-[#FAF8F5] mb-1 font-mono">
            {stats?.totalImages ?? 0}
          </div>
          <span className="text-xs text-[#7B8F82]">إجمالي الصور الحقيقية</span>
        </div>
      </div>

      {/* Quick Starter Setup Helper (When catalog is empty) */}
      {stats && stats.totalCategories === 0 && (
        <div className="p-6 rounded-2xl bg-[#C5A880]/15 border border-[#C5A880]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#12261E] dark:text-[#FAF8F5] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#A88758] dark:text-[#C5A880]" />
              <span>تسهيل البدء: إنشاء أصناف معمارية أساسية بنقرة واحدة</span>
            </h3>
            <p className="text-xs text-[#4F6355] dark:text-[#BAC9BE]">
              يقوم هذا الزر بإضافة أصناف قياسية حقيقية فارغة (مظلات، سواتر، برجولات، خيام، إلخ) دون إضافة أي منتجات وهمية.
            </p>
          </div>
          <button
            type="button"
            disabled={seeding}
            onClick={handleSeedStarterCategories}
            className="shrink-0 px-5 py-2.5 rounded-xl bg-[#12261E] dark:bg-[#C5A880] text-white dark:text-[#0D1411] font-bold text-xs shadow-md hover:opacity-90 disabled:opacity-50"
          >
            {seeding ? 'جارٍ الإنشاء...' : 'إضافة الأصناف المقترحة'}
          </button>
        </div>
      )}

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <button
          type="button"
          onClick={onOpenAddCategory}
          className="p-5 rounded-2xl bg-white dark:bg-[#131D18] border border-[#C5A880]/20 hover:border-[#C5A880] text-right transition-all flex items-center justify-between group shadow-xs"
        >
          <div>
            <h4 className="text-sm font-bold text-[#12261E] dark:text-[#FAF8F5] mb-1">
              إضافة صنف جديد
            </h4>
            <p className="text-xs text-[#7B8F82]">إنشاء صنف جديد لتصنيف المنتجات</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#12261E]/5 dark:bg-white/5 text-[#A88758] flex items-center justify-center group-hover:bg-[#12261E] group-hover:text-white transition-colors">
            <Plus className="w-4 h-4" />
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenAddProduct}
          className="p-5 rounded-2xl bg-white dark:bg-[#131D18] border border-[#C5A880]/20 hover:border-[#C5A880] text-right transition-all flex items-center justify-between group shadow-xs"
        >
          <div>
            <h4 className="text-sm font-bold text-[#12261E] dark:text-[#FAF8F5] mb-1">
              إضافة منتج مع صور
            </h4>
            <p className="text-xs text-[#7B8F82]">رفع صور حقيقية ومواصفات المنتج</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#12261E]/5 dark:bg-white/5 text-[#A88758] flex items-center justify-center group-hover:bg-[#12261E] group-hover:text-white transition-colors">
            <Plus className="w-4 h-4" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('settings')}
          className="p-5 rounded-2xl bg-white dark:bg-[#131D18] border border-[#C5A880]/20 hover:border-[#C5A880] text-right transition-all flex items-center justify-between group shadow-xs"
        >
          <div>
            <h4 className="text-sm font-bold text-[#12261E] dark:text-[#FAF8F5] mb-1">
              إعدادات الشعار والواتساب
            </h4>
            <p className="text-xs text-[#7B8F82]">تعديل أرقام التواصل وروابط الشركة</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#12261E]/5 dark:bg-white/5 text-[#A88758] flex items-center justify-center group-hover:bg-[#12261E] group-hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* Recent Items Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Products */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#131D18] border border-[#C5A880]/20 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#12261E] dark:text-[#FAF8F5]">
              آخر المنتجات المضافة
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('products')}
              className="text-xs text-[#A88758] dark:text-[#C5A880] font-semibold hover:underline"
            >
              عرض الكل ({stats?.totalProducts || 0})
            </button>
          </div>

          {stats?.recentProducts && stats.recentProducts.length > 0 ? (
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {stats.recentProducts.map(prod => (
                <div key={prod.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0">
                      {prod.coverImage ? (
                        <img src={prod.coverImage} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                          <Package className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-[#12261E] dark:text-[#FAF8F5] line-clamp-1">
                        {prod.name}
                      </div>
                      <div className="text-[11px] text-[#7B8F82]">
                        {new Date(prod.createdAt).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    prod.isActive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-stone-500/10 text-stone-500'
                  }`}>
                    {prod.isActive ? 'نشط' : 'معطل'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#7B8F82]">
              لم تتم إضافة منتجات بعد.
            </div>
          )}
        </div>

        {/* Recent Categories */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#131D18] border border-[#C5A880]/20 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#12261E] dark:text-[#FAF8F5]">
              الأصناف المسجلة
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('categories')}
              className="text-xs text-[#A88758] dark:text-[#C5A880] font-semibold hover:underline"
            >
              عرض الكل ({stats?.totalCategories || 0})
            </button>
          </div>

          {stats?.recentCategories && stats.recentCategories.length > 0 ? (
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {stats.recentCategories.map(cat => (
                <div key={cat.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0">
                      {cat.imageUrl ? (
                        <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                          <Layers className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-[#12261E] dark:text-[#FAF8F5]">
                        {cat.name}
                      </div>
                      <div className="text-[11px] text-[#7B8F82] line-clamp-1">
                        {cat.description || 'بدون وصف مختصر'}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    cat.isActive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-stone-500/10 text-stone-500'
                  }`}>
                    {cat.isActive ? 'نشط' : 'معطل'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#7B8F82]">
              لم تتم إضافة أصناف بعد.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
