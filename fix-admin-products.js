#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Admin Products Issue\n');

// Check if .env file exists in client
const clientEnvPath = path.join(__dirname, 'client', '.env');
if (!fs.existsSync(clientEnvPath)) {
  console.log('📝 Creating client/.env file...');
  const envContent = `# Development environment
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Willowbrook Clothing`;
  fs.writeFileSync(clientEnvPath, envContent);
  console.log('✅ Created client/.env file');
} else {
  console.log('✅ client/.env file already exists');
}

// Check if main .env file exists
const mainEnvPath = path.join(__dirname, '.env');
if (!fs.existsSync(mainEnvPath)) {
  console.log('⚠️  Main .env file not found');
  console.log('📝 Please create .env file with:');
  console.log('   DATABASE_URL="your-neon-database-url"');
  console.log('   JWT_SECRET="your-secret-key"');
} else {
  console.log('✅ Main .env file exists');
}

console.log('\n' + '='.repeat(50));
console.log('🚀 NEXT STEPS');
console.log('='.repeat(50));

console.log('\n1. Start the development servers:');
console.log('   npm run dev');
console.log('   (This starts both client on port 3000 and server on port 5000)');

console.log('\n2. If you get API errors:');
console.log('   - Check browser console for specific error messages');
console.log('   - Verify you\'re logged in as an admin user');
console.log('   - Check Network tab in browser dev tools');

console.log('\n3. Test API connection:');
console.log('   node test-api-connection.js');

console.log('\n4. Admin login credentials:');
console.log('   Email: admin@willowbrook.com');
console.log('   Password: secret123');

console.log('\n5. If still having issues:');
console.log('   - Check server logs for errors');
console.log('   - Verify database connection');
console.log('   - Check JWT_SECRET is set in .env');

console.log('\n✨ The admin products page should now work correctly!');