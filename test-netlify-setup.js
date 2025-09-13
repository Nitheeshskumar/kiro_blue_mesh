#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Netlify Functions setup...\n');

// Test 1: Check required files exist
console.log('1. Checking required files...');
const requiredFiles = [
  'netlify.toml',
  'netlify/functions/api.ts',
  'netlify/functions/package.json',
  'netlify/functions/tsconfig.json',
  'netlify/functions/lib/database.ts',
  'netlify/functions/routes/auth.ts',
  'netlify/functions/routes/products.ts',
  'netlify/functions/routes/customizations.ts',
  'netlify/functions/routes/orders.ts',
  'netlify/functions/routes/admin.ts',
  'netlify/functions/middleware/errorHandler.ts'
];

let allFilesExist = true;
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
}

// Test 2: Check package.json structure
console.log('\n2. Checking package.json structure...');
try {
  const packageJson = JSON.parse(fs.readFileSync('netlify/functions/package.json', 'utf8'));
  
  const requiredDeps = [
    '@netlify/functions',
    'express',
    'serverless-http',
    'cors',
    'helmet',
    'bcryptjs',
    'jsonwebtoken'
  ];

  let allDepsPresent = true;
  for (const dep of requiredDeps) {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`   ✅ ${dep}`);
    } else {
      console.log(`   ❌ ${dep} - MISSING`);
      allDepsPresent = false;
    }
  }

  if (allDepsPresent) {
    console.log('   ✅ All required dependencies present');
  }
} catch (error) {
  console.log('   ❌ Error reading package.json:', error.message);
  allFilesExist = false;
}

// Test 3: Check Netlify configuration
console.log('\n3. Checking netlify.toml configuration...');
try {
  const netlifyConfig = fs.readFileSync('netlify.toml', 'utf8');
  
  const requiredConfig = [
    'publish = "client/dist"',
    'command = "npm run build:netlify"',
    'functions = "netlify/functions"',
    'node_bundler = "esbuild"',
    'from = "/api/*"',
    'to = "/.netlify/functions/api/:splat"'
  ];

  let allConfigPresent = true;
  for (const config of requiredConfig) {
    if (netlifyConfig.includes(config)) {
      console.log(`   ✅ ${config}`);
    } else {
      console.log(`   ❌ ${config} - MISSING`);
      allConfigPresent = false;
    }
  }

  if (allConfigPresent) {
    console.log('   ✅ Netlify configuration looks good');
  }
} catch (error) {
  console.log('   ❌ Error reading netlify.toml:', error.message);
  allFilesExist = false;
}

// Test 4: Check build scripts
console.log('\n4. Checking build scripts...');
try {
  const rootPackageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (rootPackageJson.scripts && rootPackageJson.scripts['build:netlify']) {
    console.log('   ✅ build:netlify script exists');
  } else {
    console.log('   ❌ build:netlify script missing');
    allFilesExist = false;
  }

  if (rootPackageJson.scripts && rootPackageJson.scripts['prepare:netlify']) {
    console.log('   ✅ prepare:netlify script exists');
  } else {
    console.log('   ❌ prepare:netlify script missing');
    allFilesExist = false;
  }
} catch (error) {
  console.log('   ❌ Error reading root package.json:', error.message);
  allFilesExist = false;
}

// Test 5: Check TypeScript configuration
console.log('\n5. Checking TypeScript configuration...');
try {
  const tsConfig = JSON.parse(fs.readFileSync('netlify/functions/tsconfig.json', 'utf8'));
  
  if (tsConfig.compilerOptions && tsConfig.compilerOptions.target) {
    console.log('   ✅ TypeScript configuration exists');
  } else {
    console.log('   ❌ Invalid TypeScript configuration');
    allFilesExist = false;
  }
} catch (error) {
  console.log('   ❌ Error reading tsconfig.json:', error.message);
  allFilesExist = false;
}

// Final result
console.log('\n' + '='.repeat(50));
if (allFilesExist) {
  console.log('🎉 All tests passed! Netlify Functions setup is complete.');
  console.log('\n📋 Next steps:');
  console.log('1. Run: npm run prepare:netlify');
  console.log('2. Push to GitHub');
  console.log('3. Connect to Netlify');
  console.log('4. Set environment variables');
  console.log('5. Deploy!');
} else {
  console.log('❌ Some tests failed. Please fix the issues above.');
  process.exit(1);
}

console.log('\n📖 For detailed instructions, see: NETLIFY-DEPLOYMENT.md');