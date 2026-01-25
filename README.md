# cloudflare-error-worker

A Cloudflare Worker that intercepts HTTP error responses (4xx and 5xx) from your origin server and displays custom, user-friendly error pages.

## Purpose

This worker acts as a proxy layer that:
- Monitors responses from your origin server
- Intercepts error status codes (400-599)
- Displays branded error pages with helpful information
- Provides fallback pages when the origin is completely unreachable
- Includes contact information and timestamps for troubleshooting

## Configuration

Edit `src/index.js` to customize:
- Contact email address
- Enable/disable timestamps and retry buttons
- Error messages for specific status codes

## Deployment

This worker is configured to auto-deploy to Cloudflare using Cloudflare's automatic deployments:

1. Link your repository to Cloudflare:
   - Go to your Cloudflare dashboard
   - Navigate to Workers & Pages
   - Connect your GitHub repository

2. Deploy via Wrangler CLI:
   ```bash
   npx wrangler deploy
   ```

3. For automatic deployments, connect your repository in the Cloudflare dashboard under Workers & Pages > Create Application > Pages > Connect to Git

Any push to the main branch will trigger an automatic rebuild and deployment of the worker.
