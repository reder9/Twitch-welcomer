document.addEventListener('DOMContentLoaded', () => {
  const footerHTML = `
    <footer class="text-sm text-gray-500 p-4 border-t mt-8">
      <div class="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto gap-4">
        
        <!-- Left Section -->
        <div id="footer-content" class="text-center md:text-left text-cyan-300 font-medium">
          <span id="app-name">App</span> 
          <span id="app-version">v0.0.0</span> — 
          <span id="app-author">by Author</span>
        </div>

        <!-- Right Section -->
        <div class="flex items-center space-x-4">
          <a href="https://redersoft.canny.io/" class="text-blue-400 hover:text-blue-300 transition">
            💡 Suggest a Feature / Report a Bug
          </a>
          <a href="https://www.buymeacoffee.com/reder9" target="_blank" rel="noopener noreferrer"
             class="text-yellow-400 hover:text-yellow-300 transition font-semibold">
            ☕ Buy Me a Coffee
          </a>
        </div>

      </div>
    </footer>
  `;

  // Inject the footer into the page
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    footerPlaceholder.innerHTML = footerHTML;

    // Fetch app info and populate dynamic values
    fetch('/api/app-info')
      .then(res => res.json())
      .then(info => {
        document.getElementById('app-name').textContent = info.name || 'App';
        document.getElementById('app-version').textContent = `v${info.version || '0.0.0'}`;
        document.getElementById('app-author').textContent = info.author ? `by ${info.author}` : '';
      })
      .catch(err => {
        console.error('Failed to load app info:', err);
        const footer = document.getElementById('footer-content');
        if (footer) footer.textContent = 'Unable to load app info';
      });
  }
});
