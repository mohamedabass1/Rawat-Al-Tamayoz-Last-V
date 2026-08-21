import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

let supabaseInstance: SupabaseClient | null = null;

export const BUCKET_NAME = 'site-images';

export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  return Boolean(url && key && url.startsWith('http') && !url.includes('placeholder'));
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseInstance) {
    const url = process.env.SUPABASE_URL!;
    const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)!;

    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseInstance;
}

/**
 * Uploads a file buffer to the Supabase Storage public bucket ('site-images').
 * Returns the public URL of the uploaded asset.
 */
export async function uploadToSupabaseStorage(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<{ url: string; key: string }> {
  const client = getSupabase();
  if (!client) {
    throw new Error('Supabase client is not configured');
  }

  // Ensure unique clean path
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `uploads/${Date.now()}_${sanitizedName}`;

  const { data, error } = await client.storage
    .from(BUCKET_NAME)
    .upload(filePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error('Supabase storage upload error:', error);
    throw new Error(`فشل رفع الصورة إلى Supabase Storage: ${error.message}`);
  }

  const { data: publicData } = client.storage.from(BUCKET_NAME).getPublicUrl(data.path);

  return {
    url: publicData.publicUrl,
    key: data.path,
  };
}
