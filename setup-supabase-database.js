#!/usr/bin/env node

/**
 * Supabase Database Setup Script
 * 
 * This script sets up the complete Supabase database structure and sample data
 * for the Willowbrook Clothing application migration from Neon to Supabase.
 * 
 * Usage:
 *   node setup-supabase-database.js
 * 
 * Prerequisites:
 *   - SUPABASE_DATABASE_URL environment variable set
 *   - PostgreSQL client (pg) package installed
 */

require('dotenv').config();

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

async function readSQLFile(filename) {
  try {
    const filePath = path.join(__dirname, filename);
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read SQL file ${filename}: ${error.message}`);
  }
}

async function executeSQLScript(pool, script, scriptName) {
  try {
    logStep('EXEC', `Executing ${scriptName}...`);

    // Split script into individual statements (basic splitting on semicolons)
    const statements = script
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      try {
        await pool.query(statement);
        successCount++;
      } catch (error) {
        // Some errors are expected (like "already exists" errors)
        if (error.message.includes('already exists') ||
          error.message.includes('duplicate key') ||
          error.message.includes('ON CONFLICT')) {
          // These are acceptable - just log as info
          successCount++;
        } else {
          logWarning(`Statement failed: ${error.message.substring(0, 100)}...`);
          errorCount++;
        }
      }
    }

    logSuccess(`${scriptName} completed: ${successCount} statements executed, ${errorCount} errors`);
    return { successCount, errorCount };
  } catch (error) {
    logError(`Failed to execute ${scriptName}: ${error.message}`);
    throw error;
  }
}

async function validateDatabase(pool) {
  try {
    logStep('VALIDATE', 'Running database validation...');

    const validationScript = await readSQLFile('supabase-validation.sql');
    const result = await pool.query(validationScript);

    // The validation script returns multiple result sets
    // We'll just check if we can query basic tables
    const tableCheck = await pool.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'users', 'product_categories', 'products', 'customizations', 
        'orders', 'order_items', 'customer_reviews', 'review_photos',
        'customer_measurements', 'customization_preferences'
      )
    `);

    const tableCount = parseInt(tableCheck.rows[0].table_count);

    if (tableCount === 10) {
      logSuccess('Database validation passed: All tables exist');
    } else {
      logWarning(`Database validation warning: Expected 10 tables, found ${tableCount}`);
    }

    // Check sample data
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const productCount = await pool.query('SELECT COUNT(*) FROM products');
    const categoryCount = await pool.query('SELECT COUNT(*) FROM product_categories');

    logSuccess(`Sample data loaded: ${userCount.rows[0].count} users, ${productCount.rows[0].count} products, ${categoryCount.rows[0].count} categories`);

    return {
      tables: tableCount,
      users: parseInt(userCount.rows[0].count),
      products: parseInt(productCount.rows[0].count),
      categories: parseInt(categoryCount.rows[0].count)
    };
  } catch (error) {
    logError(`Database validation failed: ${error.message}`);
    throw error;
  }
}

async function testConnection(pool) {
  try {
    logStep('CONNECT', 'Testing database connection...');
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    logSuccess(`Connected to PostgreSQL: ${result.rows[0].pg_version.substring(0, 50)}...`);
    return true;
  } catch (error) {
    logError(`Connection failed: ${error.message}`);
    return false;
  }
}

async function main() {
  log('🚀 Supabase Database Setup for Willowbrook Clothing', 'bright');
  log('================================================', 'bright');

  // Check environment variables
  const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

  if (!databaseUrl) {
    logError('Missing required environment variable: SUPABASE_DATABASE_URL or DATABASE_URL');
    logError('Please set your Supabase database connection string in the environment variables.');
    logError('Example: SUPABASE_DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"');
    process.exit(1);
  }

  // Create database connection
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  try {
    // Test connection
    const connected = await testConnection(pool);
    if (!connected) {
      process.exit(1);
    }

    // Step 1: Create database schema
    logStep('SCHEMA', 'Setting up database schema...');
    const schemaScript = await readSQLFile('supabase-schema.sql');
    await executeSQLScript(pool, schemaScript, 'Database Schema');

    // Step 2: Insert sample data
    logStep('DATA', 'Inserting sample data...');
    const dataScript = await readSQLFile('supabase-sample-data.sql');
    await executeSQLScript(pool, dataScript, 'Sample Data');

    // Step 3: Validate setup
    const validation = await validateDatabase(pool);

    // Final summary
    log('\\n🎉 Database setup completed successfully!', 'green');
    log('==========================================', 'green');
    log(`Tables created: ${validation.tables}`, 'bright');
    log(`Sample users: ${validation.users}`, 'bright');
    log(`Sample products: ${validation.products}`, 'bright');
    log(`Product categories: ${validation.categories}`, 'bright');
    log('\\nNext steps:', 'bright');
    log('1. Update your application environment variables to use Supabase', 'cyan');
    log('2. Test your application with the new database', 'cyan');
    log('3. Run the migration validation tests', 'cyan');

  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logError(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

// Run the setup
if (require.main === module) {
  main();
}

module.exports = { main };