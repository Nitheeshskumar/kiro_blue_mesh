# Supabase Storage Setup Guide

## ✅ What Was Fixed

The "row-level security policy" error has been resolved by adding proper storage policies.

---

## 🔧 What the Fix Did

### 1. **Created/Updated the `product-images` Bucket**
- Set as public (images accessible via URL)
- 10MB file size limit
- Allowed types: JPEG, JPG, PNG, WebP, GIF

### 2. **Added Storage Policies**
- ✅ Anyone can upload product images
- ✅ Anyone can view product images
- ✅ Anyone can update product images
- ✅ Anyone can delete product images

---

## 📋 Verify the Setup

### Option 1: Via Supabase Dashboard

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on **Storage** in the left sidebar
3. You should see a bucket named `product-images`
4. Click on it to verify it exists

### Option 2: Test Upload

1. Go to your admin panel: `/admin/products`
2. Click "Add New Product"
3. Try uploading an image
4. Should work without errors now!

---

## 🚨 If Upload Still Fails

### Check 1: Bucket Exists

Run this in Supabase SQL Editor:

```sql
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'product-images';
```

**Expected result:** One row showing the bucket

**If empty:** The bucket doesn't exist. Create it manually:

1. Go to Storage in Supabase Dashboard
2. Click "New bucket"
3. Name: `product-images`
4. Public: ✅ Yes
5. File size limit: 10MB
6. Allowed MIME types: `image/jpeg, image/jpg, image/png, image/webp, image/gif`

### Check 2: Policies Exist

Run this in Supabase SQL Editor:

```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%product images%';
```

**Expected result:** 4 policies (INSERT, SELECT, UPDATE, DELETE)

**If empty:** Run the fix script again:
```bash
node fix-storage-policies.js
```

### Check 3: Environment Variables

Verify your `.env` file has:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

And `client/.env` has:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🔐 Security Notes

### Current Setup (Development-Friendly)

The current policies allow **anyone** to upload/view/delete images. This is fine for:
- ✅ Development
- ✅ Small teams
- ✅ Trusted environments

### Production Recommendations

For production, you should restrict uploads to authenticated admins:

```sql
-- Replace the upload policy with this:
DROP POLICY "Anyone can upload product images" ON storage.objects;

CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid()::text 
    AND role = 'ADMIN'
  )
);
```

---

## 📁 Storage Structure

Your images will be stored at:

```
product-images/
└── products/
    ├── 1762615214059-2zlw80anusx.png
    ├── 1762615214060-abc123def.jpg
    └── ...
```

**Public URL format:**
```
https://[project-id].supabase.co/storage/v1/object/public/product-images/products/[filename]
```

---

## 🎯 How It Works

### Upload Flow:

1. **User selects image** in AddProduct page
2. **SupabaseUploadWidget** handles the upload
3. **Supabase Storage** stores the file
4. **Public URL** is returned
5. **URL saved** in product database

### Storage Policies Check:

```
User uploads → Supabase checks policies → Allowed? → Store file
                                       ↓
                                    Denied? → Error
```

---

## 🐛 Troubleshooting

### Error: "new row violates row-level security policy"

**Cause:** Storage policies not set up correctly

**Fix:** Run `node fix-storage-policies.js`

### Error: "Bucket not found"

**Cause:** The `product-images` bucket doesn't exist

**Fix:** 
1. Go to Supabase Dashboard → Storage
2. Create bucket named `product-images`
3. Set as public
4. Run fix script again

### Error: "Invalid API key"

**Cause:** Wrong Supabase credentials

**Fix:** 
1. Check `.env` and `client/.env`
2. Get correct keys from Supabase Dashboard → Settings → API
3. Restart dev server

### Error: "File too large"

**Cause:** File exceeds 10MB limit

**Fix:** 
- Compress the image
- Or increase limit in bucket settings

---

## ✅ Success Checklist

- [ ] Ran `node fix-storage-policies.js` successfully
- [ ] Bucket `product-images` exists in Supabase Dashboard
- [ ] Bucket is set to public
- [ ] Environment variables are correct
- [ ] Dev server restarted after changes
- [ ] Test upload works in AddProduct page

---

## 🎉 You're All Set!

Your Supabase Storage is now configured for product image uploads. You can:

- ✅ Upload images in AddProduct page
- ✅ Upload images in EditProduct page
- ✅ Images are publicly accessible
- ✅ Images stored securely in Supabase

Happy uploading! 🚀
