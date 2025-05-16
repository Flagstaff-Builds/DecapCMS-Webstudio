#!/usr/bin/env node

/**
 * This script starts both the Express server and the netlify-cms-proxy-server
 * for local development with Decap CMS.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if .env file exists, if not create it from .env.example
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  console.log('Creating .env file from .env.example...');
  let envContent = fs.readFileSync(envExamplePath, 'utf8');
  
  // Update with local development settings
  envContent = envContent
    .replace(/SITE_TITLE=.*/, 'SITE_TITLE=Webstudio.tips Blog (Local)')
    .replace(/SITE_URL=.*/, 'SITE_URL=http://localhost:3000')
    + '\n# Local development settings\nLOCAL_BACKEND=true\n';
  
  fs.writeFileSync(envPath, envContent);
  console.log('.env file created successfully!');
}

console.log('Starting Express server...');

// Start the Express server
const expressServer = spawn('node', ['server.js'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NODE_ENV: 'development' }
});

// Give the Express server a moment to start
setTimeout(() => {
  console.log('Starting netlify-cms-proxy-server...');
  
  // Start the netlify-cms-proxy-server
  const proxyServer = spawn('npx', ['netlify-cms-proxy-server'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'development' }
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\nShutting down servers...');
    expressServer.kill('SIGINT');
    proxyServer.kill('SIGINT');
    setTimeout(() => process.exit(0), 100);
  });

  // Handle errors
  expressServer.on('error', (error) => {
    console.error('Express server error:', error);
  });

  proxyServer.on('error', (error) => {
    console.error('Proxy server error:', error);
  });

  // Log when servers exit
  expressServer.on('close', (code) => {
    console.log(`Express server exited with code ${code}`);
    // If the Express server exits, kill the proxy server too
    proxyServer.kill('SIGINT');
  });

  proxyServer.on('close', (code) => {
    console.log(`Proxy server exited with code ${code}`);
    // If the proxy server exits, kill the Express server too
    expressServer.kill('SIGINT');
  });
  
  console.log('\n-----------------------------------------------------');
  console.log('Local CMS development environment is running!');
  console.log('- Access the site at: http://localhost:3000');
  console.log('- Access the admin UI at: http://localhost:3000/admin/local.html');
  console.log('- Proxy server is running at: http://localhost:8081/api/v1');
  console.log('-----------------------------------------------------\n');
}, 1000);

console.log('Local CMS development environment starting...');
console.log('Press Ctrl+C to stop all servers.');
