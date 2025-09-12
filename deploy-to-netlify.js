#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚀 Preparing Willowbrook Clothing for Netlify deployment...\n');

// Check if Netlify CLI is installed
function checkNetlifyCLI() {
  try {
    execSync('netlify --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Create production environment file
function createProductionEnv() {
  const envContent = `# Willowbrook Clothing - Production Environment
VITE_API_URL=https://your-backend-url.com/api
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
VITE_APP_NAME=Willowbrook Clothing
VITE_APP_URL=https://willowbrook-clothing.netlify.app
`;

  fs.writeFileSync('client/.env.production', envContent);
  console.log('✅ Created client/.env.production');
}

// Build the client
function buildClient() {
  console.log('📦 Building client for production...');
  try {
    execSync('cd client && npm install && npm run build', { stdio: 'inherit' });
    console.log('✅ Client build completed');
    return true;
  } catch (error) {
    console.error('❌ Client build failed');
    return false;
  }
}

// Main deployment preparation
async function main() {
  try {
    // Create production environment
    createProductionEnv();

    // Build the client
    if (!buildClient()) {
      process.exit(1);
    }

    console.log('\n🎉 Netlify deployment preparation complete!\n');
    
    console.log('📋 Next steps:');
    console.log('1. Update client/.env.production with your actual backend URL');
    console.log('2. Deploy to Netlify:');
    
    if (checkNetlifyCLI()) {
      console.log('   netlify deploy --prod --dir=client/dist');
    } else {
      console.log('   - Install Netlify CLI: npm install -g netlify-cli');
      console.log('   - Or drag client/dist folder to Netlify dashboard');
    }
    
    console.log('3. Update API redirects in netlify.toml with your backend URL');
    console.log('\n🌐 Your Willowbrook Clothing app will be live on Netlify!');

  } catch (error) {
    console.error('❌ Deployment preparation failed:', error.message);
    process.exit(1);
  }
}

main();