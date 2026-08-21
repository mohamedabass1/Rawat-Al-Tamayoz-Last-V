import React from 'react';
import type { SiteSettings } from '../../types';
import { ArrowDown, MessageSquare, Compass, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  settings: SiteSettings;
  onExploreClick: () => void;
  onContactClick?: () => void;
  categories?: any[];
  onSelectCategory?: (id: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  onExploreClick,
  onContactClick
}) => {
  const handleContact = () => {
    if (onContactClick) {
      onContactClick();
    } else {
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const whatsappCleanNumber = settings.whatsappNumber?.replace(/\D/g, '');
  const whatsappUrl = whatsappCleanNumber
    ? `https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent(settings.defaultWhatsappMessage || 'السلام عليكم ورحمة الله، أود الاستفسار عن أعمالكم.')}`
    : '';

  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center justify-center pt-28 pb-16 overflow-hidden" dir="rtl">
      {/* Background Architectural Canvas */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#12261E]/5 via-transparent to-[#FAF8F5] dark:from-[#0B1310] dark:via-[#0E1713] dark:to-[#0F1412] pointer-events-none" />
      
      {/* Geometric architectural lines */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <line x1="10%" y1="0" x2="10%" y2="100%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" className="text-[#C5A880]" />
          <line x1="90%" y1="0" x2="90%" y2="100%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" className="text-[#C5A880]" />
          <line x1="0" y1="30%" x2="100%" y2="30%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" className="text-[#C5A880]" />
        </svg>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Subtle Luxury Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C5A880]/15 border border-[#C5A880]/30 text-[#12261E] dark:text-[#E2C79E] text-xs sm:text-sm font-bold tracking-wide mb-6 shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-[#A88758] dark:text-[#C5A880]" />
          <span>{settings.companyTagline || 'مظلات • سواتر • برجولات • حلول معمارية خارجية'}</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#12261E] dark:text-[#FAF8F5] leading-[1.25] sm:leading-[1.2] mb-6 max-w-4xl"
        >
          {settings.heroHeadline || 'نصنع مساحات خارجية تليق بذوقك الرفيع'}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-[#45574C] dark:text-[#A9BCAE] max-w-2xl leading-relaxed mb-10 font-normal"
        >
          {settings.heroSubheadline || 'تصميم وتنفيذ وتوريد أرقى المظلات والسواتر والبرجولات والخيام بأعلى معايير الهندسة والجودة والضمان.'}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <button
            type="button"
            onClick={onExploreClick}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#12261E] hover:bg-[#1A382C] dark:bg-[#C5A880] dark:hover:bg-[#D4BA95] text-white dark:text-[#0D1411] font-bold text-base shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            استكشف أعمالنا ومنتجاتنا
          </button>

          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-white dark:bg-[#18241E] text-[#12261E] dark:text-[#E8EFEA] font-bold text-base border border-[#C5A880]/30 hover:border-[#C5A880] shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <MessageSquare className="w-5 h-5 text-[#C5A880]" />
              <span>استفسار واتساب مباشر</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={handleContact}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-[#18241E] text-[#12261E] dark:text-[#E8EFEA] font-bold text-base border border-[#C5A880]/30 hover:border-[#C5A880] shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              تواصل معنا
            </button>
          )}
        </motion.div>

        {/* Quick Highlights Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-16 pt-8 border-t border-[#C5A880]/15 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full text-right sm:text-center"
        >
          <div className="flex items-center sm:justify-center gap-2.5 text-xs sm:text-sm font-semibold text-[#2D3E33] dark:text-[#C1D2C6]">
            <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0" />
            <span>خامات معالجة ومقاومة للعوامل الجوية</span>
          </div>
          <div className="flex items-center sm:justify-center gap-2.5 text-xs sm:text-sm font-semibold text-[#2D3E33] dark:text-[#C1D2C6]">
            <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0" />
            <span>تصاميم هندسية مخصصة حسب المساحة</span>
          </div>
          <div className="flex items-center sm:justify-center gap-2.5 text-xs sm:text-sm font-semibold text-[#2D3E33] dark:text-[#C1D2C6]">
            <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0" />
            <span>ضمان جودة معتمد والتزام بالمواعيد</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
