import React, { useState } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Lock, X, Loader2, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose
}) => {
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setErrorMsg('يرجى ملء جميع الحقول');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('يجب أن تتكون كلمة المرور الجديدة من 6 خانات على الأقل');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('كلمة المرور الجديدة غير متطابقة مع التأكيد');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await api.changePassword(currentPassword, newPassword);
      showToast('تم تغيير كلمة المرور بنجاح', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل تغيير كلمة المرور');
      showToast(err.message || 'فشل تغيير كلمة المرور', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir="rtl">
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#FAF8F5] dark:bg-[#121A16] border border-[#C5A880]/30 shadow-2xl z-10 text-right"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#12261E] text-[#C5A880] flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#12261E] dark:text-[#FAF8F5]">
                تغيير كلمة مرور الإدارة
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-white bg-black/5 dark:bg-white/5 transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
                كلمة المرور الحالية
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0E1512] border border-[#C5A880]/30 focus:border-[#C5A880] text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
                كلمة المرور الجديدة
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="6 خانات على الأقل"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0E1512] border border-[#C5A880]/30 focus:border-[#C5A880] text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
                تأكيد كلمة المرور الجديدة
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="أعد كتابة كلمة المرور الجديدة"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0E1512] border border-[#C5A880]/30 focus:border-[#C5A880] text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#4A5D51] dark:text-[#A0B3A6]"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-[#12261E] dark:bg-[#C5A880] text-white dark:text-[#0D1411] font-bold text-sm shadow-md hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>حفظ التغييرات</span>}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
