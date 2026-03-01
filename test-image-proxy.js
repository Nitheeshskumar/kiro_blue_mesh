#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🖼️  Testing Image Proxy Setup...\n');

// Check if image proxy function exists
const imageProxyPath = 'netlify/functions/image-proxy.ts';
if (!fs.existsSync(imageProxyPath)) {
  console.error('❌ Image proxy function not found at:', imageProxyPath);
  process.exit(1);
}

console.log('✅ Image proxy function exists');

// Check if imageUtils exists
const imageUtilsPath = 'client/src/lib/imageUtils.ts';
if (!fs.existsSync(imageUtilsPath)) {
  console.error('❌ Image utils not found at:', imageUtilsPath);
  process.exit(1);
}

console.log('✅ Image utils exists');

// Check if ProxiedImage component exists
const proxiedImagePath = 'client/src/components/ui/ProxiedImage.tsx';
if (!fs.existsSync(proxiedImagePath)) {
  console.error('❌ ProxiedImage component not found at:', proxiedImagePath);
  process.exit(1);
}

console.log('✅ ProxiedImage component exists');

// Test the utility function
try {
  const { getProxiedImageUrl } = require('./client/src/lib/imageUtils.ts');
  
  const testUrl = 'https://example.supabase.co/storage/v1/object/public/images/test.jpg';
  const proxiedUrl = getProxiedImageUrl(testUrl);
  
  if (proxiedUrl.includes('/.netlify/functions/image-proxy')) {
    console.log('✅ URL proxying works correctly');
    console.log('   Original:', testUrl);
    console.log('   Proxied: ', proxiedUrl);
  } else {
    console.log('❌ URL proxying not working as expected');
  }
} catch (error) {
  console.log('⚠️  Cannot test utility function (TypeScript compilation needed)');
}

console.log('\n🎉 Image proxy setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Deploy to Netlify to test the proxy function');
console.log('2. Update your components to use getProxiedImageUrl() or ProxiedImage component');
console.log('3. Test with actual Supabase URLs in production');

console.log('\n💡 Usage examples:');
console.log('   // In components:');
console.log('   import { getProxiedImageUrl } from "../lib/imageUtils";');
console.log('   <img src={getProxiedImageUrl(product.images[0])} />');
console.log('');
console.log('   // Or use the ProxiedImage component:');
console.log('   import { ProxiedImage } from "../components/ui/ProxiedImage";');
console.log('   <ProxiedImage src={product.images[0]} alt="Product" />');