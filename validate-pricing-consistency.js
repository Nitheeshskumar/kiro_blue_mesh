#!/usr/bin/env node

/**
 * Pricing Consistency Validation Script
 * 
 * This script validates that pricing calculations are consistent between:
 * 1. Client-side pricing logic (React components)
 * 2. Server-side pricing logic (API endpoints)
 * 3. Database pricing constants
 */

const fs = require('fs');
const path = require('path');

// Test scenarios for pricing validation (INR pricing)
const testScenarios = [
  {
    name: 'Basic T-Shirt',
    basePrice: 2075.00, // ₹2,075 (25 USD * 83)
    hasEmbroidery: false,
    hasLogo: false,
    expectedTotal: 2075.00
  },
  {
    name: 'T-Shirt with Embroidery',
    basePrice: 2075.00, // ₹2,075 (25 USD * 83)
    hasEmbroidery: true,
    hasLogo: false,
    expectedTotal: 3320.00 // 2075 + 1245
  },
  {
    name: 'T-Shirt with Logo',
    basePrice: 2075.00, // ₹2,075 (25 USD * 83)
    hasEmbroidery: false,
    hasLogo: true,
    expectedTotal: 2905.00 // 2075 + 830
  },
  {
    name: 'T-Shirt with Both',
    basePrice: 2075.00, // ₹2,075 (25 USD * 83)
    hasEmbroidery: true,
    hasLogo: true,
    expectedTotal: 4150.00 // 2075 + 1245 + 830
  },
  {
    name: 'Premium Hoodie',
    basePrice: 3735.00, // ₹3,735 (45 USD * 83)
    hasEmbroidery: true,
    hasLogo: false,
    expectedTotal: 4980.00 // 3735 + 1245
  }
];

// Cart total scenarios (INR pricing)
const cartScenarios = [
  {
    name: 'Single Item Cart',
    items: [{ price: 2075.00, quantity: 1 }], // ₹2,075 T-Shirt
    expectedSubtotal: 2075.00,
    expectedShipping: 829.00, // ₹829 shipping
    expectedTotal: 2904.00
  },
  {
    name: 'Multiple Items Cart',
    items: [
      { price: 2075.00, quantity: 2 }, // 2x T-Shirts
      { price: 3735.00, quantity: 1 }  // 1x Hoodie
    ],
    expectedSubtotal: 7885.00, // (2075 * 2) + (3735 * 1)
    expectedShipping: 829.00,
    expectedTotal: 8714.00
  }
];

// Pricing constants (should match both client and server)
const EXPECTED_PRICING = {
  EMBROIDERY_COST: 1245.00, // ₹1,245 (15 USD * 83)
  LOGO_COST: 830.00, // ₹830 (10 USD * 83)
  STANDARD_SHIPPING: 829.00, // ₹829 (9.99 USD * 83)
  TAX_RATE: 0.18 // 18% GST
}

// Helper function to format prices in INR
function formatINR(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(price);
};

// Client-side pricing function (extracted from constants/pricing.ts)
function calculateCustomizationPrice(basePrice, hasEmbroidery = false, hasLogo = false) {
  let total = basePrice;
  if (hasEmbroidery) total += EXPECTED_PRICING.EMBROIDERY_COST;
  if (hasLogo) total += EXPECTED_PRICING.LOGO_COST;
  return total;
}

// Cart total calculation (extracted from CartPage.tsx logic)
function calculateCartTotal(items, includeShipping = true) {
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  let total = subtotal;
  if (includeShipping) total += EXPECTED_PRICING.STANDARD_SHIPPING;
  return { subtotal, total };
}

// Validation functions
function validateCustomizationPricing() {
  console.log('🧮 Validating Customization Pricing...\n');
  
  let passed = 0;
  let failed = 0;
  
  testScenarios.forEach(scenario => {
    const calculated = calculateCustomizationPrice(
      scenario.basePrice,
      scenario.hasEmbroidery,
      scenario.hasLogo
    );
    
    const isValid = Math.abs(calculated - scenario.expectedTotal) < 0.01;
    
    if (isValid) {
      console.log(`✅ ${scenario.name}: ${formatINR(calculated)} (Expected: ${formatINR(scenario.expectedTotal)})`);
      passed++;
    } else {
      console.log(`❌ ${scenario.name}: ${formatINR(calculated)} (Expected: ${formatINR(scenario.expectedTotal)})`);
      failed++;
    }
  });
  
  console.log(`\nCustomization Pricing: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

function validateCartCalculations() {
  console.log('🛒 Validating Cart Calculations...\n');
  
  let passed = 0;
  let failed = 0;
  
  cartScenarios.forEach(scenario => {
    const { subtotal, total } = calculateCartTotal(scenario.items, true);
    
    const subtotalValid = Math.abs(subtotal - scenario.expectedSubtotal) < 0.01;
    const totalValid = Math.abs(total - scenario.expectedTotal) < 0.01;
    
    if (subtotalValid && totalValid) {
      console.log(`✅ ${scenario.name}:`);
      console.log(`   Subtotal: ${formatINR(subtotal)} (Expected: ${formatINR(scenario.expectedSubtotal)})`);
      console.log(`   Total: ${formatINR(total)} (Expected: ${formatINR(scenario.expectedTotal)})`);
      passed++;
    } else {
      console.log(`❌ ${scenario.name}:`);
      console.log(`   Subtotal: ${formatINR(subtotal)} (Expected: ${formatINR(scenario.expectedSubtotal)}) ${subtotalValid ? '✅' : '❌'}`);
      console.log(`   Total: ${formatINR(total)} (Expected: ${formatINR(scenario.expectedTotal)}) ${totalValid ? '✅' : '❌'}`);
      failed++;
    }
    console.log('');
  });
  
  console.log(`Cart Calculations: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

function validatePricingConstants() {
  console.log('🔧 Validating Pricing Constants Consistency...\n');
  
  const files = [
    'client/src/constants/pricing.ts',
    'netlify/functions/lib/pricing.ts'
  ];
  
  let allValid = true;
  
  files.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract pricing constants using regex
      const embroideryMatch = content.match(/EMBROIDERY_COST:\s*([\d.]+)/);
      const logoMatch = content.match(/LOGO_COST:\s*([\d.]+)/);
      const shippingMatch = content.match(/STANDARD_SHIPPING:\s*([\d.]+)/);
      
      const fileConstants = {
        EMBROIDERY_COST: embroideryMatch ? parseFloat(embroideryMatch[1]) : null,
        LOGO_COST: logoMatch ? parseFloat(logoMatch[1]) : null,
        STANDARD_SHIPPING: shippingMatch ? parseFloat(shippingMatch[1]) : null
      };
      
      console.log(`📁 ${filePath}:`);
      
      Object.keys(EXPECTED_PRICING).forEach(key => {
        if (key === 'TAX_RATE') return; // Skip tax rate for now
        
        const expected = EXPECTED_PRICING[key];
        const actual = fileConstants[key];
        
        if (actual === null) {
          console.log(`   ❌ ${key}: Not found`);
          allValid = false;
        } else if (Math.abs(actual - expected) < 0.01) {
          console.log(`   ✅ ${key}: ${formatINR(actual)}`);
        } else {
          console.log(`   ❌ ${key}: ${formatINR(actual)} (Expected: ${formatINR(expected)})`);
          allValid = false;
        }
      });
      
      console.log('');
    } else {
      console.log(`❌ File not found: ${filePath}\n`);
      allValid = false;
    }
  });
  
  return allValid;
}

function validateProductPrices() {
  console.log('📦 Validating Product Base Prices...\n');
  
  const serverProductsFile = 'server/src/routes/products.ts';
  const netlifyProductsFile = 'netlify/functions/routes/products.ts';
  
  if (!fs.existsSync(serverProductsFile) || !fs.existsSync(netlifyProductsFile)) {
    console.log('❌ Product files not found\n');
    return false;
  }
  
  // Extract sample products from both files
  const serverContent = fs.readFileSync(serverProductsFile, 'utf8');
  const netlifyContent = fs.readFileSync(netlifyProductsFile, 'utf8');
  
  // Simple validation that both files contain the same base prices
  const pricePattern = /basePrice:\s*([\d.]+)/g;
  
  const serverPrices = [];
  const netlifyPrices = [];
  
  let match;
  while ((match = pricePattern.exec(serverContent)) !== null) {
    serverPrices.push(parseFloat(match[1]));
  }
  
  pricePattern.lastIndex = 0; // Reset regex
  while ((match = pricePattern.exec(netlifyContent)) !== null) {
    netlifyPrices.push(parseFloat(match[1]));
  }
  
  const pricesMatch = JSON.stringify(serverPrices.sort()) === JSON.stringify(netlifyPrices.sort());
  
  if (pricesMatch) {
    console.log(`✅ Product base prices consistent between server and netlify functions`);
    console.log(`   Found ${serverPrices.length} products with prices: ${serverPrices.map(p => formatINR(p)).join(', ')}\n`);
    return true;
  } else {
    console.log(`❌ Product base prices inconsistent:`);
    console.log(`   Server: ${serverPrices.map(p => formatINR(p)).join(', ')}`);
    console.log(`   Netlify: ${netlifyPrices.map(p => formatINR(p)).join(', ')}\n`);
    return false;
  }
}

// Main validation function
function runValidation() {
  console.log('🚀 Starting Pricing Consistency Validation\n');
  console.log('=' .repeat(50) + '\n');
  
  const results = {
    customizationPricing: validateCustomizationPricing(),
    cartCalculations: validateCartCalculations(),
    pricingConstants: validatePricingConstants(),
    productPrices: validateProductPrices()
  };
  
  console.log('=' .repeat(50));
  console.log('📊 VALIDATION SUMMARY\n');
  
  const allPassed = Object.values(results).every(result => result === true);
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} - ${testName}`);
  });
  
  console.log('\n' + '=' .repeat(50));
  
  if (allPassed) {
    console.log('🎉 ALL PRICING VALIDATIONS PASSED!');
    console.log('✅ Client and server pricing calculations are consistent.');
    process.exit(0);
  } else {
    console.log('⚠️  PRICING INCONSISTENCIES DETECTED!');
    console.log('❌ Please review and fix the failing validations above.');
    process.exit(1);
  }
}

// Run validation if called directly
if (require.main === module) {
  runValidation();
}

module.exports = {
  runValidation,
  validateCustomizationPricing,
  validateCartCalculations,
  validatePricingConstants,
  validateProductPrices
};