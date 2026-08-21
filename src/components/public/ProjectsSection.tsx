import React, { useState } from 'react';
import type { Project } from '../../types';
import { ImageViewerModal } from '../common/ImageViewerModal';
import { ImagePlaceholder } from '../common/ImagePlaceholder';
import { Briefcase, MapPin, Maximize2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface ProjectsSectionProps {
  projects: Project[];
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!projects || projects.length === 0) {
    return null; // Gracefully hidden if no real projects added yet
  }

  const handleOpenProject = (project: Project) => {
    setActiveProject(project);
    setLightboxOpen(true);
  };

  return (
    <section id="projects" className="py-20 bg-[#F4F0E8]/30 dark:bg-[#0E1512]/30 border-t border-[#C5A880]/15" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A88758] dark:text-[#C5A880] mb-2">
            <Briefcase className="w-4 h-4" />
            <span>معرض الأعمال المنفذة</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#12261E] dark:text-[#FAF8F5] tracking-tight mb-4">
            نماذج من المشاريع والأعمال الحية
          </h2>
          <p className="text-sm sm:text-base text-[#526558] dark:text-[#9FB1A4]">
            مقتطفات من مشاريع حقيقية تم تنفيذها بأعلى معايير الجودة والدقة الهندسية.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {projects.map((project, idx) => {
            const firstImage = project.images?.[0];
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                onClick={() => handleOpenProject(project)}
                className="group relative rounded-2xl overflow-hidden bg-white dark:bg-[#141F1A] border border-[#C5A880]/20 hover:border-[#C5A880]/60 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col"
              >
                <div className="relative aspect-[16/11] w-full overflow-hidden bg-stone-100 dark:bg-stone-900">
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <ImagePlaceholder title={project.title} className="w-full h-full" iconSize={32} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

                  <div className="absolute top-3 left-3">
                    <span className="p-2 rounded-xl bg-black/60 text-white backdrop-blur-md flex items-center justify-center">
                      <Maximize2 className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    {project.categoryName && (
                      <span className="text-[11px] font-bold text-[#A88758] dark:text-[#C5A880] mb-1 block">
                        {project.categoryName}
                      </span>
                    )}
                    <h3 className="text-base sm:text-lg font-bold text-[#12261E] dark:text-[#FAF8F5] mb-1.5 line-clamp-1">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="text-xs sm:text-sm text-[#5B6F62] dark:text-[#9FB2A5] line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    )}
                  </div>

                  {project.location && (
                    <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center gap-1.5 text-xs text-[#75897C] dark:text-[#95A89C]">
                      <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>{project.location}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {activeProject && (
        <ImageViewerModal
          images={activeProject.images.map(url => ({ url, alt: activeProject.title }))}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          title={activeProject.title}
        />
      )}
    </section>
  );
};
