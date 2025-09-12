#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🐘 Setting up Neon PostgreSQL Database...\n');

// Check if .env file exists
const envPath = path.join(__dirname, 'server', '.env');
const envExamplePath = path.join(__dirname, 'server', '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📝 Creating .env file from template...');
    const envContent = fs.readFileSync(envExamplePath, 'utf8');
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created server/.env file');
  } else {
    console.log('❌ .env.example not found');
    process.exit(1);
  }
}

console.log('📋 Next steps to connect your Neon database:\n');

console.log('1. 🔗 Get your Neon connection string from your dashboard');
console.log('   It looks like: postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require\n');

console.log('2. ✏️  Edit server/.env and replace the DATABASE_URL:');
console.log('   DATABASE_URL="your-neon-connection-string-here"\n');

console.log('3. 🔑 Add a JWT secret:');
console.log('   JWT_SECRET="your-super-secret-jwt-key-here"\n');

console.log('4. 🚀 Run database setup:');
console.log('   npm run setup-db\n');

console.log('5. 🌱 Seed with sample data:');
console.log('   npm run seed-db\n');

console.log('6. ▶️  Start the application:');
console.log('   npm run dev\n');

console.log('💡 Example .env configuration:');
console.log('DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/clothing_customizer?sslmode=require"');
console.log('JWT_SECRET="my-super-secret-key-12345"');

// Check if DATABASE_URL is already configured
const envContent = fs.readFileSync(envPath, 'utf8');
if (envContent.includes('localhost:5432')) {
  console.log('\n⚠️  Your .env still has the default localhost database URL.');
  console.log('   Please update it with your Neon connection string.');
} else if (envContent.includes('neon.tech')) {
  console.log('\n✅ Looks like you already have a Neon connection string configured!');
  console.log('   You can now run: npm run setup-db');
}