#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Netlify Functions locally...\n');

// Test 1: Check if functions exist
console.log('1. Checking function files...');
const functionFiles = [
  'netlify/functions/api.ts',
  'netlify/functions/test.ts',
  'netlify/functions/debug.ts',
  'netlify/functions/lib/database.ts',
  'netlify/functions/routes/auth.ts'
];

let allFilesExist = true;
for (const file of functionFiles) {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
}

// Test 2: Check function dependencies
console.log('\n2. Checking function dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('netlify/functions/package.json', 'utf8'));
  const requiredDeps = ['@netlify/functions', 'express', 'serverless-http', 'bcryptjs', 'jsonwebtoken'];
  
  for (const dep of requiredDeps) {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`   ✅ ${dep}`);
    } else {
      console.log(`   ❌ ${dep} - MISSING`);
      allFilesExist = false;
    }
  }
} catch (error) {
  console.log('   ❌ Error reading function package.json:', error.message);
  allFilesExist = false;
}

// Test 3: Try to import the database
console.log('\n3. Testing database import...');
try {
  // This is a basic syntax check
  const dbContent = fs.readFileSync('netlify/functions/lib/database.ts', 'utf8');
  if (dbContent.includes('export class Database') && dbContent.includes('export const db')) {
    console.log('   ✅ Database class and export found');
  } else {
    console.log('   ❌ Database class or export missing');
    allFilesExist = false;
  }
} catch (error) {
  console.log('   ❌ Error reading database file:', error.message);
  allFilesExist = false;
}

// Test 4: Check auth route
console.log('\n4. Testing auth route...');
try {
  const authContent = fs.readFileSync('netlify/functions/routes/auth.ts', 'utf8');
  if (authContent.includes('router.post(\'/login\'') && authContent.includes('router.post(\'/register\'')) {
    console.log('   ✅ Login and register routes found');
  } else {
    console.log('   ❌ Login or register routes missing');
    allFilesExist = false;
  }
} catch (error) {
  console.log('   ❌ Error reading auth route:', error.message);
  allFilesExist = false;
}

// Test 5: Check main API function
console.log('\n5. Testing main API function...');
try {
  const apiContent = fs.readFileSync('netlify/functions/api.ts', 'utf8');
  if (apiContent.includes('export const handler') && apiContent.includes('serverless-http')) {
    console.log('   ✅ Handler export and serverless-http found');
  } else {
    console.log('   ❌ Handler export or serverless-http missing');
    allFilesExist = false;
  }
} catch (error) {
  console.log('   ❌ Error reading API function:', error.message);
  allFilesExist = false;
}

console.log('\n' + '='.repeat(50));
if (allFilesExist) {
  console.log('🎉 All function tests passed!');
  console.log('\n📋 Next steps to debug 404:');
  console.log('1. Check Netlify build logs for compilation errors');
  console.log('2. Verify environment variables are set');
  console.log('3. Test these URLs after deployment:');
  console.log('   - https://your-site.netlify.app/.netlify/functions/test');
  console.log('   - https://your-site.netlify.app/.netlify/functions/debug');
  console.log('   - https://your-site.netlify.app/.netlify/functions/api/health');
  console.log('4. Check function logs in Netlify dashboard');
} else {
  console.log('❌ Some function tests failed. Fix the issues above first.');
}

console.log('\n📖 For detailed troubleshooting, see: TROUBLESHOOT-404.md');