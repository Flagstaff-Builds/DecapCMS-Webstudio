# Decap CMS + Webstudio Blog Template

## Overview

A straightforward blog setup that connects **Decap CMS** with **Webstudio**. It saves everything to **Git**, so your content stays versioned and clean. Non-technical users can log in, write posts, and publish — all through a simple editor.

| Features                          | How It Works                                 |
|----------------------------------|----------------------------------------------|
| Easy blog editor                 | Write posts in a simple, doc-style editor    |
| No coding needed                 | Formatting and layout handled automatically  |
| Connects to Webstudio            | Posts show up on your Webstudio site         |
| Free hosting with Netlify        | No servers or databases to manage            |
| Works on mobile too              | Update content from anywhere                 |

## Table of Contents
- [Quick Setup](#quick-setup)
  - [Option A: Fork First, Then Deploy](#option-a-fork-first-then-deploy-recommended)
  - [Option B: Direct Deploy](#option-b-direct-deploy-faster-but-limited)
  - [Configure Environment Variables](#configure-environment-variables)
  - [Set Up Authentication](#set-up-authentication)
- [Documentation](#documentation)



## Quick Setup

Choose the option that works best for you:

### Option A: Fork First, Then Deploy (Recommended)

> **Why fork first?** Forking gives you your own copy of the repository, allowing you to receive updates, maintain version history, and fully control your content through Git.

1. Click the "Fork" button at the top-right of [this repository](https://github.com/Flagstaff-Builds/DecapCMS-Webstudio)
2. Wait for the forking process to complete
3. Go to [Netlify](https://app.netlify.com/)
4. Click "Add new site" → "Import an existing project"
5. Select GitHub and choose your forked repository
6. In the deployment settings, verify these are set:
   - Build command: `npm run build`
   - Publish directory: `public`
7. Click "Deploy site"

### Option B: Direct Deploy (Faster but Limited)

> **Note:** This option will clone the repository to your GitHub account, but you will not receive updates.

Click the button below to deploy directly to Netlify:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Flagstaff-Builds/DecapCMS-Webstudio)

During setup:
1. Follow the prompts to connect to GitHub
2. Netlify will create a copy of the repository in your GitHub account
3. In the deployment settings, verify these are set:
   - Build command: `npm run build`
   - Publish directory: `public`
4. Click "Deploy site"


---

## Configure Environment Variables

1. In your Netlify dashboard, go to "Site settings" > "Environment variables"
2. Add these variables (**replace with your info**):

```env
# Repository configuration
GITHUB_BRANCH=main

# Site information (use quotes for titles with spaces)
SITE_TITLE="My Awesome Blog"
SITE_URL=https://YOUR-NETLIFY-SITE.netlify.app

# Media and content settings
MEDIA_FOLDER=images/uploads
PUBLIC_FOLDER=/images/uploads
CONTENT_FOLDER=content/blog
```

### Set Up Authentication

> **Note:** Netlify Identity is officially deprecated by Netlify, but still functions for existing sites. While we use it here for simplicity, be aware that Netlify recommends alternatives like Auth0 for new projects. For this template, Identity still works fine.

1. On your Netlify site dashboard, go to "Site settings" > "Identity"
2. Click "Enable Identity"
3. Under "Registration preferences", select "Invite only"
4. Under "Services" > "Git Gateway", click "Enable Git Gateway"
5. Go to the "Identity" tab and click "Invite users"
6. Enter your email address and click "Send"
7. Check your email and accept the invitation

## Documentation

For more detailed instructions and guides, please refer to the following documentation:
- [Content Management Guide](docs/content-management.md)
- [Webstudio Integration Guide](docs/webstudio-integration.md)
- [Troubleshooting Guide](docs/troubleshooting.md)



## Need Help?

If you need assistance, these resources might help:
- [Decap CMS Documentation](https://decapcms.org/docs/intro/)
- [Netlify Documentation](https://docs.netlify.com/)
- [Webstudio Documentation](https://docs.webstudio.is/university/foundations/variables) - See the Resource Variables section
- [Webstudio CMS Integration](https://docs.webstudio.is/university/foundations/cms)
