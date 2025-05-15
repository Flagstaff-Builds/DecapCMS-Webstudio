const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const marked = require('marked');

// Create necessary directories if they don't exist
const contentDir = path.join(process.cwd(), 'content/blog');
const apiDir = path.join(process.cwd(), 'public/blog');

if (!fs.existsSync(contentDir)) {
  fs.mkdirSync(contentDir, { recursive: true });
}

if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

// Process blog posts
console.log('Building blog JSON files...');

// Check if the directory has any files
const blogFiles = fs.existsSync(contentDir) ? fs.readdirSync(contentDir) : [];

// Process each blog post
const posts = blogFiles
  .filter(filename => filename.endsWith('.md'))
  .map(filename => {
    const filePath = path.join(contentDir, filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse frontmatter and content
    const { data, content } = matter(fileContent);
    
    // Convert markdown to HTML
    const htmlContent = marked.parse(content);
    
    return {
      slug: filename.replace(/\.md$/, ''),
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString(),
      featured_image: data.featured_image || null,
      description: data.description || '',
      content: htmlContent
    };
  });

// Sort posts by date (newest first)
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

// Create a file with all posts
fs.writeFileSync(
  path.join(apiDir, 'index.json'),
  JSON.stringify({ posts }, null, 2)
);

// Create individual files for each post
posts.forEach(post => {
  fs.writeFileSync(
    path.join(apiDir, `${post.slug}.json`),
    JSON.stringify(post, null, 2)
  );
});

// Create a sample post if there are no posts
if (posts.length === 0) {
  console.log('No posts found. Creating a sample post...');
  
  const samplePostContent = `---
title: Welcome to Your Blog
date: ${new Date().toISOString()}
description: This is a sample blog post to help you get started.
---

# Welcome to Your Blog!

This is a sample blog post created automatically to help you get started.

## What's Next?

1. Go to the admin panel (/admin) to login and create real blog posts
2. Edit this sample post or delete it once you've created your own content
3. Connect your Webstudio project to this CMS

Enjoy blogging!
`;

  const samplePostPath = path.join(contentDir, 'welcome-post.md');
  fs.writeFileSync(samplePostPath, samplePostContent);
  
  // Run the build again to process the sample post
  console.log('Re-running build to process sample post...');
  require('./build.js');
  return;
}

console.log(`Generated JSON files for ${posts.length} blog posts`);
