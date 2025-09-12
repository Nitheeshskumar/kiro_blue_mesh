#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Node.js compatibility issues...\n');

function replaceInFile(filePath, searchValue, replaceValue) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(searchValue)) {
      content = content.replace(new RegExp(searchValue, 'g'), replaceValue);
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed ${filePath}`);
      return true;
    }
  }
  return false;
}

// Fix nullish coalescing assignment operator (??=) if it exists
const filesToCheck = [
  'server/src/routes/orders.ts',
  'server/src/routes/customizations.ts',
  'server/src/routes/auth.ts',
  'server/src/routes/products.ts',
  'server/src/utils/storyGenerator.ts',
  'server/src/index.ts'
];

let fixesApplied = 0;

filesToCheck.forEach(filePath => {
  // Replace ??= with compatible syntax
  if (replaceInFile(filePath, '\\?\\?=', '= ')) {
    fixesApplied++;
  }
  
  // Replace optional chaining in assignments if needed
  if (replaceInFile(filePath, '(\\w+)\\?\\?= ', '$1 = $1 || ')) {
    fixesApplied++;
  }
});

// Check for other modern syntax that might cause issues
console.log('\n🔍 Checking for other compatibility issues...');

// Update server dev script to use nodemon instead of tsx if needed
const serverPackageJson = path.join(__dirname, 'server', 'package.json');
if (fs.existsSync(serverPackageJson)) {
  const packageContent = JSON.parse(fs.readFileSync(serverPackageJson, 'utf8'));
  
  // Check if tsx is causing issues, replace with ts-node
  if (packageContent.scripts.dev.includes('tsx')) {
    packageContent.scripts.dev = 'ts-node --esm src/index.ts';
    packageContent.scripts['db:seed'] = 'ts-node --esm src/seed.ts';
    
    // Add ts-node as dependency if not present
    if (!packageContent.devDependencies['ts-node']) {
      packageContent.devDependencies['ts-node'] = '^10.9.1';
    }
    
    fs.writeFileSync(serverPackageJson, JSON.stringify(packageContent, null, 2));
    console.log('✅ Updated server scripts to use ts-node');
    fixesApplied++;
  }
}

if (fixesApplied === 0) {
  console.log('✅ No compatibility issues found!');
} else {
  console.log(`✅ Applied ${fixesApplied} compatibility fixes`);
  console.log('\n📦 You may need to install updated dependencies:');
  console.log('cd server && npm install ts-node@^10.9.1');
}

console.log('\n🚀 Try running the project again: npm run dev');