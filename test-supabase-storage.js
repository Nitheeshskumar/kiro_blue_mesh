#!/usr/bin/env node

/**
 * Test Supabase Storage Configuration
 * Run this to diagnose image upload issues
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load client environment variables
const clientEnvPath = path.join(__dirname, 'client', '.env');
if (fs.existsSync(clientEnvPath)) {
  const clientEnv = fs.readFileSync(clientEnvPath, 'utf8');
  clientEnv.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && key.startsWith('VITE_')) {
      process.env[key] = value;
    }
  });
}

async function testSupabaseStorage() {
  console.log('🔍 Testing Supabase Storage Configuration...\n');

  // Check environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  console.log('📋 Environment Variables:');
  console.log(`VITE_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}\n`);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing required environment variables');
    console.log('💡 Make sure your client/.env file contains:');
    console.log('   VITE_SUPABASE_URL=https://your-project.supabase.co');
    console.log('   VITE_SUPABASE_ANON_KEY=your-anon-key');
    process.exit(1);
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test 1: Basic connectivity
    console.log('🔄 Testing basic connectivity...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Failed to connect to Supabase Storage:', bucketsError.message);
      process.exit(1);
    }

    console.log('✅ Successfully connected to Supabase Storage');
    console.log(`📦 Found ${buckets.length} storage buckets\n`);

    // Test 2: Check product-images bucket
    console.log('🔄 Checking product-images bucket...');
    const productImagesBucket = buckets.find(bucket => bucket.id === 'product-images');

    if (!productImagesBucket) {
      console.error('❌ Product images bucket not found');
      console.log('💡 Available buckets:', buckets.map(b => b.id).join(', '));
      console.log('💡 Run this command to create the bucket:');
      console.log('   node fix-storage-policies.js');
      process.exit(1);
    }

    console.log('✅ Product images bucket found');
    console.log(`   Public: ${productImagesBucket.public ? '✅ Yes' : '❌ No'}`);
    console.log(`   File size limit: ${productImagesBucket.file_size_limit ? (productImagesBucket.file_size_limit / 1024 / 1024).toFixed(1) + 'MB' : 'Not set'}`);
    console.log(`   Allowed MIME types: ${productImagesBucket.allowed_mime_types ? productImagesBucket.allowed_mime_types.join(', ') : 'Not set'}\n`);

    if (!productImagesBucket.public) {
      console.error('❌ Product images bucket is not public');
      console.log('💡 Run this command to fix bucket configuration:');
      console.log('   node fix-storage-policies.js');
      process.exit(1);
    }

    // Test 3: Check storage policies
    console.log('🔄 Testing upload permissions...');
    
    // Create a small test file
    const testFileName = `test-${Date.now()}.txt`;
    const testFile = new Blob(['test content'], { type: 'text/plain' });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(`test/${testFileName}`, testFile);

    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError.message);
      
      if (uploadError.message.includes('policy')) {
        console.log('💡 This is likely a storage policy issue. Run:');
        console.log('   node fix-storage-policies.js');
      }
      
      process.exit(1);
    }

    console.log('✅ Upload test successful');

    // Clean up test file
    const { error: deleteError } = await supabase.storage
      .from('product-images')
      .remove([uploadData.path]);

    if (deleteError) {
      console.warn('⚠️ Warning: Could not clean up test file:', deleteError.message);
    } else {
      console.log('✅ Test file cleaned up');
    }

    console.log('\n🎉 All tests passed! Your Supabase Storage is configured correctly.');
    console.log('\n📋 Configuration Summary:');
    console.log(`   Supabase URL: ${supabaseUrl}`);
    console.log(`   Bucket: product-images (public)`);
    console.log(`   File size limit: ${(productImagesBucket.file_size_limit / 1024 / 1024).toFixed(1)}MB`);
    console.log(`   Allowed types: ${productImagesBucket.allowed_mime_types.join(', ')}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.log('\n💡 Troubleshooting steps:');
    console.log('1. Check your internet connection');
    console.log('2. Verify your Supabase project is active');
    console.log('3. Check your environment variables');
    console.log('4. Run: node fix-storage-policies.js');
    process.exit(1);
  }
}

testSupabaseStorage();