#!/usr/bin/env node

/**
 * Seed Products to Supabase Database
 * 
 * This script inserts the sample products from the server into the Supabase database
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Sample products data from server/src/routes/products.ts
const sampleProducts = [
  {
    id: 'prod-1',
    name: 'Classic T-Shirt',
    description: 'Comfortable cotton t-shirt perfect for customization',
    category: 'shirts',
    categories: ['cotton-essentials', 'mother-daughter'],
    basePrice: 2075.00, // ₹2,075 (25 USD * 83)
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#00FF00', '#FFFF00'],
    isActive: true
  },
  {
    id: 'prod-2',
    name: 'Premium Hoodie',
    description: 'Warm and cozy hoodie with premium materials',
    category: 'hoodies',
    categories: ['cotton-essentials', 'birthday-celebration'],
    basePrice: 3735.00, // ₹3,735 (45 USD * 83)
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['#000000', '#FFFFFF', '#808080', '#000080', '#800000'],
    isActive: true
  },
  {
    id: 'prod-3',
    name: 'Baseball Cap',
    description: 'Classic baseball cap with adjustable strap',
    category: 'accessories',
    categories: ['accessories', 'kids-coordinated'],
    basePrice: 1660.00, // ₹1,660 (20 USD * 83)
    images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400'],
    sizes: ['One Size'],
    colors: ['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#00FF00'],
    isActive: true
  },
  {
    id: 'prod-4',
    name: 'Maternity Dress',
    description: 'Elegant and comfortable dress for expecting mothers',
    category: 'dresses',
    categories: ['maternity', 'cotton-essentials'],
    basePrice: 5395.00, // ₹5,395 (65 USD * 83)
    images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['#000080', '#800080', '#008000', '#000000'],
    isActive: true
  },
  {
    id: 'prod-5',
    name: 'Baby Onesie Set',
    description: 'Soft organic cotton onesies for newborns',
    category: 'baby-clothes',
    categories: ['newborn-essentials', 'cotton-essentials'],
    basePrice: 2905.00, // ₹2,905 (35 USD * 83)
    images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400'],
    sizes: ['0-3M', '3-6M', '6-9M', '9-12M'],
    colors: ['#FFB6C1', '#87CEEB', '#98FB98', '#FFFFE0'],
    isActive: true
  },
  {
    id: 'prod-6',
    name: 'Birthday Party Dress',
    description: 'Special occasion dress perfect for celebrations',
    category: 'dresses',
    categories: ['birthday-celebration', 'kids-coordinated'],
    basePrice: 4565.00, // ₹4,565 (55 USD * 83)
    images: ['https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400'],
    sizes: ['2T', '3T', '4T', '5T', '6T'],
    colors: ['#FF69B4', '#9370DB', '#FFD700', '#FF6347'],
    isActive: true
  }
];

async function seedProducts() {
  console.log('🌱 Seeding products to Supabase database...\n');

  try {
    // Clear existing products (optional)
    console.log('🗑️  Clearing existing products...');
    await prisma.product.deleteMany({});
    console.log('✅ Existing products cleared\n');

    // Insert sample products
    console.log('📦 Inserting sample products...');
    
    for (const product of sampleProducts) {
      try {
        const createdProduct = await prisma.product.create({
          data: {
            id: product.id,
            name: product.name,
            description: product.description,
            category: product.category,
            basePrice: product.basePrice,
            images: product.images,
            sizes: product.sizes,
            colors: product.colors,
            isActive: product.isActive
            // Note: categories field is not in the current Prisma schema
            // The main category is stored in the 'category' field
          }
        });
        
        console.log(`   ✅ Created: ${createdProduct.name} (${createdProduct.id})`);
      } catch (error) {
        console.error(`   ❌ Failed to create ${product.name}:`, error.message);
      }
    }

    // Verify the data
    console.log('\n📊 Verifying inserted data...');
    const productCount = await prisma.product.count();
    console.log(`✅ Total products in database: ${productCount}`);

    // Display all products
    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        basePrice: true,
        isActive: true
      }
    });

    console.log('\n📋 Products in database:');
    allProducts.forEach(product => {
      console.log(`   • ${product.name} (${product.category}) - ₹${product.basePrice}`);
    });

    console.log('\n✅ Product seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
if (require.main === module) {
  seedProducts()
    .then(() => {
      console.log('\n🎉 Seeding process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = { seedProducts, sampleProducts };