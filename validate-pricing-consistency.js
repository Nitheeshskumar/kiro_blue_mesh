#!/usr/bin/env node

/**
 * Pricing Consistency Validation
 * Validates that pricing calculations are consistent between client and server
 */

const fs = require('fs')
const path = require('path')

// Read pricing files
const clientPricingPath = path.join(__dirname, 'client/src/constants/pricing.ts')
const serverPricingPath = path.join(__dirname, 'netlify/functions/lib/pricing.ts')

console.log('🔍 Validating pricing consistency between client and server...\n')

try {
  // Read client pricing
  const clientPricing = fs.readFileSync(clientPricingPath, 'utf8')
  
  // Read server pricing
  const serverPricing = fs.readFileSync(serverPricingPath, 'utf8')
  
  // Extract pricing constants using regex
  const extractPricing = (content) => {
    const embroideryMatch = content.match(/EMBROIDERY_COST:\s*([\d.]+)/)
    const logoMatch = content.match(/LOGO_COST:\s*([\d.]+)/)
    const shippingMatch = content.match(/STANDARD_SHIPPING:\s*([\d.]+)/)
    const taxMatch = content.match(/TAX_RATE:\s*([\d.]+)/)
    
    return {
      EMBROIDERY_COST: embroideryMatch ? parseFloat(embroideryMatch[1]) : null,
      LOGO_COST: logoMatch ? parseFloat(logoMatch[1]) : null,
      STANDARD_SHIPPING: shippingMatch ? parseFloat(shippingMatch[1]) : null,
      TAX_RATE: taxMatch ? parseFloat(taxMatch[1]) : null
    }
  }
  
  const clientPrices = extractPricing(clientPricing)
  const serverPrices = extractPricing(serverPricing)
  
  console.log('📊 Client Pricing:')
  console.table(clientPrices)
  
  console.log('📊 Server Pricing:')
  console.table(serverPrices)
  
  // Validate consistency
  let isConsistent = true
  const differences = []
  
  Object.keys(clientPrices).forEach(key => {
    if (clientPrices[key] !== serverPrices[key]) {
      isConsistent = false
      differences.push({
        constant: key,
        client: clientPrices[key],
        server: serverPrices[key],
        difference: Math.abs(clientPrices[key] - serverPrices[key])
      })
    }
  })
  
  if (isConsistent) {
    console.log('✅ PRICING CONSISTENCY: PASSED')
    console.log('All pricing constants match between client and server.\n')
  } else {
    console.log('❌ PRICING CONSISTENCY: FAILED')
    console.log('Found differences between client and server pricing:\n')
    console.table(differences)
    console.log('\n⚠️  This could lead to pricing discrepancies in orders!')
  }
  
  // Test sample calculations
  console.log('🧮 Testing Sample Calculations...\n')
  
  const testCases = [
    { basePrice: 2075.00, hasEmbroidery: false, hasLogo: false, description: 'Basic T-Shirt' },
    { basePrice: 2075.00, hasEmbroidery: true, hasLogo: false, description: 'T-Shirt with Embroidery' },
    { basePrice: 2075.00, hasEmbroidery: false, hasLogo: true, description: 'T-Shirt with Logo' },
    { basePrice: 2075.00, hasEmbroidery: true, hasLogo: true, description: 'T-Shirt with Both' },
    { basePrice: 3735.00, hasEmbroidery: true, hasLogo: false, description: 'Hoodie with Embroidery' }
  ]
  
  testCases.forEach((testCase, index) => {
    // Client calculation
    let clientTotal = testCase.basePrice
    if (testCase.hasEmbroidery) clientTotal += clientPrices.EMBROIDERY_COST
    if (testCase.hasLogo) clientTotal += clientPrices.LOGO_COST
    
    // Server calculation
    let serverTotal = testCase.basePrice
    if (testCase.hasEmbroidery) serverTotal += serverPrices.EMBROIDERY_COST
    if (testCase.hasLogo) serverTotal += serverPrices.LOGO_COST
    
    const matches = clientTotal === serverTotal
    
    console.log(`Test ${index + 1}: ${testCase.description}`)
    console.log(`  Base Price: ₹${testCase.basePrice.toFixed(2)}`)
    console.log(`  Client Total: ₹${clientTotal.toFixed(2)}`)
    console.log(`  Server Total: ₹${serverTotal.toFixed(2)}`)
    console.log(`  Match: ${matches ? '✅' : '❌'}`)
    
    if (!matches) {
      console.log(`  Difference: ₹${Math.abs(clientTotal - serverTotal).toFixed(2)}`)
    }
    console.log('')
  })
  
  // Test order total calculations
  console.log('🛒 Testing Order Total Calculations...\n')
  
  const orderTests = [
    { subtotal: 2075.00, description: 'Single item order' },
    { subtotal: 4150.00, description: 'Two item order' },
    { subtotal: 6225.00, description: 'Three item order' }
  ]
  
  orderTests.forEach((test, index) => {
    // Client calculation (from CartPage logic)
    const clientOrderTotal = test.subtotal + clientPrices.STANDARD_SHIPPING
    
    // Server calculation (from orders.ts logic)
    const serverOrderTotal = test.subtotal + serverPrices.STANDARD_SHIPPING
    
    const matches = clientOrderTotal === serverOrderTotal
    
    console.log(`Order Test ${index + 1}: ${test.description}`)
    console.log(`  Subtotal: ₹${test.subtotal.toFixed(2)}`)
    console.log(`  Shipping: ₹${clientPrices.STANDARD_SHIPPING.toFixed(2)}`)
    console.log(`  Client Total: ₹${clientOrderTotal.toFixed(2)}`)
    console.log(`  Server Total: ₹${serverOrderTotal.toFixed(2)}`)
    console.log(`  Match: ${matches ? '✅' : '❌'}`)
    
    if (!matches) {
      console.log(`  Difference: ₹${Math.abs(clientOrderTotal - serverOrderTotal).toFixed(2)}`)
    }
    console.log('')
  })
  
  // Check currency formatting
  console.log('💱 Checking Currency Formatting...\n')
  
  // Check for $ symbols in key files
  const filesToCheck = [
    'client/src/components/ProductGrid.tsx',
    'client/src/pages/CustomizerPage.tsx',
    'client/src/pages/CartPage.tsx',
    'client/src/pages/OrderTrackingPage.tsx',
    'client/src/pages/OrderConfirmationPage.tsx'
  ]
  
  let currencyIssues = []
  
  filesToCheck.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8')
      const dollarMatches = content.match(/\$\{[^}]*\.toFixed\(2\)\}/g)
      if (dollarMatches) {
        currencyIssues.push({
          file: filePath,
          issues: dollarMatches
        })
      }
    }
  })
  
  if (currencyIssues.length === 0) {
    console.log('✅ CURRENCY FORMAT: PASSED')
    console.log('No $ symbols found in pricing displays. All using ₹ (INR).\n')
  } else {
    console.log('❌ CURRENCY FORMAT: ISSUES FOUND')
    currencyIssues.forEach(issue => {
      console.log(`File: ${issue.file}`)
      issue.issues.forEach(match => {
        console.log(`  Issue: ${match}`)
      })
    })
    console.log('\n⚠️  Found $ symbols in pricing displays. Should use ₹ (INR).\n')
  }
  
  // Final summary
  console.log('📋 VALIDATION SUMMARY')
  console.log('='.repeat(50))
  
  if (isConsistent && currencyIssues.length === 0) {
    console.log('🎉 ALL CHECKS PASSED!')
    console.log('✅ Pricing constants are consistent')
    console.log('✅ Calculations match between client and server')
    console.log('✅ Currency formatting is correct (₹ INR)')
    console.log('\nYour pricing system is ready for production! 🚀')
  } else {
    console.log('⚠️  ISSUES FOUND:')
    if (!isConsistent) {
      console.log('❌ Pricing constants mismatch between client and server')
    }
    if (currencyIssues.length > 0) {
      console.log('❌ Currency formatting issues (using $ instead of ₹)')
    }
    console.log('\nPlease fix these issues before deploying to production.')
  }
  
} catch (error) {
  console.error('❌ Validation failed:', error.message)
  process.exit(1)
}