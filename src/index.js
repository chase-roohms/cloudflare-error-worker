import errorHtml from './error.html';
import fallbackHtml from './fallback.html';
import styles from './styles.css';

// ===== CONFIGURATION =====
// Customize these settings for your needs
const CONFIG = {
  // Contact information - users will see these on error pages
  contact: {
    email: 'support@example.com',  // Change to your support email
    url: 'https://status.example.com',  // Change to your status page or support URL
  },
  
  // Enable/disable features
  features: {
    showTimestamp: true,
    showRetryButton: true,
  }
};
// ========================

// Error message mappings for common HTTP status codes
const ERROR_MESSAGES = {
  500: 'The server encountered an unexpected condition that prevented it from fulfilling the request.',
  501: 'The server does not support the functionality required to fulfill the request.',
  502: 'The server received an invalid response from the upstream server.',
  503: 'The server is temporarily unable to handle the request. This is usually a temporary state.',
  504: 'The server did not receive a timely response from the upstream server.',
  505: 'The server does not support the HTTP protocol version used in the request.',
  507: 'The server is unable to store the representation needed to complete the request.',
  508: 'The server detected an infinite loop while processing the request.',
  509: 'The server has exceeded its bandwidth limit.',
  510: 'Further extensions to the request are required for the server to fulfill it.',
  511: 'The client needs to authenticate to gain network access.',
  default: 'The server encountered an error while processing your request.'
};

function getErrorMessage(statusCode) {
  return ERROR_MESSAGES[statusCode] || ERROR_MESSAGES.default;
}

function getCurrentTimestamp() {
  return new Date().toISOString();
}

function injectVariables(html, variables) {
  let result = html;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    result = result.replaceAll(placeholder, value);
  }
  return result;
}

export default {
  async fetch(request, env) {
    try {
      const response = await fetch(request);
      
      // Check if the origin server returned a 5xx error
      if (response.status >= 500 && response.status < 600) {
        // Prepare variables for template injection
        const variables = {
          STATUS_CODE: response.status.toString(),
          ERROR_MESSAGE: getErrorMessage(response.status),
          TIMESTAMP: CONFIG.features.showTimestamp ? getCurrentTimestamp() : 'N/A',
          CONTACT_EMAIL_LINK: `mailto:${CONFIG.contact.email}?subject=Error%20Report%20${response.status}&body=Error%20Code:%20${response.status}%0ATime:%20${getCurrentTimestamp()}`,
          CONTACT_URL: CONFIG.contact.url,
        };
        
        // Inject CSS and variables into the HTML
        let html = errorHtml.replace('<link rel="stylesheet" href="./styles.css">', `<style>${styles}</style>`);
        html = injectVariables(html, variables);
        
        return new Response(html, { 
          status: response.status,
          headers: { 
            "content-type": "text/html;charset=UTF-8",
            "cache-control": "no-cache, no-store, must-revalidate",
            "x-error-page": "cloudflare-worker"
          } 
        });
      }
      
      return response;
      
    } catch (err) {
      // Handle cases where the origin is completely unreachable
      const variables = {
        STATUS_CODE: '503',
        TIMESTAMP: CONFIG.features.showTimestamp ? getCurrentTimestamp() : 'N/A',
        CONTACT_EMAIL_LINK: `mailto:${CONFIG.contact.email}?subject=Critical%20Error%20Report%20503&body=Error%20Code:%20503%0ATime:%20${getCurrentTimestamp()}%0ADetails:%20Origin%20server%20unreachable`,
        CONTACT_URL: CONFIG.contact.url,
        STYLES: styles,
      };
      
      let html = injectVariables(fallbackHtml, variables);
      
      return new Response(html, { 
        status: 503,
        headers: { 
          "content-type": "text/html;charset=UTF-8",
          "cache-control": "no-cache, no-store, must-revalidate",
          "x-error-page": "cloudflare-worker-fallback"
        } 
      });
    }
  }
};