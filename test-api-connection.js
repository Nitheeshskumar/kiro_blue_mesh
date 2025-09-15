#!/usr/bin/env node

const https = require('https');
const http = require('http');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
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

    req.on('error', (error) => {
      resolve({
        status: 'ERROR',
        error: error.message
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        status: 'TIMEOUT',
        error: 'Request timed out'
      });
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function testAPI() {
  console.log('🔍 Testing API Connection\n');
  
  // Test local development server
  console.log('1. Testing local development server (localhost:5000)...');
  const localResult = await makeRequest('http://localhost:5000/api/health');
  console.log(`   Status: ${localResult.status}`);
  if (localResult.status === 200) {
    console.log('   ✅ Local server is running');
  } else if (localResult.status === 'ERROR') {
    console.log('   ❌ Local server is not running');
    console.log(`   Error: ${localResult.error}`);
  }
  
  // Test Netlify functions (if deployed)
  console.log('\n2. Testing Netlify functions...');
  console.log('   Enter your Netlify site URL when prompted');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('Enter your Netlify site URL (or press Enter to skip): ', async (siteUrl) => {
    if (siteUrl.trim()) {
      const netlifyResult = await makeRequest(`${siteUrl}/.netlify/functions/api/health`);
      console.log(`   Status: ${netlifyResult.status}`);
      if (netlifyResult.status === 200) {
        console.log('   ✅ Netlify functions are working');
      } else {
        console.log('   ❌ Netlify functions are not working');
        console.log(`   Response: ${netlifyResult.data?.substring(0, 200)}`);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 DIAGNOSIS');
    console.log('='.repeat(50));
    
    if (localResult.status === 200) {
      console.log('✅ Local development server is working');
      console.log('💡 For development, make sure to run: npm run dev');
      console.log('💡 This starts both client (port 3000) and server (port 5000)');
    } else {
      console.log('❌ Local development server is not running');
      console.log('🔧 To fix:');
      console.log('   1. Run: npm run dev (starts both client and server)');
      console.log('   2. Or run separately: npm run dev:server');
      console.log('   3. Make sure port 5000 is not blocked');
    }
    
    console.log('\n🌐 For production deployment:');
    console.log('   1. Deploy to Netlify');
    console.log('   2. Set environment variables in Netlify dashboard');
    console.log('   3. API calls will automatically use Netlify functions');
    
    rl.close();
  });
}

testAPI().catch(console.error);