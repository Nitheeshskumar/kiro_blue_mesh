import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase Environment Variables Check:');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
  console.error('Available env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));

  // In development, provide more helpful error message
  const isDev = import.meta.env.DEV;
  const errorMessage = isDev 
    ? `Missing Supabase environment variables. Please check your client/.env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly.`
    : `Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Netlify environment variables.`;
  
  throw new Error(errorMessage);
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

// Upload file to Supabase Storage with retry logic
export const uploadFile = async (
  file: File,
  bucket: string,
  path?: string,
  retries: number = 3
): Promise<SupabaseUploadResult> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = path ? `${path}/${fileName}` : fileName;

      console.log(`Upload attempt ${attempt}/${retries} for file: ${file.name}`);

      // Upload file with timeout
      const uploadPromise = supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      // Add timeout to prevent hanging uploads
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000);
      });

      const { data, error } = await Promise.race([uploadPromise, timeoutPromise]) as any;

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      if (!data || !data.path) {
        throw new Error('Upload succeeded but no file path returned');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      if (!publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
      }

      // Get image dimensions if it's an image (with error handling)
      let width: number | undefined;
      let height: number | undefined;
      let format: string | undefined;

      if (file.type.startsWith('image/')) {
        format = fileExt?.toLowerCase();

        try {
          // Create image to get dimensions with timeout
          const img = new Image();
          const imageLoaded = new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Image dimension loading timeout'));
            }, 5000);

            img.onload = () => {
              clearTimeout(timeout);
              width = img.naturalWidth;
              height = img.naturalHeight;
              resolve();
            };

            img.onerror = () => {
              clearTimeout(timeout);
              reject(new Error('Failed to load image for dimensions'));
            };
          });

          img.src = URL.createObjectURL(file);
          await imageLoaded;
          URL.revokeObjectURL(img.src);
        } catch (dimensionError) {
          console.warn('Failed to get image dimensions:', dimensionError);
          // Continue without dimensions - not critical for upload success
        }
      }

      console.log(`✅ Upload successful for file: ${file.name}`);

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
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Upload attempt ${attempt}/${retries} failed:`, lastError.message);
      
      if (attempt < retries) {
        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error('All upload attempts failed for file:', file.name);
  throw lastError;
};

// Upload multiple files with better error handling and progress tracking
export const uploadMultipleFiles = async (
  files: File[],
  bucket: string,
  path?: string,
  onProgress?: (completed: number, total: number) => void
): Promise<SupabaseUploadResult[]> => {
  const results: SupabaseUploadResult[] = [];
  const errors: string[] = [];

  console.log(`Starting upload of ${files.length} files to bucket: ${bucket}`);

  // Upload files sequentially to avoid overwhelming the connection
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      console.log(`Uploading file ${i + 1}/${files.length}: ${file.name}`);
      const result = await uploadFile(file, bucket, path);
      results.push(result);
      onProgress?.(i + 1, files.length);
    } catch (error) {
      const errorMessage = `Failed to upload ${file.name}: ${error instanceof Error ? error.message : String(error)}`;
      console.error(errorMessage);
      errors.push(errorMessage);
    }
  }

  if (errors.length > 0) {
    if (results.length === 0) {
      // All uploads failed
      throw new Error(`All uploads failed: ${errors.join(', ')}`);
    } else {
      // Some uploads succeeded, some failed
      console.warn(`${errors.length} uploads failed:`, errors);
      // Return successful uploads, let the UI handle partial success
    }
  }

  console.log(`✅ Successfully uploaded ${results.length}/${files.length} files`);
  return results;
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

// Test Supabase Storage connectivity and configuration
export const testStorageConnection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Testing Supabase Storage connection...');
    
    // Test 1: Check if we can list buckets (basic connectivity)
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      return { success: false, error: `Failed to connect to Supabase Storage: ${bucketsError.message}` };
    }

    // Test 2: Check if product-images bucket exists
    const productImagesBucket = buckets?.find(bucket => bucket.id === STORAGE_BUCKETS.PRODUCT_IMAGES);
    
    if (!productImagesBucket) {
      return { 
        success: false, 
        error: `Product images bucket '${STORAGE_BUCKETS.PRODUCT_IMAGES}' not found. Please run the storage setup script.` 
      };
    }

    // Test 3: Check if bucket is public
    if (!productImagesBucket.public) {
      return { 
        success: false, 
        error: `Product images bucket is not public. Please check bucket configuration.` 
      };
    }

    console.log('✅ Supabase Storage connection test passed');
    return { success: true };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Storage connection test failed:', errorMessage);
    return { success: false, error: `Storage connection test failed: ${errorMessage}` };
  }
};

// Initialize storage buckets (call this during app setup)
export const initializeStorageBuckets = async (): Promise<void> => {
  try {
    console.log('Initializing Supabase Storage...');
    console.log('Available buckets:', Object.values(STORAGE_BUCKETS));
    
    // Test storage connection
    const testResult = await testStorageConnection();
    if (!testResult.success) {
      console.warn('⚠️ Storage initialization warning:', testResult.error);
    }
    
  } catch (error) {
    console.warn('Supabase Storage initialization warning:', error);
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