#!/usr/bin/env node

/**
 * Migration Script: Cloudinary to Supabase Storage
 * 
 * This script helps migrate from Cloudinary to Supabase Storage by:
 * 1. Setting up Supabase Storage buckets
 * 2. Updating database schema
 * 3. Providing guidance for data migration
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Storage bucket configuration
const STORAGE_BUCKETS = [
  {
    name: 'review-photos',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    fileSizeLimit: 10485760 // 10MB
  },
  {
    name: 'product-images',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    fileSizeLimit: 10485760 // 10MB
  },
  {
    name: 'user-avatars',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    fileSizeLimit: 5242880 // 5MB
  },
  {
    name: 'customization-previews',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    fileSizeLimit: 10485760 // 10MB
  }
];

async function createStorageBuckets() {
  console.log('🪣 Creating Supabase Storage buckets...');
  
  for (const bucketConfig of STORAGE_BUCKETS) {
    try {
      // Check if bucket exists
      const { data: existingBuckets } = await supabase.storage.listBuckets();
      const bucketExists = existingBuckets?.some(bucket => bucket.name === bucketConfig.name);
      
      if (bucketExists) {
        console.log(`   ✅ Bucket '${bucketConfig.name}' already exists`);
        continue;
      }

      // Create bucket
      const { error } = await supabase.storage.createBucket(bucketConfig.name, {
        public: bucketConfig.public,
        allowedMimeTypes: bucketConfig.allowedMimeTypes,
        fileSizeLimit: bucketConfig.fileSizeLimit
      });
      
      if (error) {
        console.error(`   ❌ Failed to create bucket '${bucketConfig.name}':`, error.message);
      } else {
        console.log(`   ✅ Created bucket '${bucketConfig.name}'`);
      }
    } catch (error) {
      console.error(`   ❌ Error creating bucket '${bucketConfig.name}':`, error.message);
    }
  }
}

async function updateDatabaseSchema() {
  console.log('🗄️  Updating database schema...');
  
  try {
    // Update review_photos table structure
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add new columns for Supabase Storage
        ALTER TABLE review_photos 
        ADD COLUMN IF NOT EXISTS "storagePath" VARCHAR(255),
        ADD COLUMN IF NOT EXISTS "publicUrl" VARCHAR(500),
        ADD COLUMN IF NOT EXISTS "fileSize" INTEGER,
        ADD COLUMN IF NOT EXISTS "bucketName" VARCHAR(100) DEFAULT 'review-photos';
        
        -- Make old Cloudinary columns nullable for migration
        ALTER TABLE review_photos 
        ALTER COLUMN "publicId" DROP NOT NULL,
        ALTER COLUMN url DROP NOT NULL,
        ALTER COLUMN "thumbnailUrl" DROP NOT NULL,
        ALTER COLUMN width DROP NOT NULL,
        ALTER COLUMN height DROP NOT NULL,
        ALTER COLUMN format DROP NOT NULL,
        ALTER COLUMN bytes DROP NOT NULL;
        
        -- Add indexes for new columns
        CREATE INDEX IF NOT EXISTS idx_review_photos_storage_path ON review_photos("storagePath");
        CREATE INDEX IF NOT EXISTS idx_review_photos_bucket ON review_photos("bucketName");
      `
    });
    
    if (error) {
      console.error('   ❌ Failed to update database schema:', error.message);
    } else {
      console.log('   ✅ Database schema updated successfully');
    }
  } catch (error) {
    console.error('   ❌ Error updating database schema:', error.message);
  }
}

async function checkEnvironmentSetup() {
  console.log('🔧 Checking environment setup...');
  
  // Check client environment file
  const clientEnvPath = path.join(__dirname, 'client', '.env');
  const clientEnvExamplePath = path.join(__dirname, 'client', '.env.example');
  
  if (fs.existsSync(clientEnvPath)) {
    const envContent = fs.readFileSync(clientEnvPath, 'utf8');
    
    if (!envContent.includes('VITE_SUPABASE_URL')) {
      console.log('   ⚠️  Adding Supabase environment variables to client/.env');
      
      const supabaseEnvVars = `
# Supabase Configuration (for file storage)
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key'}
`;
      
      fs.appendFileSync(clientEnvPath, supabaseEnvVars);
      console.log('   ✅ Supabase environment variables added');
    } else {
      console.log('   ✅ Supabase environment variables already configured');
    }
  } else {
    console.log('   ⚠️  Client .env file not found. Please create one based on .env.example');
  }
}

function printMigrationInstructions() {
  console.log('\n📋 Migration Instructions:');
  console.log('');
  console.log('1. Install Supabase client dependency:');
  console.log('   cd client && npm install @supabase/supabase-js');
  console.log('');
  console.log('2. Remove Cloudinary dependencies:');
  console.log('   cd client && npm uninstall @cloudinary/react @cloudinary/url-gen cloudinary-react');
  console.log('');
  console.log('3. Update your client environment variables:');
  console.log('   - Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to client/.env');
  console.log('   - Remove VITE_CLOUDINARY_* variables');
  console.log('');
  console.log('4. Data Migration (if you have existing Cloudinary images):');
  console.log('   - Export existing review photos from your database');
  console.log('   - Download images from Cloudinary');
  console.log('   - Upload images to Supabase Storage using the new upload widget');
  console.log('   - Update database records with new Supabase Storage URLs');
  console.log('');
  console.log('5. Test the new upload functionality:');
  console.log('   - Try uploading new review photos');
  console.log('   - Verify images are stored in Supabase Storage');
  console.log('   - Check that images display correctly in the UI');
  console.log('');
  console.log('6. Clean up (after successful migration):');
  console.log('   - Remove old Cloudinary columns from review_photos table');
  console.log('   - Delete unused Cloudinary configuration files');
  console.log('   - Cancel Cloudinary subscription if no longer needed');
}

async function main() {
  console.log('🚀 Starting Cloudinary to Supabase Storage migration...\n');
  
  try {
    await createStorageBuckets();
    console.log('');
    
    await updateDatabaseSchema();
    console.log('');
    
    await checkEnvironmentSetup();
    console.log('');
    
    printMigrationInstructions();
    
    console.log('\n✅ Migration setup completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: npm install (to install new dependencies)');
    console.log('2. Update your client/.env with Supabase credentials');
    console.log('3. Test the new upload functionality');
    console.log('4. Migrate existing image data if needed');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  main();
}

module.exports = {
  createStorageBuckets,
  updateDatabaseSchema,
  checkEnvironmentSetup,
  STORAGE_BUCKETS
};