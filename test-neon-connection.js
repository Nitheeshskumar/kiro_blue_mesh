#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Neon Database Connection...\n');

const envPath = path.join(__dirname, 'server', '.env');

if (!fs.existsSync(envPath)) {
  console.log('❌ server/.env file not found');
  console.log('Run: npm run setup-neon first');
  process.exit(1);
}

try {
  console.log('🔍 Checking database connection...');
  execSync('cd server && npx prisma db pull --print', { stdio: 'pipe' });
  console.log('✅ Database connection successful!');
  
  console.log('📊 Checking database schema...');
  const result = execSync('cd server && npx prisma db pull --print', { encoding: 'utf8' });
  
  if (result.includes('model')) {
    console.log('✅ Database has existing schema');
  } else {
    console.log('ℹ️  Database is empty - ready for schema push');
  }
  
  console.log('\n🎯 Next steps:');
  console.log('1. Run: npm run setup-db (to create tables)');
  console.log('2. Run: npm run seed-db (to add sample data)');
  console.log('3. Run: npm run dev (to start the app)');
  
} catch (error) {
  console.error('❌ Database connection failed:');
  
  if (error.message.includes('authentication failed')) {
    console.log('🔑 Authentication issue - check your username/password in the connection string');
  } else if (error.message.includes('does not exist')) {
    console.log('🗄️  Database does not exist - create it in your Neon dashboard first');
  } else if (error.message.includes('timeout')) {
    console.log('⏱️  Connection timeout - check your network and Neon status');
  } else {
    console.log('🔧 Connection string format might be incorrect');
  }
  
  console.log('\n💡 Your connection string should look like:');
  console.log('DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require"');
  
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Verify your Neon connection string in server/.env');
  console.log('2. Make sure your Neon database is active');
  console.log('3. Check that ?sslmode=require is included');
  console.log('4. Ensure your IP is allowed (Neon allows all by default)');
}