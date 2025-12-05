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
VITE_API_URL=/.netlify/functions/api
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
VITE_APP_NAME=Willowbrook Clothing
VITE_APP_URL=https://willowbrook-clothing.netlify.app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
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
    console.log('1. Configure Supabase environment variables in Netlify dashboard:');
    console.log('   - SUPABASE_URL=https://your-project.supabase.co');
    console.log('   - SUPABASE_ANON_KEY=your-anon-key');
    console.log('   - SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
    console.log('   - SUPABASE_DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres');
    console.log('   - JWT_SECRET=your-jwt-secret');
    console.log('   - STRIPE_SECRET_KEY=your-stripe-secret-key');
    console.log('2. Update client/.env.production with your actual Supabase credentials');
    console.log('3. Deploy to Netlify:');
    
    if (checkNetlifyCLI()) {
      console.log('   netlify deploy --prod');
    } else {
      console.log('   - Install Netlify CLI: npm install -g netlify-cli');
      console.log('   - Or use Netlify dashboard with auto-deploy from Git');
    }
    
    console.log('4. Test the deployment with: npm run validate-supabase');
    console.log('\n🌐 Your Willowbrook Clothing app will be live on Netlify with Supabase!');

  } catch (error) {
    console.error('❌ Deployment preparation failed:', error.message);
    process.exit(1);
  }
}

main();