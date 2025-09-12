#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 Fixing react-router-dom types...\n');

try {
  // Install the actual react-router-dom package first
  console.log('📦 Installing react-router-dom package...');
  execSync('cd client && npm install react-router-dom@^6.8.1', { stdio: 'inherit' });
  
  // Install missing types
  console.log('📦 Installing @types/react-router-dom...');
  execSync('cd client && npm install --save-dev @types/react-router-dom', { stdio: 'inherit' });
  
  // Also ensure other types are up to date
  console.log('📦 Updating other type packages...');
  execSync('cd client && npm install --save-dev @types/react @types/react-dom @types/node', { stdio: 'inherit' });
  
  console.log('\n✅ React Router installed successfully!');
  console.log('Now try running: npm run dev');

} catch (error) {
  console.error('❌ Failed to install packages:', error.message);
  console.log('\nTry running manually:');
  console.log('cd client && npm install react-router-dom');
  console.log('cd client && npm install --save-dev @types/react-router-dom');
  process.exit(1);
}