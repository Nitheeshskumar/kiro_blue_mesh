#!/usr/bin/env node

/**
 * Run database migration to add enhanced customization columns
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
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

    // Read migration file - use the order management migration
    const migrationPath = path.join(__dirname, 'supabase-migration-order-management.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('🔄 Running migration...\n');

    // Execute migration
    const result = await pool.query(migrationSQL);

    console.log('\n✅ Migration completed successfully!');
    
    // Show the final message from the migration
    if (result.rows && result.rows.length > 0) {
      console.log('\n' + result.rows[result.rows.length - 1].message);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.detail) {
      console.error('Details:', error.detail);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
