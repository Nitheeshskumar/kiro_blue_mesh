#!/usr/bin/env node

/**
 * Fixed Colors Migration Script
 * 
 * This script adds support for products with fixed colors (like printed designs)
 * where colors are part of the product image and not customizable.
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.SUPABASE_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  try {
    console.log('🔄 Connecting to database...');
    await client.connect();

    console.log('📝 Reading migration file...');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'add-fixed-colors-support.sql'),
      'utf8'
    );

    console.log('🚀 Running fixed colors migration...');
    await client.query(migrationSQL);

    console.log('✅ Migration completed successfully!');

    // Add some sample products with fixed colors
    console.log('🎨 Adding sample products with fixed colors...');
    
    const fixedColorProducts = [
      {
        id: 'prod-7',
        name: 'Vintage Band T-Shirt',
        description: 'Classic vintage band design with fixed artwork colors',
        category: 'shirts',
        categories: ['cotton-essentials'],
        basePrice: 2490.00,
        images: [
          'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400',
          'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400'
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['As Shown'], // Fixed color as shown in image
        hasFixedColors: true,
        colorType: 'fixed'
      },
      {
        id: 'prod-8',
        name: 'Floral Print Dress',
        description: 'Beautiful floral pattern with unique color combination',
        category: 'dresses',
        categories: ['cotton-essentials'],
        basePrice: 4150.00,
        images: [
          'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
          'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400'
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Floral Pattern'], // Fixed pattern color
        hasFixedColors: true,
        colorType: 'fixed'
      },
      {
        id: 'prod-9',
        name: 'Graphic Print Hoodie',
        description: 'Street art inspired hoodie with unique graphic design',
        category: 'hoodies',
        categories: ['cotton-essentials'],
        basePrice: 4565.00,
        images: [
          'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Original Design'], // Fixed graphic colors
        hasFixedColors: true,
        colorType: 'fixed'
      }
    ];

    for (const product of fixedColorProducts) {
      const insertQuery = `
        INSERT INTO products (
          id, name, description, category, categories, "basePrice", 
          images, sizes, colors, "hasFixedColors", "colorType", "isActive", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          categories = EXCLUDED.categories,
          "basePrice" = EXCLUDED."basePrice",
          images = EXCLUDED.images,
          sizes = EXCLUDED.sizes,
          colors = EXCLUDED.colors,
          "hasFixedColors" = EXCLUDED."hasFixedColors",
          "colorType" = EXCLUDED."colorType",
          "updatedAt" = CURRENT_TIMESTAMP
      `;

      await client.query(insertQuery, [
        product.id,
        product.name,
        product.description,
        product.category,
        product.categories,
        product.basePrice,
        product.images,
        product.sizes,
        product.colors,
        product.hasFixedColors,
        product.colorType,
        true
      ]);

      console.log(`✅ Added fixed color product: ${product.name}`);
    }

    // Verify the migration
    console.log('\n🔍 Verifying migration...');
    const verifyQuery = `
      SELECT 
        id, 
        name, 
        "colorType",
        "hasFixedColors",
        colors,
        array_length(colors, 1) as color_count
      FROM products 
      WHERE "colorType" = 'fixed'
      ORDER BY id
    `;
    
    const result = await client.query(verifyQuery);
    
    if (result.rows.length > 0) {
      console.log('\n📊 Products with Fixed Colors:');
      console.log('ID\t\tName\t\t\tColors');
      console.log('─'.repeat(60));
      
      result.rows.forEach(row => {
        console.log(`${row.id}\t${row.name.padEnd(25)}\t${row.colors.join(', ')}`);
      });
    }

    console.log('\n✅ Fixed colors support added successfully!');
    console.log('\n💡 New features available:');
    console.log('   • Products can have fixed colors (as shown in image)');
    console.log('   • Admin can specify color type when adding products');
    console.log('   • Customizer shows appropriate color options');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the migration
runMigration();