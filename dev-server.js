#!/usr/bin/env node

/**
 * Local development server for Netlify Functions
 * This runs the Netlify functions API locally so you can test with the same code that runs in production
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Netlify Functions development server...\n');

// Load environment variables from root .env
require('dotenv').config();

// Start Netlify Dev server
const netlifyDev = spawn('npx', ['netlify', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

netlifyDev.on('error', (error) => {
  console.error('❌ Failed to start Netlify Dev:', error);
  process.exit(1);
});

netlifyDev.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Netlify Dev exited with code ${code}`);
    process.exit(code);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down development server...');
  netlifyDev.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  netlifyDev.kill('SIGTERM');
  process.exit(0);
});
