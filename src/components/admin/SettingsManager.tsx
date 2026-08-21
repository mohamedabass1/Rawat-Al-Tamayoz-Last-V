import React, { useState, useEffect } from 'react';
import type { SiteSettings, WhyUsItem } from '../../types';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { 
  Building2, Phone, MessageSquare, Mail, MapPin, Globe, 
  Upload, Trash2, Save, Loader2, Sparkles, ShieldCheck, Plus, X 
} from 'lucide-react';

interface SettingsManagerProps {
  onSettingsUpdated: (newSettings: SiteSettings) => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({ onSettingsUpdated }) => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Form Fields
  const [companyName, setCompanyName] = useState('');
  const [tagline, setTagline] = useState('');
  const [companyBio, setCompanyBio] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [defaultWhatsappMessage, setDefaultWhatsappMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [twitter, setTwitter] = useState('');
  const [snapchat, setSnapchat] = useState('');
  const [aboutStory, setAboutStory] = useState('');
  const [whyUsItems, setWhyUsItems] = useState<WhyUsItem[]>([]);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await api.getSettings();
        setSettings(data);
        setCompanyName(data.companyName || '');
        setTagline(data.tagline || '');
        setCompanyBio(data.companyBio || '');
        setLogoUrl(data.logoUrl || '');
        setWhatsappNumber(data.whatsappNumber || '');
        setDefaultWhatsappMessage(data.defaultWhatsappMessage || '');
        setPhoneNumber(data.phoneNumber || '');
        setEmail(data.email || '');
        setAddress(data.address || '');
        setInstagram(data.socialLinks?.instagram || '');
        setTiktok(data.socialLinks?.tiktok || '');
        setTwitter(data.socialLinks?.twitter || '');
        setSnapchat(data.socialLinks?.snapchat || '');
        setAboutStory(data.aboutStory || '');
        setWhyUsItems(data.whyUsItems || []);
      } catch (err: any) {
        showToast(err.message || 'فشل جلب الإعدادات', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingLogo(true);
    try {
      const urls = await api.uploadFiles(Array.from(files));
      if (urls && urls.length > 0) {
        setLogoUrl(urls[0]);
        showToast('تم رفع الشعار بنجاح', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'فشل رفع الشعار', 'error');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleUpdateWhyUs = (index: number, field: keyof WhyUsItem, value: string) => {
    setWhyUsItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleAddWhyUs = () => {
    setWhyUsItems(prev => [
      ...prev,
      { id: `why-${Date.now()}`, title: 'ميزة جديدة', description: 'اكتب وصف الميزة هنا...', icon: 'ShieldCheck' }
    ]);
  };

  const handleRemoveWhyUs = (index: number) => {
    setWhyUsItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<SiteSettings> = {
        companyName: companyName.trim(),
        tagline: tagline.trim(),
        companyBio: companyBio.trim(),
        logoUrl: logoUrl.trim(),
        whatsappNumber: whatsappNumber.trim(),
        defaultWhatsappMessage: defaultWhatsappMessage.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        address: address.trim(),
        aboutStory: aboutStory.trim(),
        whyUsItems,
        socialLinks: {
          instagram: instagram.trim(),
          tiktok: tiktok.trim(),
          twitter: twitter.trim(),
          snapchat: snapchat.trim()
        }
      };

      const updated = await api.updateSettings(payload);
      setSettings(updated);
      onSettingsUpdated(updated);
      showToast('تم حفظ جميع إعدادات الموقع بنجاح', 'success');
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ الإعدادات', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-sm text-[#7B8F82] flex items-center justify-center gap-2" dir="rtl">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>جارٍ تحميل الإعدادات...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8" dir="rtl">
      {/* Top Save Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#131D18] border border-[#C5A880]/20">
        <div>
          <h2 className="text-xl font-bold text-[#12261E] dark:text-[#FAF8F5]">
            إعدادات وهوية مؤسسة روعة التميز
          </h2>
          <p className="text-xs text-[#5B6F62] dark:text-[#9FB2A5]">
            تعديل بيانات التواصل المباشر، أرقام الواتساب، الشعار، ومحتوى صفحات الموقع.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#12261E] dark:bg-[#C5A880] text-white dark:text-[#0D1411] font-bold text-sm shadow-md hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جارٍ الحفظ...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>حفظ الإعدادات</span>
            </>
          )}
        </button>
      </div>

      {/* 1. Identity & Logo */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131D18] border border-[#C5A880]/20 space-y-6">
        <div className="flex items-center gap-2 text-sm font-bold text-[#A88758] dark:text-[#C5A880]">
          <Building2 className="w-5 h-5" />
          <span>هوية المؤسسة والشعار</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
                اسم المؤسسة
              </label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#0E1512] border border-[#C5A880]/30 text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
                الشعار اللفظي / Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#0E1512] border border-[#C5A880]/30 text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
                نبذة عامة مختصرة
              </label>
              <textarea
                rows={3}
                value={companyBio}
                onChange={e => setCompanyBio(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#0E1512] border border-[#C5A880]/30 text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none resize-none"
              />
            </div>
          </div>

          {/* Logo Uploader */}
          <div>
            <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
              شعار المؤسسة (Logo)
            </label>
            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#0E1512] border border-[#C5A880]/30 flex flex-col items-center justify-center text-center space-y-3">
              {logoUrl ? (
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-white dark:bg-[#1A2620] border border-[#C5A880]/30 p-2 flex items-center justify-center">
                  <img src={logoUrl} alt="شعار المؤسسة" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="absolute top-1 left-1 p-1 rounded-md bg-rose-600 text-white"
                    title="حذف الشعار"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl border border-dashed border-[#C5A880]/50 flex items-center justify-center text-[#7B8F82]">
                  <Building2 className="w-8 h-8" />
                </div>
              )}

              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#16221C] border border-[#C5A880]/40 text-xs font-bold cursor-pointer hover:border-[#C5A880]">
                {isUploadingLogo ? <Loader2 className="w-4 h-4 animate-spin text-[#A88758]" /> : <Upload className="w-4 h-4 text-[#A88758]" />}
                <span>{logoUrl ? 'تغيير الشعار' : 'رفع صورة الشعار'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadLogo}
                  disabled={isUploadingLogo}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Direct Conversion & Contacts (WhatsApp is core) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131D18] border border-[#C5A880]/20 space-y-6">
        <div className="flex items-center gap-2 text-sm font-bold text-[#A88758] dark:text-[#C5A880]">
          <MessageSquare className="w-5 h-5" />
          <span>أرقام التواصل والتحويل المباشر عبر واتساب</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5 flex items-center gap-1">
              <span>رقم الواتساب الرئيسي</span>
              <span className="text-[11px] text-[#A88758] font-normal">(مع المفتاح الدولي e.g. +966500000000)</span>
            </label>
            <input
              type="text"
              value={whatsappNumber}
              onChange={e => setWhatsappNumber(e.target.value)}
              placeholder="+966500000000"
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#0E1512] border border-[#C5A880]/30 text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
              رقم الهاتف للاتصال المباشر
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              placeholder="0500000000"
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#0E1512] border border-[#C5A880]/30 text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
              البريد الإلكتروني الرسمي
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="info@rawataltamayuz.com"
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#0E1512] border border-[#C5A880]/30 text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
              العنوان / المدينة
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="المملكة العربية السعودية - الرياض"
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#0E1512] border border-[#C5A880]/30 text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
            رسالة الواتساب الافتراضية العامة
          </label>
          <input
            type="text"
            value={defaultWhatsappMessage}
            onChange={e => setDefaultWhatsappMessage(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#0E1512] border border-[#C5A880]/30 text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
          />
        </div>
      </div>

      {/* 3. Social Media */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131D18] border border-[#C5A880]/20 space-y-6">
        <div className="flex items-center gap-2 text-sm font-bold text-[#A88758] dark:text-[#C5A880]">
          <Globe className="w-5 h-5" />
          <span>حسابات التواصل الاجتماعي</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
              رابط حساب إنستغرام (Instagram)
            </label>
            <input
              type="url"
              value={instagram}
              onChange={e => setInstagram(e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#0E1512] border border-[#C5A880]/30 text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
              رابط حساب تيك توك (TikTok)
            </label>
            <input
              type="url"
              value={tiktok}
              onChange={e => setTiktok(e.target.value)}
              placeholder="https://tiktok.com/@..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#0E1512] border border-[#C5A880]/30 text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
              رابط حساب تويتر / إكس (X)
            </label>
            <input
              type="url"
              value={twitter}
              onChange={e => setTwitter(e.target.value)}
              placeholder="https://x.com/..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#0E1512] border border-[#C5A880]/30 text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
              رابط سناب شات (Snapchat)
            </label>
            <input
              type="url"
              value={snapchat}
              onChange={e => setSnapchat(e.target.value)}
              placeholder="https://snapchat.com/add/..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#0E1512] border border-[#C5A880]/30 text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {/* 4. About Story */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131D18] border border-[#C5A880]/20 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#A88758] dark:text-[#C5A880]">
          <Building2 className="w-5 h-5" />
          <span>قصة المؤسسة وقسم "عن الشركة"</span>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#2A3B30] dark:text-[#D0E0D4] mb-1.5">
            النص المعماري التعريفي
          </label>
          <textarea
            rows={4}
            value={aboutStory}
            onChange={e => setAboutStory(e.target.value)}
            placeholder="اكتب نبذة عن تاريخ المؤسسة وخبرتها في تنفيذ المظلات والسواتر..."
            className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#0E1512] border border-[#C5A880]/30 text-sm text-[#12261E] dark:text-[#FAF8F5] outline-none resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* 5. Why Us Cards Editor */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131D18] border border-[#C5A880]/20 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-[#A88758] dark:text-[#C5A880]">
            <ShieldCheck className="w-5 h-5" />
            <span>بطاقات قسم "لماذا تختارنا؟"</span>
          </div>

          <button
            type="button"
            onClick={handleAddWhyUs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12261E]/10 dark:bg-white/10 text-xs font-bold text-[#12261E] dark:text-white hover:bg-[#12261E] hover:text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة بطاقة</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {whyUsItems.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#0E1512] border border-[#C5A880]/30 space-y-3 relative"
            >
              <button
                type="button"
                onClick={() => handleRemoveWhyUs(idx)}
                className="absolute top-3 left-3 text-stone-400 hover:text-rose-600"
                title="حذف"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                <label className="block text-[11px] font-bold text-[#677B6D] mb-1">
                  عنوان الميزة
                </label>
                <input
                  type="text"
                  value={item.title}
                  onChange={e => handleUpdateWhyUs(idx, 'title', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#16221C] border border-[#C5A880]/30 text-xs font-bold text-[#12261E] dark:text-[#FAF8F5] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#677B6D] mb-1">
                  الوصف
                </label>
                <textarea
                  rows={2}
                  value={item.description}
                  onChange={e => handleUpdateWhyUs(idx, 'description', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#16221C] border border-[#C5A880]/30 text-xs text-[#12261E] dark:text-[#FAF8F5] outline-none resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};
