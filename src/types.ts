export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  isCover: boolean;
  sortOrder: number;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  usages: string[];
  whatsappMessage?: string;
  images: ProductImage[];
  coverImage?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  location?: string;
  categoryName?: string;
  images: string[];
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface WhyUsItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  twitter?: string;
  snapchat?: string;
  facebook?: string;
}

export interface SiteSettings {
  companyName: string;
  tagline?: string;
  companyTagline?: string;
  companyBio: string;
  logoUrl: string;
  whatsappNumber: string;
  phoneNumber: string;
  email: string;
  address: string;
  socialLinks?: SocialLinks;
  instagramUrl?: string;
  tiktokUrl?: string;
  twitterUrl?: string;
  snapchatUrl?: string;
  facebookUrl?: string;
  defaultWhatsappMessage: string;
  whyUsItems: WhyUsItem[];
  aboutStory: string;
  heroHeadline?: string;
  heroSubheadline?: string;
}

export interface DashboardStats {
  totalCategories: number;
  totalProducts: number;
  activeProducts: number;
  totalImages: number;
  totalProjects: number;
  recentProducts: Product[];
  recentCategories: Category[];
}

export interface AdminUser {
  id: string;
  username: string;
}

export type ThemeMode = 'light' | 'dark';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}
