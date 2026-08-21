import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ToastMessage } from '../types';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type'], title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'success', title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, message, type, title };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 left-5 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`pointer-events-auto rounded-xl p-4 shadow-xl border flex items-start gap-3 backdrop-blur-md ${
                toast.type === 'success'
                  ? 'bg-[#12261E]/95 border-[#C5A880]/30 text-white dark:bg-[#0E1A15]/95'
                  : toast.type === 'error'
                  ? 'bg-rose-950/95 border-rose-500/30 text-rose-100'
                  : toast.type === 'warning'
                  ? 'bg-amber-950/95 border-amber-500/30 text-amber-100'
                  : 'bg-zinc-900/95 border-zinc-700 text-white'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#C5A880]" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
              </div>
              <div className="flex-1 min-w-0">
                {toast.title && <p className="font-bold text-sm leading-tight mb-1">{toast.title}</p>}
                <p className="text-sm font-medium leading-relaxed opacity-90">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-white/60 hover:text-white transition-colors p-0.5 rounded-lg"
                aria-label="إغلاق الإشعار"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
