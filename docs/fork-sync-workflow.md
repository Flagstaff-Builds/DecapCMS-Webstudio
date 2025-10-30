# Fork & Sync Workflow Guide

This guide explains how to fork this repository, maintain your own content, and sync template updates without conflicts.

## Initial Setup

### 1. Fork the Repository
1. Click "Fork" on the original repository
2. Clone your forked repository locally
3. Add the original repository as an upstream remote:
   ```bash
   git remote add upstream https://github.com/null1979/DecapCMS-Webstudio.git
   ```

### 2. Create Your Customer Branch
```bash
git checkout -b customer-yourname
git push -u origin customer-yourname
```

### 3. Configure Netlify
1. Deploy your fork to Netlify
2. Set your build settings to use your customer branch
3. Configure environment variables:
   - `SITE_TITLE`: Your website title
   - `SITE_URL`: Your website URL (e.g., https://yoursite.netlify.app)
   - `SITE_DESCRIPTION`: Your site description
   - `GITHUB_REPO`: Your forked repository path

## Content Management

### Protected Directories
The following directories are protected from merge conflicts:
- `/content/` - All your blog posts, categories, tags, and authors
- `/images/uploads/` - All your uploaded images

### Sample Data
The main branch includes sample content to help you get started. Once you create your customer branch, you can:
1. Keep the sample data as examples
2. Modify the sample content for your needs
3. Delete sample content and create your own

## Syncing Template Updates

### Safe Sync Process
When you want to get the latest template updates:

1. **Fetch upstream changes:**
   ```bash
   git fetch upstream
   ```

2. **Switch to your customer branch:**
   ```bash
   git checkout customer-yourname
   ```

3. **Merge template updates:**
   ```bash
   git merge upstream/main
   ```

### What Happens During Merge
- **Protected**: Your content in `/content/` and `/images/uploads/` is preserved
- **Updated**: Template files, build scripts, and CMS functionality are updated
- **Safe**: The `.gitattributes` file ensures your content is never overwritten

### Handling Conflicts
If you've modified template files (not content), you may need to resolve conflicts:
1. Git will mark conflicting files
2. Your content directories will remain untouched
3. Resolve conflicts in template files manually
4. Commit the merge

## Best Practices

### DO:
- Keep all your content in `/content/` directory
- Upload images through DecapCMS to `/images/uploads/`
- Use environment variables for site-specific configuration
- Regularly sync template updates for bug fixes and features

### DON'T:
- Modify core template files unless necessary
- Store content outside the protected directories
- Change the `.gitattributes` file
- Commit sensitive information (API keys, passwords)

## Troubleshooting

### Content Missing After Merge
This shouldn't happen with proper setup. Check:
1. Your `.gitattributes` file exists and has the correct merge strategy
2. You're on your customer branch, not main
3. Your content is in the protected directories

### Build Failures
1. Check environment variables in Netlify
2. Ensure all required dependencies are installed
3. Review build logs for specific errors

### Images Not Showing
1. Verify `SITE_URL` environment variable is set correctly
2. Check that images are in `/images/uploads/`
3. Ensure image paths in content use the correct format

## Example Workflow

```bash
# Initial setup (one time)
git clone https://github.com/yourusername/your-fork.git
cd your-fork
git remote add upstream https://github.com/null1979/DecapCMS-Webstudio.git
git checkout -b customer-mycompany
git push -u origin customer-mycompany

# Regular content updates (via DecapCMS or direct commits)
git add .
git commit -m "Update blog post"
git push

# Syncing template updates (periodically)
git fetch upstream
git checkout customer-mycompany
git merge upstream/main
git push
```