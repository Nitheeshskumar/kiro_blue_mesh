#!/usr/bin/env node

/**
 * Migration script to add categories column to products table
 * This allows products to belong to multiple categories
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  console.log('🔄 Starting migration: Add categories column to products table...\n');

  // Get database connection string
  const connectionString = process.env.SUPABASE_DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ Error: SUPABASE_DATABASE_URL environment variable is not set');
    console.log('Please set it in your .env file');
    process.exit(1);
  }

  // Create database connection
  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Read migration SQL file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'add-categories-column.sql'),
      'utf8'
    );

    console.log('📝 Executing migration SQL...\n');
    
    // Execute migration
    const result = await pool.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!\n');
    
    // Show notices from the migration
    if (result.rows && result.rows.length > 0) {
      console.log('Migration results:');
      result.rows.forEach(row => {
        console.log(row);
      });
    }

    // Verify the column exists
    console.log('\n🔍 Verifying migration...');
    const verifyResult = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        column_default,
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND column_name = 'categories'
    `);

    if (verifyResult.rows.length > 0) {
      console.log('✅ Column verified:');
      console.table(verifyResult.rows);
    } else {
      console.log('⚠️  Warning: Could not verify column was added');
    }

    // Check if any products have the categories array populated
    const countResult = await pool.query(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN categories IS NOT NULL AND array_length(categories, 1) > 0 THEN 1 END) as products_with_categories
      FROM products
    `);

    console.log('\n📊 Product statistics:');
    console.table(countResult.rows);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration
runMigration().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
