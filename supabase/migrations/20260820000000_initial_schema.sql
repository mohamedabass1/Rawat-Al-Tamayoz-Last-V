-- =============================================================================
-- Migration: Initial Schema for Rawat Al-Tamayoz Platform
-- Description: Creates categories, products, projects, site_settings, and admin_users tables,
--              Row Level Security (RLS) policies, indexes, and storage bucket configuration.
-- =============================================================================

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for category sorting and active status filtering
CREATE INDEX IF NOT EXISTS idx_categories_active_sort ON categories(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  short_description TEXT DEFAULT '',
  full_description TEXT DEFAULT '',
  features JSONB DEFAULT '[]'::jsonb,
  usages JSONB DEFAULT '[]'::jsonb,
  whatsapp_message TEXT DEFAULT '',
  images JSONB DEFAULT '[]'::jsonb,
  cover_image TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for product filtering and searching
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active_sort ON products(is_active, sort_order);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  location TEXT DEFAULT '',
  category_name TEXT DEFAULT '',
  images JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_active_sort ON projects(is_active, sort_order);

-- 4. Site Settings Table (Single-row configuration)
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  company_name TEXT NOT NULL DEFAULT 'روعة التميز',
  company_tagline TEXT DEFAULT 'مظلات • سواتر • برجولات • حلول معمارية خارجية',
  company_bio TEXT DEFAULT 'مؤسسة روعة التميز متخصصة في تصميم وتنفيذ وتوريد أرقى الحلول والمظلات والسواتر والبرجولات والخيام وبيوت الشعر بأعلى معايير الجودة والاحترافية.',
  logo_url TEXT DEFAULT '',
  whatsapp_number TEXT DEFAULT '',
  phone_number TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  instagram_url TEXT DEFAULT '',
  facebook_url TEXT DEFAULT '',
  twitter_url TEXT DEFAULT '',
  snapchat_url TEXT DEFAULT '',
  tiktok_url TEXT DEFAULT '',
  default_whatsapp_message TEXT DEFAULT 'السلام عليكم ورحمة الله، أرغب بالاستفسار عن حلولكم المعمارية وخدماتكم.',
  why_us_items JSONB DEFAULT '[
    {"id": "why-1", "title": "جودة تنفيذ استثنائية", "description": "نستخدم أفضل خامات الحديد، الأقمشة المقاومة للحرارة، والخشب المعالج لضمان المتانة والعمر الطويل.", "icon": "ShieldCheck"},
    {"id": "why-2", "title": "تصاميم هندسية عصرية", "description": "حلول معمارية مبتكرة تناسب الفلل، القصور، والمشاريع التجارية مع مراعاة أدق التفاصيل الجمالية.", "icon": "Compass"},
    {"id": "why-3", "title": "التزام بالمواعيد والضمان", "description": "دقة عالية في الجداول الزمنية مع تقديم ضمان معتمد على الهياكل والأقمشة وطرق التثبيت.", "icon": "Clock"}
  ]'::jsonb,
  about_story TEXT DEFAULT 'تأسست روعة التميز لتقديم أرقى الحلول الخارجية التي تجمع بين الوظيفة الهندسية والجمال المعماري. نحرص على تنفيذ مشاريع المظلات، السواتر، والبرجولات بأعلى مقاييس الأمان والجودة لتلبي تطلعات عملائنا الكرام.',
  hero_headline TEXT DEFAULT 'نصنع مساحات خارجية تليق بذوقك الرفيع',
  hero_subheadline TEXT DEFAULT 'تصميم وتنفيذ أرقى المظلات والسواتر والبرجولات والخيام بأعلى معايير الهندسة والجودة في المملكة.',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default settings row if missing
INSERT INTO site_settings (id) VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- 5. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  tokens JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- Row Level Security (RLS) Policies
-- =============================================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Categories RLS:
-- 1) Anyone can read active categories
CREATE POLICY "Public categories are viewable by everyone" 
ON categories FOR SELECT 
USING (true);

-- 2) Service role (Backend) has full control
CREATE POLICY "Service role full access on categories" 
ON categories FOR ALL 
USING (auth.jwt() IS NULL OR auth.role() = 'service_role');

-- Products RLS:
-- 1) Anyone can read products
CREATE POLICY "Public products are viewable by everyone" 
ON products FOR SELECT 
USING (true);

-- 2) Service role (Backend) has full control
CREATE POLICY "Service role full access on products" 
ON products FOR ALL 
USING (auth.jwt() IS NULL OR auth.role() = 'service_role');

-- Projects RLS:
-- 1) Anyone can read projects
CREATE POLICY "Public projects are viewable by everyone" 
ON projects FOR SELECT 
USING (true);

-- 2) Service role (Backend) has full control
CREATE POLICY "Service role full access on projects" 
ON projects FOR ALL 
USING (auth.jwt() IS NULL OR auth.role() = 'service_role');

-- Site Settings RLS:
-- 1) Anyone can read site settings
CREATE POLICY "Public settings are viewable by everyone" 
ON site_settings FOR SELECT 
USING (true);

-- 2) Service role (Backend) has full control
CREATE POLICY "Service role full access on site_settings" 
ON site_settings FOR ALL 
USING (auth.jwt() IS NULL OR auth.role() = 'service_role');

-- Admin Users RLS:
-- Strictly service role / backend access only
CREATE POLICY "Service role full access on admin_users" 
ON admin_users FOR ALL 
USING (auth.jwt() IS NULL OR auth.role() = 'service_role');

-- =============================================================================
-- Storage Bucket: site-images
-- =============================================================================
-- Insert the public bucket if storage schema exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy: Allow public read of images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public image view policy'
  ) THEN
    CREATE POLICY "Public image view policy" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'site-images');
  END IF;
END $$;

-- Policy: Allow service_role to insert/update/delete objects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Service role image management policy'
  ) THEN
    CREATE POLICY "Service role image management policy" 
    ON storage.objects FOR ALL 
    USING (bucket_id = 'site-images');
  END IF;
END $$;
