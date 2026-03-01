#!/usr/bin/env node

const fetch = require('node-fetch');

async function testImageProxy() {
  console.log('🧪 Testing Image Proxy Direct...\n');

  const testUrl = 'https://frbdhevxgofuvnrcbcvi.supabase.co/storage/v1/object/public/product-images/products/1772382019138-5dxjhlt1jq3.PNG';
  const proxyUrl = `http://localhost:3000/.netlify/functions/image-proxy?url=${encodeURIComponent(testUrl)}&t=${Date.now()}`;

  console.log('Original URL:', testUrl);
  console.log('Proxy URL:', proxyUrl);
  console.log('');

  try {
    console.log('1. Testing direct Supabase URL...');
    const directResponse = await fetch(testUrl);
    console.log('   Status:', directResponse.status, directResponse.statusText);
    console.log('   Content-Type:', directResponse.headers.get('content-type'));
    console.log('   Content-Length:', directResponse.headers.get('content-length'));
    console.log('   ETag:', directResponse.headers.get('etag'));
    console.log('');

    console.log('2. Testing proxy URL...');
    const proxyResponse = await fetch(proxyUrl, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    console.log('   Status:', proxyResponse.status, proxyResponse.statusText);
    console.log('   Content-Type:', proxyResponse.headers.get('content-type'));
    console.log('   Content-Length:', proxyResponse.headers.get('content-length'));
    console.log('   X-Proxy-Source:', proxyResponse.headers.get('x-proxy-source'));
    console.log('');

    if (proxyResponse.status === 200) {
      console.log('✅ Proxy is working correctly!');
      
      // Test if it's actually returning image data
      const contentType = proxyResponse.headers.get('content-type');
      if (contentType && contentType.startsWith('image/')) {
        console.log('✅ Response contains image data');
      } else {
        console.log('⚠️  Response might not contain image data');
        const text = await proxyResponse.text();
        console.log('   Response body preview:', text.substring(0, 200));
      }
    } else if (proxyResponse.status === 304) {
      console.log('⚠️  Proxy returned 304 Not Modified');
      console.log('   This means caching is working, but browser should show cached image');
    } else {
      console.log('❌ Proxy returned error status');
      const text = await proxyResponse.text();
      console.log('   Error response:', text);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testImageProxy();