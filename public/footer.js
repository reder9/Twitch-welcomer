// public/footer.js

document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/app-info')
    .then(res => res.json())
    .then(info => {
      document.getElementById('app-name').textContent = info.name || 'App';
      document.getElementById('app-version').textContent = `v${info.version || '0.0.0'}`;
      document.getElementById('app-author').textContent = info.author || '';
    })
    .catch(err => {
      console.error('Failed to load app info:', err);
      const footer = document.getElementById('footer-content');
      if (footer) footer.textContent = 'Unable to load app info';
    });
});
