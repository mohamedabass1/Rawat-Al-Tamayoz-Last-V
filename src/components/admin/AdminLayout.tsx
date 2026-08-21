import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChangePasswordModal } from './ChangePasswordModal';
import { 
  LayoutDashboard, Layers, Package, Briefcase, Settings, 
  LogOut, ExternalLink, KeyRound, Menu, X, ShieldCheck, Sun, Moon 
} from 'lucide-react';

interface AdminLayoutProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onExitAdmin: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  onSelectTab,
  onExitAdmin,
  isDarkMode,
  onToggleDarkMode,
  children
}) => {
  const { user, logout } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'نظرة عامة والتحليلات', icon: LayoutDashboard },
    { id: 'categories', label: 'الأصناف والخدمات', icon: Layers },
    { id: 'products', label: 'المنتجات والمواصفات', icon: Package },
    { id: 'projects', label: 'المشاريع المنفذة', icon: Briefcase },
    { id: 'settings', label: 'إعدادات الموقع والواتساب', icon: Settings },
  ];

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#0B110E] text-[#12261E] dark:text-[#FAF8F5] flex flex-col" dir="rtl">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 h-16 bg-white/90 dark:bg-[#111A15]/90 backdrop-blur-md border-b border-[#C5A880]/20 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#12261E] text-[#C5A880] flex items-center justify-center font-bold text-sm border border-[#C5A880]/30 shadow-xs">
              ر.ت
            </div>
            <div>
              <span className="font-black text-sm sm:text-base text-[#12261E] dark:text-[#FAF8F5] block leading-none">
                لوحة تحكم روعة التميز
              </span>
              <span className="text-[10px] text-[#A88758] font-bold">إدارة المحتوى والمنتجات</span>
            </div>
          </div>
        </div>

        {/* Topbar Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="تبديل المظهر"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-[#C5A880]" /> : <Moon className="w-4 h-4 text-[#12261E]" />}
          </button>

          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold text-[#12261E] dark:text-[#FAF8F5] transition-colors"
            title="تغيير كلمة المرور"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#A88758]" />
            <span>كلمة المرور</span>
          </button>

          <button
            type="button"
            onClick={onExitAdmin}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-[#C5A880]/20 hover:bg-[#C5A880]/30 text-[#12261E] dark:text-[#EFE2D1] text-xs font-bold transition-all"
            title="العودة للموقع العام"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#A88758]" />
            <span className="hidden sm:inline">معاينة الموقع العام</span>
            <span className="sm:hidden">الموقع</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="p-2 rounded-xl text-rose-600 hover:bg-rose-500/10 transition-colors"
            title="تسجيل الخروج"
            aria-label="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col bg-white dark:bg-[#111A15] border-l border-[#C5A880]/20 p-4 space-y-2 shrink-0">
          <div className="p-3 mb-2 rounded-2xl bg-[#C5A880]/10 border border-[#C5A880]/20 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#A88758] dark:text-[#C5A880]" />
            <div className="text-xs">
              <div className="font-bold text-[#12261E] dark:text-[#FAF8F5]">{user?.username || 'admin'}</div>
              <div className="text-[10px] text-[#7B8F82]">صلاحية إدارة كاملة</div>
            </div>
          </div>

          <nav className="space-y-1 flex-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-right ${
                    isActive
                      ? 'bg-[#12261E] dark:bg-[#C5A880] text-white dark:text-[#0D1411] shadow-md'
                      : 'text-[#4A5E51] dark:text-[#A0B3A6] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#C5A880] dark:text-[#0D1411]' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative w-64 bg-white dark:bg-[#111A15] p-4 flex flex-col space-y-2 z-10">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-black/10 dark:border-white/10">
                <span className="font-bold text-sm text-[#12261E] dark:text-[#FAF8F5]">لوحة التحكم</span>
                <button type="button" onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              <nav className="space-y-1 flex-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-right ${
                        isActive
                          ? 'bg-[#12261E] dark:bg-[#C5A880] text-white dark:text-[#0D1411]'
                          : 'text-[#4A5E51] dark:text-[#A0B3A6] hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-xs font-bold text-stone-600 dark:text-stone-300"
              >
                <KeyRound className="w-4 h-4 text-[#A88758]" />
                <span>تغيير كلمة المرور</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};
