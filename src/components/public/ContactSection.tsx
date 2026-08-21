import React, { useState } from 'react';
import type { SiteSettings, Category } from '../../types';
import { MessageSquare, Phone, Mail, MapPin, Send, Sparkles, CheckCircle2, Clock } from 'lucide-react';

interface ContactSectionProps {
  settings: SiteSettings;
  categories: Category[];
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [userNote, setUserNote] = useState('');
  const [customerName, setCustomerName] = useState('');

  const cleanNumber = settings.whatsappNumber?.replace(/\D/g, '');

  const buildWhatsappUrl = () => {
    let msg = `السلام عليكم ورحمة الله، أنا ${customerName.trim() || 'أحد المهتمين'}. `;
    if (selectedCategory) {
      msg += `أود الاستفسار عن تفاصيل وتركيب [${selectedCategory}]. `;
    } else {
      msg += `أود الاستفسار عن حلولكم المعمارية والمظلات. `;
    }
    if (userNote.trim()) {
      msg += `ملاحظاتي: ${userNote.trim()}`;
    }
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
  };

  const directWhatsappUrl = cleanNumber
    ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(settings.defaultWhatsappMessage || 'السلام عليكم ورحمة الله، أود الاستفسار عن خدماتكم.')}`
    : '';

  return (
    <section id="contact" className="py-24 relative overflow-hidden" dir="rtl">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#12261E]/5 to-[#12261E]/10 dark:via-[#0B120F] dark:to-[#080E0B] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left / Info column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A88758] dark:text-[#C5A880]">
              <Sparkles className="w-4 h-4" />
              <span>تواصل مباشر واستشارة فنية</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-[#12261E] dark:text-[#FAF8F5] tracking-tight leading-tight">
              هل لديك مشروع أو مساحة ترغب بتغطيتها؟
            </h2>

            <p className="text-base text-[#4F6355] dark:text-[#A1B5A7] leading-relaxed">
              فريقنا جاهز لتقديم المشورة الهندسية، تحديد المقاسات، واقتراح أفضل التصاميم التي تلبي احتياجاتك.
            </p>

            {/* Direct Contact Cards */}
            <div className="space-y-3 pt-2">
              {settings.whatsappNumber && (
                <a
                  href={directWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-4 rounded-2xl bg-white dark:bg-[#141F1A] border border-[#C5A880]/30 hover:border-[#C5A880] shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#12261E] dark:bg-[#C5A880] text-[#C5A880] dark:text-[#0D1411] flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#A88758] dark:text-[#C5A880]">محادثة واتساب سريعة</div>
                    <div className="text-sm sm:text-base font-bold text-[#12261E] dark:text-[#FAF8F5]" dir="ltr">
                      {settings.whatsappNumber}
                    </div>
                  </div>
                </a>
              )}

              {settings.phoneNumber && (
                <a
                  href={`tel:${settings.phoneNumber}`}
                  className="flex items-center gap-3.5 p-4 rounded-2xl bg-white dark:bg-[#141F1A] border border-black/5 dark:border-white/5 hover:border-[#C5A880]/50 shadow-sm transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-black/5 dark:bg-white/5 text-[#A88758] dark:text-[#C5A880] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#6D8073]">الاتصال الهاتفي المباشر</div>
                    <div className="text-sm sm:text-base font-bold text-[#12261E] dark:text-[#FAF8F5]" dir="ltr">
                      {settings.phoneNumber}
                    </div>
                  </div>
                </a>
              )}

              {settings.email && (
                <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white dark:bg-[#141F1A] border border-black/5 dark:border-white/5">
                  <div className="w-11 h-11 rounded-xl bg-black/5 dark:bg-white/5 text-[#A88758] dark:text-[#C5A880] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#6D8073]">البريد الإلكتروني</div>
                    <div className="text-sm font-semibold text-[#12261E] dark:text-[#FAF8F5]" dir="ltr">
                      {settings.email}
                    </div>
                  </div>
                </div>
              )}

              {settings.address && (
                <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white dark:bg-[#141F1A] border border-black/5 dark:border-white/5">
                  <div className="w-11 h-11 rounded-xl bg-black/5 dark:bg-white/5 text-[#A88758] dark:text-[#C5A880] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#6D8073]">الموقع / الفرع</div>
                    <div className="text-sm font-semibold text-[#12261E] dark:text-[#FAF8F5]">
                      {settings.address}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right / Interactive WhatsApp Inquiry Builder */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 md:p-10 rounded-3xl bg-white dark:bg-[#131D18] border border-[#C5A880]/30 shadow-xl space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#12261E] dark:text-[#FAF8F5] mb-2">
                  تجهيز استفسار مخصص عبر واتساب
                </h3>
                <p className="text-xs sm:text-sm text-[#5B6E61] dark:text-[#9FB1A4]">
                  اختر نوع الخدمة واكتب تفاصيل مساحتك لإرسالها مباشرة للمستشار الفني في ثوانٍ.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2D3E33] dark:text-[#D1E0D5] mb-1.5">
                    الاسم الكريم (اختياري)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="مثال: أبو محمد / م. خالد"
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] dark:bg-[#0E1512] border border-[#C5A880]/30 focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none transition-all"
                  />
                </div>

                {categories.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-[#2D3E33] dark:text-[#D1E0D5] mb-1.5">
                      نوع الحل أو الصنف المطلوب
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] dark:bg-[#0E1512] border border-[#C5A880]/30 focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none transition-all"
                    >
                      <option value="">-- اختر الصنف المطلوب --</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#2D3E33] dark:text-[#D1E0D5] mb-1.5">
                    ملاحظات أو تفاصيل المساحة (اختياري)
                  </label>
                  <textarea
                    rows={3}
                    value={userNote}
                    onChange={e => setUserNote(e.target.value)}
                    placeholder="مثال: مظلة سيارات تتسع لسيارتين بطول 6 متر، مع تفضيل قماش بي في سي ألماني..."
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] dark:bg-[#0E1512] border border-[#C5A880]/30 focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none transition-all resize-none"
                  />
                </div>

                {cleanNumber ? (
                  <a
                    href={buildWhatsappUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl bg-[#12261E] dark:bg-[#C5A880] text-white dark:text-[#0D1411] font-bold text-base shadow-lg hover:opacity-90 active:scale-98 transition-all"
                  >
                    <MessageSquare className="w-5 h-5 text-[#C5A880] dark:text-[#0D1411]" />
                    <span>إرسال الاستفسار عبر واتساب الآن</span>
                  </a>
                ) : (
                  <div className="p-4 rounded-xl bg-[#C5A880]/15 text-xs text-[#12261E] dark:text-[#FAF8F5] font-medium text-center">
                    يرجى ضبط رقم واتساب في لوحة التحكم لتفعيل الإرسال المباشر.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
