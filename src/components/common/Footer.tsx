import React from 'react';
import type { SiteSettings, Category } from '../../types';
import { Layers, MessageSquare, Phone, Mail, MapPin, Instagram, Facebook, Twitter, Shield, ArrowUp } from 'lucide-react';

interface FooterProps {
  settings: SiteSettings;
  categories: Category[];
  onNavigateSection: (sectionId: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  categories,
  onNavigateSection,
  onOpenAdmin
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasSocials = settings.instagramUrl || settings.facebookUrl || settings.twitterUrl || settings.snapchatUrl;
  const hasContacts = settings.whatsappNumber || settings.phoneNumber || settings.email || settings.address;

  return (
    <footer className="bg-[#12261E] dark:bg-[#080D0B] text-[#D1DDD5] border-t border-[#C5A880]/20 pt-16 pb-12" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.companyName || 'روعة التميز'}
                  className="h-10 w-auto object-contain brightness-110"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[#1D3B2F] text-[#C5A880] flex items-center justify-center border border-[#C5A880]/30">
                  <Layers className="w-5 h-5" />
                </div>
              )}
              <span className="text-xl font-bold text-white tracking-wide">
                {settings.companyName || 'روعة التميز'}
              </span>
            </div>

            <p className="text-sm text-[#A0B5A7] leading-relaxed">
              {settings.companyBio || 'مؤسسة روعة التميز متخصصة في تصميم وتنفيذ وتوريد أرقى المظلات والسواتر والبرجولات والخيام بأعلى معايير الجودة.'}
            </p>

            {hasSocials && (
              <div className="flex items-center gap-2.5 pt-2">
                {settings.instagramUrl && (
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-[#C5A880] hover:text-[#12261E] text-[#D1DDD5] transition-all"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {settings.facebookUrl && (
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-[#C5A880] hover:text-[#12261E] text-[#D1DDD5] transition-all"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {settings.twitterUrl && (
                  <a
                    href={settings.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-[#C5A880] hover:text-[#12261E] text-[#D1DDD5] transition-all"
                    aria-label="Twitter / X"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#C5A880]">
              روابط سريعة
            </h4>
            <div className="flex flex-col gap-2.5 text-sm">
              <button
                type="button"
                onClick={() => onNavigateSection('hero')}
                className="text-right text-[#A0B5A7] hover:text-white transition-colors"
              >
                الرئيسية
              </button>
              <button
                type="button"
                onClick={() => onNavigateSection('categories')}
                className="text-right text-[#A0B5A7] hover:text-white transition-colors"
              >
                الأصناف والخدمات
              </button>
              <button
                type="button"
                onClick={() => onNavigateSection('products')}
                className="text-right text-[#A0B5A7] hover:text-white transition-colors"
              >
                معرض الحلول والمواصفات
              </button>
              <button
                type="button"
                onClick={() => onNavigateSection('why-us')}
                className="text-right text-[#A0B5A7] hover:text-white transition-colors"
              >
                لماذا روعة التميز
              </button>
              <button
                type="button"
                onClick={() => onNavigateSection('about')}
                className="text-right text-[#A0B5A7] hover:text-white transition-colors"
              >
                من نحن
              </button>
              <button
                type="button"
                onClick={() => onNavigateSection('contact')}
                className="text-right text-[#A0B5A7] hover:text-white transition-colors"
              >
                تواصل واستفسار
              </button>
            </div>
          </div>

          {/* Categories List */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#C5A880]">
              أصناف الأعمال
            </h4>
            {categories.length > 0 ? (
              <div className="flex flex-col gap-2 text-sm">
                {categories.slice(0, 6).map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onNavigateSection('products')}
                    className="text-right text-[#A0B5A7] hover:text-[#C5A880] transition-colors line-clamp-1"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#738C7D] leading-relaxed">
                يتم إدارة وتحديث الأصناف بانتظام من لوحة التحكم.
              </p>
            )}
          </div>

          {/* Contact Details (Only rendered if set) */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#C5A880]">
              بيانات التواصل
            </h4>
            {hasContacts ? (
              <div className="flex flex-col gap-3 text-sm">
                {settings.whatsappNumber && (
                  <div className="flex items-center gap-2.5 text-[#A0B5A7]">
                    <MessageSquare className="w-4 h-4 text-[#C5A880] shrink-0" />
                    <span dir="ltr">{settings.whatsappNumber}</span>
                  </div>
                )}
                {settings.phoneNumber && (
                  <div className="flex items-center gap-2.5 text-[#A0B5A7]">
                    <Phone className="w-4 h-4 text-[#C5A880] shrink-0" />
                    <span dir="ltr">{settings.phoneNumber}</span>
                  </div>
                )}
                {settings.email && (
                  <div className="flex items-center gap-2.5 text-[#A0B5A7]">
                    <Mail className="w-4 h-4 text-[#C5A880] shrink-0" />
                    <span dir="ltr">{settings.email}</span>
                  </div>
                )}
                {settings.address && (
                  <div className="flex items-start gap-2.5 text-[#A0B5A7]">
                    <MapPin className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                    <span>{settings.address}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#738C7D] leading-relaxed">
                يمكنك التواصل المباشر مع فريق المبيعات والاستشارات الهندسية عبر نموذج التواصل.
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7C9686]">
          <div>
            © {new Date().getFullYear()} {settings.companyName || 'روعة التميز'}. جميع الحقوق محفوظة.
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 hover:text-[#C5A880] transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>لوحة التحكم</span>
            </button>

            <button
              type="button"
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
              title="الرجوع للأعلى"
              aria-label="الرجوع لأعلى الصفحة"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
