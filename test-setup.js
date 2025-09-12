#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing project setup...\n');

try {
  // Test if we can build the TypeScript
  console.log('📝 Testing TypeScript compilation...');
  
  // Check client TypeScript
  process.chdir('client');
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('✅ Client TypeScript compiles successfully');
  
  // Check server TypeScript
  process.chdir('../server');
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('✅ Server TypeScript compiles successfully');
  
  process.chdir('..');
  
  console.log('\n✅ All tests passed! The project is ready to run.');
  console.log('\nTo start the development server:');
  console.log('npm run dev');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.log('\nTry running the setup again:');
  console.log('npm run setup');
  process.exit(1);
}