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

// Middleware to process config.yml for admin paths
app.use((req, res, next) => {
  // Check if request is for config.yml in either admin path
  if (req.path === '/admin/config.yml' || req.path === '/admin/cms/config.yml') {
    try {
      // Generate config using the same logic as Netlify function
      const config = `backend:
  name: git-gateway
  branch: ${process.env.GITHUB_BRANCH || 'main'}
  accept_roles: [admin, editor]

# Media files will be stored in the repo under images/uploads
media_folder: "${process.env.MEDIA_FOLDER || 'images/uploads'}"
public_folder: "${process.env.PUBLIC_FOLDER || '/images/uploads'}"

# Publish mode configuration
${process.env.PUBLISH_MODE ? `publish_mode: ${process.env.PUBLISH_MODE}` : '# publish_mode is not set (defaults to simple)'}

# Set site URL
site_url: ${process.env.SITE_URL || 'http://localhost:3000'}
display_url: ${process.env.SITE_URL || 'http://localhost:3000'}

# Collections for blog and related content
collections:
  - name: "blog"
    label: "Blog"
    folder: "${process.env.CONTENT_FOLDER || 'content/blog'}"
    create: true
    slug: "{{slug}}"
    fields:
      - { label: "Title", name: "title", widget: "string" }
      - { label: "Slug", name: "slug", widget: "string" }
      - { label: "Excerpt", name: "excerpt", widget: "text", required: false }
      - label: "Feature Image"
        name: "feature_image"
        widget: "object"
        required: false
        fields:
          - { label: "Image", name: "url", widget: "image", required: true }
          - { label: "Alt Text", name: "alt", widget: "string", required: false }
          - { label: "Title", name: "title", widget: "string", required: false }
          - { label: "Width", name: "width", widget: "number", required: false, value_type: "int" }
          - { label: "Height", name: "height", widget: "number", required: false, value_type: "int" }
      - { label: "HTML Content", name: "html_content", widget: "markdown" }
      - { label: "Published At", name: "published_at", widget: "datetime" }
      - label: "Category"
        name: "category"
        widget: "relation"
        collection: "categories"
        search_fields: ["name"]
        value_field: "slug"
        display_fields: ["name"]
        required: false
      - label: "Tags"
        name: "tags"
        widget: "relation"
        collection: "tags"
        search_fields: ["name"]
        value_field: "slug"
        display_fields: ["name"]
        multiple: true
        required: false
      - label: "Author"
        name: "author"
        widget: "relation"
        collection: "authors"
        search_fields: ["name"]
        value_field: "slug"
        display_fields: ["name"]
        required: false

  - name: "categories"
    label: "Categories"
    folder: "content/categories"
    create: true
    slug: "{{slug}}"
    fields:
      - { label: "Name", name: "name", widget: "string" }
      - { label: "Slug", name: "slug", widget: "string" }

  - name: "tags"
    label: "Tags"
    folder: "content/tags"
    create: true
    slug: "{{slug}}"
    fields:
      - { label: "Name", name: "name", widget: "string" }
      - { label: "Slug", name: "slug", widget: "string" }

  - name: "authors"
    label: "Authors"
    folder: "content/authors"
    create: true
    slug: "{{slug}}"
    fields:
      - { label: "Name", name: "name", widget: "string" }
      - { label: "Slug", name: "slug", widget: "string" }
      - { label: "Image URL", name: "image_url", widget: "image", required: false }
      - { label: "Website", name: "website", widget: "string", required: false }
      - { label: "Twitter", name: "twitter", widget: "string", required: false }
      - { label: "Bio", name: "bio", widget: "text", required: false }`;
      
      // Serve the processed content
      res.setHeader('Content-Type', 'text/yaml');
      return res.send(config);
    } catch (error) {
      console.error('Error processing config:', error);
      return next(); // Fall through to static file serving if there's an error
    }
  }
  
  // Process config.local.yml if requested
  if (req.path === '/admin/config.local.yml' || req.path === '/admin/cms/config.local.yml') {
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

// API endpoint for paginated posts
app.get('/api/posts', (req, res) => {
  try {
    // Read the posts data file
    const postsPath = path.join(__dirname, 'public', 'api', 'posts.json');
    
    // Check if the file exists
    if (!fs.existsSync(postsPath)) {
      return res.status(404).json({ error: 'Posts data not found. Please run the build process first.' });
    }
    
    // Read and parse the posts data
    const allPosts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
    
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default to 10 posts per page
    
    // Calculate pagination values
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Get the paginated posts
    const posts = allPosts.posts || [];
    const paginatedPosts = posts.slice(startIndex, endIndex);
    
    // Create response object with pagination metadata
    const totalPosts = posts.length;
    const totalPages = Math.ceil(totalPosts / limit);
    
    const response = {
      posts: paginatedPosts,
      pagination: {
        currentPage: page,
        postsPerPage: limit,
        totalPosts,
        totalPages,
        hasNextPage: endIndex < totalPosts,
        hasPrevPage: startIndex > 0
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`\nAdmin panels:`);
  console.log(`  Legacy: http://localhost:${PORT}/admin/`);
  console.log(`  New CMS: http://localhost:${PORT}/admin/cms/`);
  console.log(`  Example embed: http://localhost:${PORT}/admin/edit-blogs-example.html`);
  console.log(`\nLocal test panels:`);
  console.log(`  Legacy: http://localhost:${PORT}/admin/local.html`);
  console.log(`  New CMS: http://localhost:${PORT}/admin/cms/local.html`);
});