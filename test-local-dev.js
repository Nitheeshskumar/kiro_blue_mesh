#!/usr/bin/env node

/**
 * Test Local Development Setup
 * Verifies that Netlify Dev is configured correctly
 */

const http = require('http');

console.log('🧪 Testing Local Development Setup\n');

// Test configuration
const tests = [
  {
    name: 'Netlify Dev Health Check',
    url: 'http://localhost:8888/.netlify/functions/api/health',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'API Redirect Test',
    url: 'http://localhost:8888/api/health',
    method: 'GET',
    expectedStatus: 200
  }
];

function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      console.log(`  URL: ${test.url}`);
      
      const result = await makeRequest(test.url, test.method);
      
      if (result.status === test.expectedStatus) {
        console.log(`  ✅ PASSED (Status: ${result.status})`);
        passed++;
      } else {
        console.log(`  ❌ FAILED (Expected: ${test.expectedStatus}, Got: ${result.status})`);
        failed++;
      }
      
      console.log('');
    } catch (error) {
      console.log(`  ❌ FAILED (${error.message})`);
      console.log('');
      failed++;
    }
  }

  console.log('─'.repeat(50));
  console.log(`\n📊 Test Results:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📝 Total:  ${tests.length}\n`);

  if (failed === 0) {
    console.log('🎉 All tests passed! Local development is ready.\n');
    console.log('Next steps:');
    console.log('  1. Run: npm run dev');
    console.log('  2. Open: http://localhost:3000');
    console.log('  3. Test login and product browsing\n');
  } else {
    console.log('⚠️  Some tests failed. Make sure:');
    console.log('  1. Netlify Dev is running (npm run dev:netlify)');
    console.log('  2. Environment variables are set in .env');
    console.log('  3. Functions are built (npm run build:functions)\n');
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Check if server is running first
console.log('Checking if Netlify Dev is running...\n');

makeRequest('http://localhost:8888/.netlify/functions/api/health')
  .then(() => {
    console.log('✅ Netlify Dev is running!\n');
    return runTests();
  })
  .catch((error) => {
    console.log('❌ Netlify Dev is not running.\n');
    console.log('Please start it first:');
    console.log('  npm run dev:netlify\n');
    console.log('Or start both client and server:');
    console.log('  npm run dev\n');
    process.exit(1);
  });
