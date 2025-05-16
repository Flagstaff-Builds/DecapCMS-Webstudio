# No-Code Blog Solution for Webstudio

## Table of Contents
- [Why You'll Love This](#why-youll-love-this)
- [How It Works](#how-it-works)
- [Quick Setup](#quick-setup)
  - [Step 1: Get the Code](#step-1-get-the-code)
  - [Step 2: Deploy to Netlify](#step-2-deploy-to-netlify)
  - [Step 3: Configure Environment Variables](#step-3-configure-environment-variables)
  - [Step 4: Set Up Authentication](#step-4-set-up-authentication)
  - [Step 5: Add Blog Posts](#step-5-add-blog-posts)
  - [Step 6: Connect to Webstudio](#step-6-connect-to-webstudio)
- [Content Model](#content-model)
- [Troubleshooting](#troubleshooting)

---

Welcome to your simple, designer-friendly blog solution for Webstudio. This package lets you manage your blog content through an easy-to-use interface, while seamlessly displaying it on your Webstudio website. **No coding required.**

## Why You'll Love This

- **Easy Content Management**: Write and edit blog posts using a clean, intuitive interface (Decap CMS)
- **Perfect for Designers**: No need to touch code - focus on creating great content
- **Seamless Webstudio Integration**: Connect your blog to Webstudio with just a few clicks
- **Free Hosting**: Deploy everything to Netlify at no cost
- **Mobile-Friendly**: Manage your blog from anywhere, on any device
- **Beautiful by Default**: Clean, responsive design that looks great out of the box

## How It Works

1. You write blog posts in a simple editor (similar to a Word document)
2. The system automatically formats everything for the web
3. Your Webstudio site displays the results
4. No databases to manage or complex setup required

---

## Quick Setup (Recommended)

### Step 1: Get the Code

Choose the option that works best for you:

#### Option A: Fork on GitHub (Recommended for most users)
1. Click the "Fork" button at the top-right of [this repository](https://github.com/Flagstaff-Builds/DecapCMS-Webstudio)
2. Wait for the forking process to complete
3. Skip to [Step 2: Deploy to Netlify](#step-2-deploy-to-netlify)

#### Option B: Clone Locally (For developers)
```bash
git clone https://github.com/Flagstaff-Builds/DecapCMS-Webstudio.git
cd DecapCMS-Webstudio
```
Then continue with the steps below.

### Step 2: Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/DecapCMS-Webstudio)

1. Click the "Deploy to Netlify" button above
2. Sign in with your GitHub/GitLab/Bitbucket account
3. Follow the prompts to connect your repository
4. In the deployment settings, verify these are set:
   - Build command: `npm run build`
   - Publish directory: `public`
5. Click "Deploy site"

### Step 3: Configure Environment Variables

1. In your Netlify dashboard, go to "Site settings" > "Environment variables"
2. Add these variables (replace with your info):

```env
# Repository configuration
GITHUB_BRANCH=main

# Site information (use quotes for titles with spaces)
SITE_TITLE="My Awesome Blog"
SITE_URL=https://YOUR-SITE.netlify.app

# Media and content settings
MEDIA_FOLDER=images/uploads
PUBLIC_FOLDER=/images/uploads
CONTENT_FOLDER=content/blog
```

> **Tip**: You can use spaces in your site title by putting it in quotes, like this: `SITE_TITLE="My Awesome Blog"`

### Step 4: Set Up Authentication

1. On your Netlify site dashboard, go to "Site settings" > "Identity"
2. Click "Enable Identity" (netlify Identity, it's deprecated but it works)
3. Under "Registration preferences", select "Invite only"
4. Under "Services" > "Git Gateway", click "Enable Git Gateway"
   - This allows users to access your repository content without GitHub accounts
   - Works with both public and private repositories

5. **Critical**: Configure email templates
   - Go to "Site settings" > "Identity" > "Emails"
   - Click on "Invitation template"
   - In the template, change the URL pattern from `{{ .SiteURL }}/#invite_token={{ .Token }}` to `{{ .SiteURL }}/admin/#invite_token={{ .Token }}`
   - This ensures invitation links point directly to the admin area
   - Click "Save"

6. Go back to the "Identity" tab and click "Invite users"
7. Enter your email address and click "Send"
8. Check your email and accept the invitation



### Step 5: Add Blog Posts

1. Go to `https://your-netlify-site-name.netlify.app/admin/` (replace with your Netlify site URL)
2. Log in with your email (the one you were invited with)
3. Click "New Blog" to create a new blog post
4. Add your content including:
   - Title
   - Excerpt (optional)
   - Main content (supports Markdown)
   - Featured image (required)
   - Category and tags (optional)
5. Click "Save" and then "Publish" to make the post live

### Step 6: Connect to Webstudio

1. In your Webstudio project, add a new Collection called "Blog Posts"
2. Add these fields to your collection:
   - **Title** (Text) - The title of your blog post
   - **Slug** (Text) - URL-friendly version of the title (check "unique")
   - **Date** (Date & Time) - Publication date
   - **Excerpt** (Long Text) - Short summary for previews
   - **Body** (Rich Text) - Main content of your post (Markdown supported)
   - **Image** (Image) - Featured image for the post (required)
   - **Author** (Text) - Optional
   - **Category** (Text) - Optional, for organization
   - **Tags** (List of Text) - Optional, for better discoverability

3. In your Webstudio page, add a Collection List and connect it to your Blog Posts collection
4. Style the list items to display your blog posts
5. Create a dynamic route for individual blog posts using the slug

## Content Model

This CMS uses a robust content model inspired by ZenBlog, with the following collections:

### Blog Posts
The main content type with the following fields:
- **Title**: The title of the blog post
- **Slug**: URL-friendly identifier (automatically generated from title if not provided)
- **Excerpt**: A short summary of the post (optional)
- **HTML Content**: The main content of the post in Markdown format
- **Published At**: The date and time when the post was published
- **Category**: A single category the post belongs to (optional, relation to Categories collection)
- **Tags**: Multiple tags associated with the post (optional, relation to Tags collection)
- **Authors**: One or more authors of the post (optional, relation to Authors collection)

### Categories
Organize posts into broad topics:
- **Name**: Display name of the category
- **Slug**: URL-friendly identifier

### Tags
Add more specific classifications to posts:
- **Name**: Display name of the tag
- **Slug**: URL-friendly identifier

### Authors
Manage information about content creators:
- **Name**: Author's name
- **Slug**: URL-friendly identifier
- **Image URL**: Profile picture (optional)
- **Website**: Author's website URL (optional)
- **Twitter**: Author's Twitter handle (optional)
- **Bio**: Short biography (optional)

## Troubleshooting

### "Page not found" Error on Netlify

If you encounter a "Page not found" error when visiting your Netlify site, check the following:

1. **Redirects Configuration**: Make sure your `netlify.toml` file has the correct redirects configuration. The general redirect rule should not have any role-based conditions:

```toml
# General redirect for SPA - this should be LAST in the redirect list
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. **Environment Variables**: Ensure all environment variables are correctly set in your Netlify dashboard:
   - SITE_URL should be your Netlify domain (e.g., `https://your-site.netlify.app`)  
   - LOCAL_BACKEND should be set to `false` for production

3. **Deployment**: After making any changes to your configuration, trigger a new deployment from the Netlify dashboard.

### Admin Access Issues

If you're having trouble accessing the admin area:

1. Make sure Git Gateway is enabled in your Netlify Identity settings
2. Check that your invitation links are correctly formatted to point to `/admin/#invite_token=`
3. Try manually adding `/admin` to the URL if you're redirected to a 404 page

## How to Display Blog Posts in Webstudio

### Display a List of Blog Posts

1. In Webstudio, add a "For Each" component to your page
2. In the component settings:
   - Set the "Items" field to your resource variable: `blogPosts.posts`
   - Set the "Item Name" to `post` (or any name you prefer)
3. Inside the For Each component, add elements to display blog post information:
   - Add a Heading and set its text content to `post.title`
   - Add a Text component and set its content to `post.excerpt`
   - Add a Link component to create a "Read More" link to individual posts
4. Access related data with:
   - `post.category.name` for category name
   - `post.tags` (array of tag objects with properties like `name`)
   - `post.authors` (array of author objects with properties like `name`, `image_url`, etc.)

### Create a Dynamic Blog Post Page

For individual blog posts, you'll need to:

1. Create a dynamic page in Webstudio (e.g., `/blog/:slug`)
2. Add a Resource variable that fetches a specific post:
   - URL: `https://your-netlify-site-name.netlify.app/blog/${system.params.slug}.json`
   - This uses the URL parameter to fetch the specific post
3. Use this resource to display the full blog post content on your page with:
   - `post.title` for the post title
   - `post.html_content` for the rendered HTML content
   - `post.published_at` for the publication date
   - `post.category.name` for the category
   - Author info with `post.authors[0].name`, `post.authors[0].image_url`, etc.

### Access Related Content

You can also create dedicated pages for categories, tags, and authors by fetching their respective endpoints:
1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file (copy from the example):
   ```bash
   cp .env.example .env
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:3000`

> ⚠️ **Note**: Local testing is great for previewing changes, but remember to push your changes to GitHub to see them on your live site.

## Troubleshooting

### Common Issues

1. **Environment Variables**:
   - For local development: Update the `.env` file at the root of your project
   - For Netlify: Add them in the Netlify dashboard under Site settings > Environment variables

2. **Required Environment Variables**:
   ```env
   # Repository configuration
   GITHUB_BRANCH=main

   # Site information (use quotes for titles with spaces)
   SITE_TITLE="My Awesome Blog"
   SITE_URL=https://YOUR-SITE.netlify.app

   # Media and content settings
   MEDIA_FOLDER=images/uploads
   PUBLIC_FOLDER=/images/uploads
   CONTENT_FOLDER=content/blog
   ```

3. **Admin Access**:
   - Make sure you've enabled Identity in your Netlify site settings
   - Check your email (including spam) for the invitation
   - If you're still having trouble:
     1. Go to your Netlify site settings > Identity > Emails
     2. Verify the invitation template has the correct URL format:
        - It should be `{{ .SiteURL }}/admin/#invite_token={{ .Token }}`
        - Not `{{ .SiteURL }}/#invite_token={{ .Token }}`
   - If you received an invitation with the wrong URL format, manually add "/admin" before the "#" in the URL
     - Change: `https://your-site.netlify.app/#invite_token=xyz`
     - To: `https://your-site.netlify.app/admin/#invite_token=xyz`

4. **Custom Domain**: If you're using a custom domain, make sure to update the `SITE_URL` environment variable.

5. **Build Failures**: If your site fails to build on Netlify, check the build logs for errors. Common issues include missing environment variables or dependencies.

6. **Content Not Updating**: After publishing a post, it may take a few minutes for Netlify to rebuild your site and update the JSON files.

7. **Setup Wizard Issues**: If you encounter any problems with the setup wizard:
   - Make sure you have Node.js installed on your computer
   - Try running `npm install` before running `npm run setup`
   - The wizard will create a `.env` file - make sure to transfer these variables to Netlify

## Need Help?

If you need assistance, these resources might help:
- [Decap CMS Documentation](https://decapcms.org/docs/intro/)
- [Netlify Documentation](https://docs.netlify.com/)
- [Webstudio Documentation](https://docs.webstudio.is/university/foundations/variables) - See the Resource Variables section
- [Webstudio CMS Integration](https://docs.webstudio.is/university/foundations/cms)
