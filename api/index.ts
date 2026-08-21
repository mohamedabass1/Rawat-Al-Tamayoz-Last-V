import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { db } from "../server/db.js";
import {
  generateToken,
  requireAuth,
  AuthenticatedRequest,
} from "../server/auth.js";
import { uploadMiddleware, processUploadedFile } from "../server/upload.js";

dotenv.config();

const app = express();

// Parse JSON bodies (up to 20MB for settings/metadata)
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Static uploads directory (for local file serving and backward compatibility)
const uploadsDir = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsDir));

// ==========================================
// Public SEO Routes
// ==========================================
app.get("/robots.txt", (_req, res) => {
  res.type("text/plain");
  res.send(
    `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: /sitemap.xml\n`,
  );
});

app.get("/sitemap.xml", async (_req, res) => {
  try {
    const categories = await db.getCategories(true);
    const products = await db.getProducts(undefined, true);
    const baseUrl = process.env.APP_URL || "";

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Home
    xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    // Categories
    categories.forEach((cat) => {
      xml += `  <url>\n    <loc>${baseUrl}/#category-${cat.id}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Products
    products.forEach((prod) => {
      xml += `  <url>\n    <loc>${baseUrl}/#product-${prod.id}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;
    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch {
    res.status(500).send("Error generating sitemap");
  }
});

// ==========================================
// Public API Endpoints
// ==========================================
app.get("/api/public/data", async (_req, res) => {
  try {
    const [settings, categories, products, projects] = await Promise.all([
      db.getSettings(),
      db.getCategories(true),
      db.getProducts(undefined, true),
      db.getProjects(true),
    ]);

    res.json({
      settings,
      categories,
      products,
      projects,
    });
  } catch (err: any) {
    console.error("API /public/data error:", err);
    res.status(500).json({ error: "تعذر جلب البيانات" });
  }
});

app.get("/api/public/categories", async (_req, res) => {
  try {
    const categories = await db.getCategories(true);
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: "حدث خطأ أثناء جلب الأصناف" });
  }
});

app.get("/api/public/categories/:id", async (req, res) => {
  try {
    const cat = await db.getCategoryById(req.params.id);
    if (!cat || !cat.isActive) {
      res.status(404).json({ error: "الصنف غير موجود أو غير نشط" });
      return;
    }
    const products = await db.getProducts(cat.id, true);
    res.json({ category: cat, products });
  } catch (err: any) {
    res.status(500).json({ error: "حدث خطأ أثناء جلب الصنف" });
  }
});

app.get("/api/public/products", async (req, res) => {
  try {
    const categoryId = req.query.categoryId as string | undefined;
    const search = req.query.search as string | undefined;
    const products = await db.getProducts(categoryId, true, search);
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: "حدث خطأ أثناء جلب المنتجات" });
  }
});

app.get("/api/public/products/:id", async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product || !product.isActive) {
      res.status(404).json({ error: "المنتج غير موجود أو غير نشط" });
      return;
    }
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: "حدث خطأ أثناء جلب المنتج" });
  }
});

app.get("/api/public/projects", async (_req, res) => {
  try {
    const projects = await db.getProjects(true);
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: "حدث خطأ أثناء جلب المشاريع" });
  }
});

app.get("/api/public/settings", async (_req, res) => {
  try {
    const settings = await db.getSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: "حدث خطأ أثناء جلب إعدادات الموقع" });
  }
});

// ==========================================
// Auth API Endpoints
// ==========================================
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: "يرجى إدخال اسم المستخدم وكلمة المرور" });
      return;
    }

    const user = await db.findUserByUsername(String(username).trim());
    if (!user) {
      res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      return;
    }

    const isValid = db.verifyPassword(
      String(password),
      user.passwordHash,
      user.salt,
    );
    if (!isValid) {
      res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      return;
    }

    const token = generateToken({ id: user.id, username: user.username });
    await db.addTokenToUser(user.id, token);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ error: "حدث خطأ في الخادم أثناء تسجيل الدخول" });
  }
});

app.post(
  "/api/auth/logout",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.substring(7).trim()
        : (req.headers["x-auth-token"] as string);
      if (token && req.user) {
        await db.removeTokenFromUser(req.user.id, token);
      }
      res.json({ success: true, message: "تم تسجيل الخروج بنجاح" });
    } catch (err: any) {
      res.status(500).json({ error: "حدث خطأ أثناء تسجيل الخروج" });
    }
  },
);

app.get("/api/auth/me", requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "غير مسجل" });
    return;
  }
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
    },
  });
});

app.post(
  "/api/auth/change-password",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        res
          .status(400)
          .json({ error: "يرجى تقديم كلمة المرور الحالية والجديدة" });
        return;
      }

      if (newPassword.length < 6) {
        res
          .status(400)
          .json({
            error: "يجب أن تتكون كلمة المرور الجديدة من 6 خانات على الأقل",
          });
        return;
      }

      const user = req.user!;
      const isCurrentValid = db.verifyPassword(
        currentPassword,
        user.passwordHash,
        user.salt,
      );
      if (!isCurrentValid) {
        res.status(400).json({ error: "كلمة المرور الحالية غير صحيحة" });
        return;
      }

      await db.updateUserPassword(user.id, newPassword);
      // Re-issue a new session token so the user stays logged in
      const newToken = generateToken({ id: user.id, username: user.username });
      await db.addTokenToUser(user.id, newToken);

      res.json({
        success: true,
        message: "تم تغيير كلمة المرور بنجاح",
        token: newToken,
      });
    } catch (err: any) {
      res.status(500).json({ error: "فشل تغيير كلمة المرور" });
    }
  },
);

// ==========================================
// Admin CMS Endpoints (Protected)
// ==========================================

// Dashboard Stats
app.get("/api/admin/stats", requireAuth, async (_req, res) => {
  try {
    const stats = await db.getStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: "حدث خطأ أثناء جلب الإحصائيات" });
  }
});

// Categories Management
app.get("/api/admin/categories", requireAuth, async (_req, res) => {
  try {
    const categories = await db.getCategories(false);
    res.json(categories);
  } catch {
    res.status(500).json({ error: "حدث خطأ أثناء جلب الأصناف" });
  }
});

app.post("/api/admin/categories", requireAuth, async (req, res) => {
  try {
    const { name, slug, description, imageUrl, sortOrder, isActive } = req.body;
    if (!name) {
      res.status(400).json({ error: "اسم الصنف مطلوب" });
      return;
    }

    const newCategory = await db.createCategory({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      description: description || "",
      imageUrl: imageUrl || "",
      sortOrder: Number(sortOrder) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json(newCategory);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "حدث خطأ أثناء إضافة الصنف" });
  }
});

app.put("/api/admin/categories/:id", requireAuth, async (req, res) => {
  try {
    const updatedCategory = await db.updateCategory(req.params.id, req.body);
    if (!updatedCategory) {
      res.status(404).json({ error: "الصنف غير موجود" });
      return;
    }
    res.json(updatedCategory);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "حدث خطأ أثناء تحديث الصنف" });
  }
});

app.delete("/api/admin/categories/:id", requireAuth, async (req, res) => {
  try {
    const success = await db.deleteCategory(req.params.id);
    if (!success) {
      res.status(404).json({ error: "الصنف غير موجود" });
      return;
    }
    res.json({ success: true, message: "تم حذف الصنف بنجاح" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "حدث خطأ أثناء حذف الصنف" });
  }
});

// Products Management
app.get("/api/admin/products", requireAuth, async (req, res) => {
  try {
    const categoryId = req.query.categoryId as string | undefined;
    const search = req.query.search as string | undefined;
    const products = await db.getProducts(categoryId, false, search);
    res.json(products);
  } catch {
    res.status(500).json({ error: "حدث خطأ أثناء جلب المنتجات" });
  }
});

app.post("/api/admin/products", requireAuth, async (req, res) => {
  try {
    const {
      name,
      categoryId,
      shortDescription,
      fullDescription,
      features,
      usages,
      whatsappMessage,
      images,
      coverImage,
      sortOrder,
      isActive,
    } = req.body;
    if (!name) {
      res.status(400).json({ error: "اسم المنتج مطلوب" });
      return;
    }

    const newProduct = await db.createProduct({
      name,
      categoryId: categoryId || undefined,
      shortDescription: shortDescription || "",
      fullDescription: fullDescription || "",
      features: Array.isArray(features) ? features : [],
      usages: Array.isArray(usages) ? usages : [],
      whatsappMessage: whatsappMessage || "",
      images: Array.isArray(images) ? images : [],
      coverImage:
        coverImage || (images && images.length > 0 ? images[0].url : ""),
      sortOrder: Number(sortOrder) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json(newProduct);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: err.message || "حدث خطأ أثناء إضافة المنتج" });
  }
});

app.put("/api/admin/products/:id", requireAuth, async (req, res) => {
  try {
    const updatedProduct = await db.updateProduct(req.params.id, req.body);
    if (!updatedProduct) {
      res.status(404).json({ error: "المنتج غير موجود" });
      return;
    }
    res.json(updatedProduct);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: err.message || "حدث خطأ أثناء تحديث المنتج" });
  }
});

app.delete("/api/admin/products/:id", requireAuth, async (req, res) => {
  try {
    const success = await db.deleteProduct(req.params.id);
    if (!success) {
      res.status(404).json({ error: "المنتج غير موجود" });
      return;
    }
    res.json({ success: true, message: "تم حذف المنتج بنجاح" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "حدث خطأ أثناء حذف المنتج" });
  }
});

// Projects Management
app.get("/api/admin/projects", requireAuth, async (_req, res) => {
  try {
    const projects = await db.getProjects(false);
    res.json(projects);
  } catch {
    res.status(500).json({ error: "حدث خطأ أثناء جلب المشاريع" });
  }
});

app.post("/api/admin/projects", requireAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      categoryName,
      images,
      sortOrder,
      isActive,
    } = req.body;
    if (!title) {
      res.status(400).json({ error: "عنوان المشروع مطلوب" });
      return;
    }

    const newProject = await db.createProject({
      title,
      description: description || "",
      location: location || "",
      categoryName: categoryName || "",
      images: Array.isArray(images) ? images : [],
      sortOrder: Number(sortOrder) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json(newProject);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: err.message || "حدث خطأ أثناء إضافة المشروع" });
  }
});

app.put("/api/admin/projects/:id", requireAuth, async (req, res) => {
  try {
    const updatedProject = await db.updateProject(req.params.id, req.body);
    if (!updatedProject) {
      res.status(404).json({ error: "المشروع غير موجود" });
      return;
    }
    res.json(updatedProject);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: err.message || "حدث خطأ أثناء تحديث المشروع" });
  }
});

app.delete("/api/admin/projects/:id", requireAuth, async (req, res) => {
  try {
    const success = await db.deleteProject(req.params.id);
    if (!success) {
      res.status(404).json({ error: "المشروع غير موجود" });
      return;
    }
    res.json({ success: true, message: "تم حذف المشروع بنجاح" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "حدث خطأ أثناء حذف المشروع" });
  }
});

// Site Settings Management
app.get("/api/admin/settings", requireAuth, async (_req, res) => {
  try {
    const settings = await db.getSettings();
    res.json(settings);
  } catch {
    res.status(500).json({ error: "حدث خطأ أثناء جلب إعدادات الموقع" });
  }
});

app.put("/api/admin/settings", requireAuth, async (req, res) => {
  try {
    const updatedSettings = await db.updateSettings(req.body);
    res.json(updatedSettings);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: err.message || "حدث خطأ أثناء حفظ الإعدادات" });
  }
});

// Image Uploads (Multi-part and Base64) - Supports 'files', 'images', and single/multiple uploads
app.post(
  "/api/admin/upload",
  requireAuth,
  uploadMiddleware.any(),
  async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ error: "لم يتم تحديد أي ملف للرفع" });
        return;
      }

      const uploadedFiles = await Promise.all(
        files.map((file) => processUploadedFile(file)),
      );

      res.json({
        success: true,
        files: uploadedFiles,
        url: uploadedFiles[0].url,
      });
    } catch (err: any) {
      console.error("File upload error:", err);
      res.status(500).json({ error: err.message || "حدث خطأ أثناء رفع الملف" });
    }
  },
);

// Global Error Handler for Serverless
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Unhandled serverless error:", err);
    res
      .status(500)
      .json({ error: err?.message || "حدث خطأ غير متوقع في الخادم" });
  },
);

export default app;
