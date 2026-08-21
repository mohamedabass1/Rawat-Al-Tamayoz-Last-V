import React from 'react';
import type { WhyUsItem } from '../../types';
import { ShieldCheck, Compass, Clock, Award, CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface WhyUsSectionProps {
  items: WhyUsItem[];
}

export const WhyUsSection: React.FC<WhyUsSectionProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6" strokeWidth={1.75} />;
      case 'Compass':
        return <Compass className="w-6 h-6" strokeWidth={1.75} />;
      case 'Clock':
        return <Clock className="w-6 h-6" strokeWidth={1.75} />;
      case 'Award':
        return <Award className="w-6 h-6" strokeWidth={1.75} />;
      default:
        return <Sparkles className="w-6 h-6" strokeWidth={1.75} />;
    }
  };

  return (
    <section id="why-us" className="py-20 bg-[#F4F0E8]/50 dark:bg-[#0C120F]/50 border-y border-[#C5A880]/15" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A88758] dark:text-[#C5A880] mb-2">
            <Sparkles className="w-4 h-4" />
            <span>معايير الجودة والضمان</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#12261E] dark:text-[#FAF8F5] tracking-tight mb-4">
            لماذا يختار عملاؤنا مؤسسة روعة التميز؟
          </h2>
          <p className="text-sm sm:text-base text-[#526558] dark:text-[#9FB1A4] leading-relaxed">
            نجمع بين الرؤية المعمارية العصرية، الدقة في التصنيع، واستخدام خامات مقاومة لأقسى الظروف المناخية.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="relative p-8 rounded-2xl bg-white dark:bg-[#141F1A] border border-[#C5A880]/20 hover:border-[#C5A880]/60 shadow-sm hover:shadow-lg transition-all flex flex-col"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#12261E]/5 dark:bg-[#1C2C24] text-[#A88758] dark:text-[#C5A880] flex items-center justify-center mb-6 border border-[#C5A880]/20">
                {getIcon(item.icon)}
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-[#12261E] dark:text-[#FAF8F5] mb-3">
                {item.title}
              </h3>

              <p className="text-sm text-[#5B6F62] dark:text-[#9FB2A5] leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
