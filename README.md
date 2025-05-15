# Simple Blog with Decap CMS for Webstudio

This package contains everything you need to set up a simple blog with Decap CMS that connects to Webstudio. This solution allows you to manage your blog content through a user-friendly admin interface while seamlessly integrating with your Webstudio site.

## What's Included

- A simple CMS to manage your blog posts
- Automatic conversion of your blog posts to JSON format that Webstudio can use
- Easy deployment to Netlify (free hosting)
- Environment variable-based configuration for easy setup
- Step-by-step instructions for non-technical users

## Quick Setup (Recommended)

### Step 1: Create a GitHub Account and Repository

If you don't have a GitHub account:
1. Go to [GitHub.com](https://github.com) and sign up
2. Verify your email address

Create a new repository:
1. Click the "+" icon in the top right corner
2. Select "New repository"
3. Name it something like "my-blog-cms"
4. Make sure it's set to "Public"
5. Click "Create repository"

### Step 2: Upload These Files to GitHub

1. On your new repository page, click "Add file" then "Upload files"
2. Drag and drop all the files from this package (or use the file picker)
3. At the bottom, add a commit message like "Initial setup"
4. Click "Commit changes"

### Step 3: Create a .env File

Create a `.env` file with your configuration (you can copy and modify the `.env.example` file):

```
# Repository configuration
GITHUB_BRANCH=main

# Site information
SITE_TITLE=My Webstudio Blog
SITE_URL=https://your-site.netlify.app

# Media and content settings
MEDIA_FOLDER=images/uploads
PUBLIC_FOLDER=/images/uploads
CONTENT_FOLDER=content/blog
```

Replace the values with your own information:
- `GITHUB_BRANCH`: The branch to use for content (usually main)
- `SITE_TITLE`: Your site title
- `SITE_URL`: The URL where your site will be hosted (Netlify will provide this)

> **Important**: When you set up Netlify, you will need to add these same environment variables to your Netlify site settings.

### Step 4: Test Your Site Locally (Optional)

You can test your site locally before deploying:

1. Install dependencies:
   ```
   npm install
   ```

2. Start the local development server:
   ```
   npm run dev
   ```

3. Open http://localhost:3000/admin/ in your browser

### Step 5: Deploy to Netlify

1. Go to [Netlify.com](https://netlify.com) and sign up (you can use your GitHub account)
2. Click "Add new site" then "Import an existing project"
3. Select GitHub and authorize Netlify to access your repositories
4. Find and select your repository
5. In the deploy settings:
   - Build command: `npm run build`
   - Publish directory: `public`
6. Click "Deploy site"

7. **Important**: Set up environment variables
   - Once your site is deployed, go to Site settings > Environment variables
   - Add all the variables from your `.env` file
   - Make sure to include all variables: GITHUB_USERNAME, GITHUB_REPO, GITHUB_BRANCH, SITE_TITLE, SITE_URL, MEDIA_FOLDER, PUBLIC_FOLDER, and CONTENT_FOLDER
   - Click "Save" and trigger a new deploy

> **Pro Tip**: Your site now uses environment variables instead of hardcoded configuration, making it much easier to maintain and update!

### Step 6: Set Up Authentication

1. On your Netlify site dashboard, go to "Site settings" > "Identity"
2. Click "Enable Identity" (netlify Identity, it's deprecated but it works)
3. Under "Registration preferences", select "Invite only"
4. Under "Services" > "Git Gateway", click "Enable Git Gateway"
   - This allows users to access your repository content without GitHub accounts
   - Works with both public and private repositories
5. Go back to the "Identity" tab and click "Invite users"
6. Enter your email address and click "Send"
7. Check your email and accept the invitation

### Step 5: Connect to Webstudio

1. Log in to Webstudio
2. In your project, click on "Variables" in the left sidebar
3. Click the "+" button and select "Resource" to add a new resource variable
4. Configure the resource:
   - Name: `blogPosts` (you can choose any name)
   - URL: `https://your-netlify-site-name.netlify.app/blog/index.json` (replace with your actual Netlify site URL)
   - Method: `GET`
   - Response Type: `JSON`
5. Click "Save"
6. Now you can use this resource variable in your Webstudio project to display blog posts

> **Important**: Make sure to replace `your-netlify-site-name.netlify.app` with your actual Netlify domain in the URL field. You can find this in your Netlify dashboard.

### Step 6: Add Blog Posts

1. Go to `https://your-netlify-site-name.netlify.app/admin/` (replace with your Netlify site URL)
2. Log in with your email (the one you invited in Step 4)
3. Click "New Blog" to create a new blog post
4. Add your content and click "Save"
5. Click "Publish" to make the post live

After publishing, Netlify will automatically rebuild your site and update the JSON files that Webstudio uses.

### How to Display Blog Posts in Webstudio

#### Display a List of Blog Posts

1. In Webstudio, add a "For Each" component to your page
2. In the component settings:
   - Set the "Items" field to your resource variable: `blogPosts.posts`
   - Set the "Item Name" to `post` (or any name you prefer)
3. Inside the For Each component, add elements to display blog post information:
   - Add a Heading and set its text content to `post.title`
   - Add a Text component and set its content to `post.description`
   - Add an Image component and set its source to `post.featured_image` (if available)
   - Add a Link component to create a "Read More" link to individual posts

#### Create a Dynamic Blog Post Page

For individual blog posts, you'll need to:

1. Create a dynamic page in Webstudio (e.g., `/blog/:slug`)
2. Add a Resource variable that fetches a specific post:
   - URL: `https://your-netlify-site-name.netlify.app/blog/${system.params.slug}.json`
   - This uses the URL parameter to fetch the specific post
3. Use this resource to display the full blog post content on your page

## Troubleshooting

### Common Issues

1. **Environment Variables**: Make sure your environment variables are set correctly:
   - For local development: They should be in the `.env` file at the root of your project
   - For Netlify: Add them in the Netlify dashboard under Site settings > Environment variables

2. **Required Environment Variables**:
   ```
   # GitHub configuration
   GITHUB_USERNAME=your-username
   GITHUB_REPO=your-repo-name
   GITHUB_BRANCH=main
   
   # Site information
   SITE_TITLE=My Webstudio Blog
   SITE_URL=https://your-site.netlify.app
   
   # Media and content settings
   MEDIA_FOLDER=images/uploads
   PUBLIC_FOLDER=/images/uploads
   CONTENT_FOLDER=content/blog
   ```

3. **Netlify Identity**: If you can't log in to the admin panel, check that Netlify Identity is properly enabled and that you've accepted the invitation email.

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
