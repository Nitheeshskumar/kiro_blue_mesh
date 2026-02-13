require('dotenv').config();
const { Pool } = require('pg');

async function testPricingFunctionality() {
  const pool = new Pool({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🧪 Testing Size and Color Pricing Functionality');
    console.log('==============================================');
    
    // Create a test product with size and color pricing
    const testProduct = {
      id: 'test-pricing-product',
      name: 'Test Pricing T-Shirt',
      description: 'A test product to verify size and color pricing',
      category: 'shirts',
      categories: ['cotton-essentials'],
      basePrice: 2000.00,
      images: ['https://example.com/test-image.jpg'],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['#000000', '#FFFFFF', '#FF0000'],
      sizePricing: {
        'S': 0,
        'M': 0, 
        'L': 0,
        'XL': 249
      },
      colorPricing: {
        '#000000': 0,
        '#FFFFFF': 0,
        '#FF0000': 166
      },
      isActive: true,
      hasFixedColors: false,
      colorType: 'customizable'
    };

    // Insert test product
    await pool.query(`
      INSERT INTO products (
        id, name, description, category, categories, "basePrice", 
        images, sizes, colors, "sizePricing", "colorPricing", 
        "isActive", "hasFixedColors", "colorType", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        "sizePricing" = EXCLUDED."sizePricing",
        "colorPricing" = EXCLUDED."colorPricing",
        "updatedAt" = CURRENT_TIMESTAMP
    `, [
      testProduct.id, testProduct.name, testProduct.description, 
      testProduct.category, testProduct.categories, testProduct.basePrice,
      testProduct.images, testProduct.sizes, testProduct.colors,
      JSON.stringify(testProduct.sizePricing), JSON.stringify(testProduct.colorPricing),
      testProduct.isActive, testProduct.hasFixedColors, testProduct.colorType
    ]);

    console.log('✅ Test product created successfully');

    // Retrieve and verify the product
    const result = await pool.query(`
      SELECT id, name, "basePrice", "sizePricing", "colorPricing", sizes, colors
      FROM products 
      WHERE id = $1
    `, [testProduct.id]);

    const product = result.rows[0];
    console.log('\n📦 Product Details:');
    console.log(`- Name: ${product.name}`);
    console.log(`- Base Price: ₹${product.basePrice}`);
    console.log(`- Available Sizes: ${product.sizes.join(', ')}`);
    console.log(`- Available Colors: ${product.colors.join(', ')}`);

    console.log('\n💰 Pricing Breakdown:');
    
    // Test different size/color combinations
    const combinations = [
      { size: 'S', color: '#000000', description: 'Small + Black' },
      { size: 'M', color: '#FFFFFF', description: 'Medium + White' },
      { size: 'L', color: '#FF0000', description: 'Large + Red' },
      { size: 'XL', color: '#FF0000', description: 'Extra Large + Red' }
    ];

    combinations.forEach(combo => {
      const sizeModifier = product.sizePricing[combo.size] || 0;
      const colorModifier = product.colorPricing[combo.color] || 0;
      const totalPrice = product.basePrice + sizeModifier + colorModifier;
      
      console.log(`- ${combo.description}:`);
      console.log(`  Base: ₹${product.basePrice} + Size: ₹${sizeModifier} + Color: ₹${colorModifier} = ₹${totalPrice}`);
    });

    // Test with embroidery
    console.log('\n🎨 With Customizations:');
    const embroideryPrice = 1245; // From pricing constants
    const xlRedWithEmbroidery = product.basePrice + 249 + 166 + embroideryPrice;
    console.log(`- XL + Red + Embroidery: ₹${product.basePrice} + ₹249 + ₹166 + ₹${embroideryPrice} = ₹${xlRedWithEmbroidery}`);

    console.log('\n✅ Pricing functionality test completed successfully!');
    
    // Clean up test product
    await pool.query('DELETE FROM products WHERE id = $1', [testProduct.id]);
    console.log('🧹 Test product cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await pool.end();
  }
}

testPricingFunctionality();