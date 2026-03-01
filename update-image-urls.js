#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Updating components to use proxied image URLs...\n');

const componentsToUpdate = [
  'client/src/pages/OrderTrackingPage.tsx',
  'client/src/pages/OrderConfirmationPage.tsx',
  'client/src/pages/HomePage.tsx',
  'client/src/pages/CustomizerPage.tsx',
  'client/src/pages/admin/ProductManagement.tsx',
  'client/src/pages/admin/OrderManagement.tsx'
];

const addImportIfNeeded = (content, filePath) => {
  if (content.includes('getProxiedImageUrl')) {
    return content; // Already has the import
  }

  // Find the last import statement
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      lastImportIndex = i;
    }
  }

  if (lastImportIndex === -1) {
    // No imports found, add at the top
    return `import { getProxiedImageUrl } from '../lib/imageUtils';\n${content}`;
  }

  // Calculate relative path to imageUtils
  const relativePath = path.relative(path.dirname(filePath), 'client/src/lib/imageUtils').replace(/\\/g, '/');
  const importPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
  
  // Add import after the last import
  lines.splice(lastImportIndex + 1, 0, `import { getProxiedImageUrl } from '${importPath}';`);
  
  return lines.join('\n');
};

const updateImageSources = (content) => {
  // Replace direct image usage with proxied URLs
  const patterns = [
    // product.images[0] -> getProxiedImageUrl(product.images[0])
    /src=\{([^}]*\.images\[[^\]]*\])\}/g,
    // item.product.images[0] -> getProxiedImageUrl(item.product.images[0])
    /src=\{([^}]*\.product\.images\[[^\]]*\])\}/g,
    // Direct string URLs in src attributes
    /src=\{([^}]*images\[[^\]]*\])\}/g
  ];

  let updatedContent = content;
  
  patterns.forEach(pattern => {
    updatedContent = updatedContent.replace(pattern, (match, imageRef) => {
      // Don't wrap if already wrapped
      if (imageRef.includes('getProxiedImageUrl')) {
        return match;
      }
      return `src={getProxiedImageUrl(${imageRef})}`;
    });
  });

  return updatedContent;
};

let updatedCount = 0;

componentsToUpdate.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    let updatedContent = originalContent;

    // Add import if needed
    updatedContent = addImportIfNeeded(updatedContent, filePath);
    
    // Update image sources
    updatedContent = updateImageSources(updatedContent);

    if (updatedContent !== originalContent) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✅ Updated: ${filePath}`);
      updatedCount++;
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Updated ${updatedCount} files with proxied image URLs`);
console.log('\n📋 Manual updates may be needed for:');
console.log('- Complex image URL expressions');
console.log('- Dynamic image URLs from API responses');
console.log('- Image URLs in state or props');

console.log('\n💡 For API responses, consider updating the API to return proxied URLs directly');
console.log('   or use getProxiedImageUrls() to batch convert arrays of URLs.');