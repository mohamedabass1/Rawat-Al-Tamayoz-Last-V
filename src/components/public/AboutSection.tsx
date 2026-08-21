import React from 'react';
import type { SiteSettings } from '../../types';
import { Layers, ShieldCheck, HeartHandshake, Sparkles, Building2 } from 'lucide-react';
import { motion } from 'motion/react';

interface AboutSectionProps {
  settings: SiteSettings;
  onExploreClick: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ settings, onExploreClick }) => {
  return (
    <section id="about" className="py-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A88758] dark:text-[#C5A880]">
              <Building2 className="w-4 h-4" />
              <span>عن مؤسسة روعة التميز</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-[#12261E] dark:text-[#FAF8F5] tracking-tight leading-tight">
              خبرة هندسية وشغف بتطوير المساحات الخارجية
            </h2>

            <p className="text-base sm:text-lg text-[#4E6255] dark:text-[#A7BBAE] leading-relaxed">
              {settings.aboutStory || settings.companyBio || 'مؤسسة متخصصة في تصميم وتوريد وتنفيذ كافة أعمال المظلات والسواتر والبرجولات والخيام وبيوت الشعر.'}
            </p>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-[#141F1A] border border-[#C5A880]/20">
                <div className="flex items-center gap-2.5 font-bold text-sm text-[#12261E] dark:text-[#FAF8F5] mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#A88758] dark:text-[#C5A880]" />
                  <span>معايير أمان وهندسة دقيقة</span>
                </div>
                <p className="text-xs text-[#63776A] dark:text-[#8FA295] leading-relaxed">
                  حسابات دقيقة لأحمال الرياح، درجات العزل، وطرق التثبيت الاحترافية.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#141F1A] border border-[#C5A880]/20">
                <div className="flex items-center gap-2.5 font-bold text-sm text-[#12261E] dark:text-[#FAF8F5] mb-1">
                  <HeartHandshake className="w-4 h-4 text-[#A88758] dark:text-[#C5A880]" />
                  <span>خدمة عملاء واستشارات فنية</span>
                </div>
                <p className="text-xs text-[#63776A] dark:text-[#8FA295] leading-relaxed">
                  معاينة الموقع وتقديم الاستشارة الهندسية لاختيار الحل الأنسب.
                </p>
              </div>
            </div>
          </div>

          {/* Visual Brand Panel */}
          <div className="lg:col-span-5">
            <div className="relative p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#12261E] via-[#1A362B] to-[#254B3D] text-[#FAF8F5] border border-[#C5A880]/30 shadow-2xl overflow-hidden">
              {/* Subtle background decoration */}
              <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[#C5A880]/10 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-[#C5A880]/10 blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-[#C5A880]/20 text-[#C5A880] flex items-center justify-center border border-[#C5A880]/40 shadow-inner">
                  <Layers className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white mb-2">
                    {settings.companyName || 'روعة التميز'}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#C4D8CB] leading-relaxed">
                    نسعى دائمًا إلى تحويل المساحات المفتوحة إلى أماكن مميزة توفر الراحة، الظل، والجمال المعماري المتناسق.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/15 flex items-center justify-between">
                  <span className="text-xs text-[#C5A880] font-semibold">حلول متكاملة لجميع المساحات</span>
                  <button
                    type="button"
                    onClick={onExploreClick}
                    className="text-xs font-bold text-white hover:text-[#C5A880] transition-colors"
                  >
                    استعراض المنتجات ←
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
