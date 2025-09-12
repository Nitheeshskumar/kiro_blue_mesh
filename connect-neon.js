#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🐘 Connecting to Neon PostgreSQL Database...\n');

const envPath = path.join(__dirname, 'server', '.env');

// Check if .env exists
if (!fs.existsSync(envPath)) {
  console.log('❌ server/.env file not found');
  console.log('Run: npm run setup-neon first');
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');

// Check if DATABASE_URL is configured
if (envContent.includes('localhost:5432')) {
  console.log('❌ DATABASE_URL still points to localhost');
  console.log('Please update server/.env with your Neon connection string\n');
  console.log('Example:');
  console.log('DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require"');
  process.exit(1);
}

if (!envContent.includes('neon.tech')) {
  console.log('⚠️  DATABASE_URL doesn\'t appear to be a Neon connection string');
  console.log('Make sure it includes "neon.tech" in the hostname');
}

try {
  console.log('🔧 Generating Prisma client...');
  execSync('cd server && npx prisma generate', { stdio: 'inherit' });
  
  console.log('🗄️  Pushing database schema...');
  execSync('cd server && npx prisma db push', { stdio: 'inherit' });
  
  console.log('🌱 Seeding database with sample data...');
  execSync('cd server && npm run db:seed', { stdio: 'inherit' });
  
  console.log('\n✅ Database setup complete!');
  console.log('🚀 You can now run: npm run dev');
  
} catch (error) {
  console.error('\n❌ Database setup failed:');
  console.error(error.message);
  
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Check your Neon connection string in server/.env');
  console.log('2. Make sure your Neon database is running');
  console.log('3. Verify the connection string includes ?sslmode=require');
  console.log('4. Try running: cd server && npx prisma db push --force-reset');
}