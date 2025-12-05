#!/usr/bin/env node

/**
 * Test login functionality locally
 * This directly tests the auth route without needing a full server
 */

require('dotenv').config();

async function testLogin() {
  console.log('🔍 Testing Login Functionality\n');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('✓ SUPABASE_DATABASE_URL:', process.env.SUPABASE_DATABASE_URL ? 'Set' : '❌ NOT SET');
  console.log('✓ JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : '❌ NOT SET');
  console.log('✓ SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : '❌ NOT SET');
  console.log('✓ SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : '❌ NOT SET');
  console.log('');
  
  if (!process.env.SUPABASE_DATABASE_URL || !process.env.JWT_SECRET) {
    console.error('❌ Missing required environment variables!');
    console.error('Make sure your .env file has:');
    console.error('  - SUPABASE_DATABASE_URL');
    console.error('  - JWT_SECRET');
    process.exit(1);
  }
  
  try {
    // Test database connection
    console.log('📊 Testing database connection...');
    const { getDatabase } = require('./netlify/functions/dist/lib/database');
    const db = await getDatabase();
    console.log('✓ Database connected successfully\n');
    
    // Check if admin user exists
    console.log('👤 Checking for admin user...');
    const adminUser = await db.findUserByEmail('admin@willowbrook.com');
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      console.log('Creating admin user...');
      
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('secret123', 12);
      
      await db.createUser({
        email: 'admin@willowbrook.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN'
      });
      
      console.log('✓ Admin user created successfully');
      console.log('  Email: admin@willowbrook.com');
      console.log('  Password: secret123\n');
    } else {
      console.log('✓ Admin user exists');
      console.log('  Email:', adminUser.email);
      console.log('  Role:', adminUser.role);
      console.log('  ID:', adminUser.id);
      console.log('');
    }
    
    // Test login
    console.log('🔐 Testing login...');
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    
    const user = await db.findUserByEmail('admin@willowbrook.com');
    const passwordMatch = await bcrypt.compare('secret123', user.password);
    
    if (!passwordMatch) {
      console.error('❌ Password verification failed!');
      process.exit(1);
    }
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    console.log('✓ Login successful!');
    console.log('✓ JWT token generated');
    console.log('');
    
    console.log('🎉 All tests passed!\n');
    console.log('You can now login with:');
    console.log('  Email: admin@willowbrook.com');
    console.log('  Password: secret123');
    console.log('');
    console.log('To start the development server, run:');
    console.log('  npm run dev');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

testLogin();
