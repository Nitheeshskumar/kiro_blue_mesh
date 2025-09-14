#!/usr/bin/env node

const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function makePostRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        status: 'ERROR',
        error: error.message
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        status: 'TIMEOUT',
        error: 'Request timed out'
      });
    });

    req.write(postData);
    req.end();
  });
}

async function testLogin() {
  console.log('🔐 Testing Login API Endpoint\n');
  
  rl.question('Enter your Netlify site URL (e.g., https://your-site.netlify.app): ', async (siteUrl) => {
    if (!siteUrl.startsWith('http')) {
      console.log('❌ Please enter a valid URL starting with https://');
      rl.close();
      return;
    }
    
    const loginUrl = `${siteUrl}/.netlify/functions/api/auth/login`;
    console.log(`\n🎯 Testing login at: ${loginUrl}\n`);
    
    // Test with admin credentials
    console.log('📝 Testing with admin credentials...');
    const loginData = {
      email: 'admin@willowbrook.com',
      password: 'secret123'
    };
    
    console.log('📤 Sending POST request with:', JSON.stringify(loginData, null, 2));
    
    const result = await makePostRequest(loginUrl, loginData);
    
    console.log('\n📥 Response:');
    console.log(`Status: ${result.status}`);
    
    if (result.status === 200) {
      console.log('✅ SUCCESS - Login worked!');
      try {
        const response = JSON.parse(result.data);
        console.log('👤 User:', response.user);
        console.log('🔑 Token received:', response.token ? 'Yes' : 'No');
      } catch (e) {
        console.log('📄 Raw response:', result.data);
      }
    } else if (result.status === 404) {
      console.log('❌ FAILED - 404 Not Found');
      console.log('💡 The API endpoint is not deployed or routing is broken');
    } else if (result.status === 500) {
      console.log('❌ FAILED - 500 Internal Server Error');
      console.log('💡 Check Netlify function logs for the error details');
      try {
        const response = JSON.parse(result.data);
        console.log('📄 Error details:', response);
      } catch (e) {
        console.log('📄 Raw error:', result.data);
      }
    } else if (result.status === 'ERROR') {
      console.log('❌ FAILED - Network Error:', result.error);
    } else if (result.status === 'TIMEOUT') {
      console.log('⏰ TIMEOUT - Function took too long');
    } else {
      console.log(`📊 Status: ${result.status}`);
      try {
        const response = JSON.parse(result.data);
        console.log('📄 Response:', JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('📄 Raw response:', result.data);
      }
    }
    
    // Test with invalid credentials
    console.log('\n📝 Testing with invalid credentials...');
    const invalidData = {
      email: 'test@test.com',
      password: 'wrongpassword'
    };
    
    const invalidResult = await makePostRequest(loginUrl, invalidData);
    console.log(`Status: ${invalidResult.status}`);
    
    if (invalidResult.status === 401) {
      console.log('✅ GOOD - Returns 401 for invalid credentials');
    } else if (invalidResult.status === 404) {
      console.log('❌ Still getting 404 - API routing is broken');
    } else {
      console.log('📄 Response:', invalidResult.data?.substring(0, 200));
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    
    if (result.status === 404) {
      console.log('❌ API endpoint not found - deployment issue');
      console.log('🔧 Check:');
      console.log('   1. Netlify build logs');
      console.log('   2. Functions are in netlify/functions directory');
      console.log('   3. Build command includes function compilation');
    } else if (result.status === 500) {
      console.log('❌ Server error - runtime issue');
      console.log('🔧 Check:');
      console.log('   1. Netlify function logs');
      console.log('   2. Environment variables (JWT_SECRET)');
      console.log('   3. Database connection issues');
    } else if (result.status === 200) {
      console.log('✅ API is working perfectly!');
      console.log('💡 If you\'re still getting 404 in the app:');
      console.log('   1. Check client-side API configuration');
      console.log('   2. Verify the request URL in browser dev tools');
      console.log('   3. Check for CORS issues');
    } else {
      console.log(`⚠️  Unexpected status: ${result.status}`);
      console.log('💡 Check the response details above');
    }
    
    rl.close();
  });
}

testLogin().catch(console.error);