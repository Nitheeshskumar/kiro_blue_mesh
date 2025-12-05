#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎨 Rebranding from CustomWear to Willowbrook...\n');

// Files to update with brand name changes
const filesToUpdate = [
  'client/src/components/Navbar.tsx',
  'client/src/pages/HomePage.tsx',
  'client/index.html',
  'client/package.json',
  'server/package.json',
  'package.json',
  'README.md',
  'clothing-customizer-spec.md',
  'QUICK-START.md'
];

// Brand name mappings
const brandMappings = [
  { old: 'CustomWear', new: 'Willowbrook' },
  { old: 'customwear', new: 'willowbrook' },
  { old: 'CUSTOMWEAR', new: 'WILLOWBROOK' },
  { old: 'custom-wear', new: 'willowbrook' },
  { old: 'Clothing Customizer', new: 'Willowbrook Clothing' },
  { old: 'clothing-customizer', new: 'willowbrook-clothing' },
  { old: 'clothing_customizer', new: 'willowbrook_clothing' }
];

let updatedFiles = 0;

function updateFileContent(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;

  brandMappings.forEach(mapping => {
    if (content.includes(mapping.old)) {
      content = content.replace(new RegExp(mapping.old, 'g'), mapping.new);
      hasChanges = true;
    }
  });

  if (hasChanges) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${filePath}`);
    return true;
  }

  return false;
}

// Update all specified files
filesToUpdate.forEach(file => {
  if (updateFileContent(file)) {
    updatedFiles++;
  }
});

// Update HTML title and meta tags
const indexHtmlPath = 'client/index.html';
if (fs.existsSync(indexHtmlPath)) {
  let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
  
  // Update title
  htmlContent = htmlContent.replace(/<title>.*<\/title>/, '<title>Willowbrook Clothing</title>');
  
  // Add meta description if not exists
  if (!htmlContent.includes('meta name="description"')) {
    htmlContent = htmlContent.replace(
      '<meta name="viewport"',
      '<meta name="description" content="Custom clothing design with Willowbrook - Create personalized apparel with our intuitive design studio">\n    <meta name="viewport"'
    );
  }
  
  fs.writeFileSync(indexHtmlPath, htmlContent);
  console.log('✅ Updated HTML title and meta tags');
}

// Update admin email
const createAdminPath = 'server/src/createAdmin.ts';
if (fs.existsSync(createAdminPath)) {
  let adminContent = fs.readFileSync(createAdminPath, 'utf8');
  adminContent = adminContent.replace(
    'admin@clothingcustomizer.com',
    'admin@willowbrook.com'
  );
  fs.writeFileSync(createAdminPath, adminContent);
  console.log('✅ Updated admin email');
}

console.log(`\n🎉 Rebranding complete!`);
console.log(`📊 Updated ${updatedFiles} files`);
console.log(`🏷️  Brand name changed from CustomWear to Willowbrook`);
console.log(`\n🚀 Your app is now branded as Willowbrook Clothing!`);