#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎨 Finalizing Willowbrook branding...\n');

// Additional files and content to update
const additionalUpdates = [
  {
    file: 'QUICK-START.md',
    updates: [
      { old: 'Clothing Customizer', new: 'Willowbrook Clothing' },
      { old: 'clothing customizer', new: 'Willowbrook clothing platform' },
      { old: 'CustomWear', new: 'Willowbrook' }
    ]
  },
  {
    file: 'clothing-customizer-spec.md',
    updates: [
      { old: 'Clothing Customizer Web App', new: 'Willowbrook Clothing Platform' },
      { old: 'clothing customization', new: 'Willowbrook clothing customization' },
      { old: 'CustomWear', new: 'Willowbrook' }
    ]
  }
];

let updatedFiles = 0;

additionalUpdates.forEach(({ file, updates }) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let hasChanges = false;

    updates.forEach(({ old, new: newText }) => {
      if (content.includes(old)) {
        content = content.replace(new RegExp(old, 'g'), newText);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      fs.writeFileSync(file, content);
      console.log(`✅ Updated: ${file}`);
      updatedFiles++;
    }
  }
});

// Update any remaining references in key files
const keyFiles = [
  'client/src/pages/HomePage.tsx',
  'client/src/components/Navbar.tsx',
  'README.md'
];

keyFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let hasChanges = false;

    // Additional specific replacements
    const replacements = [
      { old: 'custom clothing', new: 'Willowbrook custom clothing' },
      { old: 'Professional quality meets personal style', new: 'Premium craftsmanship meets personal style at Willowbrook' }
    ];

    replacements.forEach(({ old, new: newText }) => {
      if (content.includes(old)) {
        content = content.replace(new RegExp(old, 'g'), newText);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      fs.writeFileSync(file, content);
      console.log(`✅ Enhanced: ${file}`);
      updatedFiles++;
    }
  }
});

console.log(`\n🎉 Willowbrook branding finalized!`);
console.log(`📊 Updated ${updatedFiles} additional files`);
console.log(`\n🏷️  Your app is now fully branded as Willowbrook Clothing`);
console.log(`✨ Your comforatble clothing store platform ready!`);