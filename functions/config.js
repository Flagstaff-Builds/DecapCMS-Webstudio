// No need for handlebars, using string interpolation

// Template for config.yml
const getConfigTemplate = (vars) => `
backend:
  name: git-gateway
  branch: ${vars.GITHUB_BRANCH}
  accept_roles: [admin, editor]
  squash_merges: true

# Media files will be stored in the repo under images/uploads
media_folder: "${vars.MEDIA_FOLDER}"
public_folder: "${vars.PUBLIC_FOLDER}"

# Enable the editorial workflow (drafts, review, publish)
publish_mode: editorial_workflow

# Set site URL
site_url: ${vars.SITE_URL}
display_url: ${vars.SITE_URL}

# Collections for blog and related content
collections:
  - name: "blog"
    label: "Blog"
    folder: "${vars.CONTENT_FOLDER}"
    create: true
    slug: "{{slug}}"
    fields:
      - { label: "Title", name: "title", widget: "string" }
      - { label: "Slug", name: "slug", widget: "string" }
      - { label: "Excerpt", name: "excerpt", widget: "text", required: false }
      - { label: "HTML Content", name: "html_content", widget: "markdown" }
      - { label: "Published At", name: "published_at", widget: "datetime" }
      - label: "Category"
        name: "category"
        widget: "relation"
        collection: "categories"
        search_fields: ["name"]
        value_field: "slug"
        display_fields: ["name"]
        required: false
      - label: "Tags"
        name: "tags"
        widget: "relation"
        collection: "tags"
        search_fields: ["name"]
        value_field: "slug"
        display_fields: ["name"]
        multiple: true
        required: false
      - label: "Authors"
        name: "authors"
        widget: "relation"
        collection: "authors"
        search_fields: ["name"]
        value_field: "slug"
        display_fields: ["name"]
        multiple: true
        required: false

  - name: "categories"
    label: "Categories"
    folder: "content/categories"
    create: true
    slug: "{{slug}}"
    fields:
      - { label: "Name", name: "name", widget: "string" }
      - { label: "Slug", name: "slug", widget: "string" }

  - name: "tags"
    label: "Tags"
    folder: "content/tags"
    create: true
    slug: "{{slug}}"
    fields:
      - { label: "Name", name: "name", widget: "string" }
      - { label: "Slug", name: "slug", widget: "string" }

  - name: "authors"
    label: "Authors"
    folder: "content/authors"
    create: true
    slug: "{{slug}}"
    fields:
      - { label: "Name", name: "name", widget: "string" }
      - { label: "Slug", name: "slug", widget: "string" }
      - { label: "Image URL", name: "image_url", widget: "image", required: false }
      - { label: "Website", name: "website", widget: "string", required: false }
      - { label: "Twitter", name: "twitter", widget: "string", required: false }
      - { label: "Bio", name: "bio", widget: "text", required: false }
`;

exports.handler = async function(event, context) {
  try {
    // Prepare variables for the template
    const vars = {
      GITHUB_BRANCH: process.env.GITHUB_BRANCH || 'main',
      MEDIA_FOLDER: process.env.MEDIA_FOLDER || 'images/uploads',
      PUBLIC_FOLDER: process.env.PUBLIC_FOLDER || '/images/uploads',
      CONTENT_FOLDER: process.env.CONTENT_FOLDER || 'content/blog',
      SITE_URL: process.env.SITE_URL
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