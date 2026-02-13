#!/usr/bin/env node

/**
 * Enhanced Pricing Validation Test
 * Tests the new size and color pricing variations
 */

require('dotenv').config()

// Import pricing functions from both client and server
const clientPricing = require('./client/src/constants/pricing.ts')
const serverPricing = require('./netlify/functions/lib/pricing.ts')

console.log('🧪 Testing Enhanced Pricing with Size and Color Variations...\n')

// Test data
const testProduct = {
  id: 'test-product',
  name: 'Test T-Shirt',
  basePrice: 2075.00,
  sizePricing: {
    'XS': 0, 'S': 0, 'M': 0, 'L': 0, 'XL': 249, 'XXL': 415
  },
  colorPricing: {
    '#000000': 0, // Black
    '#FFFFFF': 0, // White  
    '#FF0000': 166, // Red
    '#0000FF': 166, // Blue
    '#800080': 332  // Purple
  }
}

const testCases = [
  {
    name: 'Basic T-Shirt (M, Black)',
    size: 'M',
    color: '#000000',
    embroidery: false,
    logo: false,
    expected: 2075.00
  },
  {
    name: 'XL T-Shirt (XL, Black)',
    size: 'XL', 
    color: '#000000',
    embroidery: false,
    logo: false,
    expected: 2075.00 + 249 // XL size premium
  },
  {
    name: 'Red T-Shirt (M, Red)',
    size: 'M',
    color: '#FF0000', 
    embroidery: false,
    logo: false,
    expected: 2075.00 + 166 // Red color premium
  },
  {
    name: 'Premium Combo (XL, Purple)',
    size: 'XL',
    color: '#800080',
    embroidery: false, 
    logo: false,
    expected: 2075.00 + 249 + 332 // XL + Purple premiums
  },
  {
    name: 'Full Custom (XXL, Red, Embroidery)',
    size: 'XXL',
    color: '#FF0000',
    embroidery: true,
    logo: false,
    expected: 2075.00 + 415 + 166 + 1245 // XXL + Red + Embroidery
  }
]

console.log('📊 Running Enhanced Pricing Tests...\n')

let allPassed = true

testCases.forEach((test, index) => {
  console.log(`Test ${index + 1}: ${test.name}`)
  
  // Calculate using client-side logic
  const clientTotal = clientPricing.calculateProductPrice(
    testProduct.basePrice,
    test.size,
    test.color,
    testProduct.sizePricing,
    testProduct.colorPricing,
    test.embroidery,
    test.logo
  )
  
  // Calculate using server-side logic  
  const serverTotal = serverPricing.calculateProductPrice(
    testProduct.basePrice,
    test.size,
    test.color,
    testProduct.sizePricing,
    testProduct.colorPricing,
    test.embroidery,
    test.logo
  )
  
  const clientMatch = Math.abs(clientTotal - test.expected) < 0.01
  const serverMatch = Math.abs(serverTotal - test.expected) < 0.01
  const consistency = Math.abs(clientTotal - serverTotal) < 0.01
  
  console.log(`  Expected: ₹${test.expected.toFixed(2)}`)
  console.log(`  Client:   ₹${clientTotal.toFixed(2)} ${clientMatch ? '✅' : '❌'}`)
  console.log(`  Server:   ₹${serverTotal.toFixed(2)} ${serverMatch ? '✅' : '❌'}`)
  console.log(`  Match:    ${consistency ? '✅' : '❌'}`)
  
  if (!clientMatch || !serverMatch || !consistency) {
    allPassed = false
  }
  
  console.log('')
})

console.log('📋 ENHANCED PRICING TEST SUMMARY')
console.log('==================================================')
if (allPassed) {
  console.log('🎉 ALL ENHANCED PRICING TESTS PASSED!')
  console.log('✅ Size pricing variations working correctly')
  console.log('✅ Color pricing variations working correctly') 
  console.log('✅ Client-server consistency maintained')
  console.log('\nYour enhanced pricing system is ready! 🚀')
} else {
  console.log('❌ SOME TESTS FAILED')
  console.log('Please review the pricing calculations above.')
  process.exit(1)
}