import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { db } from "./server/db.js";
import {
  generateToken,
  requireAuth,
  AuthenticatedRequest,
} from "./server/auth.js";
import { uploadMiddleware, processUploadedFile } from "./server/upload.js";

dotenv.config();

const PORT = 3000;

async function startServer() {
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
        res
          .status(401)
          .json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
        return;
      }

      const isValid = db.verifyPassword(
        String(password),
        user.passwordHash,
        user.salt,
      );
      if (!isValid) {
        res
          .status(401)
          .json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
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
          res.status(400).json({
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
        const newToken = generateToken({
          id: user.id,
          username: user.username,
        });
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
  app.get("/api/admin/stats", requireAuth, async (_req, res) => {
    try {
      const stats = await db.getStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: "حدث خطأ في استرجاع الإحصائيات" });
    }
  });

  // Categories CRUD
  app.get("/api/admin/categories", requireAuth, async (_req, res) => {
    try {
      const categories = await db.getCategories(false);
      res.json(categories);
    } catch (err: any) {
      res.status(500).json({ error: "حدث خطأ أثناء جلب الأصناف" });
    }
  });

  app.post("/api/admin/categories", requireAuth, async (req, res) => {
    try {
      const { name, description, imageUrl, sortOrder, isActive, slug } =
        req.body;
      if (!name || !name.trim()) {
        res.status(400).json({ error: "يرجى إدخال اسم الصنف" });
        return;
      }
      const newCat = await db.createCategory({
        name,
        description,
        imageUrl,
        sortOrder,
        isActive,
        slug,
      });
      res.status(201).json(newCat);
    } catch (err: any) {
      res.status(500).json({ error: "فشل إنشاء الصنف" });
    }
  });

  app.put("/api/admin/categories/:id", requireAuth, async (req, res) => {
    try {
      const updated = await db.updateCategory(req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ error: "الصنف غير موجود" });
        return;
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: "فشل تحديث الصنف" });
    }
  });

  app.delete("/api/admin/categories/:id", requireAuth, async (req, res) => {
    try {
      const result = await db.deleteCategory(req.params.id);
      if (!result.success) {
        res.status(404).json({ error: "الصنف غير موجود" });
        return;
      }
      res.json({ success: true, affectedProducts: result.affectedProducts });
    } catch (err: any) {
      res.status(500).json({ error: "فشل حذف الصنف" });
    }
  });

  // Products CRUD
  app.get("/api/admin/products", requireAuth, async (req, res) => {
    try {
      const categoryId = req.query.categoryId as string | undefined;
      const search = req.query.search as string | undefined;
      const products = await db.getProducts(categoryId, false, search);
      res.json(products);
    } catch (err: any) {
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
      if (!name || !name.trim()) {
        res.status(400).json({ error: "يرجى إدخال اسم المنتج" });
        return;
      }
      const newProd = await db.createProduct({
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
      });
      res.status(201).json(newProd);
    } catch (err: any) {
      res.status(500).json({ error: "فشل إنشاء المنتج" });
    }
  });

  app.put("/api/admin/products/:id", requireAuth, async (req, res) => {
    try {
      const updated = await db.updateProduct(req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ error: "المنتج غير موجود" });
        return;
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: "فشل تحديث المنتج" });
    }
  });

  app.delete("/api/admin/products/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await db.deleteProduct(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "المنتج غير موجود" });
        return;
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: "فشل حذف المنتج" });
    }
  });

  // Projects CRUD
  app.get("/api/admin/projects", requireAuth, async (_req, res) => {
    try {
      const projects = await db.getProjects(false);
      res.json(projects);
    } catch (err: any) {
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
      if (!title || !title.trim()) {
        res.status(400).json({ error: "يرجى إدخال عنوان المشروع" });
        return;
      }
      const newProject = await db.createProject({
        title,
        description,
        location,
        categoryName,
        images,
        sortOrder,
        isActive,
      });
      res.status(201).json(newProject);
    } catch (err: any) {
      res.status(500).json({ error: "فشل إنشاء المشروع" });
    }
  });

  app.put("/api/admin/projects/:id", requireAuth, async (req, res) => {
    try {
      const updated = await db.updateProject(req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ error: "المشروع غير موجود" });
        return;
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: "فشل تحديث المشروع" });
    }
  });

  app.delete("/api/admin/projects/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await db.deleteProject(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "المشروع غير موجود" });
        return;
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: "فشل حذف المشروع" });
    }
  });

  // Settings
  app.get("/api/admin/settings", requireAuth, async (_req, res) => {
    try {
      const settings = await db.getSettings();
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ error: "فشل جلب الإعدادات" });
    }
  });

  app.put("/api/admin/settings", requireAuth, async (req, res) => {
    try {
      const updated = await db.updateSettings(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: "فشل حفظ الإعدادات" });
    }
  });

  // File Upload (Single or Multiple with Supabase Storage support)
  app.post(
    "/api/admin/upload",
    requireAuth,
    uploadMiddleware.array("files", 15),
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
          url: uploadedFiles[0].url, // For single upload convenience
        });
      } catch (err: any) {
        console.error("File upload error:", err);
        res
          .status(500)
          .json({ error: err.message || "حدث خطأ أثناء رفع الملف" });
      }
    },
  );

  // Fast Category Bootstrapper
  app.post(
    "/api/admin/seed-starter-categories",
    requireAuth,
    async (_req, res) => {
      try {
        const starterCategories = [
          {
            name: "مظلات وسواتر",
            slug: "umbrellas-screens",
            description:
              "مظلات سيارات وحدائق وسواتر خصوصية بأجود أنواع الحديد والقماش والخشب",
            sortOrder: 1,
          },
          {
            name: "برجولات وجلسات خارجية",
            slug: "pergolas-seating",
            description: "برجولات خشبية وحديدية وجلسات خارجية عصرية وفاخرة",
            sortOrder: 2,
          },
          {
            name: "بيوت شعر وخيام ملكية",
            slug: "tents-hair-houses",
            description:
              "بيوت شعر تراثية وخيام ملكية مجهزة بأعلى مواصفات العزل والأناقة",
            sortOrder: 3,
          },
          {
            name: "مظلات مسابح ومداخل",
            slug: "pool-entrance-shades",
            description:
              "مظلات تغطية مسابح ومداخل فلل وقصور بمقاومة عالية للعوامل الجوية",
            sortOrder: 4,
          },
          {
            name: "سواتر قماشية وحديدية",
            slug: "screens-partitions",
            description:
              "سواتر شرائح ومجدول وقماش بي في سي بأعلى نسب حجب الرؤية",
            sortOrder: 5,
          },
          {
            name: "هناجر ومستودعات",
            slug: "hangars-warehouses",
            description:
              "تصميم وتنفيذ هناجر ومستودعات ومظلات مشاريع بمواصفات هندسية دقيقة",
            sortOrder: 6,
          },
        ];

        const existingCats = await db.getCategories();
        const created = [];
        for (const cat of starterCategories) {
          const exists = existingCats.some((c) => c.name === cat.name);
          if (!exists) {
            const newCat = await db.createCategory({
              ...cat,
              imageUrl: "",
              isActive: true,
            });
            created.push(newCat);
          }
        }

        res.json({ success: true, count: created.length, created });
      } catch (err: any) {
        res.status(500).json({ error: "فشل إضافة التصنيفات المقترحة" });
      }
    },
  );

  // ==========================================
  // Vite Integration & Asset Serving
  // ==========================================
  const distPath = path.join(process.cwd(), "dist");
  const indexHtmlExists = fs.existsSync(path.join(distPath, "index.html"));
  const isProduction = process.env.NODE_ENV === "production" && indexHtmlExists;

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✨ Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
