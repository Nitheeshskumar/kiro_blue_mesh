require('dotenv').config();
const { Pool } = require('pg');

async function addSampleProducts() {
  const pool = new Pool({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🛍️ Adding Sample Products with Size & Color Pricing');
    console.log('==================================================');

    // Sample Product 1: Classic Cotton T-Shirt
    const product1 = {
      id: 'prod-classic-tshirt-001',
      name: 'Classic Cotton T-Shirt',
      description: 'Premium 100% cotton t-shirt perfect for everyday wear and customization. Soft, breathable, and durable.',
      category: 'shirts',
      categories: ['cotton-essentials', 'mother-daughter'],
      basePrice: 1899.00, // ₹1,899
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: ['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#00FF00', '#FFFF00'],
      sizePricing: {
        'XS': 0,
        'S': 0,
        'M': 0,
        'L': 0,
        'XL': 199,    // ₹199 extra for XL
        'XXL': 349    // ₹349 extra for XXL
      },
      colorPricing: {
        '#000000': 0,     // Black - no extra cost
        '#FFFFFF': 0,     // White - no extra cost
        '#FF0000': 149,   // Red - ₹149 extra
        '#0000FF': 149,   // Blue - ₹149 extra
        '#00FF00': 149,   // Green - ₹149 extra
        '#FFFF00': 199    // Yellow - ₹199 extra (premium color)
      },
      isActive: true,
      hasFixedColors: false,
      colorType: 'customizable'
    };

    // Sample Product 2: Premium Hoodie
    const product2 = {
      id: 'prod-premium-hoodie-002',
      name: 'Premium Fleece Hoodie',
      description: 'Cozy fleece hoodie with kangaroo pocket and adjustable drawstring. Perfect for cooler weather and casual styling.',
      category: 'hoodies',
      categories: ['cotton-essentials', 'birthday-celebration'],
      basePrice: 3299.00, // ₹3,299
      images: [
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=400&fit=crop'
      ],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['#000000', '#FFFFFF', '#808080', '#000080', '#800000'],
      sizePricing: {
        'S': 0,
        'M': 0,
        'L': 0,
        'XL': 299,    // ₹299 extra for XL
        'XXL': 499    // ₹499 extra for XXL
      },
      colorPricing: {
        '#000000': 0,     // Black - no extra cost
        '#FFFFFF': 49,    // White - ₹49 extra (harder to keep clean)
        '#808080': 99,    // Gray - ₹99 extra
        '#000080': 199,   // Navy - ₹199 extra (premium color)
        '#800000': 249    // Maroon - ₹249 extra (premium color)
      },
      isActive: true,
      hasFixedColors: false,
      colorType: 'customizable'
    };

    // Sample Product 3: Kids Birthday Dress (Fixed Colors)
    const product3 = {
      id: 'prod-kids-birthday-dress-003',
      name: 'Princess Birthday Dress',
      description: 'Beautiful party dress with sparkly details and flowing skirt. Perfect for birthday celebrations and special occasions.',
      category: 'dresses',
      categories: ['birthday-celebration', 'kids-coordinated'],
      basePrice: 2799.00, // ₹2,799
      images: [
        'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=400&h=400&fit=crop'
      ],
      sizes: ['2T', '3T', '4T', '5T', '6T'],
      colors: ['Pink Princess with Gold Sparkles'], // Fixed color description
      sizePricing: {
        '2T': 0,
        '3T': 0,
        '4T': 99,     // ₹99 extra for 4T
        '5T': 149,    // ₹149 extra for 5T
        '6T': 199     // ₹199 extra for 6T
      },
      colorPricing: {
        'Pink Princess with Gold Sparkles': 0  // Fixed color, no extra cost
      },
      isActive: true,
      hasFixedColors: true,
      colorType: 'fixed'
    };

    const products = [product1, product2, product3];

    // Insert each product
    for (const product of products) {
      await pool.query(`
        INSERT INTO products (
          id, name, description, category, categories, "basePrice", 
          images, sizes, colors, "sizePricing", "colorPricing", 
          "isActive", "hasFixedColors", "colorType", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          categories = EXCLUDED.categories,
          "basePrice" = EXCLUDED."basePrice",
          images = EXCLUDED.images,
          sizes = EXCLUDED.sizes,
          colors = EXCLUDED.colors,
          "sizePricing" = EXCLUDED."sizePricing",
          "colorPricing" = EXCLUDED."colorPricing",
          "isActive" = EXCLUDED."isActive",
          "hasFixedColors" = EXCLUDED."hasFixedColors",
          "colorType" = EXCLUDED."colorType",
          "updatedAt" = CURRENT_TIMESTAMP
      `, [
        product.id, product.name, product.description, 
        product.category, product.categories, product.basePrice,
        product.images, product.sizes, product.colors,
        JSON.stringify(product.sizePricing), JSON.stringify(product.colorPricing),
        product.isActive, product.hasFixedColors, product.colorType
      ]);

      console.log(`✅ Added: ${product.name}`);
      
      // Show pricing examples for each product
      console.log(`   Base Price: ₹${product.basePrice}`);
      console.log(`   Size Examples:`);
      Object.entries(product.sizePricing).slice(0, 3).forEach(([size, modifier]) => {
        console.log(`     ${size}: ₹${product.basePrice + modifier} (base + ₹${modifier})`);
      });
      
      if (product.colorType === 'customizable') {
        console.log(`   Color Examples:`);
        Object.entries(product.colorPricing).slice(0, 3).forEach(([color, modifier]) => {
          const colorName = {
            '#000000': 'Black',
            '#FFFFFF': 'White', 
            '#FF0000': 'Red',
            '#0000FF': 'Blue',
            '#808080': 'Gray',
            '#000080': 'Navy'
          }[color] || color;
          console.log(`     ${colorName}: +₹${modifier}`);
        });
      } else {
        console.log(`   Fixed Color: ${product.colors[0]}`);
      }
      console.log('');
    }

    // Verify products were added
    const result = await pool.query(`
      SELECT id, name, "basePrice", "colorType", 
             jsonb_object_keys("sizePricing") as sample_size,
             ("sizePricing" ->> jsonb_object_keys("sizePricing")::text)::int as size_modifier
      FROM products 
      WHERE id IN ($1, $2, $3)
      LIMIT 3
    `, [product1.id, product2.id, product3.id]);

    console.log('📊 Verification - Products in Database:');
    console.log(`Found ${result.rows.length} products`);

    // Show detailed pricing breakdown for one product
    const detailedProduct = await pool.query(`
      SELECT * FROM products WHERE id = $1
    `, [product1.id]);

    if (detailedProduct.rows.length > 0) {
      const p = detailedProduct.rows[0];
      console.log('\n🔍 Detailed Example - Classic Cotton T-Shirt:');
      console.log(`Base Price: ₹${p.basePrice}`);
      console.log('Size Pricing:', JSON.stringify(p.sizePricing, null, 2));
      console.log('Color Pricing:', JSON.stringify(p.colorPricing, null, 2));
      
      // Calculate some example combinations
      console.log('\n💰 Example Price Combinations:');
      console.log(`- Medium + Black: ₹${p.basePrice + 0 + 0} (₹${p.basePrice} + ₹0 + ₹0)`);
      console.log(`- Large + Red: ₹${p.basePrice + 0 + 149} (₹${p.basePrice} + ₹0 + ₹149)`);
      console.log(`- XL + Yellow: ₹${p.basePrice + 199 + 199} (₹${p.basePrice} + ₹199 + ₹199)`);
      console.log(`- XXL + Yellow + Embroidery: ₹${p.basePrice + 349 + 199 + 1245} (₹${p.basePrice} + ₹349 + ₹199 + ₹1245)`);
    }

    console.log('\n🎉 Sample products added successfully!');
    console.log('You can now test the pricing functionality in the admin panel and customer interface.');

  } catch (error) {
    console.error('❌ Error adding sample products:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

addSampleProducts();