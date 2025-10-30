# Connecting to Webstudio

This guide explains how to connect your Decap CMS blog to a Webstudio site.

## Quick Start

This CMS provides both **dynamic API endpoints** (recommended) and **static JSON files** for accessing your content:

- **Recommended:** Use `/api/posts` and `/api/post` for dynamic, real-time data
- **Alternative:** Use `/blog/*.json` files for static, build-time data

The API endpoints have been updated to work reliably on Netlify deployments.

## Table of Contents
- [Embedding the CMS Editor](#embedding-the-cms-editor)
- [Setting Up Resources in Webstudio](#setting-up-resources-in-webstudio)
- [Display a List of Posts (Recommended)](#display-a-list-of-posts-recommended)
- [Create a Dynamic Post Page (Recommended)](#create-a-dynamic-post-page-recommended)
- [Add Previous/Next Post Navigation](#add-previousnext-post-navigation)
- [Implement Pagination](#implement-pagination)
- [Display Limited Posts](#display-limited-posts)
- [API Endpoints Reference](#api-endpoints-reference)

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

### Available API Endpoints

This CMS provides two types of endpoints:

1. **Dynamic API Endpoints** (Recommended - serverless functions that always return fresh data):
   - `/api/posts` - Get paginated list of posts
   - `/api/post` - Get individual post by slug

2. **Static JSON Files** (Generated at build time):
   - `/blog/index.json` - All posts (full content)
   - `/blog/posts.json` - All posts (metadata only)
   - `/blog/index-[N].json` - Limited posts (e.g., index-3.json for 3 most recent)
   - `/blog/[slug].json` - Individual post by slug
   - `/categories/index.json` - All categories
   - `/tags/index.json` - All tags
   - `/authors/index.json` - All authors

### Display a List of Posts (Recommended)

1. In Webstudio, add a "**Data Variable**" to your page:
   - Name it `blogPosts`
   - Select "**Resource**" as the data type
   - Set the "URL" to `https://YOUR-NETLIFY-SITE.netlify.app/api/posts?limit=10`
   - Set the "Request Method" to "**GET**"

2. Add a "**Collection**" component to your page:
   - Bind the "**Data**" to: `blogPosts.posts`

3. Inside the "**Collection**" component, add elements to display each post:
   - **Title**: Bind to `blog.title`
   - **Excerpt**: Bind to `blog.excerpt`
   - **Feature Image** (if using):
     - Source: `blog.feature_image.url`
     - Alt Text: `blog.feature_image.alt`
     - Title: `blog.feature_image.title`
   - **Category**: `blog.category.name`
   - **Tags**: `blog.tags` (array - use collection to display)
   - **Author**: `blog.author.name`
   - **Author Image**: `blog.author.image_url`


---


### Create a Dynamic Post Page (Recommended)

1. In Webstudio, create a new page with a dynamic route parameter (e.g., `/blog/[slug]`)

2. Add a Data Variable to fetch a single blog post:
   - Name it `blogPost`
   - Select "**Resource**" as the data type
   - Set the URL to `https://YOUR-NETLIFY-SITE.netlify.app/api/post?slug=${system.params.slug}`
   - Set the "Request Method" to "**GET**"

3. Display the post content:
   - **Title**: `blogPost.title`
   - **Feature Image**: `blogPost.feature_image.url`
   - **Content (HTML)**: `blogPost.html_content`
   - **Content (Markdown)**: `blogPost.markdown_content` (if you need raw markdown)
   - **Author Info**:
     - Name: `blogPost.author.name`
     - Image: `blogPost.author.image_url`
     - Bio: `blogPost.author.bio`
   - **Published Date**: `blogPost.published_at`
   - **Category**: `blogPost.category.name`
   - **Tags**: `blogPost.tags` (array)

### Add Previous/Next Post Navigation

The `/api/post` endpoint includes navigation data for previous and next posts. Here's how to implement post navigation in Webstudio:

1. **Add Navigation Links:**
   - For the Previous Post link (newer post):
     - Set visibility condition to: `blogPost.navigation.previous`
     - Set the href to: `/blog/${blogPost.navigation.previous.slug}`
     - Display the title: `${blogPost.navigation.previous.title}`

   - For the Next Post link (older post):
     - Set visibility condition to: `blogPost.navigation.next`
     - Set the href to: `/blog/${blogPost.navigation.next.slug}`
     - Display the title: `${blogPost.navigation.next.title}`

2. **Navigation Data Structure:**
   The API endpoint returns navigation data in this format:
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
   - Set the URL to `https://YOUR-NETLIFY-SITE.netlify.app/api/posts?limit=${postsPerPage}${system.search.page ? `&page=${system.search.page}` : ''}`
   - Create a separate variable `postsPerPage` with a numeric value (e.g., `10`)

2. Add Pagination Controls:
   - Create a navigation element with "Previous" and "Next" buttons
   - For the Previous button:
     - Set its visibility condition to: `blogPosts.pagination.hasPrevPage`
     - Set its href to: `?page=${blogPosts.pagination.currentPage - 1}`
   - For the Next button:
     - Set its visibility condition to: `blogPosts.pagination.hasNextPage`
     - Set its href to: `?page=${blogPosts.pagination.currentPage + 1}`

3. Display Pagination Information (optional):
   - Current page: `Page ${blogPosts.pagination.currentPage} of ${blogPosts.pagination.totalPages}`
   - Total posts: `${blogPosts.pagination.totalPosts} posts`

4. Show/Hide Pagination Controls:
   - Set the visibility of the entire pagination component to:
     ```javascript
     blogPosts.pagination.hasNextPage || blogPosts.pagination.currentPage > 1
     ```

### Display Limited Posts

To display a limited number of posts (e.g., on your homepage):

1. Create a Data Variable for a limited set of posts:
   - Name it `recentPosts`
   - Set the URL to `https://YOUR-NETLIFY-SITE.netlify.app/api/posts?limit=3`
   (replace 3 with your desired number)

2. Display the limited posts:
   - Add a Collection component
   - Bind its Data to `recentPosts.posts`
   - Design your post cards as needed

3. Add a "View All Posts" link to your full blog page

### Alternative: Using Static JSON Files

If you prefer to use the static JSON files (generated at build time):

**For listing posts:**
- All posts: `https://YOUR-NETLIFY-SITE.netlify.app/blog/index.json`
- Limited posts: `https://YOUR-NETLIFY-SITE.netlify.app/blog/index-3.json` (for 3 posts)
- Access posts array: `blogPosts.posts`

**For individual posts:**
- URL: `https://YOUR-NETLIFY-SITE.netlify.app/blog/${system.params.slug}.json`
- Access all fields directly: `blogPost.title`, `blogPost.html_content`, etc.
- Navigation uses `blogPost.previous_post` and `blogPost.next_post`

## API Endpoints Reference

### Dynamic API Endpoints (Recommended)

#### Get Paginated Posts
```
GET /api/posts?page=1&limit=10
```

**Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of posts per page (default: 10)

**Example Response:**
```json
{
  "success": true,
  "count": 10,
  "posts": [
    {
      "title": "Post Title",
      "slug": "post-slug",
      "excerpt": "Post excerpt...",
      "published_at": "2024-01-01T00:00:00Z",
      "feature_image": {
        "url": "https://YOUR-SITE.netlify.app/images/example.jpg",
        "alt": "Alt text",
        "title": "Image title"
      },
      "category": {
        "name": "Category Name",
        "slug": "category-slug"
      },
      "tags": [
        {"name": "Tag Name", "slug": "tag-slug"}
      ],
      "author": {
        "name": "Author Name",
        "slug": "author-slug",
        "image_url": "https://YOUR-SITE.netlify.app/images/author.jpg",
        "bio": "Author bio..."
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

#### Get Single Post
```
GET /api/post?slug=post-slug
```
This endpoint returns a single post with navigation data for previous and next posts.

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

### Static JSON Files

#### Categories
```
GET /categories/index.json
```

#### Tags
```
GET /tags/index.json
```

#### Authors
```
GET /authors/index.json
```

#### Blog Post Files

**All posts:**
```
https://YOUR-SITE.netlify.app/blog/index.json
```
Response format:
```json
{
  "posts": [
    {
      "title": "Post Title",
      "slug": "post-slug",
      "excerpt": "Post excerpt...",
      "feature_image": {
        "url": "https://YOUR-SITE.netlify.app/images/example.jpg",
        "alt": "Alt text"
      },
      "html_content": "<p>Full HTML content...</p>",
      "markdown_content": "Full markdown content...",
      "published_at": "2024-01-01T00:00:00Z",
      "category": {"name": "Category", "slug": "category"},
      "tags": [{"name": "Tag", "slug": "tag"}],
      "authors": {"name": "Author", "slug": "author"}
    }
  ]
}
```

**Limited posts (1, 3, 5, or 10):**
```
https://YOUR-SITE.netlify.app/blog/index-3.json
```

**Individual post:**
```
https://YOUR-SITE.netlify.app/blog/[slug].json
```
Returns single post object with `previous_post` and `next_post` for navigation.

## Advanced: Using the Markdown Content

If you prefer to use your own markdown parser or need access to the raw markdown:

1. Both API endpoints and static files include:
   - `html_content` - Pre-rendered HTML (sanitized)
   - `markdown_content` - Raw markdown content

2. You can use `blogPost.markdown_content` with a custom markdown parser if you need more control over the rendering

## Choosing Between Dynamic API and Static Files

### Use Dynamic API Endpoints (`/api/posts`, `/api/post`) when:
- You need real-time data that updates immediately after publishing
- You're implementing pagination with query parameters
- You want server-side filtering or searching
- You need consistent data format across different queries

### Use Static JSON Files (`/blog/*.json`) when:
- You want faster load times for static content
- Your content doesn't change frequently
- You're building a static site that rebuilds on content changes
- You want to reduce serverless function invocations

## Troubleshooting API Endpoints

If the API endpoints aren't working:
1. The functions have been updated to work without the `@netlify/functions` builder wrapper
2. Check Netlify's function logs for deployment errors
3. Ensure your `netlify.toml` redirects are configured correctly
4. Verify that the `content/` directory is being included in the function deployment
