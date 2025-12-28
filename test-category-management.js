#!/usr/bin/env node

/**
 * Test script for category management functionality
 * This script tests the category CRUD operations
 */

const axios = require('axios')

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:8888/.netlify/functions/api'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@willowbrook.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

let authToken = null

async function login() {
  try {
    console.log('🔐 Logging in as admin...')
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    })
    
    authToken = response.data.token
    console.log('✅ Login successful')
    return true
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.error || error.message)
    return false
  }
}

async function testGetCategories() {
  try {
    console.log('\n📋 Testing: Get all categories...')
    const response = await axios.get(`${BASE_URL}/admin/categories`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    
    console.log(`✅ Found ${response.data.length} categories`)
    response.data.forEach(cat => {
      console.log(`   - ${cat.icon} ${cat.name} (${cat.productCount} products)`)
    })
    return response.data
  } catch (error) {
    console.error('❌ Get categories failed:', error.response?.data?.error || error.message)
    return []
  }
}

async function testCreateCategory() {
  try {
    console.log('\n➕ Testing: Create new category...')
    const newCategory = {
      name: 'Test Category',
      description: 'This is a test category for automated testing',
      icon: '🧪'
    }
    
    const response = await axios.post(`${BASE_URL}/admin/categories`, newCategory, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    
    console.log('✅ Category created successfully')
    console.log(`   - ID: ${response.data.id}`)
    console.log(`   - Name: ${response.data.name}`)
    console.log(`   - Slug: ${response.data.slug}`)
    return response.data
  } catch (error) {
    console.error('❌ Create category failed:', error.response?.data?.error || error.message)
    return null
  }
}

async function testUpdateCategory(categoryId) {
  try {
    console.log('\n✏️ Testing: Update category...')
    const updates = {
      name: 'Updated Test Category',
      description: 'This category has been updated by the test script',
      icon: '🔄'
    }
    
    const response = await axios.put(`${BASE_URL}/admin/categories/${categoryId}`, updates, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    
    console.log('✅ Category updated successfully')
    console.log(`   - New name: ${response.data.name}`)
    console.log(`   - New icon: ${response.data.icon}`)
    return response.data
  } catch (error) {
    console.error('❌ Update category failed:', error.response?.data?.error || error.message)
    return null
  }
}

async function testDeleteCategory(categoryId) {
  try {
    console.log('\n🗑️ Testing: Delete category...')
    await axios.delete(`${BASE_URL}/admin/categories/${categoryId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    
    console.log('✅ Category deleted successfully')
    return true
  } catch (error) {
    console.error('❌ Delete category failed:', error.response?.data?.error || error.message)
    return false
  }
}

async function testPublicCategoriesEndpoint() {
  try {
    console.log('\n🌐 Testing: Public categories endpoint...')
    const response = await axios.get(`${BASE_URL}/categories`)
    
    console.log(`✅ Public endpoint returned ${response.data.length} categories`)
    return response.data
  } catch (error) {
    console.error('❌ Public categories failed:', error.response?.data?.error || error.message)
    return []
  }
}

async function runTests() {
  console.log('🚀 Starting Category Management Tests')
  console.log('=====================================')
  
  // Login
  const loginSuccess = await login()
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without admin authentication')
    process.exit(1)
  }
  
  // Test getting categories
  const initialCategories = await testGetCategories()
  
  // Test creating a category
  const newCategory = await testCreateCategory()
  if (!newCategory) {
    console.log('\n❌ Cannot proceed without successful category creation')
    process.exit(1)
  }
  
  // Test updating the category
  await testUpdateCategory(newCategory.id)
  
  // Test getting categories again to see the changes
  await testGetCategories()
  
  // Test public endpoint
  await testPublicCategoriesEndpoint()
  
  // Clean up - delete the test category
  await testDeleteCategory(newCategory.id)
  
  // Final check
  await testGetCategories()
  
  console.log('\n🎉 All tests completed!')
  console.log('=====================================')
}

// Run the tests
runTests().catch(error => {
  console.error('💥 Test suite failed:', error.message)
  process.exit(1)
})