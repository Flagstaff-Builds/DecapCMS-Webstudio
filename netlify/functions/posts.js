const fs = require('fs');
const path = require('path');
const { builder } = require('@netlify/functions');

async function handler(event, context) {
  try {
    // Try multiple possible locations for the posts.json file
    const possiblePaths = [
      path.join(process.cwd(), 'public', 'api', 'posts.json'), // Netlify production
      path.join(process.cwd(), 'api', 'posts.json'), // Local development
      path.join(process.cwd(), '..', 'public', 'api', 'posts.json') // Fallback
    ];
    
    let postsPath = '';
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        postsPath = possiblePath;
        break;
      }
    }
    
    // If no valid path was found, return an error
    if (!postsPath) {
      console.error('Could not find posts.json in any of these locations:', possiblePaths);
      return {
        statusCode: 404,
        body: JSON.stringify({ 
          error: 'Posts data not found',
          searchedPaths: possiblePaths,
          message: 'Please ensure the build process has run and generated the posts.json file.'
        })
      };
    }
    
    console.log('Found posts.json at:', postsPath);
    
    // Read and parse the posts data
    const allPosts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
    
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
