#!/usr/bin/env node

const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    request.on('error', (error) => {
      resolve({
        status: 'ERROR',
        error: error.message
      });
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      resolve({
        status: 'TIMEOUT',
        error: 'Request timed out'
      });
    });
  });
}

async function testEndpoint(url, description) {
  console.log(`\n🔍 Testing: ${description}`);
  console.log(`URL: ${url}`);
  
  const result = await makeRequest(url);
  
  if (result.status === 200) {
    console.log('✅ SUCCESS - Status: 200');
    try {
      const json = JSON.parse(result.data);
      console.log('📄 Response:', JSON.stringify(json, null, 2));
    } catch {
      console.log('📄 Response (text):', result.data.substring(0, 200));
    }
  } else if (result.status === 404) {
    console.log('❌ FAILED - Status: 404 Not Found');
    console.log('💡 This means the function is not deployed or the route is wrong');
  } else if (result.status === 'ERROR') {
    console.log('❌ FAILED - Network Error:', result.error);
  } else if (result.status === 'TIMEOUT') {
    console.log('⏰ TIMEOUT - Function took too long to respond');
  } else {
    console.log(`⚠️  Status: ${result.status}`);
    console.log('📄 Response:', result.data.substring(0, 200));
  }
  
  return result.status === 200;
}

async function diagnoseDeployment() {
  console.log('🔧 Netlify Deployment Diagnostics\n');
  
  rl.question('Enter your Netlify site URL (e.g., https://your-site.netlify.app): ', async (siteUrl) => {
    if (!siteUrl.startsWith('http')) {
      console.log('❌ Please enter a valid URL starting with https://');
      rl.close();
      return;
    }
    
    console.log(`\n🎯 Testing deployment at: ${siteUrl}\n`);
    
    // Test 1: Basic site
    const siteWorks = await testEndpoint(siteUrl, 'Frontend Site');
    
    // Test 2: Simple function
    const testWorks = await testEndpoint(`${siteUrl}/.netlify/functions/test`, 'Test Function');
    
    // Test 3: Debug function
    const debugWorks = await testEndpoint(`${siteUrl}/.netlify/functions/debug`, 'Debug Function');
    
    // Test 4: API health check
    const healthWorks = await testEndpoint(`${siteUrl}/.netlify/functions/api/health`, 'API Health Check');
    
    // Test 5: Login endpoint (should return error but not 404)
    console.log(`\n🔍 Testing: Login Endpoint (POST)`);
    console.log(`URL: ${siteUrl}/.netlify/functions/api/auth/login`);
    console.log('📝 Note: This will likely return an error (missing body) but should NOT be 404');
    
    const loginResult = await makeRequest(`${siteUrl}/.netlify/functions/api/auth/login`);
    if (loginResult.status === 404) {
      console.log('❌ FAILED - Status: 404 Not Found');
      console.log('💡 The API routing is not working');
    } else if (loginResult.status === 405) {
      console.log('✅ GOOD - Status: 405 Method Not Allowed (GET instead of POST)');
      console.log('💡 The route exists but needs POST request');
    } else {
      console.log(`📊 Status: ${loginResult.status}`);
      console.log('📄 Response:', loginResult.data?.substring(0, 200));
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 DIAGNOSIS SUMMARY');
    console.log('='.repeat(60));
    
    if (!siteWorks) {
      console.log('❌ Frontend site is not working - check basic deployment');
    } else if (!testWorks && !debugWorks) {
      console.log('❌ Netlify Functions are not deployed at all');
      console.log('💡 Check build logs for function compilation errors');
    } else if (!healthWorks) {
      console.log('❌ Main API function is not working');
      console.log('💡 Check function logs in Netlify dashboard');
    } else if (loginResult.status === 404) {
      console.log('❌ API routing is broken');
      console.log('💡 Check the Express route setup in api.ts');
    } else {
      console.log('✅ Functions are deployed and API routing works!');
      console.log('💡 The 404 error might be:');
      console.log('   - Missing environment variables (JWT_SECRET)');
      console.log('   - CORS issues');
      console.log('   - Client-side request problems');
    }
    
    console.log('\n🔧 Next Steps:');
    if (!testWorks) {
      console.log('1. Check Netlify build logs for errors');
      console.log('2. Verify functions directory is set to "netlify/functions"');
      console.log('3. Make sure build command is "npm run build:netlify"');
    } else if (!healthWorks) {
      console.log('1. Check Netlify function logs for runtime errors');
      console.log('2. Verify all dependencies are installed');
      console.log('3. Check for TypeScript compilation errors');
    } else {
      console.log('1. Check environment variables in Netlify dashboard');
      console.log('2. Test login with proper POST request and body');
      console.log('3. Check browser dev tools for client-side errors');
    }
    
    rl.close();
  });
}

diagnoseDeployment().catch(console.error);