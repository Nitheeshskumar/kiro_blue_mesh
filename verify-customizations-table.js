#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

async function verifyTable() {
  const pool = new Pool({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'customizations' 
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Customizations table structure:\n');
    console.table(result.rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyTable();
