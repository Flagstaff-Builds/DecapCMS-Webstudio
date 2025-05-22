const { builder } = require('@netlify/functions');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Content directory is at /var/task/content in the Netlify function
const CONTENT_DIR = '/var/task/content';

// Site URL for generating absolute paths
const SITE_URL = process.env.URL || 'https://decapcms-webstudio.netlify.app';

// Log the current working directory and available files
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Content directory:', CONTENT_DIR);
console.log('Site URL:', SITE_URL);

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

function processContentImages(content) {
  if (!content) return content;
  
  // Process markdown images
  return content.replace(/!\[([^\]]*)]\(([^)]+)\)/g, (match, alt, imgPath) => {
    // Only process relative paths and paths that don't start with http
    if (!/^(https?:\/\/|\/)/.test(imgPath)) {
      const fullPath = processImagePath(imgPath);
      return `![${alt}](${fullPath})`;
    }
    return match;
  });
}

function processPostData(data, content) {
  const processedData = { ...data };
  
  // Process image fields
  const imageFields = ['image', 'cover', 'thumbnail', 'featured_image', 'feature_image'];
  
  imageFields.forEach(field => {
    if (processedData[field]) {
      if (typeof processedData[field] === 'string') {
        // For string fields, add a _url version with the full path
        processedData[`${field}_url`] = processImagePath(processedData[field]);
      } else if (processedData[field] && typeof processedData[field] === 'object' && processedData[field].url) {
        // For object fields (like feature_image), update the url property
        processedData[field] = {
          ...processedData[field],
          url: processImagePath(processedData[field].url)
        };
      }
    }
  });
  
  return {
    ...processedData,
    content: processContentImages(content)
  };
}

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
        
        // Process the post data (including image URLs)
        const processedPost = processPostData(frontmatter, content);
        
        // Add slug and excerpt
        const slug = filename.replace(/\.(md|mdx)$/, '');
        const excerpt = processedPost.excerpt || 
          (processedPost.content ? 
            processedPost.content.slice(0, 200).replace(/\s+\S*$/, '') + '...' : '');
        
        posts.push({
          ...processedPost,
          slug,
          excerpt
        });
      } catch (error) {
        console.error(`Error processing ${filename}:`, error);
      }
    }
    
    // Sort posts by date, newest first
    return posts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  } catch (error) {
    console.error('Error getting posts:', error);
    return [];
  }
}

// Create the handler
const handler = async (event, context) => {
  try {
    // Extract and log query parameters
    const queryParams = event.queryStringParameters || {};
    console.log('Request path:', event.path);
    console.log('Query parameters:', JSON.stringify(queryParams));
    
    // Check if this is a direct request or from Netlify's proxy
    const isDirectRequest = event.path.includes('/api/posts');
    
    // Get pagination parameters from query string with fallbacks
    let page = 1;
    let limit = 10;
    
    // Parse limit parameter, ensuring it's a valid number
    if (queryParams.limit) {
      const parsedLimit = parseInt(queryParams.limit, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        limit = parsedLimit;
      }
    }
    
    // Parse page parameter, ensuring it's a valid number
    if (queryParams.page) {
      const parsedPage = parseInt(queryParams.page, 10);
      if (!isNaN(parsedPage) && parsedPage > 0) {
        page = parsedPage;
      }
    }
    
    console.log(`Pagination parameters: page=${page}, limit=${limit}`);
    
    // Get all posts
    const allPosts = getPosts();
    console.log(`Total posts found: ${allPosts.length}`);
    
    // Calculate pagination
    const totalPosts = allPosts.length;
    const totalPages = Math.ceil(totalPosts / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, totalPosts);
    
    console.log(`Pagination indices: startIndex=${startIndex}, endIndex=${endIndex}`);
    
    // Slice the array to get only the posts for the current page
    const paginatedPosts = allPosts.slice(startIndex, endIndex);
    console.log(`Returning ${paginatedPosts.length} posts for this page`);
    
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
