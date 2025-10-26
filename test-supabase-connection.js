#!/usr/bin/env node

/**
 * Supabase Connection Test Script
 * 
 * This script tests the Supabase database connection and performs basic operations
 * to verify that the migration setup is working correctly.
 */

require('dotenv').config();
const { Pool } = require('pg');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testConnection() {
  const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    log('❌ Missing SUPABASE_DATABASE_URL or DATABASE_URL environment variable', 'red');
    return false;
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  try {
    log('🔌 Testing Supabase database connection...', 'cyan');
    
    // Test basic connection
    const timeResult = await pool.query('SELECT NOW() as current_time');
    log(`✅ Connection successful! Server time: ${timeResult.rows[0].current_time}`, 'green');
    
    // Test table existence
    log('📋 Checking table structure...', 'cyan');
    const tableResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tables = tableResult.rows.map(row => row.table_name);
    log(`✅ Found ${tables.length} tables: ${tables.join(', ')}`, 'green');
    
    // Test sample data
    log('📊 Checking sample data...', 'cyan');
    
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const productCount = await pool.query('SELECT COUNT(*) FROM products');
    const categoryCount = await pool.query('SELECT COUNT(*) FROM product_categories');
    const orderCount = await pool.query('SELECT COUNT(*) FROM orders');
    
    log(`✅ Sample data loaded:`, 'green');
    log(`   - Users: ${userCount.rows[0].count}`, 'green');
    log(`   - Products: ${productCount.rows[0].count}`, 'green');
    log(`   - Categories: ${categoryCount.rows[0].count}`, 'green');
    log(`   - Orders: ${orderCount.rows[0].count}`, 'green');
    
    // Test admin user
    const adminResult = await pool.query('SELECT email, role FROM users WHERE role = $1', ['ADMIN']);
    if (adminResult.rows.length > 0) {
      log(`✅ Admin user found: ${adminResult.rows[0].email}`, 'green');
    } else {
      log('⚠️  No admin user found', 'yellow');
    }
    
    // Test product with customization options
    const productResult = await pool.query(`
      SELECT name, "customizationOptions" 
      FROM products 
      WHERE "customizationOptions" IS NOT NULL 
      LIMIT 1
    `);
    
    if (productResult.rows.length > 0) {
      const product = productResult.rows[0];
      log(`✅ Product with customization found: ${product.name}`, 'green');
      
      // Test JSON operations
      const colorCount = await pool.query(`
        SELECT jsonb_array_length("customizationOptions"->'colors') as color_count
        FROM products 
        WHERE id = 'prod-1'
      `);
      
      if (colorCount.rows.length > 0) {
        log(`✅ JSON operations working: ${colorCount.rows[0].color_count} colors available`, 'green');
      }
    }
    
    // Test array operations
    const categoryArrayResult = await pool.query(`
      SELECT name, categories 
      FROM products 
      WHERE array_length(categories, 1) > 0 
      LIMIT 1
    `);
    
    if (categoryArrayResult.rows.length > 0) {
      const product = categoryArrayResult.rows[0];
      log(`✅ Array operations working: ${product.name} has ${product.categories.length} categories`, 'green');
    }
    
    // Test foreign key relationships
    const relationResult = await pool.query(`
      SELECT o.id, u.email, COUNT(oi.id) as item_count
      FROM orders o
      JOIN users u ON o."userId" = u.id
      LEFT JOIN order_items oi ON o.id = oi."orderId"
      GROUP BY o.id, u.email
      LIMIT 1
    `);
    
    if (relationResult.rows.length > 0) {
      const order = relationResult.rows[0];
      log(`✅ Foreign key relationships working: Order ${order.id} for ${order.email} has ${order.item_count} items`, 'green');
    }
    
    log('🎉 All tests passed! Supabase database is ready for use.', 'bright');
    return true;
    
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'red');
    return false;
  } finally {
    await pool.end();
  }
}

async function main() {
  log('🧪 Supabase Database Connection Test', 'bright');
  log('===================================', 'bright');
  
  const success = await testConnection();
  
  if (success) {
    log('\\n✅ Database is ready for application use!', 'green');
    log('Next steps:', 'cyan');
    log('1. Update your application environment variables', 'cyan');
    log('2. Test your application endpoints', 'cyan');
    log('3. Run your application test suite', 'cyan');
  } else {
    log('\\n❌ Database test failed. Please check the setup.', 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testConnection };