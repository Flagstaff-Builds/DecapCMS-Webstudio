const fs = require('fs');
const path = require('path');
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
      
      return {
        ...data,
        slug: data.slug || filename.replace(/\.md$/, '')
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
  
  let authorData = [];
  if (data.authors && Array.isArray(data.authors)) {
    authorData = data.authors
      .filter(authorSlug => authorMap[authorSlug])
      .map(authorSlug => authorMap[authorSlug]);
  }
  
  // Process feature image if it exists
  let featureImage = null;
  if (data.feature_image && data.feature_image.url) {
    // Create a new object with all the feature image properties
    featureImage = {
      ...data.feature_image,
      // Convert the URL to an absolute URL
      url: convertImagePathToAbsoluteUrl(data.feature_image.url)
    };
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

// Create individual files for each post
posts.forEach(post => {
  fs.writeFileSync(
    path.join(blogApiDir, `${post.slug}.json`),
    JSON.stringify(post, null, 2)
  );
});

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
  require('./build.js');
  return;
}

console.log(`Generated JSON files for ${posts.length} blog posts, ${categories.length} categories, ${tags.length} tags, and ${authors.length} authors`);
