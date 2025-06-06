const fs = require('fs');
const path = require('path');

// Function to process config file with environment variables
function processConfig(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`Config file not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace environment variables
  content = content
    .replace(/\${GITHUB_BRANCH}/g, process.env.GITHUB_BRANCH || 'main')
    .replace(/\${MEDIA_FOLDER}/g, process.env.MEDIA_FOLDER || 'images/uploads')
    .replace(/\${PUBLIC_FOLDER}/g, process.env.PUBLIC_FOLDER || '/images/uploads')
    .replace(/\${CONTENT_FOLDER}/g, process.env.CONTENT_FOLDER || 'content/blog')
    .replace(/\${SITE_URL}/g, process.env.SITE_URL || 'http://localhost:3000')
    .replace(/\${PUBLISH_MODE}/g, process.env.PUBLISH_MODE || 'simple');

  // Inject or remove the movie collection based on environment variable
  const movieSnippet = `  - name: "movies"
    label: "Movies"
    folder: "content/movies"
    create: true
    slug: "{{slug}}"
    fields:
      - { label: "Title", name: "title", widget: "string" }
      - { label: "Slug", name: "slug", widget: "string" }
      - { label: "TMDB ID", name: "tmdb_id", widget: "number", required: false }
      - { label: "Overview", name: "overview", widget: "text", required: false }
      - { label: "Poster", name: "poster_path", widget: "string", required: false }
      - { label: "Release Date", name: "release_date", widget: "datetime", required: false }
      - { label: "Showtimes", name: "showtimes", widget: "list", required: false }`;

  if (process.env.COLLECTION_MOVIE === 'true') {
    content = content.replace('# MOVIE_COLLECTION_PLACEHOLDER', movieSnippet);
  } else {
    content = content.replace('# MOVIE_COLLECTION_PLACEHOLDER', '');
  }
  
  // Add Git Gateway URLs if configured
  if (process.env.GIT_GATEWAY_URL) {
    // Find the backend section and add the URLs
    content = content.replace(
      /(backend:\s*\n\s*name:\s*git-gateway\s*\n\s*branch:[^\n]*\n\s*accept_roles:[^\n]*)/,
      `$1\n  identity_url: ${process.env.GIT_GATEWAY_URL}\n  gateway_url: ${process.env.GIT_GATEWAY_URL}`
    );
  }
  
  // Write back the processed content
  fs.writeFileSync(filePath, content);
  console.log(`Processed config: ${filePath}`);
}

// Process both config files
const configPaths = [
  path.join(__dirname, '..', 'public', 'admin', 'config.yml'),
  path.join(__dirname, '..', 'public', 'admin', 'cms', 'config.yml')
];

configPaths.forEach(processConfig);

console.log('Config files processed successfully');