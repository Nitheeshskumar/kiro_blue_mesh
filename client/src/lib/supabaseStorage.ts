import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket configuration
export const STORAGE_BUCKETS = {
  REVIEW_PHOTOS: 'review-photos',
  PRODUCT_IMAGES: 'product-images',
  USER_AVATARS: 'user-avatars',
  CUSTOMIZATION_PREVIEWS: 'customization-previews'
} as const;

export interface SupabaseUploadResult {
  id: string;
  path: string;
  fullPath: string;
  publicUrl: string;
  width?: number;
  height?: number;
  format?: string;
  size: number;
  originalFilename: string;
  bucketName: string;
}

// Upload file to Supabase Storage
export const uploadFile = async (
  file: File,
  bucket: string,
  path?: string
): Promise<SupabaseUploadResult> => {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    // Get image dimensions if it's an image
    let width: number | undefined;
    let height: number | undefined;
    let format: string | undefined;

    if (file.type.startsWith('image/')) {
      format = fileExt?.toLowerCase();
      
      // Create image to get dimensions
      const img = new Image();
      const imageLoaded = new Promise<void>((resolve) => {
        img.onload = () => {
          width = img.naturalWidth;
          height = img.naturalHeight;
          resolve();
        };
      });
      
      img.src = URL.createObjectURL(file);
      await imageLoaded;
      URL.revokeObjectURL(img.src);
    }

    return {
      id: data.path,
      path: data.path,
      fullPath: data.fullPath,
      publicUrl,
      width,
      height,
      format,
      size: file.size,
      originalFilename: file.name,
      bucketName: bucket
    };
  } catch (error) {
    console.error('Supabase upload error:', error);
    throw error;
  }
};

// Upload multiple files
export const uploadMultipleFiles = async (
  files: File[],
  bucket: string,
  path?: string
): Promise<SupabaseUploadResult[]> => {
  const uploadPromises = files.map(file => uploadFile(file, bucket, path));
  return Promise.all(uploadPromises);
};

// Delete file from Supabase Storage
export const deleteFile = async (bucket: string, path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
};

// Get optimized image URL with transformations
export const getOptimizedImageUrl = (
  publicUrl: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  }
): string => {
  if (!options) return publicUrl;

  const url = new URL(publicUrl);
  const params = new URLSearchParams();

  if (options.width) params.set('width', options.width.toString());
  if (options.height) params.set('height', options.height.toString());
  if (options.quality) params.set('quality', options.quality.toString());
  if (options.format) params.set('format', options.format);

  // Supabase doesn't have built-in image transformations like Cloudinary
  // For now, return the original URL. You can integrate with services like
  // ImageKit, Cloudflare Images, or implement server-side transformations
  return publicUrl;
};

// Get thumbnail URL (placeholder for future image transformation service)
export const getThumbnailUrl = (publicUrl: string, size: number = 150): string => {
  return getOptimizedImageUrl(publicUrl, { width: size, height: size });
};

// Initialize storage buckets (call this during app setup)
export const initializeStorageBuckets = async (): Promise<void> => {
  const buckets = Object.values(STORAGE_BUCKETS);
  
  for (const bucketName of buckets) {
    try {
      // Check if bucket exists
      const { data: existingBuckets } = await supabase.storage.listBuckets();
      const bucketExists = existingBuckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        // Create bucket if it doesn't exist
        const { error } = await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          fileSizeLimit: 10485760 // 10MB
        });
        
        if (error && !error.message.includes('already exists')) {
          console.error(`Failed to create bucket ${bucketName}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error initializing bucket ${bucketName}:`, error);
    }
  }
};

// Validate file before upload
export const validateFile = (file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } => {
  const maxSize = maxSizeMB * 1024 * 1024;
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (file.size > maxSize) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, WebP, and GIF images are allowed' };
  }

  return { valid: true };
};

// Specific validation for product images (7MB limit)
export const validateProductImage = (file: File): { valid: boolean; error?: string } => {
  return validateFile(file, 7);
};