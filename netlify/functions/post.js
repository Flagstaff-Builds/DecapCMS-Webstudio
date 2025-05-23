const { builder } = require('@netlify/functions');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Content directory is at /var/task/content in the Netlify function
const CONTENT_DIR = '/var/task/content';

// Site URL for generating absolute paths
const SITE_URL = process.env.URL || 'https://decapcms-webstudio.netlify.app';

// Function to process image paths to absolute URLs
function processImagePath(imgPath) {
  if (!imgPath) return imgPath;
  
  // If it's already a full URL, return as is
  if (/^https?:\/\//.test(imgPath)) {
    return imgPath;
  }
  
  // Remove any leading slashes
  const cleanPath = imgPath.replace(/^\/+/, '');
  
  // If it's already in the images directory, use as is, otherwise prepend images/
  const finalPath = cleanPath.startsWith('images/') ? cleanPath : `images/${cleanPath}`;
  
  return `${SITE_URL}/${finalPath}`;
}

// Function to load all authors
function loadAuthors() {
  try {
    const authorsDir = path.join(CONTENT_DIR, 'authors');
    
    if (!fs.existsSync(authorsDir)) {
      console.error('Authors directory does not exist:', authorsDir);
      return {};
    }
    
    const authorFiles = fs.readdirSync(authorsDir);
    const authorMap = {};
    
    for (const filename of authorFiles) {
      if (!filename.endsWith('.md')) {
        continue;
      }
      
      const filePath = path.join(authorsDir, filename);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContent);
      
      const slug = data.slug || filename.replace('.md', '');
      
      // Process author data with proper image URL
      authorMap[slug] = {
        name: data.name,
        slug: slug,
        image_url: processImagePath(data.image_url),
        bio: data.bio || null,
        url: data.url || null
      };
    }
    
    return authorMap;
  } catch (error) {
    console.error('Error loading authors:', error);
    return {};
  }
}

// Function to load all categories
function loadCategories() {
  try {
    const categoriesDir = path.join(CONTENT_DIR, 'categories');
    
    if (!fs.existsSync(categoriesDir)) {
      console.error('Categories directory does not exist:', categoriesDir);
      return {};
    }
    
    const categoryFiles = fs.readdirSync(categoriesDir);
    const categoryMap = {};
    
    for (const filename of categoryFiles) {
      if (!filename.endsWith('.md')) {
        continue;
      }
      
      const filePath = path.join(categoriesDir, filename);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContent);
      
      const slug = data.slug || filename.replace('.md', '');
      
      categoryMap[slug] = {
        name: data.name,
        slug: slug
      };
    }
    
    return categoryMap;
  } catch (error) {
    console.error('Error loading categories:', error);
    return {};
  }
}

// Function to load all tags
function loadTags() {
  try {
    const tagsDir = path.join(CONTENT_DIR, 'tags');
    
    if (!fs.existsSync(tagsDir)) {
      console.error('Tags directory does not exist:', tagsDir);
      return {};
    }
    
    const tagFiles = fs.readdirSync(tagsDir);
    const tagMap = {};
    
    for (const filename of tagFiles) {
      if (!filename.endsWith('.md')) {
        continue;
      }
      
      const filePath = path.join(tagsDir, filename);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContent);
      
      const slug = data.slug || filename.replace('.md', '');
      
      tagMap[slug] = {
        name: data.name,
        slug: slug
      };
    }
    
    return tagMap;
  } catch (error) {
    console.error('Error loading tags:', error);
    return {};
  }
}

// Function to get a single post by slug
function getPostBySlug(slug) {
  try {
    const postsDir = path.join(CONTENT_DIR, 'blog');
    
    if (!fs.existsSync(postsDir)) {
      console.error('Posts directory does not exist:', postsDir);
      return null;
    }
    
    // Load all authors, categories, and tags first
    const authorMap = loadAuthors();
    const categoryMap = loadCategories();
    const tagMap = loadTags();
    
    // Get all post files
    const postFiles = fs.readdirSync(postsDir);
    let targetFile = null;
    
    // First try: Check if there's a file with a matching filename
    for (const filename of postFiles) {
      if ((filename === `${slug}.md`) || (filename === `${slug}.mdx`)) {
        targetFile = filename;
        break;
      }
    }
    
    // Second try: If no file matches by name, check frontmatter slugs
    if (!targetFile) {
      console.log(`No file with name ${slug}.md found, checking frontmatter slugs...`);
      
      for (const filename of postFiles) {
        if (!filename.endsWith('.md') && !filename.endsWith('.mdx')) {
          continue;
        }
        
        const filePath = path.join(postsDir, filename);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data: frontmatter } = matter(fileContent);
        
        if (frontmatter.slug === slug) {
          console.log(`Found matching frontmatter slug in file: ${filename}`);
          targetFile = filename;
          break;
        }
      }
    }
    
    if (!targetFile) {
      console.error(`No post found with slug: ${slug} (checked both filenames and frontmatter)`);
      return null;
    }
    
    const filePath = path.join(postsDir, targetFile);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content } = matter(fileContent);
    
    // Skip drafts unless we're in development
    if (frontmatter.draft && process.env.CONTEXT !== 'development') {
      return null;
    }
    
    // Get the markdown content
    let markdownContent = '';
    if (frontmatter.html_content) {
      // If html_content exists in frontmatter, use that as markdown
      markdownContent = frontmatter.html_content;
    } else {
      // Otherwise use the content from the markdown file
      markdownContent = content;
    }
    
    // Process author data
    let authorData = null;
    if (frontmatter.author && authorMap[frontmatter.author]) {
      authorData = authorMap[frontmatter.author];
    } else if (frontmatter.authors && Array.isArray(frontmatter.authors) && frontmatter.authors.length > 0) {
      // Handle legacy authors array format
      const authorSlug = frontmatter.authors[0];
      if (authorMap[authorSlug]) {
        authorData = authorMap[authorSlug];
      }
    }
    
    // Process category data
    let categoryData = null;
    if (frontmatter.category && categoryMap[frontmatter.category]) {
      categoryData = categoryMap[frontmatter.category];
    }
    
    // Process tags data
    let tagData = [];
    if (frontmatter.tags && Array.isArray(frontmatter.tags)) {
      tagData = frontmatter.tags
        .filter(tagSlug => tagMap[tagSlug])
        .map(tagSlug => tagMap[tagSlug]);
    }
    
    // Enhance the post object with additional fields
    const post = { 
      ...frontmatter, 
      slug,
      content: markdownContent,
      markdown_content: markdownContent, // Include raw markdown content
      // Use the properly formatted author data from the map
      author: authorData,
      authors: authorData, // Keep this for backward compatibility
      category: categoryData,
      tags: tagData
    };
    
    // Process image fields
    if (post.feature_image) {
      if (typeof post.feature_image === 'string') {
        post.feature_image = { url: processImagePath(post.feature_image) };
      } else if (typeof post.feature_image === 'object' && post.feature_image.url) {
        post.feature_image.url = processImagePath(post.feature_image.url);
      }
    }
    
    return post;
  } catch (error) {
    console.error(`Error getting post by slug ${slug}:`, error);
    return null;
  }
}

// Create the handler
const handler = async (event, context) => {
  try {
    // Log the complete event object for debugging
    console.log('Event path:', event.path);
    console.log('Event httpMethod:', event.httpMethod);
    console.log('Event headers:', JSON.stringify(event.headers));
    
    // Get query parameters from multiple possible sources
    const rawQueryString = event.rawQuery || event.rawQueryString || '';
    const queryParams = event.queryStringParameters || {};
    
    console.log('Raw query string:', rawQueryString);
    console.log('Query parameters object:', JSON.stringify(queryParams));
    
    // Try to get the slug from multiple sources
    let slug = queryParams.slug;
    
    // If slug is not found in queryParams, try parsing it from the raw query string
    if (!slug && rawQueryString) {
      try {
        const params = new URLSearchParams(rawQueryString);
        if (params.has('slug')) {
          slug = params.get('slug');
          console.log('Found slug in raw query string:', slug);
        }
      } catch (error) {
        console.error('Error parsing raw query string:', error);
      }
    }
    
    // If still no slug, check if it's in the URL path
    if (!slug && event.path) {
      const pathParts = event.path.split('/');
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart !== 'post') {
        slug = lastPart;
        console.log('Found slug in path:', slug);
      }
    }
    
    console.log('Final slug value:', slug);
    
    if (!slug) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS'
        },
        body: JSON.stringify({ 
          success: false,
          error: 'Missing slug parameter',
          debug: {
            rawQueryString,
            queryParams,
            path: event.path
          }
        })
      };
    }
    
    // Get the post by slug
    const post = getPostBySlug(slug);
    
    if (!post) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS'
        },
        body: JSON.stringify({ 
          success: false,
          error: 'Post not found'
        })
      };
    }
    
    // Format the response to match what Webstudio expects
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify(post) // Return just the post object directly
    };
  } catch (error) {
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({ 
        success: false,
        error: 'Failed to fetch post',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};

// Export the builder-wrapped handler
module.exports = { handler: builder(handler) };
