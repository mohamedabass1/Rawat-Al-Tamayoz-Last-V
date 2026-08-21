import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'تأكيد الحذف',
  cancelText = 'إلغاء',
  isDestructive = true,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir="rtl">
        <div className="fixed inset-0" onClick={onCancel} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md p-6 rounded-2xl bg-[#FAF8F5] dark:bg-[#121A16] border border-[#C5A880]/30 shadow-2xl z-10 text-right"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className={`p-3 rounded-xl shrink-0 ${isDestructive ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#12261E] dark:text-[#FAF8F5] mb-1">
                {title}
              </h3>
              <p className="text-sm text-[#5C7063] dark:text-[#9FB1A4] leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#4A5D51] dark:text-[#A0B3A6] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md active:scale-95 ${
                isDestructive
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-[#12261E] dark:bg-[#C5A880] text-[#FAF8F5] dark:text-[#0D1411]'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
