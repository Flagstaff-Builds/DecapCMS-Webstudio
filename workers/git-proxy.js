/**
 * Cloudflare Worker - Git Proxy for Decap CMS
 * 
 * This worker trusts Cloudflare Access authentication and proxies
 * Git operations to GitHub, eliminating the need for a second login.
 */

export default {
  async fetch(request, env) {
    // Only handle requests from authenticated Cloudflare Access users
    const cfAccessJWT = request.headers.get('Cf-Access-Jwt-Assertion');
    if (!cfAccessJWT) {
      return new Response('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);
    
    // Handle different CMS endpoints
    if (url.pathname === '/api/auth') {
      // Return mock auth response - user is already authenticated via CF Access
      return new Response(JSON.stringify({
        provider: 'cloudflare-access',
        token: cfAccessJWT,
        user: {
          name: request.headers.get('Cf-Access-Authenticated-User-Email') || 'User',
          email: request.headers.get('Cf-Access-Authenticated-User-Email') || 'user@example.com'
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Proxy Git operations to GitHub
    if (url.pathname.startsWith('/api/github/')) {
      const githubPath = url.pathname.replace('/api/github/', '');
      const githubUrl = `https://api.github.com/${githubPath}${url.search}`;
      
      // Clone the request
      const githubRequest = new Request(githubUrl, {
        method: request.method,
        headers: {
          ...Object.fromEntries(request.headers),
          'Authorization': `token ${env.GITHUB_TOKEN}`,
          'User-Agent': 'Cloudflare-Worker-Git-Proxy'
        },
        body: request.method !== 'GET' ? await request.text() : undefined
      });

      // Remove CF Access headers before sending to GitHub
      githubRequest.headers.delete('Cf-Access-Jwt-Assertion');
      githubRequest.headers.delete('Cf-Access-Authenticated-User-Email');

      const response = await fetch(githubRequest);
      
      // Return GitHub's response
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers),
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};