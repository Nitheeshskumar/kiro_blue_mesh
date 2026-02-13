require('dotenv').config();
const axios = require('axios');

async function testProductsAPI() {
  try {
    console.log('🌐 Testing Products API');
    console.log('=======================');

    // Test getting all products
    console.log('📡 Testing GET /api/products...');
    
    const response = await axios.get('http://localhost:5000/api/products', {
      timeout: 10000
    });

    console.log(`✅ API Response Status: ${response.status}`);
    console.log(`📦 Found ${response.data.length} products`);

    response.data.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Base Price: ₹${product.basePrice}`);
      console.log(`   Sizes: ${product.sizes.join(', ')}`);
      console.log(`   Color Type: ${product.colorType}`);
      
      if (product.sizePricing) {
        console.log(`   Size Pricing: ${Object.keys(product.sizePricing).length} size modifiers`);
      }
      
      if (product.colorPricing) {
        console.log(`   Color Pricing: ${Object.keys(product.colorPricing).length} color modifiers`);
      }
    });

    // Test getting a specific product
    if (response.data.length > 0) {
      const firstProduct = response.data[0];
      console.log(`\n🔍 Testing GET /api/products/${firstProduct.id}...`);
      
      const singleProductResponse = await axios.get(`http://localhost:5000/api/products/${firstProduct.id}`, {
        timeout: 10000
      });

      console.log(`✅ Single Product API Response Status: ${singleProductResponse.status}`);
      const product = singleProductResponse.data;
      
      console.log(`📋 Product Details:`);
      console.log(`   Name: ${product.name}`);
      console.log(`   Description: ${product.description}`);
      console.log(`   Base Price: ₹${product.basePrice}`);
      console.log(`   Size Pricing:`, JSON.stringify(product.sizePricing, null, 2));
      console.log(`   Color Pricing:`, JSON.stringify(product.colorPricing, null, 2));
    }

    console.log('\n✅ API tests completed successfully!');
    console.log('The products are properly accessible through the API with pricing information.');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Connection refused - Development server is not running');
      console.log('💡 Please start the development server with: npm run dev:server');
    } else {
      console.error('❌ API test failed:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    }
  }
}

testProductsAPI();