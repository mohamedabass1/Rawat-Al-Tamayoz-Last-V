# 📖 دليل إعداد وربط Supabase (Supabase Setup & Migration Guide)

هذا الدليل يشرح بالتفصيل كيفية ربط موقع **روعة التميز** بقاعدة بيانات **Supabase (PostgreSQL)** والتخزين السحابي **Supabase Storage**، وترحيل كافة البيانات والصور بسهولة.

---

## 🏗️ 1. المخطط المعماري للنظام (System Architecture)

```text
┌─────────────────────────────────────────────────────────────┐
│                 الواجهة الأمامية (Frontend)                 │
│         React 19 + TypeScript + Tailwind CSS v4             │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               الخادم الخلفي (Express / Node.js)              │
│       المصادقة (JWT) + إدارة الـ CRUD + رفع ومعالجة الصور   │
└──────────────┬───────────────────────────────┬──────────────┘
               │ PostgreSQL Queries            │ File Uploads
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│    Supabase PostgreSQL       │ │      Supabase Storage      │
│  (Categories, Products,      │ │       ('site-images')      │
│   Projects, Settings, Users) │ │ (Public bucket for images) │
└──────────────────────────────┘ └────────────────────────────┘
```

---

## 🚀 2. خطوات إنشاء وتهيئة مشروع Supabase

### الخطوة 1: إنشاء حساب ومشروع جديد
1. ادخل إلى [supabase.com](https://supabase.com) وسجّل دخولك.
2. اضغط على **New Project** (مشروع جديد).
3. أدخل اسم المشروع (مثل `rawat-al-tamayoz`) وحدد كلمة مرور قوية لقاعدة البيانات (`Database Password`) واختر المنطقة الأقرب لك (مثل `Frankfurt` أو `Bahrain`).
4. انتظر دقيقة حتى يكتمل تجهيز قاعدة البيانات.

---

### الخطوة 2: استخراج مفاتيح الاتصال (API Credentials)
1. من القائمة الجانبية في لوحة تحكم Supabase، اذهب إلى:
   **Project Settings** (⚙️) ➡️ **API**.
2. ستجد البيانات التالية:
   * **Project URL**: يبدأ بـ `https://qngnpbrxjjdxjdixossz.supabase.co`
   * **Project API Keys**:
     * `anon` / `public`: المفتاح العام.
     * `service_role`: المفتاح السري المخصص للسيرفر (اضغط *Reveal* لنسخه).

---

### الخطوة 3: تطبيق ملف تهيئة الجداول والـ SQL Migration
1. في لوحة تحكم Supabase، اضغط على **SQL Editor** من القائمة الجانبية.
2. اضغط على **New Query**.
3. افتح الملف الموجود في مشروعك:
   `supabase/migrations/20260820000000_initial_schema.sql`
4. انسخ محتواه بالكامل والصقه في الـ **SQL Editor**.
5. اضغط على زر **RUN** في الأسفل لتنفيذ الاستعلام.
   * سيتم إنشاء الجداول: `categories`, `products`, `projects`, `site_settings`, `admin_users`.
   * سيتم تفعيل سياسات الأمان (Row Level Security - RLS).
   * سيتم إنشاء مجلد التخزين العام `site-images`.

---

### الخطوة 4: التحقق من مجلد التخزين (Storage Bucket)
1. من القائمة الجانبية، اذهب إلى **Storage**.
2. تأكد من وجود مجلد باسم **`site-images`** وأنه **Public**.
3. إذا لم يكن موجوداً، اضغط **New Bucket**، واكتب الاسم `site-images` وفعّل خيار **Public Bucket**.

---

## ⚙️ 3. إعداد المتغيرات البيئية (Environment Variables)

أنشئ ملف باسم `.env` في المجلد الرئيسي للمشروع (بجانب `package.json`) وأضف القيم التي حصلت عليها:

```env
PORT=3000
NODE_ENV=production

# Supabase Configurations
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App URL
APP_URL=https://your-domain.com
```

---

## 📦 4. ترحيل البيانات الحالية (Data Migration)

يحتوي المشروع على سكريبت ترحيل آلي ذكي يقوم بما يلي:
1. قراءة البيانات من `data/store.json`.
2. رفع الصور الموجودة في مجلد `uploads/` إلى **Supabase Storage** وتحويل الروابط تلقائياً.
3. ترحيل كافة الأصناف والمنتجات والمشاريع والإعدادات وحسابات المدراء إلى **Supabase PostgreSQL**.

لتشغيل الترحيل، نفّذ الأمر التالي:

```bash
npm run migrate:supabase
```

ستظهر لك رسالة تأكيد وجدول إحصائي يوضح عدد السجلات والصور التي تم ترحيلها بنجاح.

---

## 🖥️ 5. تشغيل المشروع محلياً (Local Development)

```bash
# تثبيت الحزم (في حال لم تكن مثبتة)
npm install

# تشغيل خادم التطوير (Full-Stack Dev Server)
npm run dev
```

افتح المتصفح على `http://localhost:3000`.

---

## 🌐 6. النشر للإنتاج (Production Deployment)

### النشر عبر Render (موصى به - مجاني وسهل):
1. ارفع المشروع إلى حسابك في **GitHub**.
2. في [Render.com](https://render.com)، أنشئ **New Web Service** واختر المستودع.
3. اضبط الإعدادات:
   * **Build Command:** `npm install && npm run build`
   * **Start Command:** `npm start`
4. في قسم **Environment Variables**، أضف:
   * `NODE_ENV` = `production`
   * `SUPABASE_URL` = (رابط مشروع Supabase الخاص بك)
   * `SUPABASE_ANON_KEY` = (المفتاح العام)
   * `SUPABASE_SERVICE_ROLE_KEY` = (مفتاح السيرفر السري)
5. اضغط **Deploy** وموقعك سيعمل مباشرة ومتصل بقاعدة بيانات Supabase السحابية!

---

## 🛡️ 7. الأمان وحماية البيانات (Security Notes)

* **مفتاح `SUPABASE_SERVICE_ROLE_KEY` سري وخاص بالخادم فقط:** لا تقم أبداً بكتابته في كود الواجهة الأمامية أو رفعه في مستودعات عامة.
* **الجداول محمية عبر Row Level Security (RLS):** الزوار يمكنهم قراءة المحتوى النشط فقط، بينما كافة عمليات الإضافة والتعديل والحذف وتغيير الإعدادات تتطلب توثيقاً إدارياً عبر الخادم الخلفي.
* **الصور العامة:** تُحفظ الصور في مجلد `site-images` وتُخدم بروابط سريعة ومباشرة عبر Supabase CDN.
