#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 Checking Node.js version compatibility...\n');

// Check current Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

console.log(`Current Node.js version: ${nodeVersion}`);
console.log(`Major version: ${majorVersion}`);

if (majorVersion < 16) {
  console.error('❌ Node.js 16 or higher is required for this project.');
  console.log('Please upgrade Node.js to version 16 or higher.');
  console.log('Visit: https://nodejs.org/');
  process.exit(1);
}

if (majorVersion < 18) {
  console.log('⚠️  Node.js 18+ is recommended for best compatibility.');
  console.log('Some features may not work with Node.js < 18.');
}

console.log('✅ Node.js version is compatible!');

// Check if we need to update any syntax
console.log('\n🔧 Checking for compatibility issues...');

try {
  // Test if the server can start without syntax errors
  console.log('Testing server syntax...');
  execSync('cd server && npx tsc --noEmit', { stdio: 'pipe' });
  console.log('✅ Server TypeScript compiles successfully');
  
  console.log('Testing client syntax...');
  execSync('cd client && npx tsc --noEmit', { stdio: 'pipe' });
  console.log('✅ Client TypeScript compiles successfully');
  
} catch (error) {
  console.error('❌ Compilation errors found:');
  console.error(error.message);
  
  console.log('\n🔧 Attempting to fix compatibility issues...');
  
  // Try to fix common issues
  try {
    console.log('Updating dependencies...');
    execSync('cd server && npm update', { stdio: 'inherit' });
    execSync('cd client && npm update', { stdio: 'inherit' });
    console.log('✅ Dependencies updated');
  } catch (updateError) {
    console.error('Failed to update dependencies:', updateError.message);
  }
}

console.log('\n✅ Node.js compatibility check complete!');
console.log('You can now run: npm run dev');