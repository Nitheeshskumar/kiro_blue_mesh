#!/usr/bin/env node

/**
 * Run Saved Addresses Migration
 * Adds saved_addresses table to Supabase database
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

async function runMigration() {
  console.log('🚀 Starting Saved Addresses Migration...\n')

  // Check for database URL
  const databaseUrl = process.env.SUPABASE_DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ Error: SUPABASE_DATABASE_URL not found in .env file')
    process.exit(1)
  }

  // Create database connection
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    // Test connection
    console.log('📡 Testing database connection...')
    await pool.query('SELECT NOW()')
    console.log('✅ Database connected successfully\n')

    // Read migration file
    console.log('📄 Reading migration file...')
    const migrationPath = path.join(__dirname, 'supabase-addresses-migration.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    console.log('✅ Migration file loaded\n')

    // Run migration
    console.log('🔄 Running migration...')
    await pool.query(migrationSQL)
    console.log('✅ Migration completed successfully!\n')

    // Verify table creation
    console.log('🔍 Verifying table creation...')
    const result = await pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'saved_addresses'
      ORDER BY ordinal_position
    `)

    if (result.rows.length > 0) {
      console.log('✅ Table "saved_addresses" created with columns:')
      result.rows.forEach(row => {
        console.log(`   - ${row.column_name} (${row.data_type})`)
      })
    } else {
      console.log('⚠️  Warning: Could not verify table creation')
    }

    console.log('\n🎉 Saved Addresses Migration Complete!')
    console.log('\nNext steps:')
    console.log('1. Restart your dev server: npm run dev')
    console.log('2. Test address management in profile page')
    console.log('3. Test address selection during checkout')

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    if (error.detail) {
      console.error('Details:', error.detail)
    }
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Run migration
runMigration()
