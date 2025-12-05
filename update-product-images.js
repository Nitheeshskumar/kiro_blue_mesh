#!/usr/bin/env node

/**
 * Update Product Images Script
 * 
 * This script updates the existing products in the database to include multiple images
 * for better carousel demonstration.
 */

const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.SUPABASE_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const updatedProducts = [
  {
    id: 'prod-1',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      'https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=400',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400'
    ]
  },
  {
    id: 'prod-2',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400'
    ]
  },
  {
    id: 'prod-3',
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400',
      'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=400'
    ]
  },
  {
    id: 'prod-4',
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'
    ]
  },
  {
    id: 'prod-5',
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400',
      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400'
    ]
  },
  {
    id: 'prod-6',
    images: [
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400',
      'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400',
      'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=400'
    ]
  }
];

async function updateProductImages() {
  try {
    console.log('🔄 Connecting to database...');
    await client.connect();

    console.log('📸 Updating product images...');
    
    for (const product of updatedProducts) {
      const query = `
        UPDATE products 
        SET images = $1, "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $2
      `;
      
      const result = await client.query(query, [product.images, product.id]);
      
      if (result.rowCount > 0) {
        console.log(`✅ Updated ${product.id} with ${product.images.length} images`);
      } else {
        console.log(`⚠️  Product ${product.id} not found, skipping...`);
      }
    }

    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    const verifyQuery = `
      SELECT id, name, array_length(images, 1) as image_count
      FROM products 
      WHERE id = ANY($1)
      ORDER BY id
    `;
    
    const productIds = updatedProducts.map(p => p.id);
    const verifyResult = await client.query(verifyQuery, [productIds]);
    
    console.log('\n📊 Updated Products:');
    console.log('ID\t\tName\t\t\tImages');
    console.log('─'.repeat(50));
    
    verifyResult.rows.forEach(row => {
      console.log(`${row.id}\t${row.name.padEnd(20)}\t${row.image_count || 0}`);
    });

    console.log('\n✅ Product images updated successfully!');
    console.log('\n💡 You can now see image carousels in:');
    console.log('   • Product catalog pages');
    console.log('   • Product customizer');
    console.log('   • Admin product management');

  } catch (error) {
    console.error('❌ Error updating product images:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the update
updateProductImages();