const { builder } = require('@netlify/functions');
const fs = require('fs');
const path = require('path');

async function handler(event, context) {
  try {
    // Get the current working directory and list its contents
    const cwd = process.cwd();
    const dirname = __dirname;
    const rootFiles = fs.readdirSync('/');
    const contentDirs = [];
    
    // Try to find the content directory
    const possiblePaths = [
      '/',
      '/var/task',
      '/opt/build/repo',
      path.join(process.cwd(), '..'),
      path.join(process.cwd(), '..', '..'),
      path.join(process.cwd(), '..', '..', '..')
    ];
    
    const foundDirs = [];
    
    for (const basePath of possiblePaths) {
      try {
        const files = fs.readdirSync(basePath);
        foundDirs.push({
          path: basePath,
          files: files
        });
        
        // Check if content directory exists here
        const contentPath = path.join(basePath, 'content');
        if (fs.existsSync(contentPath)) {
          contentDirs.push({
            path: contentPath,
            files: fs.readdirSync(contentPath)
          });
        }
      } catch (error) {
        console.error(`Error reading ${basePath}:`, error.message);
      }
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        cwd,
        dirname,
        rootFiles,
        foundDirs,
        contentDirs,
        env: process.env
      }, null, 2)
    };
  } catch (error) {
    console.error('Debug error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
        stack: error.stack
      })
    };
  }
}

module.exports.handler = builder(handler);
