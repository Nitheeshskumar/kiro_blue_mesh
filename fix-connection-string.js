#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Neon connection string...\n');

const envPath = path.join(__dirname, 'server', '.env');

if (!fs.existsSync(envPath)) {
  console.log('❌ server/.env file not found');
  process.exit(1);
}

// Read current .env content
let envContent = fs.readFileSync(envPath, 'utf8');

console.log('🔍 Checking connection string format...');

// Extract the DATABASE_URL line
const lines = envContent.split('\n');
let databaseUrlLine = lines.find(line => line.startsWith('DATABASE_URL='));

if (!databaseUrlLine) {
  console.log('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

console.log('Current DATABASE_URL:', databaseUrlLine);

// Check for common issues and fix them
let fixed = false;
let newDatabaseUrl = databaseUrlLine;

// Fix: Remove extra u' prefix
if (databaseUrlLine.includes(`u'postgresql://`)) {
  newDatabaseUrl = newDatabaseUrl.replace(`u'postgresql://`, `postgresql://`);
  console.log('✅ Removed extra u\' prefix');
  fixed = true;
}

// Fix: Remove duplicate postgresql:// 
if (databaseUrlLine.match(/postgresql:\/\/.*postgresql:\/\//)) {
  newDatabaseUrl = newDatabaseUrl.replace(/postgresql:\/\/.*?postgresql:\/\//, 'postgresql://');
  console.log('✅ Removed duplicate postgresql:// prefix');
  fixed = true;
}

// Fix: Remove channel_binding parameter (can cause issues)
if (newDatabaseUrl.includes('channel_binding=require')) {
  newDatabaseUrl = newDatabaseUrl.replace('&channel_binding=require', '');
  newDatabaseUrl = newDatabaseUrl.replace('?channel_binding=require&', '?');
  newDatabaseUrl = newDatabaseUrl.replace('?channel_binding=require', '');
  console.log('✅ Removed channel_binding parameter');
  fixed = true;
}

// Ensure sslmode=require is present
if (!newDatabaseUrl.includes('sslmode=require')) {
  if (newDatabaseUrl.includes('?')) {
    newDatabaseUrl = newDatabaseUrl.replace('"', '&sslmode=require"');
  } else {
    newDatabaseUrl = newDatabaseUrl.replace('"', '?sslmode=require"');
  }
  console.log('✅ Added sslmode=require');
  fixed = true;
}

if (fixed) {
  // Update the .env file
  const newEnvContent = envContent.replace(databaseUrlLine, newDatabaseUrl);
  fs.writeFileSync(envPath, newEnvContent);
  
  console.log('\n✅ Fixed connection string!');
  console.log('New DATABASE_URL:', newDatabaseUrl);
  
  // Validate the format
  const urlMatch = newDatabaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^\/]+)\/([^?]+)/);
  if (urlMatch) {
    console.log('\n📊 Connection details:');
    console.log('  Username:', urlMatch[1]);
    console.log('  Host:', urlMatch[3]);
    console.log('  Database:', urlMatch[4]);
    console.log('  SSL Mode: Required');
  }
  
} else {
  console.log('✅ Connection string format looks correct');
}

console.log('\n🚀 Now try running:');
console.log('npm run test-neon');
console.log('npm run setup-db');