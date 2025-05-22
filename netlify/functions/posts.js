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

// Function to get all posts
function getPosts() {
  try {
    const postsDir = path.join(CONTENT_DIR, 'blog');
    
    if (!fs.existsSync(postsDir)) {
      console.error('Posts directory does not exist:', postsDir);
      return [];
    }
    
    const postFiles = fs.readdirSync(postsDir);
    const posts = [];
    
    for (const filename of postFiles) {
      try {
        if (!filename.endsWith('.md') && !filename.endsWith('.mdx')) {
          continue;
        }
        
        const filePath = path.join(postsDir, filename);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data: frontmatter, content } = matter(fileContent);
        
        // Skip drafts unless we're in development
        if (frontmatter.draft && process.env.CONTEXT !== 'development') {
          continue;
        }
        
        // Use the filename as the default slug
        const fileSlug = filename.replace(/\.(md|mdx)$/, '');
        
        // Store both the filename-based slug and the frontmatter slug if it exists
        const post = { 
          ...frontmatter, 
          slug: fileSlug,
          frontmatter_slug: frontmatter.slug // Store the frontmatter slug separately
        };
        
        // Process image fields
        if (post.feature_image) {
          if (typeof post.feature_image === 'string') {
            post.feature_image = { url: processImagePath(post.feature_image) };
          } else if (typeof post.feature_image === 'object' && post.feature_image.url) {
            post.feature_image.url = processImagePath(post.feature_image.url);
          }
        }
        
        posts.push(post);
      } catch (error) {
        console.error(`Error processing ${filename}:`, error);
      }
    }
    
    // Sort posts by date, newest first
    return posts.sort((a, b) => {
      const dateA = a.published_at || a.date || 0;
      const dateB = b.published_at || b.date || 0;
      return new Date(dateB) - new Date(dateA);
    });
  } catch (error) {
    console.error('Error getting posts:', error);
    return [];
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
    
    // Check if a slug is provided - if so, return a single post
    if (queryParams.slug || (rawQueryString && new URLSearchParams(rawQueryString).has('slug'))) {
      const slug = queryParams.slug || new URLSearchParams(rawQueryString).get('slug');
      console.log('Looking for post with slug:', slug);
      
      // Get all posts
      const allPosts = getPosts();
      
      // Find the post with the matching slug
      // Check both the slug property and the frontmatter slug field
      const post = allPosts.find(post => 
        post.slug === slug || 
        (post.slug && post.slug.replace(/\.(md|mdx)$/, '') === slug) ||
        post.frontmatter_slug === slug
      );
      
      if (!post) {
        console.log('No post found with slug:', slug);
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
      
      console.log('Found post with slug:', slug);
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS'
        },
        body: JSON.stringify(post)
      };
    }
    
    // If no slug is provided, handle as a paginated list request
    let page = 1;
    let limit = 10;
    
    // Parse limit from query parameters object
    if (queryParams && queryParams.limit) {
      const parsedLimit = parseInt(queryParams.limit, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        limit = parsedLimit;
        console.log(`Found limit in queryStringParameters: ${limit}`);
      }
    }
    
    // As a fallback, manually parse the raw query string
    if (rawQueryString) {
      const params = new URLSearchParams(rawQueryString);
      if (params.has('limit')) {
        const rawLimit = params.get('limit');
        const parsedLimit = parseInt(rawLimit, 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
          limit = parsedLimit;
          console.log(`Found limit in raw query string: ${limit}`);
        }
      }
      
      if (params.has('page')) {
        const rawPage = params.get('page');
        const parsedPage = parseInt(rawPage, 10);
        if (!isNaN(parsedPage) && parsedPage > 0) {
          page = parsedPage;
        }
      }
    }
    
    // Log final parameters after all parsing attempts
    console.log('FINAL pagination parameters:', { page, limit });
    
    // Get all posts
    const allPosts = getPosts();
    console.log('Total posts found:', allPosts.length);
    
    // Calculate pagination
    const totalPosts = allPosts.length;
    const totalPages = Math.ceil(totalPosts / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, totalPosts);
    
    // Log pagination calculation details
    console.log('Pagination calculation:', { 
      totalPosts,
      totalPages,
      startIndex,
      endIndex,
      postsToReturn: endIndex - startIndex
    });
    
    // Slice the array to get only the posts for the current page
    const paginatedPosts = allPosts.slice(startIndex, endIndex);
    
    // Log number of posts being returned
    console.log(`Returning ${paginatedPosts.length} posts for page ${page} with limit ${limit}`);
    
    // Log the first post to help with debugging
    if (paginatedPosts.length > 0) {
      console.log('First post in response:', {
        title: paginatedPosts[0].title,
        slug: paginatedPosts[0].slug,
        date: paginatedPosts[0].date || paginatedPosts[0].published_at
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
        },
        debug: {
          requestedLimit: event.queryStringParameters?.limit,
          parsedLimit: limit,
          rawQueryString: event.rawQuery || event.rawQueryString || '',
          queryParams: event.queryStringParameters || {}
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
