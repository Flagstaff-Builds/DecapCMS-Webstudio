const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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
  next();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin/`);
});