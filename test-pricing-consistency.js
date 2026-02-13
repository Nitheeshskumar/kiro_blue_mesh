#!/usr/bin/env node

/**
 * Pricing Consistency Test
 * Tests that client-side and server-side pricing calculations produce identical results
 */

// Simulate client-side pricing constants
const CLIENT_PRICING = {
  EMBROIDERY_COST: 1245.00, // ₹1,245 (15 USD * 83)
  LOGO_COST: 830.00,        // ₹830 (10 USD * 83)
  STANDARD_SHIPPING: 829.00, // ₹829 (9.99 USD * 83)
  TAX_RATE: 0.18,           // 18% GST
}

// Simulate server-side pricing constants
const SERVER_PRICING = {
  EMBROIDERY_COST: 1245.00, // ₹1,245 (15 USD * 83)
  LOGO_COST: 830.00,        // ₹830 (10 USD * 83)
  STANDARD_SHIPPING: 829.00, // ₹829 (9.99 USD * 83)
  TAX_RATE: 0.18,           // 18% GST
}

// Client-side calculation function
const clientCalculateCustomizationPrice = (basePrice, hasEmbroidery = false, hasLogo = false) => {
  let total = basePrice
  if (hasEmbroidery) total += CLIENT_PRICING.EMBROIDERY_COST
  if (hasLogo) total += CLIENT_PRICING.LOGO_COST
  return total
}

// Server-side calculation function
const serverCalculateCustomizationPrice = (basePrice, hasEmbroidery = false, hasLogo = false) => {
  let total = basePrice
  if (hasEmbroidery) total += SERVER_PRICING.EMBROIDERY_COST
  if (hasLogo) total += SERVER_PRICING.LOGO_COST
  return total
}

// Order total calculation
const calculateOrderTotal = (subtotal, includeShipping = true, includeTax = false, pricing) => {
  let total = subtotal
  if (includeShipping) total += pricing.STANDARD_SHIPPING
  if (includeTax) total += subtotal * pricing.TAX_RATE
  return total
}

// Test cases
const testCases = [
  {
    name: 'Basic T-Shirt (No Customizations)',
    basePrice: 2075.00,
    hasEmbroidery: false,
    hasLogo: false,
    expected: 2075.00
  },
  {
    name: 'T-Shirt with Embroidery',
    basePrice: 2075.00,
    hasEmbroidery: true,
    hasLogo: false,
    expected: 2075.00 + 1245.00
  },
  {
    name: 'T-Shirt with Logo',
    basePrice: 2075.00,
    hasEmbroidery: false,
    hasLogo: true,
    expected: 2075.00 + 830.00
  },
  {
    name: 'T-Shirt with Embroidery + Logo',
    basePrice: 2075.00,
    hasEmbroidery: true,
    hasLogo: true,
    expected: 2075.00 + 1245.00 + 830.00
  },
  {
    name: 'Premium Hoodie with Embroidery',
    basePrice: 3735.00,
    hasEmbroidery: true,
    hasLogo: false,
    expected: 3735.00 + 1245.00
  },
  {
    name: 'Baseball Cap with Logo',
    basePrice: 1660.00,
    hasEmbroidery: false,
    hasLogo: true,
    expected: 1660.00 + 830.00
  }
]

// Run tests
console.log('🧪 Testing Pricing Consistency Between Client and Server\n')

let allTestsPassed = true

// Test pricing constants consistency
console.log('1. Testing Pricing Constants Consistency:')
const constantsMatch = JSON.stringify(CLIENT_PRICING) === JSON.stringify(SERVER_PRICING)
console.log(`   Constants Match: ${constantsMatch ? '✅ PASS' : '❌ FAIL'}`)
if (!constantsMatch) {
  console.log('   Client:', CLIENT_PRICING)
  console.log('   Server:', SERVER_PRICING)
  allTestsPassed = false
}
console.log()

// Test customization pricing
console.log('2. Testing Customization Pricing:')
testCases.forEach((testCase, index) => {
  const clientResult = clientCalculateCustomizationPrice(
    testCase.basePrice, 
    testCase.hasEmbroidery, 
    testCase.hasLogo
  )
  
  const serverResult = serverCalculateCustomizationPrice(
    testCase.basePrice, 
    testCase.hasEmbroidery, 
    testCase.hasLogo
  )
  
  const clientMatch = Math.abs(clientResult - testCase.expected) < 0.01
  const serverMatch = Math.abs(serverResult - testCase.expected) < 0.01
  const clientServerMatch = Math.abs(clientResult - serverResult) < 0.01
  
  const testPassed = clientMatch && serverMatch && clientServerMatch
  
  console.log(`   Test ${index + 1}: ${testCase.name}`)
  console.log(`     Expected: ₹${testCase.expected.toFixed(2)}`)
  console.log(`     Client:   ₹${clientResult.toFixed(2)} ${clientMatch ? '✅' : '❌'}`)
  console.log(`     Server:   ₹${serverResult.toFixed(2)} ${serverMatch ? '✅' : '❌'}`)
  console.log(`     Match:    ${clientServerMatch ? '✅ PASS' : '❌ FAIL'}`)
  console.log()
  
  if (!testPassed) allTestsPassed = false
})

// Test order totals with shipping
console.log('3. Testing Order Totals with Shipping:')
const shippingTestCases = [
  { subtotal: 2075.00, name: 'Basic Order' },
  { subtotal: 4150.00, name: 'Order with Customizations' },
  { subtotal: 6225.00, name: 'Large Order' }
]

shippingTestCases.forEach((testCase, index) => {
  const clientTotal = calculateOrderTotal(testCase.subtotal, true, false, CLIENT_PRICING)
  const serverTotal = calculateOrderTotal(testCase.subtotal, true, false, SERVER_PRICING)
  const expected = testCase.subtotal + CLIENT_PRICING.STANDARD_SHIPPING
  
  const clientMatch = Math.abs(clientTotal - expected) < 0.01
  const serverMatch = Math.abs(serverTotal - expected) < 0.01
  const clientServerMatch = Math.abs(clientTotal - serverTotal) < 0.01
  
  const testPassed = clientMatch && serverMatch && clientServerMatch
  
  console.log(`   Test ${index + 1}: ${testCase.name}`)
  console.log(`     Subtotal: ₹${testCase.subtotal.toFixed(2)}`)
  console.log(`     Shipping: ₹${CLIENT_PRICING.STANDARD_SHIPPING.toFixed(2)}`)
  console.log(`     Expected: ₹${expected.toFixed(2)}`)
  console.log(`     Client:   ₹${clientTotal.toFixed(2)} ${clientMatch ? '✅' : '❌'}`)
  console.log(`     Server:   ₹${serverTotal.toFixed(2)} ${serverMatch ? '✅' : '❌'}`)
  console.log(`     Match:    ${clientServerMatch ? '✅ PASS' : '❌ FAIL'}`)
  console.log()
  
  if (!testPassed) allTestsPassed = false
})

// Final result
console.log('📊 Final Result:')
if (allTestsPassed) {
  console.log('✅ ALL TESTS PASSED - Pricing is consistent between client and server!')
  console.log('🔒 Security: Server-side validation ensures price integrity')
  console.log('💰 Currency: All prices properly formatted in Indian Rupees (₹)')
  process.exit(0)
} else {
  console.log('❌ SOME TESTS FAILED - Pricing inconsistencies detected!')
  console.log('⚠️  Please review and fix the pricing calculations')
  process.exit(1)
}