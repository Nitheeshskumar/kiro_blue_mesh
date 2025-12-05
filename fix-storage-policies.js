#!/usr/bin/env node

/**
 * Fix Supabase Storage Policies
 * Run this to enable uploads to the product-images bucket
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function fixStoragePolicies() {
  const connectionString = process.env.SUPABASE_DATABASE_URL;

  if (!connectionString) {
    console.error('❌ Error: SUPABASE_DATABASE_URL not found in environment variables');
    console.log('Please ensure your .env file contains the SUPABASE_DATABASE_URL');
    process.exit(1);
  }

  console.log('🔄 Connecting to Supabase database...');

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to database successfully\n');

    // Read SQL file
    const sqlPath = path.join(__dirname, 'fix-supabase-storage-policies.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🔄 Fixing storage policies...\n');

    // Execute SQL
    const result = await pool.query(sql);

    console.log('\n✅ Storage policies fixed successfully!');
    console.log('\n📋 You can now upload images to the product-images bucket.');
    
  } catch (error) {
    console.error('❌ Failed to fix storage policies:', error.message);
    if (error.detail) {
      console.error('Details:', error.detail);
    }
    console.log('\n💡 Alternative: You can run this SQL directly in Supabase SQL Editor:');
    console.log('   1. Go to your Supabase project dashboard');
    console.log('   2. Click on "SQL Editor" in the left sidebar');
    console.log('   3. Copy and paste the contents of fix-supabase-storage-policies.sql');
    console.log('   4. Click "Run"');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixStoragePolicies();
