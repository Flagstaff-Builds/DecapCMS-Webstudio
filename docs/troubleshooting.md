# Troubleshooting

This guide helps you solve common issues with your Decap CMS and Netlify setup.

## Common Issues

### Site Not Found

If you encounter a "Page not found" error when visiting your Netlify site, check the following:

1. **Environment Variables**: Ensure **all environment variables are correctly set** in your Netlify dashboard:
   - SITE_URL should be your Netlify domain (e.g., `https://YOUR-NETLIFY-SITE.netlify.app`)

2. **Deployment**: After making any changes to your configuration, trigger a new deployment from the Netlify dashboard.

### Admin Access Issues

If you can't access the admin panel or log in:

1. **Check the URL**: Make sure you're using the correct URL: `https://YOUR-NETLIFY-SITE.netlify.app/admin/`

2. **Identity Setup**: Verify that Netlify Identity is properly set up:
   - Go to your Netlify dashboard > Site settings > Identity
   - Ensure Identity is enabled
   - Check that Git Gateway is enabled

3. **Invitation Issues**: If you've been invited but can't accept the invitation:
   - Check your email (including spam) for the invitation
   - If the link doesn't work, try modifying it:
     - Change `https://YOUR-NETLIFY-SITE.netlify.app/#invite_token=xxx` to `https://YOUR-NETLIFY-SITE.netlify.app/admin/#invite_token=xxx`

### Content Not Updating

If your content changes aren't appearing:

1. **Build Status**: Check if your site is still building in the Netlify dashboard

2. **Cache Issues**: Try clearing your browser cache or using incognito mode

3. **Deployment Logs**: Review the deployment logs in Netlify for any errors

## Advanced Troubleshooting

### Local Development

To test your site locally:

1. Clone your repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your environment variables
4. Run the local server: `npm run dev`
5. Access the admin at: `http://localhost:3000/admin/`

### Manual Rebuilds

If you need to force a rebuild:

1. Go to your Netlify dashboard
2. Navigate to the "Deploys" tab
3. Click "Trigger deploy" > "Deploy site"

### Content Structure Issues

If your content structure seems incorrect:

1. Check the frontmatter in your markdown files
2. Verify that required fields are present
3. Ensure your content follows the expected format for your templates
