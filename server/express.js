const express = require('express');
const path = require('path');
const { saveTwitchConfig, getTwitchConfig, getAdditionalConfig, saveAdditionalConfig } = require('../config');
const tmi = require('tmi.js');

function createExpressApp() {
  const app = express();

  // Ensure static files (index.html, config-extra.html, etc.) are served from the public folder
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.use(express.json());

  app.post('/save-config', async (req, res) => {
    const { username, password, channel } = req.body;

    if (!username || !password || !channel) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const client = new tmi.Client({
      identity: {
        username,
        password,
      },
      channels: [channel],
    });

    try {
      await client.connect();
      await client.disconnect();

      // Save if auth succeeds
      saveTwitchConfig({ username, password, channel });
      res.status(200).json({ message: '✅ Configuration saved successfully!' });

    } catch (err) {
      console.error('Twitch auth failed:', err.message);
      res.status(401).json({ message: '❌ Authentication failed. Please check your OAuth token and username.' });
    }
  });

  app.get('/get-config', (req, res) => {
    const config = getTwitchConfig();
    res.json(config);
  });

  app.post('/save-additional-config', (req, res) => {
    const { welcomeNewPosters, welcomeFirstTimeToday, welcomeFirstTimeViewers, messages } = req.body;
    saveAdditionalConfig({ welcomeNewPosters, welcomeFirstTimeToday, welcomeFirstTimeViewers, messages });
    res.json({ message: '✅ Additional settings saved successfully!' });
  });

  app.get('/get-additional-config', (req, res) => {
    const config = getAdditionalConfig();
    res.json(config);
  });

  // Optional: fallback route for unknown paths (could return index.html or 404)
  app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });

  return app;
}

module.exports = { createExpressApp };
