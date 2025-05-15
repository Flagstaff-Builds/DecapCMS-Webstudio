# Simple Blog with Decap CMS for Webstudio

This package contains everything you need to set up a simple blog with Decap CMS that connects to Webstudio.

## What's Included

- A simple CMS to manage your blog posts
- Automatic conversion of your blog posts to a format Webstudio can use
- Easy deployment to Netlify (free hosting)

## Setup Guide (No Coding Required)

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

### Step 3: Set Up Netlify

1. Go to [Netlify.com](https://netlify.com) and sign up (you can use your GitHub account)
2. Click "Add new site" then "Import an existing project"
3. Select GitHub and authorize Netlify to access your repositories
4. Find and select your "my-blog-cms" repository
5. In the deploy settings:
   - Build command: `npm run build`
   - Publish directory: `public`
6. Click "Deploy site"

### Step 4: Set Up Authentication

1. On your Netlify site dashboard, go to "Site settings" > "Identity"
2. Click "Enable Identity"
3. Under "Registration preferences", select "Invite only"
4. Under "Services" > "Git Gateway", click "Enable Git Gateway"
5. Go back to the "Identity" tab and click "Invite users"
6. Enter your email address and click "Send"
7. Check your email and accept the invitation

### Step 5: Connect to Webstudio

1. Log in to Webstudio
2. In your project, click on "Resources" in the top menu
3. Add a new resource:
   - Name: `decapCMS`
   - Type: `Resource`
   - URL: `https://your-netlify-site-name.netlify.app/blog/index.json` (replace with your actual Netlify site URL)
   - Method: `GET`
4. Click "Save"
5. Now you can use this resource in your Webstudio project to display blog posts

### Step 6: Add Blog Posts

1. Go to `https://your-netlify-site-name.netlify.app/admin/` (replace with your Netlify site URL)
2. Log in with your email (the one you invited in Step 4)
3. Click "New Blog" to create a new blog post
4. Add your content and click "Save"
5. Click "Publish" to make the post live

After publishing, Netlify will automatically rebuild your site and update the JSON files that Webstudio uses.

### How to Display Blog Posts in Webstudio

1. In Webstudio, add a "For Each" component connected to your decapCMS resource
2. Format each item to display the blog post information (title, date, content, etc.)
3. For individual blog posts, you can fetch specific posts by ID

## Need Help?

If you need assistance, these resources might help:
- [Decap CMS Documentation](https://decapcms.org/docs/intro/)
- [Netlify Documentation](https://docs.netlify.com/)
- [Webstudio Documentation](https://docs.webstudio.is/)
