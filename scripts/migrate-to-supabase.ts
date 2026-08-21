import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { BUCKET_NAME } from '../server/supabase.js';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes('placeholder')) {
  console.error('\n❌ خطأ: يرجى ضبط المتغيرات البيئية SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في ملف .env أولاً.');
  console.error('Example:');
  console.error('SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co');
  console.error('SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsIn...\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

const STORE_PATH = path.join(process.cwd(), 'data', 'store.json');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

async function migrate() {
  console.log('\n🚀 بدء عملية ترحيل البيانات إلى Supabase...');
  console.log(`🔗 Supabase URL: ${SUPABASE_URL}\n`);

  if (!fs.existsSync(STORE_PATH)) {
    console.log('⚠️ لم يتم العثور على ملف data/store.json.');
    return;
  }

  const rawJson = fs.readFileSync(STORE_PATH, 'utf-8');
  const store = JSON.parse(rawJson);

  const report = {
    images: { discovered: 0, uploaded: 0, skipped: 0, errors: 0 },
    categories: { discovered: 0, inserted: 0, errors: 0 },
    products: { discovered: 0, inserted: 0, errors: 0 },
    projects: { discovered: 0, inserted: 0, errors: 0 },
    settings: { discovered: 1, inserted: 0, errors: 0 },
    users: { discovered: 0, inserted: 0, errors: 0 }
  };

  // 1. Storage Migration (Upload local files in uploads/ to Supabase Storage bucket 'site-images')
  console.log('📦 [1/6] فحص وترحيل الصور المخزنة محلياً إلى Supabase Storage...');
  const uploadedUrlMap = new Map<string, string>();

  if (fs.existsSync(UPLOADS_DIR)) {
    const files = fs.readdirSync(UPLOADS_DIR);
    report.images.discovered = files.length;

    for (const filename of files) {
      const localFilePath = path.join(UPLOADS_DIR, filename);
      if (!fs.statSync(localFilePath).isFile()) continue;

      const fileBuffer = fs.readFileSync(localFilePath);
      const ext = path.extname(filename).toLowerCase();
      let mimeType = 'image/jpeg';
      if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.webp') mimeType = 'image/webp';
      else if (ext === '.svg') mimeType = 'image/svg+xml';
      else if (ext === '.avif') mimeType = 'image/avif';

      const storagePath = `uploads/${filename}`;

      try {
        const { error: uploadErr } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, fileBuffer, {
            contentType: mimeType,
            upsert: true
          });

        if (uploadErr) {
          console.warn(`  ⚠️ فشل رفع الصورة ${filename}: ${uploadErr.message}`);
          report.images.errors++;
        } else {
          const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
          uploadedUrlMap.set(`/uploads/${filename}`, publicUrlData.publicUrl);
          report.images.uploaded++;
        }
      } catch (e: any) {
        console.warn(`  ⚠️ استثناء أثناء رفع ${filename}:`, e.message);
        report.images.errors++;
      }
    }
  }
  console.log(`  ✅ اكتمل ترحيل الصور: ${report.images.uploaded}/${report.images.discovered} تم رفعها بنجاح.\n`);

  // Helper to replace local /uploads/ URLs with Supabase Storage public URLs
  function remapUrl(url?: string): string {
    if (!url) return '';
    if (uploadedUrlMap.has(url)) return uploadedUrlMap.get(url)!;
    return url;
  }

  // 2. Categories Migration
  console.log('📂 [2/6] ترحيل الأصناف (Categories)...');
  const categories = Array.isArray(store.categories) ? store.categories : [];
  report.categories.discovered = categories.length;

  for (const cat of categories) {
    try {
      const { error } = await supabase.from('categories').upsert({
        id: cat.id,
        name: cat.name,
        slug: cat.slug || `category-${cat.id}`,
        description: cat.description || '',
        image_url: remapUrl(cat.imageUrl),
        sort_order: cat.sortOrder || 0,
        is_active: cat.isActive !== undefined ? cat.isActive : true,
        created_at: cat.createdAt || new Date().toISOString(),
        updated_at: cat.updatedAt || new Date().toISOString()
      });

      if (error) {
        console.error(`  ❌ خطأ في ترحيل الصنف ${cat.name}:`, error.message);
        report.categories.errors++;
      } else {
        report.categories.inserted++;
      }
    } catch (err: any) {
      console.error(`  ❌ استثناء في الصنف ${cat.name}:`, err.message);
      report.categories.errors++;
    }
  }
  console.log(`  ✅ الأصناف: ${report.categories.inserted}/${report.categories.discovered} تم ترحيلها بنجاح.\n`);

  // 3. Products Migration
  console.log('🛍️ [3/6] ترحيل المنتجات (Products)...');
  const products = Array.isArray(store.products) ? store.products : [];
  report.products.discovered = products.length;

  for (const prod of products) {
    try {
      const mappedImages = Array.isArray(prod.images)
        ? prod.images.map((img: any) => ({
            ...img,
            url: remapUrl(img.url)
          }))
        : [];

      const { error } = await supabase.from('products').upsert({
        id: prod.id,
        category_id: prod.categoryId || null,
        name: prod.name,
        slug: prod.slug || `product-${prod.id}`,
        short_description: prod.shortDescription || '',
        full_description: prod.fullDescription || '',
        features: prod.features || [],
        usages: prod.usages || [],
        whatsapp_message: prod.whatsappMessage || '',
        images: mappedImages,
        cover_image: remapUrl(prod.coverImage),
        sort_order: prod.sortOrder || 0,
        is_active: prod.isActive !== undefined ? prod.isActive : true,
        created_at: prod.createdAt || new Date().toISOString(),
        updated_at: prod.updatedAt || new Date().toISOString()
      });

      if (error) {
        console.error(`  ❌ خطأ في ترحيل المنتج ${prod.name}:`, error.message);
        report.products.errors++;
      } else {
        report.products.inserted++;
      }
    } catch (err: any) {
      console.error(`  ❌ استثناء في المنتج ${prod.name}:`, err.message);
      report.products.errors++;
    }
  }
  console.log(`  ✅ المنتجات: ${report.products.inserted}/${report.products.discovered} تم ترحيلها بنجاح.\n`);

  // 4. Projects Migration
  console.log('🏗️ [4/6] ترحيل المشاريع (Projects)...');
  const projects = Array.isArray(store.projects) ? store.projects : [];
  report.projects.discovered = projects.length;

  for (const proj of projects) {
    try {
      const mappedImages = Array.isArray(proj.images)
        ? proj.images.map((imgUrl: string) => remapUrl(imgUrl))
        : [];

      const { error } = await supabase.from('projects').upsert({
        id: proj.id,
        title: proj.title,
        description: proj.description || '',
        location: proj.location || '',
        category_name: proj.categoryName || '',
        images: mappedImages,
        sort_order: proj.sortOrder || 0,
        is_active: proj.isActive !== undefined ? proj.isActive : true,
        created_at: proj.createdAt || new Date().toISOString()
      });

      if (error) {
        console.error(`  ❌ خطأ في ترحيل المشروع ${proj.title}:`, error.message);
        report.projects.errors++;
      } else {
        report.projects.inserted++;
      }
    } catch (err: any) {
      console.error(`  ❌ استثناء في المشروع ${proj.title}:`, err.message);
      report.projects.errors++;
    }
  }
  console.log(`  ✅ المشاريع: ${report.projects.inserted}/${report.projects.discovered} تم ترحيلها بنجاح.\n`);

  // 5. Site Settings Migration
  console.log('⚙️ [5/6] ترحيل إعدادات الموقع (Site Settings)...');
  if (store.settings) {
    try {
      const s = store.settings;
      const { error } = await supabase.from('site_settings').upsert({
        id: 'default',
        company_name: s.companyName,
        company_tagline: s.companyTagline || '',
        company_bio: s.companyBio || '',
        logo_url: remapUrl(s.logoUrl),
        whatsapp_number: s.whatsappNumber || '',
        phone_number: s.phoneNumber || '',
        email: s.email || '',
        address: s.address || '',
        instagram_url: s.instagramUrl || '',
        facebook_url: s.facebookUrl || '',
        twitter_url: s.twitterUrl || '',
        snapchat_url: s.snapchatUrl || '',
        tiktok_url: s.tiktokUrl || '',
        default_whatsapp_message: s.defaultWhatsappMessage || '',
        why_us_items: s.whyUsItems || [],
        about_story: s.aboutStory || '',
        hero_headline: s.heroHeadline || '',
        hero_subheadline: s.heroSubheadline || '',
        updated_at: new Date().toISOString()
      });

      if (error) {
        console.error('  ❌ خطأ في ترحيل إعدادات الموقع:', error.message);
        report.settings.errors++;
      } else {
        report.settings.inserted = 1;
      }
    } catch (err: any) {
      console.error('  ❌ استثناء في إعدادات الموقع:', err.message);
      report.settings.errors++;
    }
  }
  console.log(`  ✅ الإعدادات: تم ترحيلها بنجاح.\n`);

  // 6. Admin Users Migration
  console.log('👤 [6/6] ترحيل حسابات المدراء (Admin Users)...');
  const users = Array.isArray(store.users) ? store.users : [];
  report.users.discovered = users.length;

  for (const user of users) {
    try {
      const { error } = await supabase.from('admin_users').upsert({
        id: user.id,
        username: user.username,
        password_hash: user.passwordHash,
        salt: user.salt,
        tokens: user.tokens || [],
        updated_at: new Date().toISOString()
      });

      if (error) {
        console.error(`  ❌ خطأ في ترحيل المستخدم ${user.username}:`, error.message);
        report.users.errors++;
      } else {
        report.users.inserted++;
      }
    } catch (err: any) {
      console.error(`  ❌ استثناء في المستخدم ${user.username}:`, err.message);
      report.users.errors++;
    }
  }
  console.log(`  ✅ حسابات المدراء: ${report.users.inserted}/${report.users.discovered} تم ترحيلها بنجاح.\n`);

  // Final Summary Report
  console.log('================================================================');
  console.log('🎉 اكتملت عملية الترحيل إلى Supabase بنجاح!');
  console.log('================================================================');
  console.table({
    'الصور (Images)': { مكتشف: report.images.discovered, تم_الرفع: report.images.uploaded, أخطاء: report.images.errors },
    'الأصناف (Categories)': { مكتشف: report.categories.discovered, تم_الترحيل: report.categories.inserted, أخطاء: report.categories.errors },
    'المنتجات (Products)': { مكتشف: report.products.discovered, تم_الترحيل: report.products.inserted, أخطاء: report.products.errors },
    'المشاريع (Projects)': { مكتشف: report.projects.discovered, تم_الترحيل: report.projects.inserted, أخطاء: report.projects.errors },
    'الإعدادات (Settings)': { مكتشف: report.settings.discovered, تم_الترحيل: report.settings.inserted, أخطاء: report.settings.errors },
    'المدراء (Admin Users)': { مكتشف: report.users.discovered, تم_الترحيل: report.users.inserted, أخطاء: report.users.errors }
  });
  console.log('================================================================\n');
}

migrate().catch(e => {
  console.error('Fatal migration failure:', e);
  process.exit(1);
});
