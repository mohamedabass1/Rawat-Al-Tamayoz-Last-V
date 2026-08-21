import React, { useState, useEffect } from 'react';
import type { Project } from '../../types';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from './ConfirmDialog';
import { Plus, Edit2, Trash2, Upload, Image as ImageIcon, MapPin, X, Loader2, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProjectManagerProps {
  onRefreshStats: () => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ onRefreshStats }) => {
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategoryName, setFormCategoryName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Delete State
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminProjects();
      setProjects(data);
    } catch (err: any) {
      showToast(err.message || 'فشل جلب المشاريع', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategoryName('');
    setFormLocation('');
    setFormImages([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setFormTitle(project.title);
    setFormDescription(project.description || '');
    setFormCategoryName(project.categoryName || '');
    setFormLocation(project.location || '');
    setFormImages(project.images ? [...project.images] : []);
    setIsModalOpen(true);
  };

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls = await api.uploadFiles(Array.from(files));
      if (uploadedUrls && uploadedUrls.length > 0) {
        setFormImages(prev => [...prev, ...uploadedUrls]);
        showToast(`تم رفع ${uploadedUrls.length} صورة للمشروع`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'فشل رفع الصور', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('يرجى إدخال عنوان المشروع', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        categoryName: formCategoryName.trim(),
        location: formLocation.trim(),
        images: formImages
      };

      if (editingProject) {
        await api.updateProject(editingProject.id, payload);
        showToast('تم تحديث بيانات المشروع بنجاح', 'success');
      } else {
        await api.createProject(payload);
        showToast('تمت إضافة المشروع الجديد بنجاح', 'success');
      }

      setIsModalOpen(false);
      fetchProjects();
      onRefreshStats();
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ المشروع', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      await api.deleteProject(projectToDelete.id);
      showToast('تم حذف المشروع بنجاح', 'success');
      setProjectToDelete(null);
      fetchProjects();
      onRefreshStats();
    } catch (err: any) {
      showToast(err.message || 'فشل حذف المشروع', 'error');
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#12261E] dark:text-[#FAF8F5]">
            معرض المشاريع والأعمال المنفذة
          </h2>
          <p className="text-xs text-[#5B6F62] dark:text-[#9FB2A5]">
            إضافة نماذج حية من أعمال التركيب والتنفيذ التي تمت على أرض الواقع.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#12261E] dark:bg-[#C5A880] text-white dark:text-[#0D1411] font-bold text-xs sm:text-sm shadow-md hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مشروع منفذ</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-[#7B8F82] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>جارٍ تحميل المشاريع...</span>
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div
              key={project.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#131D18] border border-[#C5A880]/20 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="aspect-[16/10] rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 mb-3 border border-black/5 dark:border-white/5">
                  {project.images?.[0] ? (
                    <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <Briefcase className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-bold text-[#12261E] dark:text-[#FAF8F5] line-clamp-1">
                    {project.title}
                  </h3>
                  {project.categoryName && (
                    <span className="text-[11px] font-semibold text-[#A88758] px-2 py-0.5 rounded-md bg-[#C5A880]/15">
                      {project.categoryName}
                    </span>
                  )}
                </div>

                {project.location && (
                  <div className="flex items-center gap-1.5 text-xs text-[#738779] dark:text-[#95A89C] mb-2">
                    <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>{project.location}</span>
                  </div>
                )}

                {project.description && (
                  <p className="text-xs text-[#5B6F62] dark:text-[#9FB2A5] line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs font-mono text-[#7B8F82]">
                  {project.images?.length || 0} صورة
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(project)}
                    className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-[#C5A880]/15 hover:text-[#A88758]"
                    title="تعديل"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectToDelete(project)}
                    className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-rose-500/10 hover:text-rose-600"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-[#C5A880]/30 bg-white dark:bg-[#131D18] space-y-4">
          <Briefcase className="w-12 h-12 text-stone-400 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-[#12261E] dark:text-[#FAF8F5]">
              لا توجد مشاريع منفذة مسجلة
            </h3>
            <p className="text-xs text-[#627668] dark:text-[#A0B3A6] max-w-sm mx-auto mt-1">
              أضف مشاريعك وأعمال التركيب الميدانية بالصور وموقع المشروع.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#12261E] dark:bg-[#C5A880] text-white dark:text-[#0D1411] font-bold text-xs shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة أول مشروع</span>
          </button>
        </div>
      )}

      {/* Add / Edit Project Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[10500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="fixed inset-0" onClick={() => setIsModalOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#FAF8F5] dark:bg-[#121A16] border border-[#C5A880]/30 shadow-2xl z-10 text-right max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#12261E] dark:text-[#FAF8F5]">
                  {editingProject ? 'تعديل بيانات المشروع' : 'إضافة مشروع منفذ جديد'}
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
                    عنوان المشروع <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="مثال: تركيب مظلات فلل بحي النرجس..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0E1512] border border-[#C5A880]/30 focus:border-[#C5A880] text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
                      التصنيف / نوع العمل
                    </label>
                    <input
                      type="text"
                      value={formCategoryName}
                      onChange={e => setFormCategoryName(e.target.value)}
                      placeholder="مظلات سيارات / برجولات..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0E1512] border border-[#C5A880]/30 focus:border-[#C5A880] text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
                      الموقع / المدينة
                    </label>
                    <input
                      type="text"
                      value={formLocation}
                      onChange={e => setFormLocation(e.target.value)}
                      placeholder="الرياض / جدة..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0E1512] border border-[#C5A880]/30 focus:border-[#C5A880] text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
                    وصف العمل المنفذ
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    placeholder="تفاصيل عن المواد المستخدمة والمساحة المنفذة..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0E1512] border border-[#C5A880]/30 focus:border-[#C5A880] text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none resize-none"
                  />
                </div>

                {/* Images Upload */}
                <div>
                  <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
                    صور المشروع المنفذ
                  </label>
                  <label className="flex items-center justify-center gap-2 p-4 border border-dashed border-[#C5A880]/50 rounded-xl cursor-pointer bg-white dark:bg-[#0E1512] hover:border-[#C5A880] text-xs font-semibold">
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#A88758]" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-[#A88758]" />
                        <span>رفع صور من الجهاز</span>
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

                  {formImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {formImages.map((url, idx) => (
                        <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-black/10">
                          <img src={url} alt="معاينة" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 left-1 p-1 rounded bg-rose-600 text-white"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
                    className="px-6 py-2.5 rounded-xl bg-[#12261E] dark:bg-[#C5A880] text-white dark:text-[#0D1411] font-bold text-sm shadow-md hover:opacity-90 disabled:opacity-50"
                  >
                    {isSubmitting ? 'جارٍ الحفظ...' : 'حفظ المشروع'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!projectToDelete}
        title="تأكيد حذف المشروع"
        message={`هل أنت متأكد من رغبتك في حذف المشروع "${projectToDelete?.title}"؟`}
        confirmText="نعم، احذف المشروع"
        onConfirm={handleConfirmDelete}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  );
};
