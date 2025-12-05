#!/usr/bin/env node

/**
 * Supabase Storage Setup Script
 * 
 * This script initializes Supabase Storage buckets for the Willowbrook Clothing application.
 * It creates the necessary storage buckets with appropriate permissions and policies.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.log('\nPlease add these to your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Storage bucket configurations
const BUCKETS = [
  {
    name: 'review-photos',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    fileSizeLimit: 10485760, // 10MB
    description: 'Customer review photos and images'
  },
  {
    name: 'product-images',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    fileSizeLimit: 10485760, // 10MB
    description: 'Product catalog images and thumbnails'
  },
  {
    name: 'user-avatars',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    fileSizeLimit: 5242880, // 5MB
    description: 'User profile avatars and pictures'
  },
  {
    name: 'customization-previews',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    fileSizeLimit: 10485760, // 10MB
    description: 'Product customization preview images'
  }
];

async function createBucket(bucketConfig) {
  const { name, public: isPublic, allowedMimeTypes, fileSizeLimit, description } = bucketConfig;
  
  try {
    console.log(`📁 Creating bucket: ${name}`);
    
    // Check if bucket already exists
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }
    
    const bucketExists = existingBuckets?.some(bucket => bucket.name === name);
    
    if (bucketExists) {
      console.log(`   ✅ Bucket '${name}' already exists`);
      return true;
    }
    
    // Create the bucket
    const { error: createError } = await supabase.storage.createBucket(name, {
      public: isPublic,
      allowedMimeTypes,
      fileSizeLimit
    });
    
    if (createError) {
      throw new Error(`Failed to create bucket: ${createError.message}`);
    }
    
    console.log(`   ✅ Created bucket '${name}' (${description})`);
    console.log(`      - Public: ${isPublic}`);
    console.log(`      - Max file size: ${(fileSizeLimit / 1024 / 1024).toFixed(1)}MB`);
    console.log(`      - Allowed types: ${allowedMimeTypes.join(', ')}`);
    
    return true;
    
  } catch (error) {
    console.error(`   ❌ Failed to create bucket '${name}': ${error.message}`);
    return false;
  }
}

async function setupStoragePolicies() {
  console.log('\n🔒 Setting up storage policies...');
  
  // Note: Supabase Storage policies are typically managed through the Supabase Dashboard
  // or via SQL. For this setup, we'll create basic policies that allow:
  // 1. Authenticated users to upload files
  // 2. Public read access to all files (since buckets are public)
  
  const policies = [
    {
      bucket: 'review-photos',
      policy: `
        -- Allow authenticated users to upload review photos
        CREATE POLICY "Authenticated users can upload review photos" ON storage.objects
        FOR INSERT WITH CHECK (
          bucket_id = 'review-photos' AND 
          auth.role() = 'authenticated'
        );
        
        -- Allow public read access to review photos
        CREATE POLICY "Public read access to review photos" ON storage.objects
        FOR SELECT USING (bucket_id = 'review-photos');
        
        -- Allow users to delete their own review photos
        CREATE POLICY "Users can delete own review photos" ON storage.objects
        FOR DELETE USING (
          bucket_id = 'review-photos' AND 
          auth.uid()::text = (storage.foldername(name))[1]
        );
      `
    }
  ];
  
  console.log('   ℹ️  Storage policies should be configured in the Supabase Dashboard');
  console.log('   📖 Visit: https://supabase.com/dashboard/project/[your-project]/storage/policies');
  console.log('   🔗 Documentation: https://supabase.com/docs/guides/storage/security/access-control');
}

async function testStorageConnection() {
  console.log('\n🧪 Testing storage connection...');
  
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      throw new Error(`Storage connection failed: ${error.message}`);
    }
    
    console.log(`   ✅ Successfully connected to Supabase Storage`);
    console.log(`   📊 Found ${data.length} buckets total`);
    
    return true;
  } catch (error) {
    console.error(`   ❌ Storage connection test failed: ${error.message}`);
    return false;
  }
}

async function displayStorageInfo() {
  console.log('\n📊 Storage Configuration Summary:');
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      throw new Error(`Failed to fetch bucket info: ${error.message}`);
    }
    
    console.log('\n   Created Buckets:');
    buckets.forEach(bucket => {
      const config = BUCKETS.find(b => b.name === bucket.name);
      if (config) {
        console.log(`   📁 ${bucket.name}`);
        console.log(`      Public: ${bucket.public ? '✅' : '❌'}`);
        console.log(`      Created: ${new Date(bucket.created_at).toLocaleDateString()}`);
        console.log(`      Purpose: ${config.description}`);
        console.log('');
      }
    });
    
    console.log('   Storage URLs:');
    console.log(`   🔗 Base URL: ${supabaseUrl}/storage/v1/object/public/`);
    console.log('   📝 Example: ${supabaseUrl}/storage/v1/object/public/review-photos/path/to/image.jpg');
    
  } catch (error) {
    console.error(`   ❌ Failed to display storage info: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Setting up Supabase Storage for Willowbrook Clothing...\n');
  
  // Test connection first
  const connectionOk = await testStorageConnection();
  if (!connectionOk) {
    console.error('\n❌ Cannot proceed without storage connection. Please check your credentials.');
    process.exit(1);
  }
  
  // Create all buckets
  console.log('\n📁 Creating storage buckets...');
  let successCount = 0;
  
  for (const bucketConfig of BUCKETS) {
    const success = await createBucket(bucketConfig);
    if (success) successCount++;
  }
  
  // Setup policies info
  await setupStoragePolicies();
  
  // Display summary
  await displayStorageInfo();
  
  // Final status
  console.log('\n' + '='.repeat(60));
  if (successCount === BUCKETS.length) {
    console.log('✅ Supabase Storage setup completed successfully!');
    console.log(`   Created/verified ${successCount}/${BUCKETS.length} buckets`);
  } else {
    console.log(`⚠️  Supabase Storage setup completed with warnings`);
    console.log(`   Created/verified ${successCount}/${BUCKETS.length} buckets`);
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Configure storage policies in Supabase Dashboard (if needed)');
  console.log('2. Update your client environment variables:');
  console.log('   - VITE_SUPABASE_URL');
  console.log('   - VITE_SUPABASE_ANON_KEY');
  console.log('3. Test file uploads using the new SupabaseUploadWidget');
  console.log('4. Run the migration script if you have existing Cloudinary data');
  
  console.log('\n🔗 Useful Links:');
  console.log(`   Dashboard: https://supabase.com/dashboard/project/${supabaseUrl.split('//')[1].split('.')[0]}`);
  console.log('   Storage Docs: https://supabase.com/docs/guides/storage');
  console.log('   Policies Guide: https://supabase.com/docs/guides/storage/security/access-control');
}

// Run setup if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  createBucket,
  testStorageConnection,
  BUCKETS
};