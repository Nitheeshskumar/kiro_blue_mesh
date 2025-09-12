#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Installing missing dependencies...\n');

try {
  // Check if node_modules exists in client
  const clientNodeModules = path.join(__dirname, 'client', 'node_modules');
  if (!fs.existsSync(clientNodeModules)) {
    console.log('📦 Client node_modules not found, installing all dependencies...');
    execSync('cd client && npm install', { stdio: 'inherit' });
  }

  // Force install react-router-dom specifically
  console.log('📦 Installing react-router-dom...');
  execSync('cd client && npm install react-router-dom@^6.8.1', { stdio: 'inherit' });

  // Install types
  console.log('📦 Installing TypeScript types...');
  execSync('cd client && npm install --save-dev @types/react-router-dom', { stdio: 'inherit' });

  // Install other potentially missing packages
  console.log('📦 Installing other dependencies...');
  execSync('cd client && npm install lucide-react axios zustand', { stdio: 'inherit' });

  console.log('\n✅ All dependencies installed successfully!');
  console.log('Now try running: npm run dev');

} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  console.log('\nTry running manually:');
  console.log('cd client && npm install');
  console.log('cd client && npm install react-router-dom');
  process.exit(1);
}