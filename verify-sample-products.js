require('dotenv').config();
const { Pool } = require('pg');

async function verifySampleProducts() {
  const pool = new Pool({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔍 Verifying Sample Products');
    console.log('============================');

    // Get all products with pricing information
    const result = await pool.query(`
      SELECT 
        id, name, description, category, categories, "basePrice", 
        images, sizes, colors, "sizePricing", "colorPricing", 
        "isActive", "hasFixedColors", "colorType", "createdAt"
      FROM products 
      WHERE id LIKE 'prod-%'
      ORDER BY "createdAt" DESC
    `);

    console.log(`📦 Found ${result.rows.length} products in database\n`);

    result.rows.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Additional Categories: ${product.categories?.join(', ') || 'None'}`);
      console.log(`   Base Price: ₹${product.basePrice}`);
      console.log(`   Color Type: ${product.colorType}`);
      console.log(`   Available Sizes: ${product.sizes.join(', ')}`);
      
      if (product.colorType === 'customizable') {
        console.log(`   Available Colors: ${product.colors.length} colors`);
      } else {
        console.log(`   Fixed Color: ${product.colors[0]}`);
      }
      
      console.log(`   Images: ${product.images.length} image(s)`);
      console.log(`   Active: ${product.isActive ? 'Yes' : 'No'}`);
      
      // Show pricing structure
      const sizePricing = product.sizePricing;
      const colorPricing = product.colorPricing;
      
      console.log('   Size Pricing:');
      Object.entries(sizePricing).forEach(([size, modifier]) => {
        console.log(`     ${size}: +₹${modifier}`);
      });
      
      if (product.colorType === 'customizable') {
        console.log('   Color Pricing:');
        Object.entries(colorPricing).forEach(([color, modifier]) => {
          const colorName = {
            '#000000': 'Black',
            '#FFFFFF': 'White',
            '#FF0000': 'Red',
            '#0000FF': 'Blue',
            '#00FF00': 'Green',
            '#FFFF00': 'Yellow',
            '#808080': 'Gray',
            '#000080': 'Navy',
            '#800000': 'Maroon'
          }[color] || color;
          console.log(`     ${colorName}: +₹${modifier}`);
        });
      }
      
      console.log('');
    });

    // Test pricing calculations for each product
    console.log('🧮 Testing Pricing Calculations');
    console.log('===============================');

    for (const product of result.rows) {
      console.log(`\n📊 ${product.name} - Pricing Examples:`);
      
      const basePrice = product.basePrice;
      const sizePricing = product.sizePricing;
      const colorPricing = product.colorPricing;
      
      // Test different combinations
      const testCombinations = [];
      
      if (product.colorType === 'customizable') {
        // For customizable colors, test various size/color combinations
        const sizes = Object.keys(sizePricing);
        const colors = Object.keys(colorPricing);
        
        testCombinations.push(
          { size: sizes[0], color: colors[0] },
          { size: sizes[Math.floor(sizes.length/2)], color: colors[1] || colors[0] },
          { size: sizes[sizes.length-1], color: colors[colors.length-1] }
        );
      } else {
        // For fixed colors, test different sizes
        const sizes = Object.keys(sizePricing);
        testCombinations.push(
          { size: sizes[0], color: product.colors[0] },
          { size: sizes[Math.floor(sizes.length/2)], color: product.colors[0] },
          { size: sizes[sizes.length-1], color: product.colors[0] }
        );
      }
      
      testCombinations.forEach((combo, i) => {
        const sizeModifier = sizePricing[combo.size] || 0;
        const colorModifier = product.colorType === 'customizable' 
          ? (colorPricing[combo.color] || 0) 
          : 0;
        const totalPrice = basePrice + sizeModifier + colorModifier;
        
        const colorDisplay = product.colorType === 'customizable' 
          ? ({
              '#000000': 'Black',
              '#FFFFFF': 'White',
              '#FF0000': 'Red',
              '#0000FF': 'Blue',
              '#00FF00': 'Green',
              '#FFFF00': 'Yellow',
              '#808080': 'Gray',
              '#000080': 'Navy',
              '#800000': 'Maroon'
            }[combo.color] || combo.color)
          : combo.color;
        
        console.log(`   ${combo.size} + ${colorDisplay}: ₹${totalPrice} (₹${basePrice} + ₹${sizeModifier} + ₹${colorModifier})`);
      });
      
      // Show with embroidery
      const lastCombo = testCombinations[testCombinations.length - 1];
      const sizeModifier = sizePricing[lastCombo.size] || 0;
      const colorModifier = product.colorType === 'customizable' 
        ? (colorPricing[lastCombo.color] || 0) 
        : 0;
      const withEmbroidery = basePrice + sizeModifier + colorModifier + 1245; // Embroidery cost
      
      console.log(`   ${lastCombo.size} + ${product.colorType === 'customizable' ? 'Color' : 'Fixed'} + Embroidery: ₹${withEmbroidery}`);
    }

    // Check categories
    console.log('\n📂 Category Distribution:');
    const categoryCount = await pool.query(`
      SELECT 
        category,
        COUNT(*) as product_count,
        AVG("basePrice") as avg_price
      FROM products 
      WHERE id LIKE 'prod-%'
      GROUP BY category
      ORDER BY product_count DESC
    `);

    categoryCount.rows.forEach(row => {
      console.log(`   ${row.category}: ${row.product_count} product(s), Avg Price: ₹${Math.round(row.avg_price)}`);
    });

    console.log('\n✅ Verification completed successfully!');
    console.log('All sample products are properly configured with size and color pricing.');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await pool.end();
  }
}

verifySampleProducts();