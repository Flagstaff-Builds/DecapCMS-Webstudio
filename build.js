const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const marked = require('marked');
require('dotenv').config();

// Root directories
const contentRootDir = path.join(process.cwd(), 'content');
const apiRootDir = path.join(process.cwd(), 'public');

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
 blogApiDir, categoriesApiDir, tagsApiDir, authorsApiDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

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
  
  // Convert markdown to HTML
  const htmlContent = marked.parse(content);
  
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
  
  // Build the post object
  return {
    slug: data.slug || filename.replace(/\.md$/, ''),
    title: data.title || 'Untitled',
    excerpt: data.excerpt || '',
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
