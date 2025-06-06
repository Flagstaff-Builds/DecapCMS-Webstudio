const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Site URL for generating absolute paths
const SITE_URL = 'https://decapcms-webstudio.netlify.app';

function processImagePath(imgPath) {
  if (!imgPath) return imgPath;
  
  // If it's already a full URL, return as is
  if (/^https?:\/\//.test(imgPath)) {
    return imgPath;
  }
  
  // Remove any leading slashes and ensure it starts with /images/
  const cleanPath = imgPath.replace(/^\/+/, '');
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
        processedData[`${field}_url`] = processImagePath(processedData[field]);
      } else if (processedData[field] && typeof processedData[field] === 'object' && processedData[field].url) {
        // Handle object-style image fields (like feature_image)
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

function getAllPosts() {
  const postsDir = path.join(process.cwd(), 'content', 'blog');
  const fileNames = fs.readdirSync(postsDir);
  
  const posts = fileNames
    .filter(fileName => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
    .map(fileName => {
      const slug = fileName.replace(/\.(md|mdx)$/, '');
      const fullPath = path.join(postsDir, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);
      
      // Skip drafts in production
      if (data.draft && process.env.NODE_ENV === 'production') {
        return null;
      }
      
      return processPostData(data, content);
    })
    .filter(Boolean); // Remove any null entries from drafts

  // Sort posts by date (newest first)
  return posts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

// Export the function for the Netlify function to use
module.exports = {
  getPosts: getAllPosts,
  processImagePath,
};

// If run directly, generate the posts.json file
if (require.main === module) {
  const posts = getAllPosts();
  const outputDir = path.join(process.cwd(), 'public', 'api');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(outputDir, 'posts.json'),
    JSON.stringify({ posts }, null, 2)
  );
  
  console.log(`Generated posts.json with ${posts.length} posts`);
}
