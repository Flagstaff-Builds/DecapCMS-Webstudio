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

// Function to get a single post by slug
function getPostBySlug(slug) {
  try {
    const postsDir = path.join(CONTENT_DIR, 'blog');
    
    if (!fs.existsSync(postsDir)) {
      console.error('Posts directory does not exist:', postsDir);
      return null;
    }
    
    // Look for a file matching the slug
    const postFiles = fs.readdirSync(postsDir);
    let targetFile = null;
    
    for (const filename of postFiles) {
      if ((filename === `${slug}.md`) || (filename === `${slug}.mdx`)) {
        targetFile = filename;
        break;
      }
    }
    
    if (!targetFile) {
      console.error(`No post found with slug: ${slug}`);
      return null;
    }
    
    const filePath = path.join(postsDir, targetFile);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content } = matter(fileContent);
    
    // Skip drafts unless we're in development
    if (frontmatter.draft && process.env.CONTEXT !== 'development') {
      return null;
    }
    
    const post = { 
      ...frontmatter, 
      slug,
      content 
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
    // Get the slug from query parameters
    const queryParams = event.queryStringParameters || {};
    const slug = queryParams.slug;
    
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
          error: 'Missing slug parameter'
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
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({ 
        success: true,
        post
      })
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
