// No need for handlebars, using string interpolation

// Template for config.yml
const getConfigTemplate = (vars) => `
backend:
  name: git-gateway
  branch: ${vars.GITHUB_BRANCH}

# Media files will be stored in the repo under images/uploads
media_folder: "${vars.MEDIA_FOLDER}"
public_folder: "${vars.PUBLIC_FOLDER}"

# Enable the editorial workflow (drafts, review, publish)
publish_mode: editorial_workflow

# Set site URL
site_url: ${vars.SITE_URL}
display_url: ${vars.SITE_URL}

# Collection for blog posts
collections:
  - name: "blog"
    label: "Blog"
    folder: "${vars.CONTENT_FOLDER}"
    create: true
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"
    fields:
      - {label: "Title", name: "title", widget: "string"}
      - {label: "Publish Date", name: "date", widget: "datetime"}
      - {label: "Featured Image", name: "featured_image", widget: "image", required: false}
      - {label: "Description", name: "description", widget: "text"}
      - {label: "Body", name: "body", widget: "markdown"}
`;

exports.handler = async function(event, context) {
  try {
    // Prepare variables for the template
    const vars = {
      GITHUB_BRANCH: process.env.GITHUB_BRANCH || 'main',
      MEDIA_FOLDER: process.env.MEDIA_FOLDER || 'images/uploads',
      PUBLIC_FOLDER: process.env.PUBLIC_FOLDER || '/images/uploads',
      CONTENT_FOLDER: process.env.CONTENT_FOLDER || 'content/blog',
      SITE_URL: process.env.SITE_URL || 'https://your-site-url.netlify.app'
    };
    
    // Generate config using template function
    const config = getConfigTemplate(vars);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/yaml'
      },
      body: config
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate config' })
    };
  }
};