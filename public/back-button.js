// back-button.js
document.addEventListener('DOMContentLoaded', () => {
  const backButtonHTML = `
    <a href="/home.html"
       id="back-button"
       class="bg-purple-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 hidden">
      ← Back
    </a>
  `;

  const mountPoint = document.getElementById('back-button-placeholder');
  if (mountPoint) {
    mountPoint.innerHTML = backButtonHTML;
  }

  // Fetch settings to decide if back button should show
  fetch('/get-config')
    .then(res => res.json())
    .then(config => {
      if (
        config.username &&
        config.password &&
        Array.isArray(config.channels) &&
        config.channels.length > 0
      ) {
        document.getElementById('back-button')?.classList.remove('hidden');
      }
    })
    .catch(err => console.error('Failed to check config for back button:', err));
});
