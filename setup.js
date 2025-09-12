#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Clothing Customizer...\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 18) {
  console.error('❌ Node.js 18 or higher is required. Current version:', nodeVersion);
  process.exit(1);
}

try {
  // Install root dependencies
  console.log('📦 Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Install client dependencies
  console.log('📦 Installing client dependencies...');
  execSync('cd client && npm install', { stdio: 'inherit' });
  
  // Ensure React types are properly installed
  console.log('🔧 Ensuring React types are installed...');
  execSync('cd client && npm install --save-dev @types/react @types/react-dom @types/react-router-dom @types/node', { stdio: 'inherit' });

  // Install server dependencies
  console.log('📦 Installing server dependencies...');
  execSync('cd server && npm install', { stdio: 'inherit' });

  // Create .env file if it doesn't exist
  const envPath = path.join(__dirname, 'server', '.env');
  if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file...');
    const envExample = fs.readFileSync(path.join(__dirname, 'server', '.env.example'), 'utf8');
    fs.writeFileSync(envPath, envExample);
    console.log('✅ Created server/.env file. Please update it with your database URL and secrets.');
  }

  console.log('\n✅ Setup complete!\n');
  console.log('Next steps:');
  console.log('1. Update server/.env with your database URL');
  console.log('2. Run: cd server && npm run db:push');
  console.log('3. Run: cd server && npm run db:seed');
  console.log('4. Run: npm run dev');
  console.log('\nThe app will be available at:');
  console.log('- Frontend: http://localhost:3000');
  console.log('- Backend: http://localhost:5000');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}