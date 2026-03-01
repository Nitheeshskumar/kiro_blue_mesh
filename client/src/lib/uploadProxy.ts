// Upload proxy client for ISP-blocked Supabase domains
export interface ProxyUploadResult {
  id: string;
  path: string;
  fullPath: string;
  publicUrl: string;
  size: number;
  originalFilename: string;
  bucketName: string;
  width?: number;
  height?: number;
  format?: string;
}

// Upload file through Netlify proxy
export const uploadFileViaProxy = async (
  file: File,
  bucket: string,
  path?: string,
  retries: number = 3
): Promise<ProxyUploadResult> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Upload attempt ${attempt}/${retries} for file: ${file.name}`);

      // Convert file to ArrayBuffer for transmission
      const fileBuffer = await file.arrayBuffer();
      
      // Build query parameters
      const params = new URLSearchParams({
        bucket,
        filename: file.name,
        contentType: file.type
      });

      if (path) {
        params.set('path', path);
      }

      // Upload via proxy
      const response = await fetch(`/.netlify/functions/upload-proxy?${params}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream'
        },
        body: fileBuffer
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      // Get image dimensions if it's an image
      if (file.type.startsWith('image/')) {
        try {
          const img = new Image();
          const imageLoaded = new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Image dimension loading timeout'));
            }, 5000);

            img.onload = () => {
              clearTimeout(timeout);
              result.width = img.naturalWidth;
              result.height = img.naturalHeight;
              result.format = file.name.split('.').pop()?.toLowerCase();
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
          // Continue without dimensions - not critical
        }
      }

      console.log(`✅ Upload successful for file: ${file.name}`);
      return result;

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

// Upload multiple files via proxy
export const uploadMultipleFilesViaProxy = async (
  files: File[],
  bucket: string,
  path?: string,
  onProgress?: (completed: number, total: number) => void
): Promise<ProxyUploadResult[]> => {
  const results: ProxyUploadResult[] = [];
  const errors: string[] = [];

  console.log(`Starting proxy upload of ${files.length} files to bucket: ${bucket}`);

  // Upload files sequentially to avoid overwhelming the connection
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      console.log(`Uploading file ${i + 1}/${files.length}: ${file.name}`);
      const result = await uploadFileViaProxy(file, bucket, path);
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

  console.log(`✅ Successfully uploaded ${results.length}/${files.length} files via proxy`);
  return results;
};

// Test proxy upload connectivity
export const testProxyUpload = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Testing upload proxy connectivity...');
    
    // Create a small test image (1x1 pixel PNG)
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx!.fillStyle = '#000000';
    ctx!.fillRect(0, 0, 1, 1);
    
    // Convert to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png');
    });
    
    const testFile = new File([blob], 'test.png', { type: 'image/png' });
    
    // Try to upload via proxy
    const result = await uploadFileViaProxy(testFile, 'product-images', 'test');
    
    // Clean up test file (optional - could be left for debugging)
    console.log('✅ Upload proxy test passed:', result.publicUrl);
    
    return { success: true };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Upload proxy test failed:', errorMessage);
    return { success: false, error: `Upload proxy test failed: ${errorMessage}` };
  }
};

// Validate file before upload (same as original)
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