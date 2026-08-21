import fs from "fs";
import path from "path";
import crypto from "crypto";
import type {
  Category,
  Product,
  Project,
  SiteSettings,
  DashboardStats,
} from "../src/types.js";
import { getSupabase, isSupabaseConfigured } from "./supabase.js";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "store.json");

export interface StoredUser {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  tokens: string[];
}

export interface DatabaseSchema {
  categories: Category[];
  products: Product[];
  projects: Project[];
  settings: SiteSettings;
  users: StoredUser[];
}

export const DEFAULT_SETTINGS: SiteSettings = {
  companyName: "روعة التميز",
  companyTagline: "مظلات • سواتر • برجولات • حلول معمارية خارجية",
  companyBio:
    "مؤسسة روعة التميز متخصصة في تصميم وتنفيذ وتوريد أرقى الحلول والمظلات والسواتر والبرجولات والخيام وبيوت الشعر بأعلى معايير الجودة والاحترافية.",
  logoUrl: "",
  whatsappNumber: "",
  phoneNumber: "",
  email: "",
  address: "",
  instagramUrl: "",
  facebookUrl: "",
  twitterUrl: "",
  snapchatUrl: "",
  tiktokUrl: "",
  defaultWhatsappMessage:
    "السلام عليكم ورحمة الله، أرغب بالاستفسار عن حلولكم المعمارية وخدماتكم.",
  whyUsItems: [
    {
      id: "why-1",
      title: "جودة تنفيذ استثنائية",
      description:
        "نستخدم أفضل خامات الحديد، الأقمشة المقاومة للحرارة، والخشب المعالج لضمان المتانة والعمر الطويل.",
      icon: "ShieldCheck",
    },
    {
      id: "why-2",
      title: "تصاميم هندسية عصرية",
      description:
        "حلول معمارية مبتكرة تناسب الفلل، القصور، والمشاريع التجارية مع مراعاة أدق التفاصيل الجمالية.",
      icon: "Compass",
    },
    {
      id: "why-3",
      title: "التزام بالمواعيد والضمان",
      description:
        "دقة عالية في الجداول الزمنية مع تقديم ضمان معتمد على الهياكل والأقمشة وطرق التثبيت.",
      icon: "Clock",
    },
  ],
  aboutStory:
    "تأسست روعة التميز لتقديم أرقى الحلول الخارجية التي تجمع بين الوظيفة الهندسية والجمال المعماري. نحرص على تنفيذ مشاريع المظلات، السواتر، والبرجولات بأعلى مقاييس الأمان والجودة لتلبي تطلعات عملائنا الكرام.",
  heroHeadline: "نصنع مساحات خارجية تليق بذوقك الرفيع",
  heroSubheadline:
    "تصميم وتنفيذ أرقى المظلات والسواتر والبرجولات والخيام بأعلى معايير الهندسة والجودة في المملكة.",
};

export function hashPassword(
  password: string,
  salt?: string,
): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, generatedSalt, 1000, 64, "sha512")
    .toString("hex");
  return { hash, salt: generatedSalt };
}

// Local cache helper
function initLocalDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    // Read-only filesystem in serverless/Vercel environment
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      if (!data.categories) data.categories = [];
      if (!data.products) data.products = [];
      if (!data.projects) data.projects = [];
      if (!data.settings) data.settings = { ...DEFAULT_SETTINGS };
      if (!data.users || data.users.length === 0) {
        const { hash, salt } = hashPassword("admin12345");
        data.users = [
          {
            id: "admin-1",
            username: "admin",
            passwordHash: hash,
            salt,
            tokens: [],
          },
        ];
      }
      return data;
    } catch (e) {
      console.error("Error reading database file, reinitializing", e);
    }
  }

  const { hash, salt } = hashPassword("admin12345");
  const initialDb: DatabaseSchema = {
    categories: [],
    products: [],
    projects: [],
    settings: { ...DEFAULT_SETTINGS },
    users: [
      {
        id: "admin-1",
        username: "admin",
        passwordHash: hash,
        salt,
        tokens: [],
      },
    ],
  };

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
  } catch (err) {
    // Read-only filesystem, keep in-memory
  }
  return initialDb;
}

let localCache: DatabaseSchema = initLocalDb();

function persistLocalDb(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(localCache, null, 2), "utf-8");
    fs.renameSync(tempFile, DB_FILE);
  } catch (error) {
    // Ignore write errors in read-only serverless environments
  }
}

// Helper transformers between PostgreSQL snake_case and TypeScript camelCase
function rowToCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || "",
    imageUrl: row.image_url || "",
    sortOrder: Number(row.sort_order) || 0,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

function rowToProduct(row: any): Product {
  return {
    id: row.id,
    categoryId: row.category_id || "",
    name: row.name,
    slug: row.slug,
    shortDescription: row.short_description || "",
    fullDescription: row.full_description || "",
    features: Array.isArray(row.features) ? row.features : [],
    usages: Array.isArray(row.usages) ? row.usages : [],
    whatsappMessage: row.whatsapp_message || "",
    images: Array.isArray(row.images) ? row.images : [],
    coverImage: row.cover_image || "",
    sortOrder: Number(row.sort_order) || 0,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

function rowToProject(row: any): Project {
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    location: row.location || "",
    categoryName: row.category_name || "",
    images: Array.isArray(row.images) ? row.images : [],
    sortOrder: Number(row.sort_order) || 0,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function rowToSettings(row: any): SiteSettings {
  if (!row) return { ...DEFAULT_SETTINGS };
  return {
    companyName: row.company_name || DEFAULT_SETTINGS.companyName,
    companyTagline: row.company_tagline || DEFAULT_SETTINGS.companyTagline,
    companyBio: row.company_bio || DEFAULT_SETTINGS.companyBio,
    logoUrl: row.logo_url || "",
    whatsappNumber: row.whatsapp_number || "",
    phoneNumber: row.phone_number || "",
    email: row.email || "",
    address: row.address || "",
    instagramUrl: row.instagram_url || "",
    facebookUrl: row.facebook_url || "",
    twitterUrl: row.twitter_url || "",
    snapchatUrl: row.snapchat_url || "",
    tiktokUrl: row.tiktok_url || "",
    defaultWhatsappMessage:
      row.default_whatsapp_message || DEFAULT_SETTINGS.defaultWhatsappMessage,
    whyUsItems: Array.isArray(row.why_us_items)
      ? row.why_us_items
      : DEFAULT_SETTINGS.whyUsItems,
    aboutStory: row.about_story || DEFAULT_SETTINGS.aboutStory,
    heroHeadline: row.hero_headline || DEFAULT_SETTINGS.heroHeadline,
    heroSubheadline: row.hero_subheadline || DEFAULT_SETTINGS.heroSubheadline,
  };
}

function rowToUser(row: any): StoredUser {
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    salt: row.salt,
    tokens: Array.isArray(row.tokens) ? row.tokens : [],
  };
}

export const db = {
  // ==========================================
  // Categories
  // ==========================================
  async getCategories(activeOnly = false): Promise<Category[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        let query = supabase
          .from("categories")
          .select("*")
          .order("sort_order", { ascending: true });
        if (activeOnly) {
          query = query.eq("is_active", true);
        }
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map(rowToCategory);
      } catch (err) {
        console.error(
          "Supabase getCategories error, falling back to local:",
          err,
        );
      }
    }

    let items = [...localCache.categories];
    if (activeOnly) {
      items = items.filter((c) => c.isActive);
    }
    return items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  },

  async getCategoryById(id: string): Promise<Category | undefined> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("id", id)
          .single();
        if (!error && data) return rowToCategory(data);
      } catch (err) {
        console.error("Supabase getCategoryById error:", err);
      }
    }
    return localCache.categories.find((c) => c.id === id);
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    const newCategory: Category = {
      id:
        data.id ||
        `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: data.name?.trim() || "صنف جديد",
      slug: data.slug?.trim() || `category-${Date.now()}`,
      description: data.description?.trim() || "",
      imageUrl: data.imageUrl || "",
      sortOrder: Number(data.sortOrder) || localCache.categories.length + 1,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: inserted, error } = await supabase
          .from("categories")
          .insert({
            id: newCategory.id,
            name: newCategory.name,
            slug: newCategory.slug,
            description: newCategory.description,
            image_url: newCategory.imageUrl,
            sort_order: newCategory.sortOrder,
            is_active: newCategory.isActive,
            created_at: newCategory.createdAt,
            updated_at: newCategory.updatedAt,
          })
          .select()
          .single();

        if (error) throw error;
        if (inserted) return rowToCategory(inserted);
      } catch (err) {
        console.error("Supabase createCategory error:", err);
      }
    }

    localCache.categories.push(newCategory);
    persistLocalDb();
    return newCategory;
  },

  async updateCategory(
    id: string,
    data: Partial<Category>,
  ): Promise<Category | null> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const updatePayload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };
        if (data.name !== undefined) updatePayload.name = data.name.trim();
        if (data.slug !== undefined) updatePayload.slug = data.slug.trim();
        if (data.description !== undefined)
          updatePayload.description = data.description.trim();
        if (data.imageUrl !== undefined)
          updatePayload.image_url = data.imageUrl;
        if (data.sortOrder !== undefined)
          updatePayload.sort_order = Number(data.sortOrder);
        if (data.isActive !== undefined)
          updatePayload.is_active = data.isActive;

        const { data: updated, error } = await supabase
          .from("categories")
          .update(updatePayload)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        if (updated) return rowToCategory(updated);
      } catch (err) {
        console.error("Supabase updateCategory error:", err);
      }
    }

    const index = localCache.categories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    const existing = localCache.categories[index];
    localCache.categories[index] = {
      ...existing,
      ...data,
      name: data.name !== undefined ? data.name.trim() : existing.name,
      description:
        data.description !== undefined
          ? data.description.trim()
          : existing.description,
      updatedAt: new Date().toISOString(),
    };
    persistLocalDb();
    return localCache.categories[index];
  },

  async deleteCategory(
    id: string,
  ): Promise<{ success: boolean; affectedProducts: number }> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error: prodErr } = await supabase
          .from("products")
          .update({ category_id: null, is_active: false })
          .eq("category_id", id);

        if (prodErr)
          console.warn("Supabase product category reset warning:", prodErr);

        const { error: delErr } = await supabase
          .from("categories")
          .delete()
          .eq("id", id);
        if (delErr) throw delErr;

        return { success: true, affectedProducts: 0 };
      } catch (err) {
        console.error("Supabase deleteCategory error:", err);
      }
    }

    const initialLen = localCache.categories.length;
    localCache.categories = localCache.categories.filter((c) => c.id !== id);
    let affected = 0;
    localCache.products = localCache.products.map((p) => {
      if (p.categoryId === id) {
        affected++;
        return { ...p, categoryId: "", isActive: false };
      }
      return p;
    });
    persistLocalDb();
    return {
      success: localCache.categories.length < initialLen,
      affectedProducts: affected,
    };
  },

  // ==========================================
  // Products
  // ==========================================
  async getProducts(
    categoryId?: string,
    activeOnly = false,
    search?: string,
  ): Promise<Product[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        let query = supabase
          .from("products")
          .select("*")
          .order("sort_order", { ascending: true });
        if (categoryId) {
          query = query.eq("category_id", categoryId);
        }
        if (activeOnly) {
          query = query.eq("is_active", true);
        }
        if (search && search.trim()) {
          const q = search.trim();
          query = query.or(
            `name.ilike.%${q}%,short_description.ilike.%${q}%,full_description.ilike.%${q}%`,
          );
        }
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map(rowToProduct);
      } catch (err) {
        console.error("Supabase getProducts error:", err);
      }
    }

    let items = [...localCache.products];
    if (categoryId) {
      items = items.filter((p) => p.categoryId === categoryId);
    }
    if (activeOnly) {
      items = items.filter((p) => p.isActive);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.fullDescription.toLowerCase().includes(q),
      );
    }
    return items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  },

  async getProductById(id: string): Promise<Product | undefined> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();
        if (!error && data) return rowToProduct(data);
      } catch (err) {
        console.error("Supabase getProductById error:", err);
      }
    }
    return localCache.products.find((p) => p.id === id);
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const images = Array.isArray(data.images) ? data.images : [];
    const cover =
      data.coverImage ||
      images.find((img) => img.isCover)?.url ||
      images[0]?.url ||
      "";

    const newProduct: Product = {
      id:
        data.id ||
        `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      categoryId: data.categoryId || "",
      name: data.name?.trim() || "منتج جديد",
      slug: data.slug?.trim() || `product-${Date.now()}`,
      shortDescription: data.shortDescription?.trim() || "",
      fullDescription: data.fullDescription?.trim() || "",
      features: Array.isArray(data.features)
        ? data.features.filter(
            (f) => typeof f === "string" && f.trim().length > 0,
          )
        : [],
      usages: Array.isArray(data.usages)
        ? data.usages.filter(
            (u) => typeof u === "string" && u.trim().length > 0,
          )
        : [],
      whatsappMessage: data.whatsappMessage?.trim() || "",
      images: images,
      coverImage: cover,
      sortOrder: Number(data.sortOrder) || localCache.products.length + 1,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: inserted, error } = await supabase
          .from("products")
          .insert({
            id: newProduct.id,
            category_id: newProduct.categoryId || null,
            name: newProduct.name,
            slug: newProduct.slug,
            short_description: newProduct.shortDescription,
            full_description: newProduct.fullDescription,
            features: newProduct.features,
            usages: newProduct.usages,
            whatsapp_message: newProduct.whatsappMessage,
            images: newProduct.images,
            cover_image: newProduct.coverImage,
            sort_order: newProduct.sortOrder,
            is_active: newProduct.isActive,
            created_at: newProduct.createdAt,
            updated_at: newProduct.updatedAt,
          })
          .select()
          .single();

        if (error) throw error;
        if (inserted) return rowToProduct(inserted);
      } catch (err) {
        console.error("Supabase createProduct error:", err);
      }
    }

    localCache.products.push(newProduct);
    persistLocalDb();
    return newProduct;
  },

  async updateProduct(
    id: string,
    data: Partial<Product>,
  ): Promise<Product | null> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const updatePayload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };
        if (data.name !== undefined) updatePayload.name = data.name.trim();
        if (data.categoryId !== undefined)
          updatePayload.category_id = data.categoryId || null;
        if (data.slug !== undefined) updatePayload.slug = data.slug.trim();
        if (data.shortDescription !== undefined)
          updatePayload.short_description = data.shortDescription.trim();
        if (data.fullDescription !== undefined)
          updatePayload.full_description = data.fullDescription.trim();
        if (data.features !== undefined) updatePayload.features = data.features;
        if (data.usages !== undefined) updatePayload.usages = data.usages;
        if (data.whatsappMessage !== undefined)
          updatePayload.whatsapp_message = data.whatsappMessage.trim();
        if (data.images !== undefined) updatePayload.images = data.images;
        if (data.coverImage !== undefined)
          updatePayload.cover_image = data.coverImage;
        if (data.sortOrder !== undefined)
          updatePayload.sort_order = Number(data.sortOrder);
        if (data.isActive !== undefined)
          updatePayload.is_active = data.isActive;

        const { data: updated, error } = await supabase
          .from("products")
          .update(updatePayload)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        if (updated) return rowToProduct(updated);
      } catch (err) {
        console.error("Supabase updateProduct error:", err);
      }
    }

    const index = localCache.products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const existing = localCache.products[index];

    let images = data.images !== undefined ? data.images : existing.images;
    let cover =
      data.coverImage !== undefined ? data.coverImage : existing.coverImage;
    if (!cover && images && images.length > 0) {
      cover = images.find((img) => img.isCover)?.url || images[0].url;
    }

    localCache.products[index] = {
      ...existing,
      ...data,
      name: data.name !== undefined ? data.name.trim() : existing.name,
      shortDescription:
        data.shortDescription !== undefined
          ? data.shortDescription.trim()
          : existing.shortDescription,
      fullDescription:
        data.fullDescription !== undefined
          ? data.fullDescription.trim()
          : existing.fullDescription,
      features: data.features !== undefined ? data.features : existing.features,
      usages: data.usages !== undefined ? data.usages : existing.usages,
      images,
      coverImage: cover,
      updatedAt: new Date().toISOString(),
    };
    persistLocalDb();
    return localCache.products[index];
  },

  async deleteProduct(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) throw error;
        return true;
      } catch (err) {
        console.error("Supabase deleteProduct error:", err);
      }
    }

    const initialLen = localCache.products.length;
    localCache.products = localCache.products.filter((p) => p.id !== id);
    persistLocalDb();
    return localCache.products.length < initialLen;
  },

  // ==========================================
  // Projects
  // ==========================================
  async getProjects(activeOnly = false): Promise<Project[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        let query = supabase
          .from("projects")
          .select("*")
          .order("sort_order", { ascending: true });
        if (activeOnly) {
          query = query.eq("is_active", true);
        }
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map(rowToProject);
      } catch (err) {
        console.error("Supabase getProjects error:", err);
      }
    }

    let items = [...localCache.projects];
    if (activeOnly) {
      items = items.filter((p) => p.isActive);
    }
    return items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  },

  async getProjectById(id: string): Promise<Project | undefined> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();
        if (!error && data) return rowToProject(data);
      } catch (err) {
        console.error("Supabase getProjectById error:", err);
      }
    }
    return localCache.projects.find((p) => p.id === id);
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    const newProject: Project = {
      id:
        data.id ||
        `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: data.title?.trim() || "مشروع جديد",
      description: data.description?.trim() || "",
      location: data.location?.trim() || "",
      categoryName: data.categoryName?.trim() || "",
      images: Array.isArray(data.images) ? data.images : [],
      sortOrder: Number(data.sortOrder) || localCache.projects.length + 1,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
    };

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: inserted, error } = await supabase
          .from("projects")
          .insert({
            id: newProject.id,
            title: newProject.title,
            description: newProject.description,
            location: newProject.location,
            category_name: newProject.categoryName,
            images: newProject.images,
            sort_order: newProject.sortOrder,
            is_active: newProject.isActive,
            created_at: newProject.createdAt,
          })
          .select()
          .single();

        if (error) throw error;
        if (inserted) return rowToProject(inserted);
      } catch (err) {
        console.error("Supabase createProject error:", err);
      }
    }

    localCache.projects.push(newProject);
    persistLocalDb();
    return newProject;
  },

  async updateProject(
    id: string,
    data: Partial<Project>,
  ): Promise<Project | null> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const updatePayload: Record<string, any> = {};
        if (data.title !== undefined) updatePayload.title = data.title.trim();
        if (data.description !== undefined)
          updatePayload.description = data.description.trim();
        if (data.location !== undefined)
          updatePayload.location = data.location.trim();
        if (data.categoryName !== undefined)
          updatePayload.category_name = data.categoryName.trim();
        if (data.images !== undefined) updatePayload.images = data.images;
        if (data.sortOrder !== undefined)
          updatePayload.sort_order = Number(data.sortOrder);
        if (data.isActive !== undefined)
          updatePayload.is_active = data.isActive;

        const { data: updated, error } = await supabase
          .from("projects")
          .update(updatePayload)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        if (updated) return rowToProject(updated);
      } catch (err) {
        console.error("Supabase updateProject error:", err);
      }
    }

    const index = localCache.projects.findIndex((p) => p.id === id);
    if (index === -1) return null;
    localCache.projects[index] = {
      ...localCache.projects[index],
      ...data,
    };
    persistLocalDb();
    return localCache.projects[index];
  },

  async deleteProject(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from("projects").delete().eq("id", id);
        if (error) throw error;
        return true;
      } catch (err) {
        console.error("Supabase deleteProject error:", err);
      }
    }

    const initialLen = localCache.projects.length;
    localCache.projects = localCache.projects.filter((p) => p.id !== id);
    persistLocalDb();
    return localCache.projects.length < initialLen;
  },

  // ==========================================
  // Settings
  // ==========================================
  async getSettings(): Promise<SiteSettings> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("*")
          .eq("id", "default")
          .single();
        if (!error && data) return rowToSettings(data);
      } catch (err) {
        console.error("Supabase getSettings error:", err);
      }
    }
    return { ...localCache.settings };
  },

  async updateSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const payload: Record<string, any> = {
          id: "default",
          updated_at: new Date().toISOString(),
        };
        if (data.companyName !== undefined)
          payload.company_name = data.companyName;
        if (data.companyTagline !== undefined)
          payload.company_tagline = data.companyTagline;
        if (data.companyBio !== undefined)
          payload.company_bio = data.companyBio;
        if (data.logoUrl !== undefined) payload.logo_url = data.logoUrl;
        if (data.whatsappNumber !== undefined)
          payload.whatsapp_number = data.whatsappNumber;
        if (data.phoneNumber !== undefined)
          payload.phone_number = data.phoneNumber;
        if (data.email !== undefined) payload.email = data.email;
        if (data.address !== undefined) payload.address = data.address;
        if (data.instagramUrl !== undefined)
          payload.instagram_url = data.instagramUrl;
        if (data.facebookUrl !== undefined)
          payload.facebook_url = data.facebookUrl;
        if (data.twitterUrl !== undefined)
          payload.twitter_url = data.twitterUrl;
        if (data.snapchatUrl !== undefined)
          payload.snapchat_url = data.snapchatUrl;
        if (data.tiktokUrl !== undefined) payload.tiktok_url = data.tiktokUrl;
        if (data.defaultWhatsappMessage !== undefined)
          payload.default_whatsapp_message = data.defaultWhatsappMessage;
        if (data.whyUsItems !== undefined)
          payload.why_us_items = data.whyUsItems;
        if (data.aboutStory !== undefined)
          payload.about_story = data.aboutStory;
        if (data.heroHeadline !== undefined)
          payload.hero_headline = data.heroHeadline;
        if (data.heroSubheadline !== undefined)
          payload.hero_subheadline = data.heroSubheadline;

        const { data: saved, error } = await supabase
          .from("site_settings")
          .upsert(payload)
          .select()
          .single();

        if (error) throw error;
        if (saved) return rowToSettings(saved);
      } catch (err) {
        console.error("Supabase updateSettings error:", err);
      }
    }

    localCache.settings = {
      ...localCache.settings,
      ...data,
    };
    persistLocalDb();
    return { ...localCache.settings };
  },

  // ==========================================
  // Stats
  // ==========================================
  async getStats(): Promise<DashboardStats> {
    const categories = await this.getCategories(false);
    const products = await this.getProducts(undefined, false);
    const projects = await this.getProjects(false);

    let totalImages = 0;
    products.forEach((p) => {
      totalImages += p.images ? p.images.length : p.coverImage ? 1 : 0;
    });
    categories.forEach((c) => {
      if (c.imageUrl) totalImages += 1;
    });
    projects.forEach((pr) => {
      totalImages += pr.images ? pr.images.length : 0;
    });

    return {
      totalCategories: categories.length,
      totalProducts: products.length,
      activeProducts: products.filter((p) => p.isActive).length,
      totalImages,
      totalProjects: projects.length,
      recentProducts: [...products]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5),
      recentCategories: [...categories]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5),
    };
  },

  // ==========================================
  // Auth Users
  // ==========================================
  async findUserById(id: string): Promise<StoredUser | undefined> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("admin_users")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (!error && data) {
          return rowToUser(data);
        }
      } catch (err) {
        console.error("Supabase findUserById error:", err);
      }
    }
    return localCache.users.find((u) => u.id === id);
  },

  async findUserByUsername(username: string): Promise<StoredUser | undefined> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("admin_users")
          .select("*")
          .ilike("username", username.trim())
          .maybeSingle();

        if (!error && data) {
          return rowToUser(data);
        }
      } catch (err) {
        console.error("Supabase findUserByUsername error:", err);
      }
    }
    return localCache.users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase(),
    );
  },

  async findUserByToken(token: string): Promise<StoredUser | undefined> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from("admin_users").select("*");

        if (!error && data && data.length > 0) {
          const matched = data.find((row: any) => {
            const toks = Array.isArray(row.tokens) ? row.tokens : [];
            return toks.includes(token);
          });
          if (matched) return rowToUser(matched);
        }
      } catch (err) {
        console.error("Supabase findUserByToken error:", err);
      }
    }
    return localCache.users.find((u) => u.tokens && u.tokens.includes(token));
  },

  async addTokenToUser(userId: string, token: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: userRow } = await supabase
          .from("admin_users")
          .select("tokens")
          .eq("id", userId)
          .single();

        let currentTokens: string[] = Array.isArray(userRow?.tokens)
          ? userRow.tokens
          : [];
        currentTokens.push(token);
        if (currentTokens.length > 10) {
          currentTokens = currentTokens.slice(-10);
        }

        await supabase
          .from("admin_users")
          .update({
            tokens: currentTokens,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
        return;
      } catch (err) {
        console.error("Supabase addTokenToUser error:", err);
      }
    }

    const user = localCache.users.find((u) => u.id === userId);
    if (user) {
      if (!user.tokens) user.tokens = [];
      user.tokens.push(token);
      if (user.tokens.length > 10) {
        user.tokens = user.tokens.slice(-10);
      }
      persistLocalDb();
    }
  },

  async removeTokenFromUser(userId: string, token: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: userRow } = await supabase
          .from("admin_users")
          .select("tokens")
          .eq("id", userId)
          .single();

        let currentTokens: string[] = Array.isArray(userRow?.tokens)
          ? userRow.tokens
          : [];
        currentTokens = currentTokens.filter((t) => t !== token);

        await supabase
          .from("admin_users")
          .update({
            tokens: currentTokens,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
        return;
      } catch (err) {
        console.error("Supabase removeTokenFromUser error:", err);
      }
    }

    const user = localCache.users.find((u) => u.id === userId);
    if (user && user.tokens) {
      user.tokens = user.tokens.filter((t) => t !== token);
      persistLocalDb();
    }
  },

  async updateUserPassword(
    userId: string,
    newPassword: string,
  ): Promise<boolean> {
    const { hash, salt } = hashPassword(newPassword);
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase
          .from("admin_users")
          .update({
            password_hash: hash,
            salt: salt,
            tokens: [],
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (error) throw error;
        return true;
      } catch (err) {
        console.error("Supabase updateUserPassword error:", err);
      }
    }

    const user = localCache.users.find((u) => u.id === userId);
    if (!user) return false;
    user.passwordHash = hash;
    user.salt = salt;
    user.tokens = [];
    persistLocalDb();
    return true;
  },

  verifyPassword(password: string, hash: string, salt: string): boolean {
    const computed = hashPassword(password, salt).hash;
    return computed === hash;
  },
};
