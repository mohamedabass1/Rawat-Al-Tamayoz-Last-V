import type {
  Category,
  Product,
  Project,
  SiteSettings,
  DashboardStats,
} from "../types";
import { optimizeImageForUpload } from "./imageOptimizer";

const TOKEN_KEY = "rawat_admin_token";

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // If not FormData, default to application/json
  if (
    !(options.body instanceof FormData) &&
    !headers["Content-Type"] &&
    options.body
  ) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = "حدث خطأ في الاتصال بالخادم";
    try {
      const data = await response.json();
      if (data.error) errorMsg = data.error;
    } catch {
      errorMsg = `خطأ ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Public Data
  getPublicData: () =>
    request<{
      settings: SiteSettings;
      categories: Category[];
      products: Product[];
      projects: Project[];
    }>("/api/public/data"),
  getPublicCategories: () => request<Category[]>("/api/public/categories"),
  getCategories: () => request<Category[]>("/api/public/categories"),
  getPublicProducts: (categoryId?: string, search?: string) => {
    const params = new URLSearchParams();
    if (categoryId) params.append("categoryId", categoryId);
    if (search) params.append("search", search);
    return request<Product[]>(`/api/public/products?${params.toString()}`);
  },
  getProducts: (categoryId?: string, search?: string) => {
    const params = new URLSearchParams();
    if (categoryId) params.append("categoryId", categoryId);
    if (search) params.append("search", search);
    return request<Product[]>(`/api/public/products?${params.toString()}`);
  },
  getPublicProduct: (id: string) =>
    request<Product>(`/api/public/products/${id}`),
  getProduct: (id: string) => request<Product>(`/api/public/products/${id}`),
  getPublicProjects: () => request<Project[]>("/api/public/projects"),
  getProjects: () => request<Project[]>("/api/public/projects"),
  getPublicSettings: () => request<SiteSettings>("/api/public/settings"),
  getSettings: () => request<SiteSettings>("/api/public/settings"),

  // Auth
  login: (username: string, password: string) =>
    request<{ token: string; user: { id: string; username: string } }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ username, password }),
      },
    ),
  logout: () =>
    request<{ success: boolean }>("/api/auth/logout", { method: "POST" }),
  getMe: () =>
    request<{ user: { id: string; username: string } }>("/api/auth/me"),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ success: boolean; message: string; token: string }>(
      "/api/auth/change-password",
      {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      },
    ),

  // Admin Stats
  getStats: () => request<DashboardStats>("/api/admin/stats"),

  // Admin Categories
  getAdminCategories: () => request<Category[]>("/api/admin/categories"),
  createCategory: (data: Partial<Category>) =>
    request<Category>("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCategory: (id: string, data: Partial<Category>) =>
    request<Category>(`/api/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: string) =>
    request<{ success: boolean; affectedProducts: number }>(
      `/api/admin/categories/${id}`,
      {
        method: "DELETE",
      },
    ),

  // Admin Products
  getAdminProducts: (categoryId?: string, search?: string) => {
    const params = new URLSearchParams();
    if (categoryId) params.append("categoryId", categoryId);
    if (search) params.append("search", search);
    return request<Product[]>(`/api/admin/products?${params.toString()}`);
  },
  createProduct: (data: Partial<Product>) =>
    request<Product>("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProduct: (id: string, data: Partial<Product>) =>
    request<Product>(`/api/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteProduct: (id: string) =>
    request<{ success: boolean }>(`/api/admin/products/${id}`, {
      method: "DELETE",
    }),

  // Admin Projects
  getAdminProjects: () => request<Project[]>("/api/admin/projects"),
  createProject: (data: Partial<Project>) =>
    request<Project>("/api/admin/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProject: (id: string, data: Partial<Project>) =>
    request<Project>(`/api/admin/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteProject: (id: string) =>
    request<{ success: boolean }>(`/api/admin/projects/${id}`, {
      method: "DELETE",
    }),

  // Admin Settings
  getAdminSettings: () => request<SiteSettings>("/api/admin/settings"),
  updateSettings: (data: Partial<SiteSettings>) =>
    request<SiteSettings>("/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  updateAdminSettings: (data: Partial<SiteSettings>) =>
    request<SiteSettings>("/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Upload (with automatic mobile optimization & compression)
  uploadFiles: async (files: File[]): Promise<string[]> => {
    // Concurrently optimize images for mobile bandwidth and standard formats
    const processedFiles = await Promise.all(
      files.map((f) => optimizeImageForUpload(f)),
    );

    const formData = new FormData();
    processedFiles.forEach((file) => {
      formData.append("files", file);
    });
    const res = await request<{
      success: boolean;
      files: Array<{ url: string }>;
    }>("/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    return res.files.map((f) => f.url);
  },

  // Starter Categories Bootstrapper
  seedStarterCategories: () =>
    request<{ success: boolean; count: number }>(
      "/api/admin/seed-starter-categories",
      {
        method: "POST",
      },
    ),
};
