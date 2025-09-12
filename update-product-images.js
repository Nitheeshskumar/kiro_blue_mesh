#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🖼️  Updating product images with better previews...\n');

try {
  // Re-run the seed to update existing products with better images
  console.log('📦 Updating product images...');
  execSync('cd server && npm run db:seed', { stdio: 'inherit' });
  
  console.log('\n✅ Product images updated successfully!');
  console.log('🎨 Your products now have better preview images');
  console.log('🛒 Cart and checkout pages will show proper product images');
  
} catch (error) {
  console.error('❌ Failed to update product images:', error.message);
  console.log('\nTry running manually:');
  console.log('cd server && npm run db:seed');
}