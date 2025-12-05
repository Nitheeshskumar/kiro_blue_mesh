#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Preparing Willowbrook Clothing for Netlify deployment...\n');

// Check if required files exist
const requiredFiles = [
  'netlify.toml',
  'netlify/functions/api.ts',
  'netlify/functions/package.json'
];

console.log('✅ Checking required files...');
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Missing required file: ${file}`);
    process.exit(1);
  }
  console.log(`   ✓ ${file}`);
}

// Check environment variables
console.log('\n📋 Environment variables needed for Netlify:');
console.log('   • DATABASE_URL (your database connection string)');
console.log('   • JWT_SECRET (random secure string)');
console.log('   • CLIENT_URL (your Netlify site URL)');
console.log('   • STRIPE_SECRET_KEY (optional, for payments)');

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  console.log('   Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('   Installing client dependencies...');
  execSync('cd client && npm install', { stdio: 'inherit' });
  
  console.log('   Installing server dependencies...');
  execSync('cd server && npm install', { stdio: 'inherit' });
  
  console.log('   Installing function dependencies...');
  execSync('cd netlify/functions && npm install', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Note about database
console.log('\n💾 Using Neon PostgreSQL database - make sure DATABASE_URL is configured!');

// Build the project
console.log('\n🏗️  Building project...');
try {
  execSync('npm run build:netlify', { stdio: 'inherit' });
  console.log('   ✓ Build completed');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 Deployment preparation complete!');
console.log('\n📝 Next steps:');
console.log('1. Push your code to GitHub');
console.log('2. Connect your GitHub repo to Netlify');
console.log('3. Set environment variables in Netlify dashboard');
console.log('4. Deploy!');
console.log('\n🔗 Your API will be available at: https://your-site.netlify.app/api/*');