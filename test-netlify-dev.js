#!/usr/bin/env node

/**
 * Test login with actual HTTP request to Netlify Dev
 * Make sure Netlify Dev is running first: npm run dev:netlify
 */

const http = require('http');

async function testLogin() {
  console.log('🧪 Testing Login via HTTP\n');
  console.log('Make sure Netlify Dev is running on port 8888!\n');
  
  const postData = JSON.stringify({
    email: 'admin@willowbrook.com',
    password: 'secret123'
  });
  
  const options = {
    hostname: 'localhost',
    port: 8888,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log('Response Status:', res.statusCode);
      console.log('Response Headers:', res.headers);
      console.log('');
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 200 && response.token) {
            console.log('✅ Login successful!');
            console.log('Token:', response.token.substring(0, 30) + '...');
            console.log('User:', response.user);
          } else {
            console.log('❌ Login failed!');
            console.log('Response:', response);
          }
          
          resolve(response);
        } catch (error) {
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      console.error('');
      console.error('Make sure Netlify Dev is running:');
      console.error('  npm run dev:netlify');
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

testLogin()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
