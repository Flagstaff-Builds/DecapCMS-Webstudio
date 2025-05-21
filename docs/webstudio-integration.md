# Connecting to Webstudio

This guide explains how to connect your Decap CMS blog to a Webstudio site.

## Setting Up Resources in Webstudio

## Table of Contents
- [Create a Listing Page](#create-a-listing-page)
- [Create a Dynamic Post Page](#create-a-dynamic-post-page)

### Create a Listing Page

1. In Webstudio, create a new page for your blog list (e.g., `/blog`)
2. Add a Resource variable to fetch all blog posts:
   - URL: `https://YOUR-NETLIFY-SITE.netlify.app/blog/index.json`
   - This will return an array of all your blog posts

### Display a List of Posts

1. In Webstudio, add a "**Data Variable**" to the body of your page
   - Name it whatever you want eg `blogPosts`
   - Select "**Resource**" as the data type
   - Set the "URL" to `https://YOUR-NETLIFY-SITE.netlify.app/blog/index.json`
   - Set the "Request Method" to "**GET**"

   Example cURL command:
   ```bash
   curl "YOUR-NETLIFY-SITE.netlify.app/blog/index.json" \
   --request get
   ```
2. Add a "**Collection**" component to your page
   - Bind the "**Data**" to your resource variable: `blogPosts.data.posts`
3. Inside the "**Collection**" component, add elements to display blog post information:
   - Add a Heading and bind its "**Text Content**" to `blog.title`
   - Add a Text component and bind its "**Text Content**" to `blog.excerpt`
   - Add an Image component and configure it with feature image properties:
     - **Source**: `blog.feature_image.url`
     - **Alt Text**: `blog.feature_image.alt`
     - **Title**: `blog.feature_image.title`
     - You can also use `blog.feature_image.width` and `blog.feature_image.height` if available
   - Etc...
4. Access related data with:
   - `blog.category.name` for category name
   - `blog.tags` (array of tag objects with properties like `name`)
   - `blog.author` (author object with properties like `name`, `image_url`, etc.)


---


### Create a Dynamic Post Page

For individual blog posts, you'll need to:

1. Create a dynamic page in Webstudio (e.g., `/blog/:slug`)
2. Add a "**Data Variable**" to the body of your page
   - Name it whatever you want eg `blogPost`
   - Select "**Resource**" as the data type
   - URL: \`https://YOUR-NETLIFY-SITE.netlify.app/blog/\${system.params.slug}.json\`
      - You'll need the backticks in the expression editor
   - Set the "Request Method" to "**GET**"

3. Add content and start binding data:
   - `blogPost.data.title` for the post title
   - For the post's feature image (if available):
     - `blogPost.data.feature_image.url` for the image source
     - `blogPost.data.feature_image.alt` for the alt text
     - `blogPost.data.feature_image.title` for the title/caption
     - `blogPost.data.feature_image.width` and `blogPost.data.feature_image.height` for dimensions
   - `blogPost.data.html_content` for the rendered HTML content
   - `blogPost.data.published_at` for the publication date
   - `blogPost.data.category.name` for the category
   - `blogPost.data.tags` for the tags (this is an array so you'll need to use a collection to display them)
   - `blogPost.data.author` for the post author (with properties like `name`, `image_url`, etc.)

## Example Resource URLs

- Blog index: `https://YOUR-NETLIFY-SITE.netlify.app/blog/index.json`
- Single post: `https://YOUR-NETLIFY-SITE.netlify.app/blog/getting-started.json`
- Categories index: `https://YOUR-NETLIFY-SITE.netlify.app/categories/index.json`
- Tags index: `https://YOUR-NETLIFY-SITE.netlify.app/tags/index.json`
- Authors index: `https://YOUR-NETLIFY-SITE.netlify.app/authors/index.json`

## Limiting Blog Posts

You can limit the number of blog posts that appear in your Webstudio resource by using a numbered index file instead of the default `index.json`.

The build process automatically generates the following files:
- `index.json` - Contains all blog posts
- `index-1.json` - Contains only the most recent post
- `index-3.json` - Contains the 3 most recent posts
- `index-5.json` - Contains the 5 most recent posts
- `index-10.json` - Contains the 10 most recent posts

To use a limited set of posts in your Webstudio project, simply change your resource URL to include the desired limit:

```
https://your-site-url.netlify.app/blog/index-3.json
```

Each limited file includes:
- The specified number of most recent posts
- The total count of all posts
- The limit that was applied

This is useful for displaying only the most recent posts on your homepage while still having access to all posts for archive pages.

## Advanced: Using the Markdown Content

If you prefer to use your own markdown parser or need access to the raw markdown:

1. Each post JSON includes both `html_content` (pre-rendered HTML) and `markdown_content` (raw markdown)
2. You can use `blogPost.data.markdown_content` with a custom markdown parser if you need more control over the rendering

## API Endpoints

This template generates JSON files that serve as API endpoints for your content:

- `/blog/index.json` - List of all blog posts
- `/blog/[slug].json` - Individual blog post data
- `/categories/index.json` - List of all categories
- `/tags/index.json` - List of all tags
- `/authors/index.json` - List of all authors