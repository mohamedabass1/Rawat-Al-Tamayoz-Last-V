import React, { useState, useEffect } from 'react';
import type { Category } from '../../types';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from './ConfirmDialog';
import { Plus, Edit2, Trash2, Eye, EyeOff, Upload, Image as ImageIcon, Check, X, Loader2, ArrowUpDown, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CategoryManagerProps {
  onRefreshStats: () => void;
  openCreateDirectly?: boolean;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  onRefreshStats,
  openCreateDirectly
}) => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formSortOrder, setFormSortOrder] = useState<number>(1);
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Delete state
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminCategories();
      setCategories(data);
    } catch (err: any) {
      showToast(err.message || 'فشل جلب الأصناف', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (openCreateDirectly) {
      handleOpenCreate();
    }
  }, [openCreateDirectly]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormName('');
    setFormDescription('');
    setFormImageUrl('');
    setFormSortOrder(categories.length + 1);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormDescription(category.description || '');
    setFormImageUrl(category.imageUrl || '');
    setFormSortOrder(category.sortOrder || 1);
    setFormIsActive(category.isActive);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls = await api.uploadFiles(Array.from(files));
      if (uploadedUrls && uploadedUrls.length > 0) {
        setFormImageUrl(uploadedUrls[0]);
        showToast('تم رفع صورة الصنف بنجاح', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'فشل رفع الصورة', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('يرجى إدخال اسم الصنف', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, {
          name: formName.trim(),
          description: formDescription.trim(),
          imageUrl: formImageUrl,
          sortOrder: Number(formSortOrder),
          isActive: formIsActive
        });
        showToast('تم تحديث بيانات الصنف بنجاح', 'success');
      } else {
        await api.createCategory({
          name: formName.trim(),
          description: formDescription.trim(),
          imageUrl: formImageUrl,
          sortOrder: Number(formSortOrder),
          isActive: formIsActive
        });
        showToast('تمت إضافة الصنف الجديد بنجاح', 'success');
      }
      setIsModalOpen(false);
      fetchCategories();
      onRefreshStats();
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ الصنف', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      const newStatus = !category.isActive;
      await api.updateCategory(category.id, { isActive: newStatus });
      setCategories(prev => prev.map(c => c.id === category.id ? { ...c, isActive: newStatus } : c));
      showToast(newStatus ? 'تم تفعيل الصنف للزوار' : 'تم تعطيل الصنف وإخفاؤه من الزوار', 'info');
      onRefreshStats();
    } catch (err: any) {
      showToast(err.message || 'فشل تغيير حالة الصنف', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteCategory(categoryToDelete.id);
      showToast(`تم حذف الصنف بنجاح ${res.affectedProducts > 0 ? `(تم فك ارتباط ${res.affectedProducts} منتج)` : ''}`, 'success');
      setCategoryToDelete(null);
      fetchCategories();
      onRefreshStats();
    } catch (err: any) {
      showToast(err.message || 'فشل حذف الصنف', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#12261E] dark:text-[#FAF8F5]">
            إدارة الأصناف والخدمات
          </h2>
          <p className="text-xs text-[#5B6F62] dark:text-[#9FB2A5]">
            إضافة وتعديل التصنيفات المعمارية، ترتيب ظهورها، وصور الغلاف.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#12261E] dark:bg-[#C5A880] text-white dark:text-[#0D1411] font-bold text-xs sm:text-sm shadow-md hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة صنف جديد</span>
        </button>
      </div>

      {/* Categories Table / List */}
      {loading ? (
        <div className="p-12 text-center text-sm text-[#7B8F82] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>جارٍ تحميل الأصناف...</span>
        </div>
      ) : categories.length > 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#131D18] border border-[#C5A880]/20 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-[#FAF8F5] dark:bg-[#0E1512] border-b border-[#C5A880]/15 text-xs text-[#63776B] dark:text-[#A0B3A6] font-bold">
                <tr>
                  <th className="p-4">الصورة</th>
                  <th className="p-4">اسم الصنف</th>
                  <th className="p-4">الوصف</th>
                  <th className="p-4 text-center">الترتيب</th>
                  <th className="p-4 text-center">الحالة</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {categories.map(category => (
                  <tr key={category.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 w-16">
                      <div className="w-12 h-10 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 border border-black/10 dark:border-white/10 shrink-0">
                        {category.imageUrl ? (
                          <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <Layers className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4 font-bold text-[#12261E] dark:text-[#FAF8F5]">
                      {category.name}
                    </td>

                    <td className="p-4 text-xs text-[#5B6F62] dark:text-[#9FB2A5] max-w-xs truncate">
                      {category.description || '—'}
                    </td>

                    <td className="p-4 text-center font-mono font-semibold text-xs text-[#7B8F82]">
                      {category.sortOrder || 1}
                    </td>

                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(category)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          category.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-stone-500/10 text-stone-500 hover:bg-stone-500/20'
                        }`}
                        title="انقر لتغيير حالة الظهور"
                      >
                        {category.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{category.isActive ? 'نشط' : 'معطل'}</span>
                      </button>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(category)}
                          className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-[#C5A880]/15 hover:text-[#A88758] transition-colors"
                          title="تعديل الصنف"
                          aria-label="تعديل الصنف"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoryToDelete(category)}
                          className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-rose-500/10 hover:text-rose-600 transition-colors"
                          title="حذف الصنف"
                          aria-label="حذف الصنف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-[#C5A880]/30 bg-white dark:bg-[#131D18] space-y-4">
          <Layers className="w-12 h-12 text-stone-400 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-[#12261E] dark:text-[#FAF8F5]">
              لا توجد أصناف مضافة حتى الآن
            </h3>
            <p className="text-xs text-[#627668] dark:text-[#A0B3A6] max-w-sm mx-auto mt-1">
              ابدأ بإضافة أول صنف كالمظلات أو السواتر أو البرجولات لتنظيم المنتجات تحته.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#12261E] dark:bg-[#C5A880] text-white dark:text-[#0D1411] font-bold text-xs shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة أول صنف الآن</span>
          </button>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[10500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="fixed inset-0" onClick={() => setIsModalOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg p-6 rounded-3xl bg-[#FAF8F5] dark:bg-[#121A16] border border-[#C5A880]/30 shadow-2xl z-10 text-right max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#12261E] dark:text-[#FAF8F5]">
                  {editingCategory ? 'تعديل بيانات الصنف' : 'إضافة صنف معماري جديد'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-white bg-black/5 dark:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
                    اسم الصنف <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="مثال: مظلات وسواتر، برجولات، بيوت شعر..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0E1512] border border-[#C5A880]/30 focus:border-[#C5A880] text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
                    وصف مختصر للصنف
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    placeholder="نبذة سريعة تظهر في بطاقة الصنف على الموقع..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0E1512] border border-[#C5A880]/30 focus:border-[#C5A880] text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none resize-none"
                  />
                </div>

                {/* Category Image Upload */}
                <div>
                  <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
                    صورة غلاف الصنف
                  </label>
                  
                  {formImageUrl && (
                    <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden mb-3 border border-[#C5A880]/30 group">
                      <img src={formImageUrl} alt="صورة الصنف" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={() => setFormImageUrl('')}
                        className="absolute top-2 left-2 p-1.5 rounded-lg bg-rose-600 text-white shadow-md hover:bg-rose-700 transition-colors"
                        title="إزالة الصورة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-[#C5A880]/50 hover:border-[#C5A880] bg-white dark:bg-[#0E1512] cursor-pointer transition-colors text-xs font-semibold text-[#12261E] dark:text-[#FAF8F5]">
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#A88758]" />
                          <span>جارٍ رفع الصورة...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-[#A88758] dark:text-[#C5A880]" />
                          <span>رفع صورة حقيقية من جهازك</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

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
                      <span>{formIsActive ? 'نشط (ظاهر بالموقع)' : 'معطل (مخفي)'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
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
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>حفظ الصنف</span>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!categoryToDelete}
        title="تأكيد حذف الصنف"
        message={`هل أنت متأكد من رغبتك في حذف الصنف "${categoryToDelete?.name}"؟ سيتم فك ارتباط أي منتجات تابعة له تلقائيًا.`}
        confirmText="نعم، احذف الصنف"
        onConfirm={handleConfirmDelete}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
};
