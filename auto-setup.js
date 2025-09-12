#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Automated Clothing Customizer Setup...\n');

function runCommand(command, description, cwd = process.cwd()) {
  try {
    console.log(`📋 ${description}...`);
    execSync(command, { stdio: 'inherit', cwd });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ Failed: ${description}`);
    console.error(`Command: ${command}`);
    console.error(`Error: ${error.message}\n`);
    throw error;
  }
}

async function main() {
  try {
    // Step 1: Install root dependencies
    runCommand('npm install', 'Installing root dependencies');

    // Step 2: Install client dependencies
    const clientPath = path.join(process.cwd(), 'client');
    runCommand('npm install', 'Installing client base dependencies', clientPath);
    
    // Install specific missing packages
    runCommand('npm install react-router-dom lucide-react axios zustand', 'Installing client packages', clientPath);
    runCommand('npm install --save-dev @types/react-router-dom @types/node', 'Installing TypeScript types', clientPath);

    // Step 3: Install server dependencies
    const serverPath = path.join(process.cwd(), 'server');
    runCommand('npm install', 'Installing server dependencies', serverPath);

    // Step 4: Setup environment file
    const envPath = path.join(serverPath, '.env');
    const envExamplePath = path.join(serverPath, '.env.example');
    
    if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
      console.log('📝 Creating .env file...');
      const envContent = fs.readFileSync(envExamplePath, 'utf8');
      fs.writeFileSync(envPath, envContent);
      console.log('✅ .env file created\n');
    }

    // Step 5: Generate Prisma client
    runCommand('npx prisma generate', 'Generating Prisma client', serverPath);

    console.log('🎉 Setup completed successfully!\n');
    console.log('📋 Next steps:');
    console.log('1. Edit server/.env with your database URL');
    console.log('2. Run: cd server && npm run db:push');
    console.log('3. Run: cd server && npm run db:seed');
    console.log('4. Run: npm run dev');
    console.log('\n🌐 The app will be available at:');
    console.log('- Frontend: http://localhost:3000');
    console.log('- Backend: http://localhost:5000');

  } catch (error) {
    console.error('\n❌ Setup failed. Please check the errors above.');
    console.log('\n🔧 Manual setup commands:');
    console.log('npm install');
    console.log('cd client && npm install react-router-dom lucide-react axios zustand');
    console.log('cd ../server && npm install');
    process.exit(1);
  }
}

main();