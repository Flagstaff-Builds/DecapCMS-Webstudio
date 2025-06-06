const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Site URL for generating absolute paths
const SITE_URL = process.env.SITE_URL || 'https://decapcms-webstudio.netlify.app';

function processImagePath(imgPath) {
  if (!imgPath) return imgPath;
  if (/^https?:\/\//.test(imgPath)) {
    return imgPath;
  }
  const cleanPath = imgPath.replace(/^\/+/, '');
  const finalPath = cleanPath.startsWith('images/') ? cleanPath : `images/${cleanPath}`;
  return `${SITE_URL}/${finalPath}`;
}

function processMovieData(data) {
  const processed = { ...data };
  if (processed.poster_path) {
    processed.poster_url = processImagePath(processed.poster_path);
  }
  return processed;
}

function getAllMovies() {
  const moviesDir = path.join(process.cwd(), 'content', 'movies');
  if (!fs.existsSync(moviesDir)) return [];
  const fileNames = fs.readdirSync(moviesDir);
  const movies = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '');
      const filePath = path.join(moviesDir, fileName);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);
      return processMovieData({ slug, ...data });
    });
  return movies.sort((a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0));
}

module.exports = { getMovies: getAllMovies };

if (require.main === module) {
  if (process.env.COLLECTION_MOVIE !== 'true') {
    console.log('Movie collection disabled, skipping movie build');
    process.exit(0);
  }
  const movies = getAllMovies();
  const outputDir = path.join(process.cwd(), 'public', 'api');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(outputDir, 'movies.json'),
    JSON.stringify({ movies }, null, 2)
  );
  console.log(`Generated movies.json with ${movies.length} movies`);
}
