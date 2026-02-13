#!/usr/bin/env node

/**
 * Database Cleanup Script for Willowbrook Clothing
 * 
 * This script safely removes all products, orders, customizations, and reviews
 * while preserving users and categories for the beta reset.
 * 
 * Usage: node cleanup-database.js
 */

const { Client } = require('pg')
require('dotenv').config()

async function cleanupDatabase() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  })

  try {
    await client.connect()
    console.log('🔗 Connected to Supabase database')

    // Start transaction for safety
    await client.query('BEGIN')
    console.log('📝 Starting database cleanup transaction...')

    // Get counts before cleanup
    const beforeCounts = await getTableCounts(client)
    console.log('\n📊 Current database state:')
    Object.entries(beforeCounts).forEach(([table, count]) => {
      console.log(`   ${table}: ${count} records`)
    })

    // Confirm cleanup
    console.log('\n⚠️  This will permanently delete:')
    console.log('   • All products and their data')
    console.log('   • All orders and order items')
    console.log('   • All customizations')
    console.log('   • All customer reviews and photos')
    console.log('   • All customer measurements and preferences')
    console.log('\n✅ This will preserve:')
    console.log('   • User accounts')
    console.log('   • Product categories')

    // In a real scenario, you'd want user confirmation here
    // For now, we'll proceed automatically since this is for beta cleanup
    
    console.log('\n🧹 Starting cleanup process...')

    // Delete in correct order to respect foreign key constraints
    
    // 1. Delete review photos first (references reviews)
    console.log('   Deleting review photos...')
    const reviewPhotosResult = await client.query('DELETE FROM review_photos')
    console.log(`   ✓ Deleted ${reviewPhotosResult.rowCount} review photos`)

    // 2. Delete customer reviews
    console.log('   Deleting customer reviews...')
    const reviewsResult = await client.query('DELETE FROM customer_reviews')
    console.log(`   ✓ Deleted ${reviewsResult.rowCount} customer reviews`)

    // 3. Delete order items (references orders and products)
    console.log('   Deleting order items...')
    const orderItemsResult = await client.query('DELETE FROM order_items')
    console.log(`   ✓ Deleted ${orderItemsResult.rowCount} order items`)

    // 4. Delete orders
    console.log('   Deleting orders...')
    const ordersResult = await client.query('DELETE FROM orders')
    console.log(`   ✓ Deleted ${ordersResult.rowCount} orders`)

    // 5. Delete customizations (references products and users)
    console.log('   Deleting customizations...')
    const customizationsResult = await client.query('DELETE FROM customizations')
    console.log(`   ✓ Deleted ${customizationsResult.rowCount} customizations`)

    // 6. Delete customer measurements
    console.log('   Deleting customer measurements...')
    const measurementsResult = await client.query('DELETE FROM customer_measurements')
    console.log(`   ✓ Deleted ${measurementsResult.rowCount} customer measurements`)

    // 7. Delete customization preferences
    console.log('   Deleting customization preferences...')
    const preferencesResult = await client.query('DELETE FROM customization_preferences')
    console.log(`   ✓ Deleted ${preferencesResult.rowCount} customization preferences`)

    // 8. Finally, delete products
    console.log('   Deleting products...')
    const productsResult = await client.query('DELETE FROM products')
    console.log(`   ✓ Deleted ${productsResult.rowCount} products`)

    // Reset product counts in categories
    console.log('   Resetting category product counts...')
    await client.query('UPDATE product_categories SET "productCount" = 0')
    console.log('   ✓ Reset all category product counts to 0')

    // Commit transaction
    await client.query('COMMIT')
    console.log('\n✅ Database cleanup completed successfully!')

    // Get counts after cleanup
    const afterCounts = await getTableCounts(client)
    console.log('\n📊 Database state after cleanup:')
    Object.entries(afterCounts).forEach(([table, count]) => {
      console.log(`   ${table}: ${count} records`)
    })

    console.log('\n🎉 Beta database reset complete!')
    console.log('   • All product and order data has been removed')
    console.log('   • User accounts and categories are preserved')
    console.log('   • Ready for fresh product data with new structure')

  } catch (error) {
    // Rollback transaction on error
    try {
      await client.query('ROLLBACK')
      console.log('🔄 Transaction rolled back due to error')
    } catch (rollbackError) {
      console.error('❌ Error during rollback:', rollbackError.message)
    }
    
    console.error('❌ Database cleanup failed:', error.message)
    console.error('   Stack trace:', error.stack)
    process.exit(1)
  } finally {
    await client.end()
    console.log('🔌 Database connection closed')
  }
}

async function getTableCounts(client) {
  const tables = [
    'users',
    'product_categories', 
    'products',
    'customizations',
    'orders',
    'order_items',
    'customer_reviews',
    'review_photos',
    'customer_measurements',
    'customization_preferences'
  ]

  const counts = {}
  
  for (const table of tables) {
    try {
      const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`)
      counts[table] = parseInt(result.rows[0].count)
    } catch (error) {
      counts[table] = 'Error'
    }
  }

  return counts
}

// Run the cleanup
if (require.main === module) {
  cleanupDatabase()
    .then(() => {
      console.log('\n🏁 Cleanup script finished')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Cleanup script failed:', error.message)
      process.exit(1)
    })
}

module.exports = { cleanupDatabase }