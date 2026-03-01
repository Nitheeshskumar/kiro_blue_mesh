import { Handler, HandlerResponse } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables for upload proxy');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const handler: Handler = async (event): Promise<HandlerResponse> => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      } as Record<string, string>,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      } as Record<string, string>,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { bucket, path: uploadPath, filename, contentType } = event.queryStringParameters || {};
    
    if (!bucket || !filename || !contentType) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        } as Record<string, string>,
        body: JSON.stringify({ 
          error: 'Missing required parameters: bucket, filename, contentType' 
        })
      };
    }

    // Validate bucket name (security)
    const allowedBuckets = ['product-images', 'review-photos', 'user-avatars', 'customization-previews'];
    if (!allowedBuckets.includes(bucket)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        } as Record<string, string>,
        body: JSON.stringify({ error: 'Invalid bucket name' })
      };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(contentType)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        } as Record<string, string>,
        body: JSON.stringify({ error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' })
      };
    }

    // Get file data from request body
    let fileBuffer: Buffer;
    
    if (event.isBase64Encoded) {
      fileBuffer = Buffer.from(event.body!, 'base64');
    } else {
      // Handle raw binary data
      fileBuffer = Buffer.from(event.body!, 'binary');
    }

    // Validate file size (7MB limit)
    const maxSize = 7 * 1024 * 1024;
    if (fileBuffer.length > maxSize) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        } as Record<string, string>,
        body: JSON.stringify({ error: 'File size must be less than 7MB' })
      };
    }

    // Generate unique filename
    const fileExt = filename.split('.').pop();
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = uploadPath ? `${uploadPath}/${uniqueFileName}` : uniqueFileName;

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: contentType,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        } as Record<string, string>,
        body: JSON.stringify({ error: `Upload failed: ${error.message}` })
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    const result = {
      id: data.path,
      path: data.path,
      fullPath: data.fullPath,
      publicUrl,
      size: fileBuffer.length,
      originalFilename: filename,
      bucketName: bucket
    };

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      } as Record<string, string>,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Upload proxy error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      } as Record<string, string>,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};