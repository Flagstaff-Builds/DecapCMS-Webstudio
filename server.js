const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS middleware for local development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Serve static files from the public directory
app.use(express.static('public'));

// Middleware to process config.yml for admin
app.use('/admin', (req, res, next) => {
  // Only process the config.yml file
  if (req.path === '/config.yml') {
    try {
      // Read the config.yml file
      const configPath = path.join(__dirname, 'public', 'admin', 'config.yml');
      let configContent = fs.readFileSync(configPath, 'utf8');
      
      // Replace environment variables
      configContent = configContent
        .replace(/\${GITHUB_BRANCH}/g, process.env.GITHUB_BRANCH || 'main')
        .replace(/\${MEDIA_FOLDER}/g, process.env.MEDIA_FOLDER || 'images/uploads')
        .replace(/\${PUBLIC_FOLDER}/g, process.env.PUBLIC_FOLDER || '/images/uploads')
        .replace(/\${CONTENT_FOLDER}/g, process.env.CONTENT_FOLDER || 'content/blog')
        .replace(/\${SITE_URL}/g, process.env.SITE_URL || 'https://your-site-url.netlify.app');
      
      // Serve the processed content
      res.setHeader('Content-Type', 'text/yaml');
      return res.send(configContent);
    } catch (error) {
      console.error('Error processing config:', error);
      return next(); // Fall through to static file serving if there's an error
    }
  }
  
  // Process config.local.yml if requested
  if (req.path === '/config.local.yml') {
    try {
      // Read the config.local.yml file
      const configPath = path.join(__dirname, 'public', 'admin', 'config.local.yml');
      let configContent = fs.readFileSync(configPath, 'utf8');
      
      // Serve the processed content
      res.setHeader('Content-Type', 'text/yaml');
      return res.send(configContent);
    } catch (error) {
      console.error('Error processing local config:', error);
      return next();
    }
  }
  
  next();
});

// Setup local backend API endpoint for Decap CMS
// This is needed for the test-repo backend to work locally
app.use('/api/v1', (req, res, next) => {
  // Log incoming requests for debugging
  console.log(`Local backend API request: ${req.method} ${req.path}`);
  
  // Handle OPTIONS requests for CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    return res.sendStatus(200);
  }
  
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Parse JSON body for POST/PUT requests
  if ((req.method === 'POST' || req.method === 'PUT') && !req.body) {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        req.body = JSON.parse(body);
      } catch (e) {
        console.error('Error parsing request body:', e);
      }
      handleApiRequest();
    });
  } else {
    handleApiRequest();
  }
  
  function handleApiRequest() {
    // Handle specific API endpoints
    if (req.path === '/collections') {
      // Return empty collections for test-repo
      return res.json({
        collections: []
      });
    }
    
    // For actual API requests, we'll just acknowledge them
    // In a real implementation, this would interact with your content repository
    if (req.method === 'GET') {
      return res.json({ success: true, message: 'Local backend GET request received' });
    } else if (req.method === 'POST' || req.method === 'PUT') {
      return res.json({ success: true, message: 'Local backend write request received', data: req.body });
    } else if (req.method === 'DELETE') {
      return res.json({ success: true, message: 'Local backend DELETE request received' });
    }
    
    next();
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin/`);
  console.log(`Local admin panel: http://localhost:${PORT}/admin/local.html`);
});