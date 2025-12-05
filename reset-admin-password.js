#!/usr/bin/env node

/**
 * Reset admin password
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');

async function resetPassword() {
  console.log('🔐 Resetting admin password...\n');
  
  try {
    const { getDatabase } = require('./netlify/functions/dist/lib/database');
    const db = await getDatabase();
    
    // Find admin user
    const admin = await db.findUserByEmail('admin@willowbrook.com');
    
    if (!admin) {
      console.error('❌ Admin user not found!');
      process.exit(1);
    }
    
    console.log('Found admin user:', admin.email);
    console.log('Current password hash:', admin.password.substring(0, 20) + '...');
    console.log('');
    
    // Hash new password
    const newPassword = 'secret123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    console.log('New password hash:', hashedPassword.substring(0, 20) + '...');
    console.log('');
    
    // Update password
    await db.updateUser(admin.id, { password: hashedPassword });
    
    console.log('✓ Password updated successfully!');
    console.log('');
    console.log('You can now login with:');
    console.log('  Email: admin@willowbrook.com');
    console.log('  Password: secret123');
    
    // Test the new password
    console.log('');
    console.log('🧪 Testing new password...');
    const updatedAdmin = await db.findUserByEmail('admin@willowbrook.com');
    const passwordMatch = await bcrypt.compare(newPassword, updatedAdmin.password);
    
    if (passwordMatch) {
      console.log('✓ Password verification successful!');
    } else {
      console.error('❌ Password verification failed!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
  
  process.exit(0);
}

resetPassword();
