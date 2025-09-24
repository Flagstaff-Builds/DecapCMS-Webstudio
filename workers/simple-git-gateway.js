/**
 * Simple Git Gateway for Cloudflare Workers
 * 
 * This worker trusts Cloudflare Access authentication and provides
 * a Git Gateway compatible API for Decap CMS, eliminating double login.
 * 
 * Deploy this as a Cloudflare Worker and set these environment variables:
 * - GITHUB_TOKEN: Personal access token with repo permissions
 * - GITHUB_REPO: owner/repo format (e.g., "YourGitHubUsername/DecapCMS-Webstudio")
 */

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Check if user has passed Cloudflare Access
    const cfEmail = request.headers.get('Cf-Access-Authenticated-User-Email');
    if (!cfEmail && !request.url.includes('localhost')) {
      return new Response('Unauthorized', { 
        status: 401,
        headers: corsHeaders 
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Mock user endpoint - CMS checks this on load
      if (path === '/.netlify/identity/user' || path === '/user') {
        return new Response(JSON.stringify({
          id: cfEmail || 'local-user',
          email: cfEmail || 'local@example.com',
          user_metadata: {
            full_name: cfEmail?.split('@')[0] || 'Local User'
          },
          app_metadata: {
            provider: 'cloudflare-access',
            roles: ['admin']
          }
        }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      }

      // Settings endpoint
      if (path === '/.netlify/identity/settings' || path === '/settings') {
        return new Response(JSON.stringify({
          autoconfirm: true,
          disable_signup: true,
          external: {
            cloudflare: true
          }
        }), {
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        });
      }

      // Git Gateway endpoint - proxy to GitHub
      if (path.startsWith('/.netlify/git/github/') || path.startsWith('/github/')) {
        const githubPath = path.replace('/.netlify/git/github/', '').replace('/github/', '');
        const [owner, repo] = env.GITHUB_REPO.split('/');
        
        // Construct GitHub API URL
        let githubUrl = `https://api.github.com/repos/${owner}/${repo}`;
        
        if (githubPath) {
          githubUrl += `/${githubPath}`;
        }
        
        // Add query parameters
        if (url.search) {
          githubUrl += url.search;
        }

        // Prepare headers for GitHub
        const headers = {
          'Authorization': `token ${env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Cloudflare-Git-Gateway'
        };

        // Handle request body for POST/PUT
        let body = null;
        if (request.method === 'POST' || request.method === 'PUT') {
          body = await request.text();
          headers['Content-Type'] = 'application/json';
        }

        // Make request to GitHub
        const githubResponse = await fetch(githubUrl, {
          method: request.method,
          headers,
          body
        });

        // Return GitHub's response
        const responseBody = await githubResponse.text();
        return new Response(responseBody, {
          status: githubResponse.status,
          headers: {
            'Content-Type': githubResponse.headers.get('Content-Type') || 'application/json',
            ...corsHeaders
          }
        });
      }

      // Default 404
      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders 
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      });
    }
  }
};