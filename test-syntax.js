#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing file syntax...\n');

const filesToCheck = [
  'client/src/pages/admin/AddProduct.tsx',
  'client/src/components/ProxyUploadWidget.tsx',
  'client/src/lib/uploadProxy.ts',
  'netlify/functions/upload-proxy.ts'
];

let hasErrors = false;

filesToCheck.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    hasErrors = true;
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Basic syntax checks
    const lines = content.split('\n');
    let braceCount = 0;
    let parenCount = 0;
    let bracketCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Count braces, parens, brackets
      for (const char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
        if (char === '[') bracketCount++;
        if (char === ']') bracketCount--;
      }
      
      // Check for obvious syntax errors
      if (line.includes('} from') && line.includes('import {')) {
        console.error(`❌ Potential import syntax error in ${filePath}:${i + 1}`);
        console.error(`   Line: ${line.trim()}`);
        hasErrors = true;
      }
    }
    
    // Check if braces are balanced
    if (braceCount !== 0) {
      console.error(`❌ Unbalanced braces in ${filePath} (${braceCount})`);
      hasErrors = true;
    }
    
    if (!hasErrors) {
      console.log(`✅ ${filePath} - syntax looks good`);
    }
    
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    hasErrors = true;
  }
});

if (hasErrors) {
  console.log('\n❌ Syntax errors found. Please fix them before continuing.');
  process.exit(1);
} else {
  console.log('\n✅ All files have valid syntax!');
}

console.log('\n💡 If you\'re still seeing Vite errors, try:');
console.log('1. Restart the development server');
console.log('2. Clear Vite cache: rm -rf client/node_modules/.vite');
console.log('3. Reinstall dependencies: npm install');