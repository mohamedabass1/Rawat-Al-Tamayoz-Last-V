import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Shield, Lock, User, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await login(username.trim(), password);
      showToast('تم تسجيل الدخول بنجاح إلى لوحة التحكم', 'success');
      setPassword('');
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'اسم المستخدم أو كلمة المرور غير صحيحة');
      showToast(err.message || 'فشل تسجيل الدخول', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir="rtl">
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#FAF8F5] dark:bg-[#111915] border border-[#C5A880]/30 shadow-2xl z-10 text-right"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#12261E] text-[#C5A880] flex items-center justify-center border border-[#C5A880]/30">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#12261E] dark:text-[#FAF8F5]">
                  تسجيل دخول الإدارة
                </h3>
                <span className="text-xs text-[#677A6D]">لوحة تحكم روعة التميز</span>
              </div>
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
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
                اسم المستخدم
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-white dark:bg-[#0E1512] border border-[#C5A880]/30 focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-white dark:bg-[#0E1512] border border-[#C5A880]/30 focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#12261E] dark:bg-[#C5A880] text-white dark:text-[#0D1411] font-bold text-sm shadow-md hover:opacity-90 active:scale-98 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارٍ التحقق...</span>
                </>
              ) : (
                <span>دخول إلى لوحة التحكم</span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
