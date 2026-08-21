import React, { useState, useEffect, useCallback } from 'react';
import type { Category, Product, Project, SiteSettings, DashboardStats } from './types';
import { api } from './lib/api';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';

// Public Components
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { Hero } from './components/public/Hero';
import { CategoryShowcase } from './components/public/CategoryShowcase';
import { ProductGrid } from './components/public/ProductGrid';
import { ProductDetailModal } from './components/public/ProductDetailModal';
import { WhyUsSection } from './components/public/WhyUsSection';
import { ProjectsSection } from './components/public/ProjectsSection';
import { AboutSection } from './components/public/AboutSection';
import { ContactSection } from './components/public/ContactSection';

// Admin Components
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CategoryManager } from './components/admin/CategoryManager';
import { ProductManager } from './components/admin/ProductManager';
import { ProjectManager } from './components/admin/ProjectManager';
import { SettingsManager } from './components/admin/SettingsManager';
import { AdminLoginModal } from './components/admin/AdminLoginModal';

import { MessageSquare, ArrowUp, Loader2 } from 'lucide-react';

export default function App() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  // Public Data States
  const [settings, setSettings] = useState<SiteSettings>({
    companyName: 'روعة التميز للمظلات والسواتر',
    tagline: 'تصميم وتنفيذ حلول التظليل والبرجولات والخيام بأعلى معايير الجودة',
    companyBio: 'مؤسسة متخصصة في تنفيذ وتوريد وتركيب كافة أعمال المظلات المعمارية، السواتر، البرجولات، بيوت الشعر والخيام بأيدي هندسية متخصصة وخامات مطابقة للمواصفات العالمية.',
    logoUrl: '',
    whatsappNumber: '+966500000000',
    defaultWhatsappMessage: 'السلام عليكم ورحمة الله، أود الاستفسار عن تفاصيل وتركيب حلول التظليل لديكم.',
    phoneNumber: '+966500000000',
    email: 'info@rawataltamayuz.com',
    address: 'المملكة العربية السعودية - الرياض',
    aboutStory: 'تأسست روعة التميز لتقديم أرقى حلول المساحات الخارجية والتظليل المعماري، معتمدين على نخبة من الحرفيين والمهندسين وأجود الخامات العالمية من أقمشة PVC وبوليثيلين وهياكل حديدية مجلفنة.',
    whyUsItems: [
      { id: '1', title: 'خامات معتمدة وضمان حقيقي', description: 'أقمشة بي في سي ألمانية وكورية مقاومة لأقسى درجات الحرارة والأشعة فوق البنفسجية.', icon: 'ShieldCheck' },
      { id: '2', title: 'دقة هندسية وتصاميم عصرية', description: 'مخططات ثلاثية الأبعاد وتنفيذ دقيق يراعي الجمالية المعمارية للمبنى.', icon: 'Compass' },
      { id: '3', title: 'سرعة في الإنجاز والالتزام', description: 'فريق متكامل يضمن سرعة التوريد والتركيب في الوقت المتفق عليه بأعلى كفاءة.', icon: 'Clock' },
    ]
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // UI Navigation States
  const [isAdminView, setIsAdminView] = useState(false);
  const [adminTab, setAdminTab] = useState('dashboard');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [directAddProduct, setDirectAddProduct] = useState(false);
  const [directAddCategory, setDirectAddCategory] = useState(false);

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Apply dark mode class to html document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Fetch Public Data
  const loadPublicData = useCallback(async () => {
    setLoading(true);
    try {
      const [sets, cats, prods, projs] = await Promise.all([
        api.getSettings(),
        api.getCategories(),
        api.getProducts(),
        api.getProjects()
      ]);
      setSettings(sets);
      setCategories(cats);
      setProducts(prods);
      setProjects(projs);
    } catch (err: any) {
      console.error('Error fetching public data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Admin Stats
  const loadAdminStats = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const s = await api.getStats();
      setStats(s);
    } catch (err: any) {
      console.error('Error fetching admin stats:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadPublicData();
  }, [loadPublicData]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminStats();
    }
  }, [isAuthenticated, loadAdminStats]);

  // Navigate directly to public category filter & scroll
  const handleSelectCategoryFromHeroOrShowcase = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    const prodSection = document.getElementById('products');
    if (prodSection) {
      prodSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenAdminFromPublic = () => {
    if (isAuthenticated) {
      setIsAdminView(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsLoginModalOpen(false);
    setIsAdminView(true);
    loadAdminStats();
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cleanWhatsappNumber = settings.whatsappNumber?.replace(/\D/g, '');
  const floatingWhatsappUrl = cleanWhatsappNumber
    ? `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(settings.defaultWhatsappMessage || 'السلام عليكم ورحمة الله، أود الاستفسار عن خدماتكم.')}`
    : '';

  // ADMIN CMS VIEW
  if (isAdminView && isAuthenticated) {
    return (
      <AdminLayout
        activeTab={adminTab}
        onSelectTab={setAdminTab}
        onExitAdmin={() => {
          setIsAdminView(false);
          loadPublicData();
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      >
        {adminTab === 'dashboard' && (
          <AdminDashboard
            stats={stats}
            onNavigateTab={setAdminTab}
            onRefreshStats={loadAdminStats}
            onOpenAddProduct={() => {
              setAdminTab('products');
              setDirectAddProduct(true);
            }}
            onOpenAddCategory={() => {
              setAdminTab('categories');
              setDirectAddCategory(true);
            }}
          />
        )}

        {adminTab === 'categories' && (
          <CategoryManager
            onRefreshStats={loadAdminStats}
            openCreateDirectly={directAddCategory}
          />
        )}

        {adminTab === 'products' && (
          <ProductManager
            onRefreshStats={loadAdminStats}
            openCreateDirectly={directAddProduct}
          />
        )}

        {adminTab === 'projects' && (
          <ProjectManager
            onRefreshStats={loadAdminStats}
          />
        )}

        {adminTab === 'settings' && (
          <SettingsManager
            onSettingsUpdated={(newSettings) => {
              setSettings(newSettings);
            }}
          />
        )}
      </AdminLayout>
    );
  }

  // PUBLIC PRODUCTION WEBSITE VIEW
  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0D1411] text-[#12261E] dark:text-[#FAF8F5] font-sans antialiased selection:bg-[#C5A880]/30 transition-colors duration-300" dir="rtl">
      {/* Header */}
      <Header
        settings={settings}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenAdmin={handleOpenAdminFromPublic}
      />

      {/* Main Public Sections */}
      <main>
        {/* Hero Section */}
        <Hero
          settings={settings}
          categories={categories}
          onExploreClick={() => {
            const el = document.getElementById('products');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onSelectCategory={handleSelectCategoryFromHeroOrShowcase}
        />

        {/* Category Architectural Showcase */}
        <CategoryShowcase
          categories={categories}
          onSelectCategory={handleSelectCategoryFromHeroOrShowcase}
          onOpenAdmin={handleOpenAdminFromPublic}
        />

        {/* Product Catalog Grid */}
        <ProductGrid
          products={products}
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          onViewProduct={(product) => setSelectedProduct(product)}
          onOpenAdmin={handleOpenAdminFromPublic}
        />

        {/* Why Choose Us Section */}
        <WhyUsSection items={settings.whyUsItems || []} />

        {/* Executed Real Projects Section (Hidden gracefully if 0 projects) */}
        <ProjectsSection projects={projects} />

        {/* About Company & Story */}
        <AboutSection
          settings={settings}
          onExploreClick={() => {
            const el = document.getElementById('products');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Interactive Contact & WhatsApp Inquiry Builder */}
        <ContactSection
          settings={settings}
          categories={categories}
        />
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        categories={categories}
        onOpenAdmin={handleOpenAdminFromPublic}
      />

      {/* Floating Action Button: Fast WhatsApp Conversion (Bottom Left for RTL) */}
      {floatingWhatsappUrl && (
        <aside aria-label="أزرار الإجراءات السريعة" className="fixed bottom-6 left-6 z-50 flex flex-col items-center gap-3">
          <a
            href={floatingWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-[#12261E] dark:bg-[#C5A880] text-white dark:text-[#0D1411] shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-[#C5A880]/30"
            title="تواصل مباشر عبر واتساب"
            aria-label="تواصل مباشر عبر واتساب"
          >
            <MessageSquare className="w-6 h-6 text-[#C5A880] dark:text-[#0D1411]" />
            <span className="absolute left-16 px-3 py-1.5 rounded-xl bg-[#12261E] text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none border border-[#C5A880]/30">
              استفسار فوري عبر واتساب
            </span>
          </a>

          <button
            type="button"
            onClick={scrollToTop}
            className="w-10 h-10 rounded-xl bg-white dark:bg-[#15201B] text-[#12261E] dark:text-white border border-[#C5A880]/30 shadow-md flex items-center justify-center hover:bg-[#FAF8F5] transition-colors"
            title="الرجوع للأعلى"
            aria-label="الرجوع للأعلى"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </aside>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        category={categories.find(c => c.id === selectedProduct?.categoryId)}
        settings={settings}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
}
