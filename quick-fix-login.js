#!/usr/bin/env node

/**
 * Quick fix for login issues
 * Run this if you're having trouble logging in
 */

const { execSync } = require('child_process');

console.log('🔧 Quick Login Fix\n');
console.log('This will:');
console.log('1. Rebuild Netlify functions');
console.log('2. Reset admin password');
console.log('3. Test login\n');

try {
  console.log('📦 Step 1: Rebuilding functions...');
  execSync('npm run build:functions', { stdio: 'inherit' });
  console.log('✓ Functions rebuilt\n');
  
  console.log('🔐 Step 2: Resetting admin password...');
  execSync('node reset-admin-password.js', { stdio: 'inherit' });
  console.log('');
  
  console.log('🧪 Step 3: Testing login...');
  execSync('node test-login-local.js', { stdio: 'inherit' });
  console.log('');
  
  console.log('✅ All done! You can now run:');
  console.log('   npm run dev');
  console.log('');
  console.log('Then login with:');
  console.log('   Email: admin@willowbrook.com');
  console.log('   Password: secret123');
  
} catch (error) {
  console.error('\n❌ Fix failed:', error.message);
  process.exit(1);
}
