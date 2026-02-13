#!/usr/bin/env node

const { Pool } = require('pg')
const bcrypt = require('bcryptjs')
require('dotenv').config()

async function ensureAdminUser() {
  const pool = new Pool({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  })

  try {
    console.log('🔍 Checking for admin user...')

    // Check if admin user exists
    const adminCheck = await pool.query('SELECT id, email FROM users WHERE email = $1', ['admin@willowbrook.com'])
    
    if (adminCheck.rows.length > 0) {
      console.log('✅ Admin user already exists:', adminCheck.rows[0].email)
      return
    }

    console.log('👤 Creating admin user...')

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    await pool.query(`
      INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [id, 'admin@willowbrook.com', 'Admin User', hashedPassword, 'ADMIN'])

    console.log('✅ Admin user created successfully!')
    console.log('   Email: admin@willowbrook.com')
    console.log('   Password: admin123')
    console.log('   Role: ADMIN')

  } catch (error) {
    console.error('❌ Failed to create admin user:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

ensureAdminUser()