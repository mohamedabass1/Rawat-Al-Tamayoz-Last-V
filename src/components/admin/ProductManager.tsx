import React, { useState, useEffect, useMemo } from 'react';
import type { Product, Category, ProductImage } from '../../types';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from './ConfirmDialog';
import { 
  Plus, Edit2, Trash2, Eye, EyeOff, Upload, Image as ImageIcon, Check, X, 
  Loader2, Search, Filter, Star, ArrowRight, ArrowLeft, MessageSquare, 
  Sparkles, Layers, Package, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductManagerProps {
  onRefreshStats: () => void;
  openCreateDirectly?: boolean;
}

export const ProductManager: React.FC<ProductManagerProps> = ({
  onRefreshStats,
  openCreateDirectly
}) => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formShortDescription, setFormShortDescription] = useState('');
  const [formFullDescription, setFormFullDescription] = useState('');
  const [formFeatures, setFormFeatures] = useState<string[]>([]);
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [formUsages, setFormUsages] = useState<string[]>([]);
  const [newUsageInput, setNewUsageInput] = useState('');
  const [formWhatsappMessage, setFormWhatsappMessage] = useState('');
  const [formImages, setFormImages] = useState<ProductImage[]>([]);
  const [formSortOrder, setFormSortOrder] = useState<number>(1);
  const [formIsActive, setFormIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Delete State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        api.getAdminProducts(),
        api.getAdminCategories()
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err: any) {
      showToast(err.message || 'فشل جلب المنتجات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (openCreateDirectly) {
      handleOpenCreate();
    }
  }, [openCreateDirectly]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategoryId(categories[0]?.id || '');
    setFormShortDescription('');
    setFormFullDescription('');
    setFormFeatures([]);
    setNewFeatureInput('');
    setFormUsages([]);
    setNewUsageInput('');
    setFormWhatsappMessage('');
    setFormImages([]);
    setFormSortOrder(products.length + 1);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormCategoryId(product.categoryId || '');
    setFormShortDescription(product.shortDescription || '');
    setFormFullDescription(product.fullDescription || '');
    setFormFeatures(product.features ? [...product.features] : []);
    setNewFeatureInput('');
    setFormUsages(product.usages ? [...product.usages] : []);
    setNewUsageInput('');
    setFormWhatsappMessage(product.whatsappMessage || '');
    setFormImages(product.images ? [...product.images] : (product.coverImage ? [{ id: 'img-cover', url: product.coverImage, isCover: true, sortOrder: 1 }] : []));
    setFormSortOrder(product.sortOrder || 1);
    setFormIsActive(product.isActive);
    setIsModalOpen(true);
  };

  const handleAddFeature = () => {
    if (!newFeatureInput.trim()) return;
    setFormFeatures(prev => [...prev, newFeatureInput.trim()]);
    setNewFeatureInput('');
  };

  const handleRemoveFeature = (index: number) => {
    setFormFeatures(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddUsage = () => {
    if (!newUsageInput.trim()) return;
    setFormUsages(prev => [...prev, newUsageInput.trim()]);
    setNewUsageInput('');
  };

  const handleRemoveUsage = (index: number) => {
    setFormUsages(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls = await api.uploadFiles(Array.from(files));
      if (uploadedUrls && uploadedUrls.length > 0) {
        const newImages: ProductImage[] = uploadedUrls.map((url, i) => ({
          id: `img-${Date.now()}-${i}`,
          url,
          isCover: formImages.length === 0 && i === 0, // Set first uploaded as cover if empty
          sortOrder: formImages.length + i + 1
        }));
        setFormImages(prev => [...prev, ...newImages]);
        showToast(`تم رفع ${uploadedUrls.length} صورة بنجاح`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'فشل رفع الصور', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetCoverImage = (index: number) => {
    setFormImages(prev => prev.map((img, i) => ({
      ...img,
      isCover: i === index
    })));
  };

  const handleRemoveImage = (index: number) => {
    setFormImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // If we removed the cover, mark the first one as cover
      if (updated.length > 0 && !updated.some(img => img.isCover)) {
        updated[0].isCover = true;
      }
      return updated;
    });
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    setFormImages(prev => {
      const newImages = [...prev];
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newImages.length) return prev;
      const temp = newImages[index];
      newImages[index] = newImages[targetIndex];
      newImages[targetIndex] = temp;
      return newImages;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('يرجى إدخال اسم المنتج', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const cover = formImages.find(img => img.isCover)?.url || formImages[0]?.url || '';

      const payload = {
        name: formName.trim(),
        categoryId: formCategoryId,
        shortDescription: formShortDescription.trim(),
        fullDescription: formFullDescription.trim(),
        features: formFeatures,
        usages: formUsages,
        whatsappMessage: formWhatsappMessage.trim(),
        images: formImages,
        coverImage: cover,
        sortOrder: Number(formSortOrder),
        isActive: formIsActive
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        showToast('تم تحديث المنتج بنجاح', 'success');
      } else {
        await api.createProduct(payload);
        showToast('تمت إضافة المنتج بنجاح', 'success');
      }

      setIsModalOpen(false);
      fetchData();
      onRefreshStats();
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ المنتج', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const newStatus = !product.isActive;
      await api.updateProduct(product.id, { isActive: newStatus });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, isActive: newStatus } : p));
      showToast(newStatus ? 'تم تفعيل المنتج وظهوره للزوار' : 'تم تعطيل المنتج وإخفاؤه', 'info');
      onRefreshStats();
    } catch (err: any) {
      showToast(err.message || 'فشل تغيير حالة المنتج', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteProduct(productToDelete.id);
      showToast('تم حذف المنتج بنجاح', 'success');
      setProductToDelete(null);
      fetchData();
      onRefreshStats();
    } catch (err: any) {
      showToast(err.message || 'فشل حذف المنتج', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (selectedCategoryFilter !== 'ALL' && p.categoryId !== selectedCategoryFilter) {
        return false;
      }
      if (statusFilter === 'ACTIVE' && !p.isActive) return false;
      if (statusFilter === 'INACTIVE' && p.isActive) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.shortDescription.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, selectedCategoryFilter, statusFilter, searchQuery]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach(c => map.set(c.id, c.name));
    return map;
  }, [categories]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#12261E] dark:text-[#FAF8F5]">
            إدارة المنتجات والمواصفات المعمارية
          </h2>
          <p className="text-xs text-[#5B6F62] dark:text-[#9FB2A5]">
            إضافة وتعديل المنتجات، رفع الصور وتحديد الغلاف، وتخصيص رسائل الواتساب.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#12261E] dark:bg-[#C5A880] text-white dark:text-[#0D1411] font-bold text-xs sm:text-sm shadow-md hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#131D18] border border-[#C5A880]/20 flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو الوصف..."
            className="w-full pl-4 pr-10 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#0E1512] border border-[#C5A880]/30 text-xs sm:text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-56">
          <select
            value={selectedCategoryFilter}
            onChange={e => setSelectedCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#0E1512] border border-[#C5A880]/30 text-xs sm:text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
          >
            <option value="ALL">جميع الأصناف</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-44">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#0E1512] border border-[#C5A880]/30 text-xs sm:text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="ACTIVE">النشطة فقط</option>
            <option value="INACTIVE">المعطلة فقط</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="p-12 text-center text-sm text-[#7B8F82] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>جارٍ تحميل المنتجات...</span>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#131D18] border border-[#C5A880]/20 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-[#FAF8F5] dark:bg-[#0E1512] border-b border-[#C5A880]/15 text-xs text-[#63776B] dark:text-[#A0B3A6] font-bold">
                <tr>
                  <th className="p-4">الغلاف</th>
                  <th className="p-4">اسم المنتج</th>
                  <th className="p-4">الصنف</th>
                  <th className="p-4 text-center">الصور</th>
                  <th className="p-4 text-center">الحالة</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filteredProducts.map(product => {
                  const cover = product.coverImage || product.images?.[0]?.url;
                  const imgCount = product.images?.length || (cover ? 1 : 0);
                  const catName = categoryMap.get(product.categoryId) || '—';

                  return (
                    <tr key={product.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 w-16">
                        <div className="w-12 h-10 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 border border-black/10 dark:border-white/10 shrink-0">
                          {cover ? (
                            <img src={cover} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-[#12261E] dark:text-[#FAF8F5]">
                          {product.name}
                        </div>
                        {product.shortDescription && (
                          <div className="text-xs text-[#5B6F62] dark:text-[#9FB2A5] max-w-xs truncate">
                            {product.shortDescription}
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-xs font-semibold text-[#A88758] dark:text-[#C5A880]">
                        {catName}
                      </td>

                      <td className="p-4 text-center font-mono font-semibold text-xs text-[#7B8F82]">
                        {imgCount} صورة
                      </td>

                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(product)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            product.isActive
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-stone-500/10 text-stone-500 hover:bg-stone-500/20'
                          }`}
                          title="انقر لتغيير حالة الظهور"
                        >
                          {product.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span>{product.isActive ? 'نشط' : 'معطل'}</span>
                        </button>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(product)}
                            className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-[#C5A880]/15 hover:text-[#A88758] transition-colors"
                            title="تعديل المنتج"
                            aria-label="تعديل المنتج"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductToDelete(product)}
                            className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-rose-500/10 hover:text-rose-600 transition-colors"
                            title="حذف المنتج"
                            aria-label="حذف المنتج"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-[#C5A880]/30 bg-white dark:bg-[#131D18] space-y-4">
          <Package className="w-12 h-12 text-stone-400 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-[#12261E] dark:text-[#FAF8F5]">
              لا توجد منتجات مطابقة
            </h3>
            <p className="text-xs text-[#627668] dark:text-[#A0B3A6] max-w-sm mx-auto mt-1">
              أضف أول منتج حقيقي مع الصور والمواصفات ليظهر لزوار الموقع.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#12261E] dark:bg-[#C5A880] text-white dark:text-[#0D1411] font-bold text-xs shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج جديد الآن</span>
          </button>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[10500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="fixed inset-0" onClick={() => setIsModalOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-3xl p-6 sm:p-8 rounded-3xl bg-[#FAF8F5] dark:bg-[#121A16] border border-[#C5A880]/30 shadow-2xl z-10 text-right max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6 border-b border-[#C5A880]/20 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#12261E] dark:text-[#FAF8F5]">
                    {editingProduct ? 'تعديل بيانات المنتج والمواصفات' : 'إضافة منتج معماري جديد'}
                  </h3>
                  <span className="text-xs text-[#7B8F82]">رفع الصور الحقيقية والمواصفات</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-white bg-black/5 dark:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
                      اسم المنتج <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      placeholder="مثال: مظلة هرمية لسيارتين، برجولة خشب معالج..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0E1512] border border-[#C5A880]/30 focus:border-[#C5A880] text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
                      الصنف التابع له
                    </label>
                    <select
                      value={formCategoryId}
                      onChange={e => setFormCategoryId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0E1512] border border-[#C5A880]/30 focus:border-[#C5A880] text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
                    >
                      <option value="">-- بدون صنف محدد --</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
                    وصف مختصر (يظهر بالبطاقة الرئيسية)
                  </label>
                  <input
                    type="text"
                    value={formShortDescription}
                    onChange={e => setFormShortDescription(e.target.value)}
                    placeholder="نبذة سريعة عن نوع القماش أو الهيكل..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0E1512] border border-[#C5A880]/30 focus:border-[#C5A880] text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
                    الوصف الكامل والمواصفات الهندسية
                  </label>
                  <textarea
                    rows={4}
                    value={formFullDescription}
                    onChange={e => setFormFullDescription(e.target.value)}
                    placeholder="اكتب المواصفات التفصيلية، سُمك الحديد، نسبة العزل، طريقة الدهان، وفترة الضمان..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0E1512] border border-[#C5A880]/30 focus:border-[#C5A880] text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Multi-Image Upload & Management */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1512] border border-[#C5A880]/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#12261E] dark:text-[#FAF8F5] flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#A88758] dark:text-[#C5A880]" />
                      <span>معرض صور المنتج (اختر صورة الغلاف)</span>
                    </label>
                    <span className="text-xs text-[#7B8F82] font-mono">
                      {formImages.length} صورة
                    </span>
                  </div>

                  {/* Dropzone Upload Button */}
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#C5A880]/40 hover:border-[#C5A880] rounded-2xl cursor-pointer bg-[#FAF8F5] dark:bg-[#131E18] transition-colors text-center group">
                    {isUploading ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-[#A88758]">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>جارٍ رفع الصور إلى الخادم...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-[#A88758] dark:text-[#C5A880] mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold text-[#12261E] dark:text-[#FAF8F5]">
                          اسحب الصور هنا أو انقر لاختيار عدة صور
                        </span>
                        <span className="text-xs text-[#7B8F82] mt-1">
                          يدعم JPG, PNG, WEBP حتى 10 ميجابايت للصورة
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleUploadImages}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>

                  {/* Uploaded Images Grid */}
                  {formImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {formImages.map((img, idx) => (
                        <div
                          key={img.id || idx}
                          className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all group ${
                            img.isCover
                              ? 'border-[#C5A880] ring-2 ring-[#C5A880]/40 shadow-md'
                              : 'border-black/10 dark:border-white/10'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt="معاينة"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />

                          {/* Cover badge */}
                          {img.isCover && (
                            <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-[#12261E] text-[#C5A880] text-[10px] font-bold shadow-xs">
                              الغلاف
                            </span>
                          )}

                          {/* Hover Actions Bar */}
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <div className="flex items-center justify-between">
                              {!img.isCover && (
                                <button
                                  type="button"
                                  onClick={() => handleSetCoverImage(idx)}
                                  className="p-1 rounded-md bg-white/20 hover:bg-[#C5A880] text-white hover:text-black text-[10px] font-bold transition-colors"
                                  title="تعيين كصورة غلاف"
                                >
                                  تعيين غلاف
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="p-1 rounded-md bg-rose-600/80 hover:bg-rose-600 text-white transition-colors mr-auto"
                                title="حذف الصورة"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center justify-center gap-1">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(idx, 'left')}
                                  className="p-1 rounded bg-white/20 text-white hover:bg-white/40"
                                  title="تقديم"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                              {idx < formImages.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveImage(idx, 'right')}
                                  className="p-1 rounded bg-white/20 text-white hover:bg-white/40"
                                  title="تأخير"
                                >
                                  <ArrowLeft className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Features Tags List */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1512] border border-[#C5A880]/30 space-y-3">
                  <label className="block text-xs font-bold text-[#12261E] dark:text-[#FAF8F5]">
                    المميزات والمواصفات الفنية (نقاط مميزة)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFeatureInput}
                      onChange={e => setNewFeatureInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                      placeholder="مثال: ضمان 10 سنوات على الهيكل / قماش ألماني مقاوم للحريق..."
                      className="flex-1 px-4 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#121A16] border border-[#C5A880]/30 text-xs sm:text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="px-4 py-2 rounded-xl bg-[#12261E] dark:bg-[#C5A880] text-white dark:text-[#0D1411] text-xs font-bold"
                    >
                      إضافة
                    </button>
                  </div>

                  {formFeatures.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {formFeatures.map((feat, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#C5A880]/15 text-[#12261E] dark:text-[#E2C79E] text-xs font-medium border border-[#C5A880]/30"
                        >
                          <span>{feat}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(idx)}
                            className="hover:text-rose-500"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Usages Tags List */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1512] border border-[#C5A880]/30 space-y-3">
                  <label className="block text-xs font-bold text-[#12261E] dark:text-[#FAF8F5]">
                    الاستخدامات والتطبيقات المناسبة
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newUsageInput}
                      onChange={e => setNewUsageInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddUsage(); } }}
                      placeholder="مثال: فلل سكنية، قصور، استراحات، مسابح، مواقف سيارات..."
                      className="flex-1 px-4 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#121A16] border border-[#C5A880]/30 text-xs sm:text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddUsage}
                      className="px-4 py-2 rounded-xl bg-[#12261E] dark:bg-[#C5A880] text-white dark:text-[#0D1411] text-xs font-bold"
                    >
                      إضافة
                    </button>
                  </div>

                  {formUsages.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {formUsages.map((useCase, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-[#2E3E33] dark:text-[#A9BCAE] text-xs font-medium border border-black/10 dark:border-white/10"
                        >
                          <span>{useCase}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveUsage(idx)}
                            className="hover:text-rose-500"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* WhatsApp Message Template */}
                <div>
                  <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#A88758]" />
                    <span>نص رسالة واتساب المخصصة لهذا المنتج (اختياري)</span>
                  </label>
                  <input
                    type="text"
                    value={formWhatsappMessage}
                    onChange={e => setFormWhatsappMessage(e.target.value)}
                    placeholder="اتركه فارغاً لاستخدام الرسالة الافتراضية، أو اكتب رسالة خاصة..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0E1512] border border-[#C5A880]/30 focus:border-[#C5A880] text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
                  />
                </div>

                {/* Sort Order & Visibility */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
                      ترتيب الظهور
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formSortOrder}
                      onChange={e => setFormSortOrder(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0E1512] border border-[#C5A880]/30 focus:border-[#C5A880] text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
                      حالة الظهور
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormIsActive(!formIsActive)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        formIsActive
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-stone-500/10 border-stone-500/30 text-stone-500'
                      }`}
                    >
                      {formIsActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      <span>{formIsActive ? 'نشط (ظاهر للزوار)' : 'معطل (مخفي)'}</span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-black/5 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#4A5D51] dark:text-[#A0B3A6]"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-[#12261E] dark:bg-[#C5A880] text-white dark:text-[#0D1411] font-bold text-sm shadow-md hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>حفظ المنتج</span>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!productToDelete}
        title="تأكيد حذف المنتج"
        message={`هل أنت متأكد من رغبتك في حذف المنتج "${productToDelete?.name}" نهائياً من قاعدة البيانات؟`}
        confirmText="نعم، احذف المنتج"
        onConfirm={handleConfirmDelete}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
};
