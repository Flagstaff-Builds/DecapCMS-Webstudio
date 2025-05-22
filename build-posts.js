const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

function getAllPosts() {
  const postsDir = path.join(process.cwd(), 'content', 'blog');
  const fileNames = fs.readdirSync(postsDir);
  
  const posts = fileNames.map(fileName => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDir, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    return {
      ...data,
      slug,
      content
    };
  });

  // Sort posts by date (newest first)
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Export the function for the Netlify function to use
module.exports = { getPosts: getAllPosts };

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
