# Connecting to Webstudio

This guide explains how to connect your Decap CMS blog to a Webstudio site.

## Table of Contents
- [Embedding the CMS Editor](#embedding-the-cms-editor)
- [Setting Up Resources in Webstudio](#setting-up-resources-in-webstudio)
- [Create a Listing Page](#create-a-listing-page)
- [Create a Dynamic Post Page](#create-a-dynamic-post-page)
- [Implement Pagination](#implement-pagination)
- [Display Limited Posts](#display-limited-posts)

## Embedding the CMS Editor

The CMS is now optimized for iframe embedding at `/admin/cms/`. This allows you to create a seamless content management experience within your Webstudio site.

### Creating an Edit Page in Webstudio

1. In Webstudio, create a new page at `/admin/edit-blogs`
2. Add an HTML Embed component with the following code:

```html
<iframe 
    src="/admin/cms/"
    style="width: 100%; height: 100vh; border: none;"
    title="Blog Content Management System"
    id="cms-iframe">
</iframe>

<script>
// Optional: Handle dynamic height adjustments
window.addEventListener('message', function(event) {
    if (event.origin !== window.location.origin) return;
    
    if (event.data.type === 'cms-height') {
        document.getElementById('cms-iframe').style.height = event.data.height + 'px';
    }
});
</script>
```

### Benefits of Iframe Embedding

- **Seamless Integration**: The CMS appears as part of your Webstudio site
- **Security**: Can be protected with Cloudflare Access at the `/admin/*` path
- **Consistent UI**: Maintain your site's header/navigation while editing content
- **Mobile Friendly**: The CMS adapts to different screen sizes

### Testing the Integration

1. Visit `/admin/edit-blogs-example.html` to see a working example
2. The example shows how to properly embed and style the CMS
3. Use this as a reference when building your Webstudio page

## Setting Up Resources in Webstudio

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

1. In Webstudio, create a new page with a dynamic route parameter (e.g., `/blog/[slug]`)
2. Add a Data Variable to fetch a single blog post:
   - Name it `blogPost`
   - Set the URL to `/api/post?slug=${system.params.slug}`
   - This will fetch a single post based on the slug in the URL

3. Display the post content:
   - Add a Heading for the title: `${blogPost.title}`
   - Add an Image for the feature image: `${blogPost.feature_image.url}`
   - For the post content, use: `${blogPost.html_content}`
   - For the author section:
     - Author name: `${blogPost.author.name}`
     - Author image: `${blogPost.author.profile_image}`
     - Author bio: `${blogPost.author.bio}`
   - For the published date: `${blogPost.published_at}`

> **Note**: If you're using the `/api/posts` endpoint with a slug parameter instead, the URL would be `/api/posts?slug=${system.params.slug}`

### Add Previous/Next Post Navigation

The individual post endpoint now includes navigation data for previous and next posts. Here's how to implement post navigation in Webstudio:

1. **Add Navigation Links:**
   - For the Previous Post link:
     - Set visibility condition to: `${blogPost.navigation.previous ? true : false}`
     - Set the href to: `/blog/${blogPost.navigation.previous.slug}`
     - Display the title: `${blogPost.navigation.previous.title}`
   
   - For the Next Post link:
     - Set visibility condition: `${blogPost.navigation.next ? true : false}`
     - Set the href to: `/blog/${blogPost.navigation.next.slug}`
     - Display the title: `${blogPost.navigation.next.title}`

2. **Navigation Data Structure:**
   The post endpoint returns navigation data in this format:
   ```json
   {
     "navigation": {
       "previous": {
         "slug": "newer-post-slug",
         "title": "Newer Post Title"
       },
       "next": {
         "slug": "older-post-slug",
         "title": "Older Post Title"
       }
     }
   }
   ```
   - `previous` points to the newer post (published more recently)
   - `next` points to the older post (published earlier)
   - Either can be `null` if there's no previous/next post

### Implement Pagination

To implement pagination for your blog listing page:

1. Set up the Data Variable for your blog posts with pagination parameters:
   - Name it `blogPosts`
   - Set the URL to `/api/posts?limit=${postsPerPage}${system.search.page ? `&page=${system.search.page}` : ''}`
   - Create a separate variable `postsPerPage` with a numeric value (e.g., `10`)

2. Add Pagination Controls:
   - Create a navigation element with "Previous" and "Next" buttons
   - For the Previous button:
     - Set its visibility condition to: `blogPosts.data.pagination.hasPrevPage ? true : false`
     - Set its href to: `?page=${blogPosts.data.pagination.currentPage - 1}`
   - For the Next button:
     - Set its visibility condition to: `blogPosts.data.pagination.hasNextPage ? true : false`
     - Set its href to: `?page=${blogPosts.data.pagination.currentPage + 1}`

3. Display Pagination Information (optional):
   - Add text to show current page: `Page ${blogPosts.data.pagination.currentPage} of ${blogPosts.data.pagination.totalPages}`
   - Show total posts: `${blogPosts.data.pagination.totalPosts} posts`

4. Show/Hide Pagination Controls:
   - Set the visibility of the entire pagination component to:
     ```javascript
     ((blogPosts.data.pagination.hasNextPage) || (blogPosts.data.pagination.currentPage > 1)) ? true : false
     ```

### Display Limited Posts

To display a limited number of posts (e.g., on your homepage):

1. Create a Data Variable for a limited set of posts:
   - Name it `recentPosts`
   - Set the URL to `/api/posts?limit=3` (replace 3 with your desired number)

2. Display the limited posts:
   - Add a Collection component
   - Bind its Data to `recentPosts.data.posts`
   - Design your post cards as needed

3. Add a "View All Posts" link to your full blog page

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

## API Endpoints

### Get Paginated Posts

```
GET /api/posts?page=1&limit=10
```

**Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of posts per page (default: 10)

**Example Response:**
```json
{
  "posts": [
    {
      "title": "Post Title",
      "slug": "post-slug",
      "excerpt": "Post excerpt...",
      "feature_image": {
        "url": "/images/example.jpg",
        "alt": "Alt text",
        "title": "Image title"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "postsPerPage": 10,
    "totalPosts": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Get Single Post
```
GET /blog/post-slug.json
```

Or using the API endpoint:
```
GET /api/post?slug=post-slug
```

**Example Response:**
```json
{
  "title": "Post Title",
  "slug": "post-slug",
  "content": "Full post content...",
  "html_content": "<p>Full post content...</p>",
  "markdown_content": "Full post content...",
  "published_at": "2024-01-01T00:00:00Z",
  "feature_image": {
    "url": "/images/example.jpg",
    "alt": "Alt text",
    "title": "Image title"
  },
  "author": {
    "name": "Author Name",
    "slug": "author-slug",
    "image_url": "/images/author.jpg",
    "bio": "Author bio..."
  },
  "category": {
    "name": "Category Name",
    "slug": "category-slug"
  },
  "tags": [
    {
      "name": "Tag Name",
      "slug": "tag-slug"
    }
  ],
  "navigation": {
    "previous": {
      "slug": "newer-post-slug",
      "title": "Newer Post Title"
    },
    "next": {
      "slug": "older-post-slug",
      "title": "Older Post Title"
    }
  }
}
```

### Categories
```
GET /categories/index.json
```

### Tags
```
GET /tags/index.json
```

### Authors
```
GET /authors/index.json
```

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