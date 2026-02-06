// Fetch health check status
const statusElement = document.getElementById('health-status');
const downNote = document.getElementById('down-note');
const unableToCheckNote = document.getElementById('unable-to-check-note');
const healthCheckUrl = '{{HEALTH_CHECK_URL}}';

fetch(healthCheckUrl)
  .then(response => response.json())
  .then(data => {
    if (data.status === 'up') {
      statusElement.textContent = 'Up';
      statusElement.style.color = '#4ade80';
    } else {
      statusElement.textContent = 'Down';
      statusElement.style.color = '#f87171';
      downNote.style.display = 'block';
    }
  })
  .catch(error => {
    statusElement.textContent = 'Unable to check';
    statusElement.style.color = '#fbbf24';
    unableToCheckNote.style.display = 'block';
  });
