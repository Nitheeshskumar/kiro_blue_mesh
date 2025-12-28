#!/usr/bin/env node

/**
 * Setup script to ensure sample categories exist in the database
 * This script creates default categories if they don't exist
 */

require('dotenv').config()
const { Pool } = require('pg')

// Database configuration
const getDatabaseConfig = () => {
  const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL
  
  if (!databaseUrl) {
    throw new Error('SUPABASE_DATABASE_URL or DATABASE_URL environment variable is required')
  }

  return {
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  }
}

const sampleCategories = [
  {
    id: 'shirts',
    name: 'T-Shirts & Tops',
    slug: 't-shirts-tops',
    description: 'Comfortable and stylish t-shirts, tank tops, and casual wear',
    icon: '👕'
  },
  {
    id: 'hoodies',
    name: 'Hoodies & Sweatshirts',
    slug: 'hoodies-sweatshirts',
    description: 'Warm and cozy hoodies, sweatshirts, and pullover tops',
    icon: '🧥'
  },
  {
    id: 'dresses',
    name: 'Dresses',
    slug: 'dresses',
    description: 'Elegant dresses for all occasions and celebrations',
    icon: '👗'
  },
  {
    id: 'accessories',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Caps, bags, and other fashion accessories',
    icon: '👒'
  },
  {
    id: 'baby-clothes',
    name: 'Baby & Kids',
    slug: 'baby-kids',
    description: 'Adorable clothing for babies and children',
    icon: '👶'
  },
  {
    id: 'maternity',
    name: 'Maternity',
    slug: 'maternity',
    description: 'Comfortable and stylish maternity wear',
    icon: '🤱'
  }
]

async function setupCategories() {
  let pool = null
  
  try {
    console.log('🔗 Connecting to database...')
    const config = getDatabaseConfig()
    pool = new Pool(config)
    
    // Test connection
    await pool.query('SELECT NOW()')
    console.log('✅ Database connection successful')
    
    console.log('\n📋 Setting up sample categories...')
    
    for (const category of sampleCategories) {
      try {
        // Check if category already exists
        const existingResult = await pool.query(
          'SELECT id FROM product_categories WHERE id = $1',
          [category.id]
        )
        
        if (existingResult.rows.length > 0) {
          console.log(`⏭️  Category "${category.name}" already exists, skipping...`)
          continue
        }
        
        // Insert new category
        await pool.query(`
          INSERT INTO product_categories (id, name, slug, description, icon, "productCount")
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          category.id,
          category.name,
          category.slug,
          category.description,
          category.icon,
          0
        ])
        
        console.log(`✅ Created category: ${category.icon} ${category.name}`)
      } catch (error) {
        console.error(`❌ Failed to create category "${category.name}":`, error.message)
      }
    }
    
    // Update product counts for all categories
    console.log('\n🔄 Updating product counts...')
    const categories = await pool.query('SELECT * FROM product_categories ORDER BY name')
    
    for (const category of categories.rows) {
      const countResult = await pool.query(`
        SELECT COUNT(*) as count 
        FROM products 
        WHERE "isActive" = true AND ($1 = ANY(categories) OR category = $1)
      `, [category.id])
      
      const count = parseInt(countResult.rows[0].count)
      
      await pool.query(
        'UPDATE product_categories SET "productCount" = $1 WHERE id = $2',
        [count, category.id]
      )
      
      console.log(`📊 ${category.icon} ${category.name}: ${count} products`)
    }
    
    console.log('\n🎉 Sample categories setup completed!')
    
  } catch (error) {
    console.error('💥 Setup failed:', error.message)
    process.exit(1)
  } finally {
    if (pool) {
      await pool.end()
    }
  }
}

// Check if this script is being run directly
if (require.main === module) {
  setupCategories()
}

module.exports = { setupCategories, sampleCategories }