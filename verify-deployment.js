#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Function to make HTTP request
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data
        });
      });
    }).on('error', reject);
  });
}

async function verifyDeployment(baseUrl) {
  console.log(`🔍 Verifying deployment at: ${baseUrl}\n`);

  const endpoints = [
    { path: '/api/health', name: 'Health Check' },
    { path: '/api/products', name: 'Products API' },
    { path: '/', name: 'Frontend' }
  ];

  let allPassed = true;

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name}...`);
      const response = await makeRequest(`${baseUrl}${endpoint.path}`);
      
      if (response.status === 200) {
        console.log(`   ✅ ${endpoint.name} - Status: ${response.status}`);
      } else if (response.status === 401 && endpoint.path.includes('/api/')) {
        console.log(`   ✅ ${endpoint.name} - Status: ${response.status} (Auth required - OK)`);
      } else {
        console.log(`   ⚠️  ${endpoint.name} - Status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.name} - Error: ${error.message}`);
      allPassed = false;
    }
  }

  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('🎉 Deployment verification completed!');
    console.log('\n🔗 Your app is live at:', baseUrl);
    console.log('📱 Try these features:');
    console.log('   • Browse products');
    console.log('   • Create an account');
    console.log('   • Customize clothing');
    console.log('   • Place orders');
  } else {
    console.log('⚠️  Some endpoints may have issues. Check the logs above.');
  }
}

// Get URL from command line argument
const url = process.argv[2];

if (!url) {
  console.log('Usage: node verify-deployment.js <your-netlify-url>');
  console.log('Example: node verify-deployment.js https://your-site.netlify.app');
  process.exit(1);
}

verifyDeployment(url).catch(console.error);