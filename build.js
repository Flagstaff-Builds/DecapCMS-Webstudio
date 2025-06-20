const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const matter = require('gray-matter');
const marked = require('marked');
require('dotenv').config();

// Get site URL from environment variables
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';

// Function to convert relative image paths to absolute URLs in markdown content
function convertRelativePathsToAbsolute(markdownContent) {
  // Regular expression to find markdown image syntax: ![alt text](/path/to/image.jpg)
  const imageRegex = /!\[([^\]]*)\]\((\/[^\)]+)\)/g;
  
  // Replace relative paths with absolute URLs
  return markdownContent.replace(imageRegex, (match, altText, relativePath) => {
    // Ensure the site URL doesn't have a trailing slash before concatenating
    const baseUrl = SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL;
    // Create the absolute URL
    const absoluteUrl = `${baseUrl}${relativePath}`;
    // Return the markdown image syntax with the absolute URL
    return `![${altText}](${absoluteUrl})`;
  });
}

// Function to convert a relative image path to an absolute URL
function convertImagePathToAbsoluteUrl(relativePath) {
  // Only process paths that start with a slash
  if (relativePath && relativePath.startsWith('/')) {
    // Ensure the site URL doesn't have a trailing slash before concatenating
    const baseUrl = SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL;
    // Create the absolute URL
    return `${baseUrl}${relativePath}`;
  }
  // Return the original path if it's not a relative path starting with a slash
  return relativePath;
}

// Root directories
const contentRootDir = path.join(process.cwd(), 'content');
const apiRootDir = path.join(process.cwd(), 'public');
const imagesDir = path.join(process.cwd(), 'images');
const publicImagesDir = path.join(apiRootDir, 'images');

// Collection directories
const blogDir = path.join(contentRootDir, 'blog');
const categoriesDir = path.join(contentRootDir, 'categories');
const tagsDir = path.join(contentRootDir, 'tags');
const authorsDir = path.join(contentRootDir, 'authors');

// API output directories
const blogApiDir = path.join(apiRootDir, 'blog');
const categoriesApiDir = path.join(apiRootDir, 'categories');
const tagsApiDir = path.join(apiRootDir, 'tags');
const authorsApiDir = path.join(apiRootDir, 'authors');

// Ensure all directories exist
[blogDir, categoriesDir, tagsDir, authorsDir, 
 blogApiDir, categoriesApiDir, tagsApiDir, authorsApiDir, publicImagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Helper function to copy a directory recursively
function copyDirectoryRecursive(source, target) {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  // Read all files/directories from source
  const entries = fs.readdirSync(source, { withFileTypes: true });

  // Process each entry
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy directories
      copyDirectoryRecursive(sourcePath, targetPath);
    } else {
      // Copy files
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

// Copy images directory to public directory
console.log('Copying images to public directory...');
if (fs.existsSync(imagesDir)) {
  copyDirectoryRecursive(imagesDir, publicImagesDir);
}

// Helper function to load all files from a directory
function loadMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  
  return fs.readdirSync(dir)
    .filter(filename => filename.endsWith('.md'))
    .map(filename => {
      const filePath = path.join(dir, filename);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContent);
      
      // Process any image URLs in the data
      const processedData = { ...data };
      
      // Convert image_url to absolute URL if it exists and is a relative path
      if (processedData.image_url && processedData.image_url.startsWith('/')) {
        processedData.image_url = convertImagePathToAbsoluteUrl(processedData.image_url);
      }
      
      return {
        ...processedData,
        slug: processedData.slug || filename.replace(/\.md$/, '')
      };
    });
}

// Process categories
console.log('Loading categories...');
const categories = loadMarkdownFiles(categoriesDir);
const categoryMap = categories.reduce((acc, category) => {
  acc[category.slug] = category;
  return acc;
}, {});

// Process tags
console.log('Loading tags...');
const tags = loadMarkdownFiles(tagsDir);
const tagMap = tags.reduce((acc, tag) => {
  acc[tag.slug] = tag;
  return acc;
}, {});

// Process authors
console.log('Loading authors...');
const authors = loadMarkdownFiles(authorsDir);
const authorMap = authors.reduce((acc, author) => {
  acc[author.slug] = author;
  return acc;
}, {});

// Process blog posts
console.log('Building blog JSON files...');
const blogFiles = fs.existsSync(blogDir) ? fs.readdirSync(blogDir).filter(f => f.endsWith('.md')) : [];

// Process each blog post
const posts = blogFiles.map(filename => {
  const filePath = path.join(blogDir, filename);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Parse frontmatter and content
  const { data, content } = matter(fileContent);
  
  // Get the markdown content
  let markdownContent = '';
  if (data.html_content) {
    // If html_content exists in frontmatter, use that as markdown
    markdownContent = data.html_content;
  } else {
    // Otherwise use the content from the markdown file
    markdownContent = content;
  }
  
  // Convert relative image paths to absolute URLs in markdown content
  const processedMarkdownContent = convertRelativePathsToAbsolute(markdownContent);
  
  // Store both markdown and HTML versions
  const htmlContent = marked.parse(processedMarkdownContent);
  
  // Process relationships
  let categoryData = null;
  if (data.category && categoryMap[data.category]) {
    categoryData = categoryMap[data.category];
  }
  
  let tagData = [];
  if (data.tags && Array.isArray(data.tags)) {
    tagData = data.tags
      .filter(tagSlug => tagMap[tagSlug])
      .map(tagSlug => tagMap[tagSlug]);
  }
  
  // Process author (single author instead of array)
  let authorData = null;
  if (data.author && authorMap[data.author]) {
    authorData = authorMap[data.author];
  }
  
  // For backward compatibility with existing content that might use authors array
  if (!authorData && data.authors && Array.isArray(data.authors) && data.authors.length > 0) {
    const authorSlug = data.authors[0];
    if (authorMap[authorSlug]) {
      authorData = authorMap[authorSlug];
    }
  }
  
  // Process feature image if it exists
  let featureImage = null;
  if (data.feature_image) {
    // Check if feature_image is a string (old format) or an object (new format)
    if (typeof data.feature_image === 'string') {
      // Old format: convert the string path to an object with url
      featureImage = {
        url: convertImagePathToAbsoluteUrl(data.feature_image),
        alt: '',
        title: ''
      };
    } else if (data.feature_image.url) {
      // New format: create a new object with all the feature image properties
      featureImage = {
        ...data.feature_image,
        // Convert the URL to an absolute URL
        url: convertImagePathToAbsoluteUrl(data.feature_image.url)
      };
    }
  }

  // Build the post object
  return {
    slug: data.slug || filename.replace(/\.md$/, ''),
    title: data.title || 'Untitled',
    excerpt: data.excerpt || '',
    feature_image: featureImage,
    markdown_content: processedMarkdownContent,
    html_content: htmlContent,
    published_at: data.published_at || new Date().toISOString(),
    category: categoryData,
    tags: tagData,
    authors: authorData
  };
});

// Sort posts by date (newest first)
posts.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

// Create a file with all posts
fs.writeFileSync(
  path.join(blogApiDir, 'index.json'),
  JSON.stringify({ posts }, null, 2)
);

// Create a function to generate limited post files
function createLimitedPostsFile(limit) {
  if (limit > 0) {
    // Take up to 'limit' posts, or all posts if there are fewer than the limit
    const limitedPosts = posts.slice(0, Math.min(limit, posts.length));
    fs.writeFileSync(
      path.join(blogApiDir, `index-${limit}.json`),
      JSON.stringify({ 
        posts: limitedPosts, 
        total: posts.length, 
        limit: limit 
      }, null, 2)
    );
    console.log(`Created limited posts file with ${limitedPosts.length}/${limit} posts: index-${limit}.json`);
  }
}

// Create a function to generate paginated post files
function createPaginatedPostsFile(pageSize, pageNumber) {
  if (pageSize > 0 && pageNumber > 0) {
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, posts.length);
    
    // Only create the page if it has content or it's the first page
    if (startIndex < posts.length || pageNumber === 1) {
      const paginatedPosts = posts.slice(startIndex, endIndex);
      const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
      
      fs.writeFileSync(
        path.join(blogApiDir, `page-${pageNumber}.json`),
        JSON.stringify({ 
          posts: paginatedPosts, 
          total: posts.length,
          page: pageNumber,
          pageSize: pageSize,
          totalPages: totalPages,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1
        }, null, 2)
      );
      console.log(`Created paginated posts file: page-${pageNumber}.json with ${paginatedPosts.length} posts`);
    }
  }
}

// Create common limited post files (1, 3, 5, 10)
createLimitedPostsFile(1);
createLimitedPostsFile(3);
createLimitedPostsFile(5);
createLimitedPostsFile(10);

// Create paginated files (3 posts per page)
const postsPerPage = 3;
const totalPages = Math.ceil(posts.length / postsPerPage) || 1; // At least 1 page

// Create paginated files for all pages
for (let i = 1; i <= totalPages; i++) {
  createPaginatedPostsFile(postsPerPage, i);
}

// Also create a default page-1.json for convenience
if (fs.existsSync(path.join(blogApiDir, 'page-1.json'))) {
  fs.copyFileSync(
    path.join(blogApiDir, 'page-1.json'),
    path.join(blogApiDir, 'index-paginated.json')
  );
}

// Create individual files for each post
posts.forEach(post => {
  fs.writeFileSync(
    path.join(blogApiDir, `${post.slug}.json`),
    JSON.stringify(post, null, 2)
  );
});

// Create a single posts.json file for the API
const apiDir = path.join(process.cwd(), 'public', 'api');
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

const postsFilePath = path.join(apiDir, 'posts.json');
fs.writeFileSync(
  postsFilePath,
  JSON.stringify({ posts }, null, 2)
);
console.log(`Created API file at ${postsFilePath} with ${posts.length} posts`);

// Also create a copy in the root for local development
const localApiDir = path.join(process.cwd(), 'api');
if (!fs.existsSync(localApiDir)) {
  fs.mkdirSync(localApiDir, { recursive: true });
}
fs.copyFileSync(postsFilePath, path.join(localApiDir, 'posts.json'));

// Generate index.html with environment variables
const SITE_TITLE = process.env.SITE_TITLE || 'Blog';
const indexHtmlTemplate = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${SITE_TITLE}</title>
    <!-- Include Netlify Identity Widget for handling invitation links -->
    <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
  </head>
  <body>
    <h1>${SITE_TITLE}</h1>
    <p>This is the blog management system for ${SITE_TITLE}. To access the admin panel, go to <a href="/admin/">Admin Area</a>.</p>
    
    <!-- Handle invitation tokens and redirect to the admin page -->
    <script>
      if (window.netlifyIdentity) {
        window.netlifyIdentity.on("init", user => {
          if (!user) {
            // Check if we have an invite token in the URL
            const hash = window.location.hash;
            if (hash && hash.includes('invite_token')) {
              // Redirect to the admin page with the same hash
              window.location.href = "/admin/" + hash;
            }
            
            window.netlifyIdentity.on("login", () => {
              document.location.href = "/admin/";
            });
          }
        });
      }
    </script>
  </body>
</html>`;

fs.writeFileSync(path.join(apiRootDir, 'index.html'), indexHtmlTemplate);

// Write categories, tags, and authors to JSON files
fs.writeFileSync(
  path.join(categoriesApiDir, 'index.json'),
  JSON.stringify({ categories }, null, 2)
);

fs.writeFileSync(
  path.join(tagsApiDir, 'index.json'),
  JSON.stringify({ tags }, null, 2)
);

fs.writeFileSync(
  path.join(authorsApiDir, 'index.json'),
  JSON.stringify({ authors }, null, 2)
);

// Copy _headers and _redirects if they exist (for platform compatibility)
const headersPath = path.join(process.cwd(), '_headers');
const redirectsPath = path.join(process.cwd(), '_redirects');
const publicHeadersPath = path.join(apiRootDir, '_headers');
const publicRedirectsPath = path.join(apiRootDir, '_redirects');

// Only copy if source files exist and destination doesn't
if (fs.existsSync(headersPath) && !fs.existsSync(publicHeadersPath)) {
  fs.copyFileSync(headersPath, publicHeadersPath);
  console.log('Copied _headers to public directory');
}

if (fs.existsSync(redirectsPath) && !fs.existsSync(publicRedirectsPath)) {
  fs.copyFileSync(redirectsPath, publicRedirectsPath);
  console.log('Copied _redirects to public directory');
}

// Create a sample post if there are no posts
if (posts.length === 0) {
  console.log('No posts found. Creating sample content...');
  
  // Create sample category
  const sampleCategoryContent = `---
name: Getting Started
slug: getting-started
---`;
  fs.writeFileSync(path.join(categoriesDir, 'getting-started.md'), sampleCategoryContent);
  
  // Create sample tag
  const sampleTagContent = `---
name: Welcome
slug: welcome
---`;
  fs.writeFileSync(path.join(tagsDir, 'welcome.md'), sampleTagContent);
  
  // Create sample author
  const sampleAuthorContent = `---
name: Admin
slug: admin
bio: Site administrator
---`;
  fs.writeFileSync(path.join(authorsDir, 'admin.md'), sampleAuthorContent);
  
  // Create sample blog post
  const samplePostContent = `---
title: Welcome to Your Blog
slug: welcome-post
excerpt: This is a sample blog post to help you get started with your Decap CMS and Webstudio setup.
published_at: ${new Date().toISOString()}
category: getting-started
tags:
  - welcome
authors:
  - admin
---

# Welcome to Your Blog!

This is a sample blog post created automatically to help you get started.

## What's Next?

1. Go to the admin panel (/admin) to login and create real blog posts
2. Edit this sample post or delete it once you've created your own content
3. Connect your Webstudio project to this CMS

Enjoy blogging!
`;

  const samplePostPath = path.join(blogDir, 'welcome-post.md');
  fs.writeFileSync(samplePostPath, samplePostContent);
  
  // Run the build again to process the sample content
  console.log('Re-running build to process sample content...');
  // Spawn a new Node process to rerun this script because require() is cached
  spawnSync('node', [__filename], { stdio: 'inherit' });
  return;
}

console.log(`Generated JSON files for ${posts.length} blog posts, ${categories.length} categories, ${tags.length} tags, and ${authors.length} authors`);
