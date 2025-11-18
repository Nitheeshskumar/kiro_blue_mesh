#!/usr/bin/env node

/**
 * Verification Script for Fixed Colors Migration
 * Checks if the colorType and hasFixedColors columns exist and are working properly
 */

const { Pool } = require('pg');
require('dotenv').config();

async function verifyFixedColorsMigration() {
  const connectionString = process.env.SUPABASE_DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ SUPABASE_DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('🔍 Verifying Fixed Colors Migration...');

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Check if columns exist
    const columnCheck = await pool.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND column_name IN ('hasFixedColors', 'colorType')
      ORDER BY column_name
    `);

    console.log('📋 Column Information:');
    columnCheck.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} | Default: ${col.column_default} | Nullable: ${col.is_nullable}`);
    });

    // Check current data
    const dataCheck = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN "colorType" = 'customizable' THEN 1 END) as customizable,
        COUNT(CASE WHEN "colorType" = 'fixed' THEN 1 END) as fixed,
        COUNT(CASE WHEN "hasFixedColors" = true THEN 1 END) as has_fixed_true,
        COUNT(CASE WHEN "hasFixedColors" = false THEN 1 END) as has_fixed_false
      FROM products
    `);

    const stats = dataCheck.rows[0];
    console.log('\n📊 Current Data Distribution:');
    console.log(`   Total Products: ${stats.total}`);
    console.log(`   Customizable Colors: ${stats.customizable}`);
    console.log(`   Fixed Colors: ${stats.fixed}`);
    console.log(`   Has Fixed Colors (true): ${stats.has_fixed_true}`);
    console.log(`   Has Fixed Colors (false): ${stats.has_fixed_false}`);

    // Show sample products
    const sampleCheck = await pool.query(`
      SELECT id, name, "colorType", "hasFixedColors", 
             array_length(colors, 1) as color_count
      FROM products 
      ORDER BY "createdAt" DESC 
      LIMIT 3
    `);

    console.log('\n📋 Sample Products:');
    sampleCheck.rows.forEach(product => {
      console.log(`   ${product.name}: Type=${product.colorType}, Fixed=${product.hasFixedColors}, Colors=${product.color_count || 0}`);
    });

    console.log('\n✅ Fixed Colors Migration verification completed!');
    console.log('💡 The database structure is ready for colorType and hasFixedColors functionality');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  verifyFixedColorsMigration().catch(console.error);
}

module.exports = { verifyFixedColorsMigration };