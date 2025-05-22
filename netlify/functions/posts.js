const { builder } = require('@netlify/functions');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Log the current working directory and available files
console.log('Current working directory:', process.cwd());
try {
  console.log('Files in current directory:', fs.readdirSync(process.cwd()));
  console.log('Files in content directory:', fs.readdirSync(path.join(process.cwd(), '..', '..', 'content')));
} catch (error) {
  console.error('Error listing directories:', error);
}

// Function to get all posts
function getPosts() {
  try {
    const postsDir = path.join(process.cwd(), '..', '..', 'content', 'blog');
    console.log('Looking for posts in:', postsDir);
    
    if (!fs.existsSync(postsDir)) {
      console.error('Posts directory does not exist:', postsDir);
      return [];
    }
    
    const fileNames = fs.readdirSync(postsDir);
    console.log('Found markdown files:', fileNames);
    
    const posts = fileNames.map(fileName => {
      try {
        if (!fileName.endsWith('.md')) return null;
        
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(postsDir, fileName);
        console.log('Processing file:', fullPath);
        
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);
        
        return {
          ...data,
          slug,
          content
        };
      } catch (error) {
        console.error(`Error processing file ${fileName}:`, error);
        return null;
      }
    }).filter(Boolean); // Remove any null entries from failed processing

    // Sort posts by date (newest first)
    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error in getPosts:', error);
    return [];
  }
}

async function handler(event, context) {
  try {
    // Get all posts
    const allPosts = { posts: getPosts() };
    
    // Get pagination parameters from query string
    const query = event.queryStringParameters || {};
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    
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
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch posts' })
    };
  }
}

// Export the builder-wrapped handler
exports.handler = builder(handler);
