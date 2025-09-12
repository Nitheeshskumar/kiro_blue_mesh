#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Clothing Customizer Project...\n');

// Check if setup is complete
const clientNodeModules = path.join(__dirname, 'client', 'node_modules');
const serverNodeModules = path.join(__dirname, 'server', 'node_modules');

if (!fs.existsSync(clientNodeModules) || !fs.existsSync(serverNodeModules)) {
  console.log('❌ Dependencies not installed. Running setup first...\n');
  
  const setup = spawn('node', ['auto-setup.js'], { stdio: 'inherit' });
  
  setup.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Setup completed. Please configure your database and run again.');
      console.log('Edit server/.env with your database URL, then run:');
      console.log('cd server && npm run db:push && npm run db:seed');
      console.log('Then run: node run-project.js');
    } else {
      console.log('\n❌ Setup failed. Please check the errors above.');
    }
  });
  
  return;
}

// Check if database is configured
const envPath = path.join(__dirname, 'server', '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ Database not configured. Please:');
  console.log('1. Edit server/.env with your database URL');
  console.log('2. Run: cd server && npm run db:push && npm run db:seed');
  console.log('3. Run: node run-project.js');
  return;
}

console.log('🌐 Starting development servers...\n');
console.log('Frontend will be available at: http://localhost:3000');
console.log('Backend will be available at: http://localhost:5000\n');

// Start both servers
const client = spawn('npm', ['run', 'dev'], { 
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit'
});

const server = spawn('npm', ['run', 'dev'], { 
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit'
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  client.kill();
  server.kill();
  process.exit();
});

client.on('close', (code) => {
  console.log(`Client process exited with code ${code}`);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});