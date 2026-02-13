#!/usr/bin/env node

const axios = require('axios')

const API_BASE = 'http://localhost:8888/.netlify/functions/api'

// Test admin credentials (you'll need to use actual admin credentials)
const ADMIN_EMAIL = 'admin@willowbrook.com'
const ADMIN_PASSWORD = 'admin123'

async function testUserManagement() {
  try {
    console.log('🧪 Testing User Management API...\n')

    // 1. Login as admin
    console.log('1. Logging in as admin...')
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    })

    const token = loginResponse.data.token
    const headers = { Authorization: `Bearer ${token}` }
    console.log('✅ Admin login successful\n')

    // 2. Get current users
    console.log('2. Fetching current users...')
    const usersResponse = await axios.get(`${API_BASE}/admin/users`, { headers })
    console.log(`✅ Found ${usersResponse.data.users.length} users\n`)

    // 3. Create a new admin user
    console.log('3. Creating new admin user...')
    const newUser = {
      email: 'test-admin@willowbrook.com',
      name: 'Test Admin',
      password: 'testpass123',
      role: 'ADMIN'
    }

    try {
      const createResponse = await axios.post(`${API_BASE}/admin/users`, newUser, { headers })
      console.log('✅ New admin user created:', createResponse.data.email)
      
      const newUserId = createResponse.data.id

      // 4. Verify user was created
      console.log('4. Verifying user creation...')
      const updatedUsersResponse = await axios.get(`${API_BASE}/admin/users`, { headers })
      const createdUser = updatedUsersResponse.data.users.find(u => u.id === newUserId)
      
      if (createdUser) {
        console.log('✅ User verification successful')
        console.log(`   - Name: ${createdUser.name}`)
        console.log(`   - Email: ${createdUser.email}`)
        console.log(`   - Role: ${createdUser.role}\n`)

        // 5. Delete the test user
        console.log('5. Cleaning up - deleting test user...')
        await axios.delete(`${API_BASE}/admin/users/${newUserId}`, { headers })
        console.log('✅ Test user deleted successfully\n')
      } else {
        console.log('❌ User verification failed - user not found\n')
      }

    } catch (createError) {
      if (createError.response?.status === 409) {
        console.log('⚠️  User already exists, skipping creation test\n')
      } else {
        throw createError
      }
    }

    console.log('🎉 All user management tests completed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.error || error.message)
    
    if (error.response?.status === 401) {
      console.log('\n💡 Make sure you have the correct admin credentials in the test script')
      console.log('   You may need to create an admin user first or check your login details')
    }
    
    process.exit(1)
  }
}

// Run the test
testUserManagement()