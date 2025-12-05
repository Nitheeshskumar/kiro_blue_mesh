#!/usr/bin/env node

/**
 * Test API routing with Netlify Functions
 */

require('dotenv').config();

async function testRouting() {
  console.log('🧪 Testing API Routing\n');
  
  // Simulate what Netlify does
  const { handler } = require('./netlify/functions/dist/api.js');
  
  // Test 1: Health check
  console.log('Test 1: Health Check');
  const healthEvent = {
    httpMethod: 'GET',
    path: '/.netlify/functions/api/health',
    headers: {},
    body: null,
    isBase64Encoded: false
  };
  
  const healthContext = {
    callbackWaitsForEmptyEventLoop: false
  };
  
  try {
    const healthResult = await handler(healthEvent, healthContext);
    console.log('✓ Status:', healthResult.statusCode);
    console.log('✓ Body:', healthResult.body);
    console.log('');
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
  
  // Test 2: Login endpoint
  console.log('Test 2: Login Endpoint');
  const loginEvent = {
    httpMethod: 'POST',
    path: '/.netlify/functions/api/auth/login',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@willowbrook.com',
      password: 'secret123'
    }),
    isBase64Encoded: false
  };
  
  const loginContext = {
    callbackWaitsForEmptyEventLoop: false
  };
  
  try {
    const loginResult = await handler(loginEvent, loginContext);
    console.log('✓ Status:', loginResult.statusCode);
    const body = JSON.parse(loginResult.body);
    if (body.token) {
      console.log('✓ Login successful!');
      console.log('✓ Token:', body.token.substring(0, 20) + '...');
      console.log('✓ User:', body.user.email);
    } else {
      console.log('❌ Response:', body);
    }
    console.log('');
  } catch (error) {
    console.error('❌ Login test failed:', error.message);
    console.error(error);
  }
  
  console.log('✅ Routing tests complete!');
}

testRouting().catch(console.error);
