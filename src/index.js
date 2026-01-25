export default {
  async fetch(request) {
    try {
      const response = await fetch(request);
      // Check if the origin server returned a 5xx error
      if (response.status >= 500 && response.status < 600) {
        return new Response(
          `<!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>We'll Be Right Back</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
              }
              .container {
                text-align: center;
                padding: 2rem;
              }
              h1 { font-size: 2.5rem; margin-bottom: 1rem; }
              p { font-size: 1.2rem; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🚧 Oops! Something went wrong</h1>
              <p>We're fixing things right now. Please check back in a few minutes!</p>
            </div>
          </body>
          </html>`,
          { 
            status: 503,
            headers: { "content-type": "text/html;charset=UTF-8" } 
          }
        );
      }
      return response;
      
    } catch (err) {
      // Handle cases where the origin is completely unreachable
      return new Response(
        `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Server Unavailable</title>
        </head>
        <body>
          <h1>Server Temporarily Unavailable</h1>
          <p>We'll be back shortly. Thank you for your patience!</p>
        </body>
        </html>`,
        { 
          status: 503,
          headers: { "content-type": "text/html;charset=UTF-8" } 
        }
      );
    }
  }
};