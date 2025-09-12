#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking installed dependencies...\n');

const clientNodeModules = path.join(__dirname, 'client', 'node_modules');
const serverNodeModules = path.join(__dirname, 'server', 'node_modules');

// Check if node_modules exist
console.log('📁 Node modules directories:');
console.log(`Client: ${fs.existsSync(clientNodeModules) ? '✅ EXISTS' : '❌ MISSING'}`);
console.log(`Server: ${fs.existsSync(serverNodeModules) ? '✅ EXISTS' : '❌ MISSING'}`);

// Check specific packages
const packagesToCheck = [
  'react',
  'react-dom', 
  'react-router-dom',
  'lucide-react',
  'axios',
  'zustand'
];

console.log('\n📦 Client packages:');
packagesToCheck.forEach(pkg => {
  const pkgPath = path.join(clientNodeModules, pkg);
  const exists = fs.existsSync(pkgPath);
  console.log(`${pkg}: ${exists ? '✅ INSTALLED' : '❌ MISSING'}`);
});

// Check types
const typesToCheck = [
  '@types/react',
  '@types/react-dom',
  '@types/react-router-dom',
  '@types/node'
];

console.log('\n🔧 TypeScript types:');
typesToCheck.forEach(pkg => {
  const pkgPath = path.join(clientNodeModules, pkg);
  const exists = fs.existsSync(pkgPath);
  console.log(`${pkg}: ${exists ? '✅ INSTALLED' : '❌ MISSING'}`);
});

console.log('\n💡 If packages are missing, run: npm run install-deps');