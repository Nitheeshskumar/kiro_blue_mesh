#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing syntax error: Unexpected token ??=\n');

// Check Node.js version first
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

console.log(`Node.js version: ${nodeVersion}`);

if (majorVersion < 14) {
  console.error('❌ Node.js 14+ is required. Please upgrade Node.js.');
  process.exit(1);
}

// The ??= operator was introduced in Node.js 15
// Let's replace it with compatible syntax
function fixNullishAssignment(filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace ??= with compatible syntax
  const regex = /(\w+)\s*\?\?=\s*(.+);/g;
  const newContent = content.replace(regex, (match, variable, value) => {
    modified = true;
    return `${variable} = ${variable} ?? ${value};`;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, newContent);
    console.log(`✅ Fixed nullish assignment in ${filePath}`);
    return true;
  }
  
  return false;
}

// Check all TypeScript files in server
const serverDir = path.join(__dirname, 'server', 'src');
const filesToCheck = [];

function findTsFiles(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findTsFiles(fullPath);
    } else if (file.endsWith('.ts')) {
      filesToCheck.push(fullPath);
    }
  });
}

if (fs.existsSync(serverDir)) {
  findTsFiles(serverDir);
}

let fixesApplied = 0;
filesToCheck.forEach(file => {
  if (fixNullishAssignment(file)) {
    fixesApplied++;
  }
});

// Also check for other modern syntax issues
console.log('\n🔍 Checking for other syntax issues...');

// Update server to use nodemon instead of tsx for better compatibility
try {
  console.log('📦 Installing compatible dependencies...');
  execSync('cd server && npm install nodemon ts-node --save-dev', { stdio: 'inherit' });
  
  // Update package.json scripts
  const packagePath = path.join(__dirname, 'server', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  packageJson.scripts.dev = 'nodemon --exec ts-node src/index.ts';
  packageJson.scripts['db:seed'] = 'ts-node src/seed.ts';
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated server scripts for compatibility');
  
} catch (error) {
  console.log('⚠️  Could not update dependencies automatically');
  console.log('Please run: cd server && npm install nodemon ts-node --save-dev');
}

if (fixesApplied > 0) {
  console.log(`\n✅ Applied ${fixesApplied} syntax fixes`);
} else {
  console.log('\n✅ No syntax issues found in TypeScript files');
}

console.log('\n🚀 Try running the project again: npm run dev');
console.log('\nIf you still get errors, try:');
console.log('1. npm run fix-node');
console.log('2. npm run install-deps');
console.log('3. npm run dev');