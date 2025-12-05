# Cloudinary to Supabase Storage Migration Guide

This guide walks you through migrating from Cloudinary to Supabase Storage for file uploads and image management in the Willowbrook Clothing application.

## Overview

We're migrating from Cloudinary to Supabase Storage to:
- Consolidate our tech stack (already using Supabase for database)
- Reduce external dependencies and costs
- Improve integration with our existing Supabase infrastructure
- Maintain better control over file storage and access

## What's Changed

### File Storage
- **Before**: Cloudinary for image uploads and transformations
- **After**: Supabase Storage for file uploads with optional image optimization

### Database Schema
- **Before**: `review_photos` table with Cloudinary-specific fields (`publicId`, `url`, `thumbnailUrl`)
- **After**: Updated schema with Supabase Storage fields (`storagePath`, `publicUrl`, `bucketName`)

### Frontend Components
- **Before**: `CloudinaryUploadWidget` component
- **After**: `SupabaseUploadWidget` component with drag-and-drop support

### API Integration
- **Before**: Direct Cloudinary SDK integration
- **After**: Supabase Storage API with custom upload utilities

## Migration Steps

### 1. Install Dependencies

```bash
# Install Supabase client
cd client && npm install @supabase/supabase-js

# Remove Cloudinary dependencies
cd client && npm uninstall @cloudinary/react @cloudinary/url-gen cloudinary-react

# Install root dependencies
cd .. && npm install
```

### 2. Set Up Environment Variables

Update your environment files:

**Root `.env`:**
```env
# Add these if not already present
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

**Client `.env`:**
```env
# Replace Cloudinary variables with Supabase
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"

# Remove these Cloudinary variables:
# VITE_CLOUDINARY_CLOUD_NAME=...
# VITE_CLOUDINARY_UPLOAD_PRESET=...
```

### 3. Initialize Supabase Storage

Run the setup script to create storage buckets:

```bash
npm run setup-supabase-storage
```

This creates the following buckets:
- `review-photos` - Customer review images
- `product-images` - Product catalog images  
- `user-avatars` - User profile pictures
- `customization-previews` - Product customization previews

### 4. Update Database Schema

Run the migration script:

```bash
npm run migrate-to-supabase
```

This will:
- Add new Supabase Storage columns to `review_photos` table
- Make old Cloudinary columns nullable for backward compatibility
- Create necessary indexes

### 5. Test New Upload Functionality

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to a product page and try submitting a review with photos
3. Verify that images are uploaded to Supabase Storage
4. Check that images display correctly in the review gallery

### 6. Data Migration (If You Have Existing Images)

If you have existing Cloudinary images, you'll need to migrate them:

#### Option A: Manual Migration
1. Export existing review photos from your database
2. Download images from Cloudinary
3. Upload to Supabase Storage using the new upload widget
4. Update database records with new URLs

#### Option B: Automated Migration Script
Create a custom script to:
1. Fetch all existing review photos from database
2. Download images from Cloudinary URLs
3. Upload to Supabase Storage
4. Update database records

Example migration script structure:
```javascript
// migrate-images.js
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

async function migrateImages() {
  // 1. Get all review photos with Cloudinary URLs
  // 2. For each photo:
  //    - Download from Cloudinary URL
  //    - Upload to Supabase Storage
  //    - Update database record
}
```

### 7. Clean Up (After Successful Migration)

Once you've verified everything works:

1. **Remove old database columns** (optional):
   ```sql
   ALTER TABLE review_photos 
   DROP COLUMN IF EXISTS "publicId",
   DROP COLUMN IF EXISTS url,
   DROP COLUMN IF EXISTS "thumbnailUrl";
   ```

2. **Delete old files**:
   ```bash
   rm client/src/lib/cloudinary.ts
   rm client/src/components/CloudinaryUploadWidget.tsx
   ```

3. **Cancel Cloudinary subscription** if no longer needed

## New File Structure

### Storage Buckets
```
supabase-storage/
├── review-photos/          # Customer review images
│   ├── reviews/           # Organized by folder
│   └── user-uploads/      # Direct uploads
├── product-images/        # Product catalog
├── user-avatars/         # Profile pictures
└── customization-previews/ # 3D preview renders
```

### Updated Components

**New Upload Widget:**
```typescript
import { SupabaseUploadWidget } from './SupabaseUploadWidget';

<SupabaseUploadWidget
  onUpload={handlePhotoUpload}
  bucket="review-photos"
  path="reviews"
  maxFiles={5}
/>
```

**Image Display:**
```typescript
// Images are now accessed via public URLs
<img src={photo.publicUrl} alt={photo.alt} />
```

## Storage Policies

Configure these policies in your Supabase Dashboard:

### Review Photos Bucket
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'review-photos' AND 
  auth.role() = 'authenticated'
);

-- Allow public read access
CREATE POLICY "Public read" ON storage.objects
FOR SELECT USING (bucket_id = 'review-photos');
```

## Troubleshooting

### Common Issues

1. **Upload fails with "Bucket not found"**
   - Run `npm run setup-supabase-storage` to create buckets
   - Check bucket names in your code match the created buckets

2. **Images don't display**
   - Verify bucket is set to public
   - Check that `publicUrl` is correctly generated
   - Ensure storage policies allow public read access

3. **File size limits**
   - Default limit is 10MB per file
   - Adjust in bucket settings if needed
   - Add client-side validation for better UX

4. **CORS issues**
   - Supabase Storage handles CORS automatically for public buckets
   - Check that you're using the correct Supabase URL

### Debugging

Enable debug logging:
```typescript
// In your upload component
const handleUpload = async (files) => {
  console.log('Uploading files:', files);
  try {
    const results = await uploadMultipleFiles(files, 'review-photos');
    console.log('Upload results:', results);
  } catch (error) {
    console.error('Upload error:', error);
  }
};
```

## Performance Considerations

### Image Optimization
- Supabase Storage doesn't include built-in image transformations like Cloudinary
- Consider integrating with services like:
  - ImageKit
  - Cloudflare Images
  - Custom server-side image processing

### Caching
- Supabase Storage includes CDN caching
- Set appropriate cache headers for better performance
- Consider implementing client-side image caching

## Security Best Practices

1. **File Validation**
   - Always validate file types and sizes on both client and server
   - Use the built-in validation in `SupabaseUploadWidget`

2. **Access Control**
   - Use Row Level Security (RLS) policies
   - Implement proper authentication checks

3. **File Naming**
   - Use UUID-based file names to prevent conflicts
   - Avoid exposing sensitive information in file paths

## Support

If you encounter issues during migration:

1. Check the [Supabase Storage documentation](https://supabase.com/docs/guides/storage)
2. Review the migration logs for specific error messages
3. Test with a small subset of data first
4. Keep backups of your original Cloudinary data until migration is complete

## Rollback Plan

If you need to rollback to Cloudinary:

1. Keep the old Cloudinary columns in the database during migration
2. Maintain both upload widgets temporarily
3. Switch the import statements back to Cloudinary components
4. Restore Cloudinary environment variables

The migration is designed to be backward compatible during the transition period.