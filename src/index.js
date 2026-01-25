import errorHtml from './error.html';
import fallbackHtml from './fallback.html';
import styles from './styles.css';

export default {
  async fetch(request) {
    try {
      const response = await fetch(request);
      // Check if the origin server returned a 5xx error
      if (response.status >= 500 && response.status < 600) {
        // Inject the CSS and status code into the HTML
        let html = errorHtml.replace('<link rel="stylesheet" href="./styles.css">', `<style>${styles}</style>`);
        html = html.replace('{{STATUS_CODE}}', response.status);
        return new Response(html, { 
          status: response.status,
          headers: { "content-type": "text/html;charset=UTF-8" } 
        });
      }
      return response;
      
    } catch (err) {
      // Handle cases where the origin is completely unreachable
      let html = fallbackHtml.replace('{{STATUS_CODE}}', '503');
      return new Response(html, { 
        status: 503,
        headers: { "content-type": "text/html;charset=UTF-8" } 
      });
    }
  }
};