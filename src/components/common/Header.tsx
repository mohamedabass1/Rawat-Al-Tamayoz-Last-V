import React, { useState, useEffect } from 'react';
import type { SiteSettings, ThemeMode } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, MessageSquare, Menu, X, Shield, Phone, Layers, Sparkles } from 'lucide-react';

interface HeaderProps {
  settings: SiteSettings;
  isDarkMode?: boolean;
  theme?: ThemeMode;
  onToggleDarkMode?: () => void;
  onToggleTheme?: () => void;
  onOpenAdmin: () => void;
  currentSection?: string;
  onNavigateSection?: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  isDarkMode,
  theme,
  onToggleDarkMode,
  onToggleTheme,
  onOpenAdmin,
  currentSection = 'hero',
  onNavigateSection
}) => {
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDark = isDarkMode !== undefined ? isDarkMode : theme === 'dark';
  const handleToggle = () => {
    if (onToggleDarkMode) {
      onToggleDarkMode();
    } else if (onToggleTheme) {
      onToggleTheme();
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'hero', label: 'الرئيسية' },
    { id: 'categories', label: 'الأصناف' },
    { id: 'products', label: 'الحلول والمنتجات' },
    { id: 'why-us', label: 'لماذا روعة التميز' },
    { id: 'about', label: 'من نحن' },
    { id: 'contact', label: 'تواصل معنا' }
  ];

  const handleNavClick = (id: string) => {
    if (onNavigateSection) {
      onNavigateSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const whatsappCleanNumber = settings.whatsappNumber?.replace(/\D/g, '');
  const whatsappUrl = whatsappCleanNumber
    ? `https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent(settings.defaultWhatsappMessage || 'السلام عليكم ورحمة الله، أود الاستفسار عن أعمالكم.')}`
    : '';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FAF8F5]/95 dark:bg-[#0D1411]/95 backdrop-blur-md shadow-sm border-b border-[#C5A880]/15 py-3'
          : 'bg-transparent py-5'
      }`}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <button
            type="button"
            onClick={() => handleNavClick('hero')}
            className="flex items-center gap-3 group text-right focus:outline-none"
          >
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.companyName || 'روعة التميز'}
                className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#12261E] to-[#1F3E32] text-[#C5A880] flex items-center justify-center shadow-md border border-[#C5A880]/30 transition-transform group-hover:scale-105">
                <Layers className="w-6 h-6" strokeWidth={1.75} />
              </div>
            )}
            
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black tracking-tight text-[#12261E] dark:text-[#E8EFE9] group-hover:text-[#A88758] dark:group-hover:text-[#C5A880] transition-colors">
                {settings.companyName || 'روعة التميز'}
              </span>
              <span className="text-[11px] font-medium text-[#687C6F] dark:text-[#8D9F94] -mt-1 hidden sm:inline-block">
                {settings.companyTagline || 'حلول معمارية خارجية متكاملة'}
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map(link => {
              const isActive = currentSection === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'text-[#12261E] dark:text-[#FAF8F5] bg-[#C5A880]/15 dark:bg-[#C5A880]/20 shadow-xs'
                      : 'text-[#4A5D51] dark:text-[#A2B4A9] hover:text-[#12261E] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct WhatsApp CTA Button */}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#12261E] dark:bg-[#C5A880] text-[#FAF8F5] dark:text-[#0D1411] text-xs sm:text-sm font-bold shadow-md hover:opacity-90 active:scale-95 transition-all border border-[#C5A880]/30"
              >
                <MessageSquare className="w-4 h-4 text-[#C5A880] dark:text-[#0D1411]" />
                <span>استفسار واتساب</span>
              </a>
            )}

            {/* Dark/Light Mode Toggle */}
            <button
              type="button"
              onClick={handleToggle}
              className="p-2.5 rounded-xl text-[#39493F] dark:text-[#B1C3B8] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              title={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
              aria-label="تغيير المظهر"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-stone-700" />}
            </button>

            {/* Admin Access Button */}
            <button
              type="button"
              onClick={onOpenAdmin}
              className={`p-2.5 rounded-xl transition-all ${
                isAuthenticated
                  ? 'bg-[#12261E] text-[#C5A880] ring-2 ring-[#C5A880]/40'
                  : 'text-[#39493F] dark:text-[#B1C3B8] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
              }`}
              title={isAuthenticated ? 'لوحة تحكم الإدارة (مسجل دخول)' : 'تسجيل دخول الإدارة'}
              aria-label="لوحة تحكم الإدارة"
            >
              <Shield className="w-5 h-5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-[#39493F] dark:text-[#B1C3B8] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-full bg-[#FAF8F5] dark:bg-[#0E1512] border-b border-[#C5A880]/20 shadow-2xl p-6 transition-all animate-in slide-in-from-top-4">
          <div className="flex flex-col gap-2">
            {navLinks.map(link => (
              <button
                key={link.id}
                type="button"
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-right px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                  currentSection === link.id
                    ? 'bg-[#C5A880]/20 text-[#12261E] dark:text-[#FAF8F5]'
                    : 'text-[#4A5D51] dark:text-[#A2B4A9] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-4 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#12261E] dark:bg-[#C5A880] text-[#FAF8F5] dark:text-[#0D1411] font-bold text-sm shadow-md"
              >
                <MessageSquare className="w-4 h-4 text-[#C5A880] dark:text-[#0D1411]" />
                <span>استفسار فوري عبر واتساب</span>
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
