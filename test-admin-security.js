#!/usr/bin/env node

const axios = require('axios')

const API_BASE = 'http://localhost:8888/.netlify/functions/api'

// Test admin credentials
const ADMIN_EMAIL = 'admin@willowbrook.com'
const ADMIN_PASSWORD = 'admin123'

// Test customer credentials (you may need to create this user)
const CUSTOMER_EMAIL = 'customer@test.com'
const CUSTOMER_PASSWORD = 'customer123'

// List of all admin endpoints to test
const ADMIN_ENDPOINTS = [
  // Admin stats and dashboard
  { method: 'GET', path: '/admin/stats', description: 'Admin dashboard stats' },
  { method: 'GET', path: '/admin/activity', description: 'Admin activity feed' },
  
  // User management
  { method: 'GET', path: '/admin/users', description: 'Get all users' },
  { method: 'POST', path: '/admin/users', description: 'Create new user', data: { email: 'test@test.com', name: 'Test', password: 'test123', role: 'CUSTOMER' } },
  
  // Product management (admin routes)
  { method: 'GET', path: '/admin/products', description: 'Get all products (admin)' },
  { method: 'POST', path: '/admin/products', description: 'Create product', data: { name: 'Test Product', category: 'shirts', basePrice: 1000 } },
  
  // Order management
  { method: 'GET', path: '/admin/orders', description: 'Get all orders' },
  
  // Category management
  { method: 'GET', path: '/admin/categories', description: 'Get categories (admin)' },
  { method: 'POST', path: '/admin/categories', description: 'Create category', data: { name: 'Test Category', description: 'Test description for category', icon: '🧪' } },
  
  // Product management (product routes)
  { method: 'POST', path: '/products', description: 'Create product (products route)', data: { name: 'Test Product 2', category: 'shirts', basePrice: 1500 } },
  { method: 'PUT', path: '/products/test-id', description: 'Update product', data: { name: 'Updated Product' } },
  { method: 'DELETE', path: '/products/test-id', description: 'Delete product' },
  
  // Order status updates
  { method: 'PUT', path: '/orders/test-order-id/status', description: 'Update order status', data: { status: 'PROCESSING' } }
]

async function testAdminSecurity() {
  try {
    console.log('🔒 Testing Admin Security - All endpoints should be protected\n')

    // 1. Test without authentication
    console.log('1. Testing endpoints without authentication (should all fail)...')
    let unauthenticatedFailures = 0
    
    for (const endpoint of ADMIN_ENDPOINTS) {
      try {
        const config = {
          method: endpoint.method.toLowerCase(),
          url: `${API_BASE}${endpoint.path}`,
          ...(endpoint.data && { data: endpoint.data })
        }
        
        await axios(config)
        console.log(`❌ ${endpoint.method} ${endpoint.path} - SECURITY ISSUE: Allowed without auth`)
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`✅ ${endpoint.method} ${endpoint.path} - Properly rejected (401)`)
          unauthenticatedFailures++
        } else {
          console.log(`⚠️  ${endpoint.method} ${endpoint.path} - Unexpected error: ${error.response?.status}`)
        }
      }
    }
    
    console.log(`\n   Result: ${unauthenticatedFailures}/${ADMIN_ENDPOINTS.length} endpoints properly reject unauthenticated requests\n`)

    // 2. Test with customer authentication (should fail for admin endpoints)
    console.log('2. Testing endpoints with customer authentication (should fail for admin endpoints)...')
    
    let customerToken = null
    try {
      const customerLogin = await axios.post(`${API_BASE}/auth/login`, {
        email: CUSTOMER_EMAIL,
        password: CUSTOMER_PASSWORD
      })
      customerToken = customerLogin.data.token
      console.log('   ✅ Customer login successful')
    } catch (error) {
      console.log('   ⚠️  Customer login failed - creating customer account...')
      try {
        await axios.post(`${API_BASE}/auth/register`, {
          email: CUSTOMER_EMAIL,
          password: CUSTOMER_PASSWORD,
          name: 'Test Customer'
        })
        const customerLogin = await axios.post(`${API_BASE}/auth/login`, {
          email: CUSTOMER_EMAIL,
          password: CUSTOMER_PASSWORD
        })
        customerToken = customerLogin.data.token
        console.log('   ✅ Customer account created and logged in')
      } catch (createError) {
        console.log('   ❌ Could not create customer account, skipping customer auth tests')
      }
    }

    if (customerToken) {
      const customerHeaders = { Authorization: `Bearer ${customerToken}` }
      let customerRejections = 0
      
      for (const endpoint of ADMIN_ENDPOINTS) {
        try {
          const config = {
            method: endpoint.method.toLowerCase(),
            url: `${API_BASE}${endpoint.path}`,
            headers: customerHeaders,
            ...(endpoint.data && { data: endpoint.data })
          }
          
          await axios(config)
          console.log(`❌ ${endpoint.method} ${endpoint.path} - SECURITY ISSUE: Allowed with customer auth`)
        } catch (error) {
          if (error.response?.status === 403) {
            console.log(`✅ ${endpoint.method} ${endpoint.path} - Properly rejected customer (403)`)
            customerRejections++
          } else if (error.response?.status === 401) {
            console.log(`✅ ${endpoint.method} ${endpoint.path} - Rejected (401)`)
            customerRejections++
          } else {
            console.log(`⚠️  ${endpoint.method} ${endpoint.path} - Unexpected error: ${error.response?.status}`)
          }
        }
      }
      
      console.log(`\n   Result: ${customerRejections}/${ADMIN_ENDPOINTS.length} endpoints properly reject customer requests\n`)
    }

    // 3. Test with admin authentication (should succeed)
    console.log('3. Testing endpoints with admin authentication (should succeed)...')
    
    const adminLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    })
    
    const adminToken = adminLogin.data.token
    const adminHeaders = { Authorization: `Bearer ${adminToken}` }
    console.log('   ✅ Admin login successful')
    
    let adminSuccesses = 0
    let adminErrors = 0
    
    for (const endpoint of ADMIN_ENDPOINTS) {
      try {
        const config = {
          method: endpoint.method.toLowerCase(),
          url: `${API_BASE}${endpoint.path}`,
          headers: adminHeaders,
          ...(endpoint.data && { data: endpoint.data })
        }
        
        const response = await axios(config)
        console.log(`✅ ${endpoint.method} ${endpoint.path} - Admin access granted (${response.status})`)
        adminSuccesses++
      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`⚠️  ${endpoint.method} ${endpoint.path} - Not found (404) - endpoint may not exist yet`)
        } else if (error.response?.status === 400) {
          console.log(`⚠️  ${endpoint.method} ${endpoint.path} - Bad request (400) - may need valid data`)
        } else {
          console.log(`❌ ${endpoint.method} ${endpoint.path} - Admin access denied: ${error.response?.status} ${error.response?.data?.error}`)
          adminErrors++
        }
      }
    }
    
    console.log(`\n   Result: ${adminSuccesses} successful, ${adminErrors} errors, ${ADMIN_ENDPOINTS.length - adminSuccesses - adminErrors} expected failures\n`)

    // 4. Test token validation
    console.log('4. Testing token validation...')
    
    // Test with invalid token
    try {
      await axios.get(`${API_BASE}/admin/stats`, {
        headers: { Authorization: 'Bearer invalid-token' }
      })
      console.log('❌ Invalid token was accepted - SECURITY ISSUE')
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid token properly rejected')
      }
    }
    
    // Test with malformed token
    try {
      await axios.get(`${API_BASE}/admin/stats`, {
        headers: { Authorization: 'InvalidFormat token' }
      })
      console.log('❌ Malformed token was accepted - SECURITY ISSUE')
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Malformed token properly rejected')
      }
    }

    console.log('\n🎉 Admin security testing completed!')
    console.log('\n📋 Summary:')
    console.log('- All admin endpoints should reject unauthenticated requests (401)')
    console.log('- All admin endpoints should reject customer requests (403)')
    console.log('- All admin endpoints should accept valid admin requests')
    console.log('- Invalid tokens should be rejected (401)')

  } catch (error) {
    console.error('❌ Security test failed:', error.response?.data?.error || error.message)
    
    if (error.response?.status === 401) {
      console.log('\n💡 Make sure you have the correct admin credentials')
      console.log('   Run: npm run ensure-admin')
    }
    
    process.exit(1)
  }
}

// Run the test
testAdminSecurity()