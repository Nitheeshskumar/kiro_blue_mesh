#!/usr/bin/env node

/**
 * Fixed Colors Migration Script
 * Adds colorType and hasFixedColors columns to the products table
 * 
 * This script fixes the TypeScript error by adding the missing database columns
 * that are referenced in the products API routes.
 */

const { Pool } = require('pg');
require('dotenv').config();

async function runFixedColorsMigration() {
  const connectionString = process.env.SUPABASE_DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ SUPABASE_DATABASE_URL environment variable is not set');
    console.log('Please check your .env file and ensure SUPABASE_DATABASE_URL is configured');
    process.exit(1);
  }

  console.log('🚀 Starting Fixed Colors Migration...');
  console.log('📍 Database:', connectionString.replace(/:[^:@]*@/, ':****@'));

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Test connection
    console.log('🔌 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');

    // Check if columns already exist
    console.log('🔍 Checking existing table structure...');
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND column_name IN ('hasFixedColors', 'colorType')
    `);

    const existingColumns = columnCheck.rows.map(row => row.column_name);
    console.log('📋 Existing columns:', existingColumns);

    // Add missing columns
    if (!existingColumns.includes('hasFixedColors')) {
      console.log('➕ Adding hasFixedColors column...');
      await pool.query(`
        ALTER TABLE products 
        ADD COLUMN "hasFixedColors" BOOLEAN DEFAULT false
      `);
      console.log('✅ hasFixedColors column added');
    } else {
      console.log('ℹ️  hasFixedColors column already exists');
    }

    if (!existingColumns.includes('colorType')) {
      console.log('➕ Adding colorType column...');
      await pool.query(`
        ALTER TABLE products 
        ADD COLUMN "colorType" VARCHAR(20) DEFAULT 'customizable' 
        CHECK ("colorType" IN ('customizable', 'fixed'))
      `);
      console.log('✅ colorType column added');
    } else {
      console.log('ℹ️  colorType column already exists');
    }

    // Add column comments
    console.log('📝 Adding column documentation...');
    await pool.query(`
      COMMENT ON COLUMN products."hasFixedColors" IS 'True if product colors are fixed to the design/image and not customizable'
    `);
    await pool.query(`
      COMMENT ON COLUMN products."colorType" IS 'Type of color options: customizable (user can choose colors) or fixed (colors are part of the design)'
    `);

    // Update existing products to have default values
    console.log('🔄 Updating existing products with default values...');
    const updateResult = await pool.query(`
      UPDATE products 
      SET "hasFixedColors" = COALESCE("hasFixedColors", false),
          "colorType" = COALESCE("colorType", 'customizable')
      WHERE "hasFixedColors" IS NULL OR "colorType" IS NULL
    `);
    console.log(`✅ Updated ${updateResult.rowCount} products with default values`);

    // Create indexes for better performance
    console.log('🔍 Creating performance indexes...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_products_color_type ON products("colorType")
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_products_has_fixed_colors ON products("hasFixedColors")
    `);
    console.log('✅ Performance indexes created');

    // Verify the migration
    console.log('🔍 Verifying migration results...');
    const verifyResult = await pool.query(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN "colorType" = 'customizable' THEN 1 END) as customizable_products,
        COUNT(CASE WHEN "colorType" = 'fixed' THEN 1 END) as fixed_products,
        COUNT(CASE WHEN "hasFixedColors" = true THEN 1 END) as has_fixed_colors_true,
        COUNT(CASE WHEN "hasFixedColors" = false THEN 1 END) as has_fixed_colors_false
      FROM products
    `);

    const stats = verifyResult.rows[0];
    console.log('📊 Migration Results:');
    console.log(`   Total Products: ${stats.total_products}`);
    console.log(`   Customizable: ${stats.customizable_products}`);
    console.log(`   Fixed Colors: ${stats.fixed_products}`);
    console.log(`   Has Fixed Colors (true): ${stats.has_fixed_colors_true}`);
    console.log(`   Has Fixed Colors (false): ${stats.has_fixed_colors_false}`);

    // Show sample of updated products
    console.log('📋 Sample of products after migration:');
    const sampleResult = await pool.query(`
      SELECT id, name, "colorType", "hasFixedColors", 
             array_length(colors, 1) as color_count
      FROM products 
      ORDER BY "createdAt" DESC 
      LIMIT 5
    `);

    sampleResult.rows.forEach(product => {
      console.log(`   ${product.id}: ${product.name} | Type: ${product.colorType} | Fixed: ${product.hasFixedColors} | Colors: ${product.color_count || 0}`);
    });

    console.log('\n🎉 Fixed Colors Migration completed successfully!');
    console.log('✅ The TypeScript error should now be resolved');
    console.log('💡 You can now use colorType and hasFixedColors in your products API');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the migration
if (require.main === module) {
  runFixedColorsMigration().catch(console.error);
}

module.exports = { runFixedColorsMigration };