import errorHtml from './error.html';
import fallbackHtml from './fallback.html';
import styles from './styles.css';

// ===== CONFIGURATION =====
// Customize these settings for your needs
const CONFIG = {
  // Contact information - users will see these on error pages
  contact: {
    email: 'chaseroohms@gmail.com',  // Change to your support email
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
  // 4XX Client Errors
  400: 'The request could not be understood by the server due to malformed syntax.',
  401: 'The request requires user authentication. Please provide valid credentials.',
  402: 'Payment is required to access this resource.',
  403: 'You do not have permission to access this resource.',
  404: 'The requested resource could not be found on this server.',
  405: 'The method specified in the request is not allowed for this resource.',
  406: 'The resource is not available in a format acceptable to your client.',
  407: 'Proxy authentication is required to access this resource.',
  408: 'The server timed out waiting for your request.',
  409: 'The request could not be completed due to a conflict with the current state of the resource.',
  410: 'The requested resource is no longer available and will not be available again.',
  411: 'The request did not specify the length of its content, which is required.',
  412: 'One or more preconditions in your request headers failed.',
  413: 'The request is larger than the server is willing or able to process.',
  414: 'The URI provided was too long for the server to process.',
  415: 'The request entity has a media type which the server does not support.',
  416: 'The requested range cannot be satisfied.',
  417: 'The expectation given in the request header could not be met.',
  418: 'The server refuses to brew coffee because it is, permanently, a teapot.',
  421: 'The request was directed at a server that is not able to produce a response.',
  422: 'The request was well-formed but contains semantic errors.',
  423: 'The resource that is being accessed is locked.',
  424: 'The request failed due to failure of a previous request.',
  425: 'The server is unwilling to risk processing a request that might be replayed.',
  426: 'The client should switch to a different protocol.',
  428: 'The origin server requires the request to be conditional.',
  429: 'You have sent too many requests in a given amount of time. Please slow down.',
  431: 'The request headers are too large.',
  451: 'The resource is unavailable for legal reasons.',
  
  // 5XX Server Errors
  500: 'The server encountered an unexpected condition that prevented it from fulfilling the request.',
  501: 'The server does not support the functionality required to fulfill the request.',
  502: 'The server received an invalid response from the upstream server. This is often due to a loss of power or internet connectivity.',
  503: 'The server is temporarily unable to handle the request. This is usually a temporary state.',
  504: 'The server did not receive a timely response from the upstream server.',
  505: 'The server does not support the HTTP protocol version used in the request.',
  507: 'The server is unable to store the representation needed to complete the request.',
  508: 'The server detected an infinite loop while processing the request.',
  509: 'The server has exceeded its bandwidth limit.',
  510: 'Further extensions to the request are required for the server to fulfill it.',
  511: 'The client needs to authenticate to gain network access.',
  
  default: 'An error occurred while processing your request.'
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
      
      // Check if the origin server returned a 4xx or 5xx error
      if ((response.status >= 400 && response.status < 600)) {
        // Prepare variables for template injection
        const variables = {
          STATUS_CODE: response.status.toString(),
          ERROR_MESSAGE: getErrorMessage(response.status),
          TIMESTAMP: CONFIG.features.showTimestamp ? getCurrentTimestamp() : 'N/A',
          CONTACT_EMAIL_LINK: `mailto:${CONFIG.contact.email}?subject=Error%20Report%20${response.status}&body=Error%20Code:%20${response.status}%0ATime:%20${getCurrentTimestamp()}`,
          CONTACT_EMAIL: CONFIG.contact.email,
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