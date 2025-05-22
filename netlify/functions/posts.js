const { builder } = require('@netlify/functions');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Content directory is at /var/task/content in the Netlify function
const CONTENT_DIR = '/var/task/content';

// Log the current working directory and available files
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Content directory:', CONTENT_DIR);

// Function to get all posts
function getPosts() {
  try {
    const postsDir = path.join(CONTENT_DIR, 'blog');
    console.log('Looking for posts in:', postsDir);
    
    if (!fs.existsSync(postsDir)) {
      console.error('Posts directory does not exist:', postsDir);
      return [];
    }
    
    const postFiles = fs.readdirSync(postsDir);
    console.log('Found post files:', postFiles);
    
    const posts = [];
    
    for (const filename of postFiles) {
      try {
        if (!filename.endsWith('.md') && !filename.endsWith('.mdx')) {
          continue;
        }
        
        const filePath = path.join(postsDir, filename);
        console.log(`Processing post: ${filePath}`);
        
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data: frontmatter, content } = matter(fileContent);
        
        // Skip drafts unless we're in development
        if (frontmatter.draft && process.env.CONTEXT !== 'development') {
          console.log(`Skipping draft: ${filename}`);
          continue;
        }
        
        const slug = filename.replace(/\.(md|mdx)$/, '');
        
        posts.push({
          title: frontmatter.title || 'Untitled',
          date: frontmatter.date || new Date().toISOString(),
          slug,
          excerpt: frontmatter.excerpt || content.slice(0, 200).replace(/\s+\S*$/, '') + '...',
          content,
          ...frontmatter
        });
      } catch (error) {
        console.error(`Error processing ${filename}:`, error);
      }
    }
    
    // Sort posts by date, newest first
    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error getting posts:', error);
    return [];
  }
}

// Create the handler
const handler = async (event, context) => {
  try {
    console.log('Processing request:', event.path, event.queryStringParameters);
    
    // Get pagination parameters from query string
    const page = parseInt(event.queryStringParameters?.page) || 1;
    const limit = parseInt(event.queryStringParameters?.limit) || 10;
    
    // Get all posts
    const allPosts = getPosts();
    
    // Calculate pagination
    const totalPosts = allPosts.length;
    const totalPages = Math.ceil(totalPosts / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, totalPosts);
    const paginatedPosts = allPosts.slice(startIndex, endIndex);
    
    // Log the first post to help with debugging
    if (paginatedPosts.length > 0) {
      console.log('First post in response:', {
        title: paginatedPosts[0].title,
        slug: paginatedPosts[0].slug,
        date: paginatedPosts[0].date,
        excerpt: paginatedPosts[0].excerpt
      });
    } else {
      console.log('No posts found for this page');
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
        count: paginatedPosts.length,
        posts: paginatedPosts,
        pagination: {
          currentPage: page,
          postsPerPage: limit,
          totalPosts,
          totalPages,
          hasNextPage: endIndex < totalPosts,
          hasPrevPage: startIndex > 0
        }
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
        error: 'Failed to fetch posts',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};

// Export the builder-wrapped handler
module.exports = { handler: builder(handler) };
