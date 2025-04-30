const express = require('express');
const path = require('path');
const fs = require('fs');
const { saveTwitchConfig, getTwitchConfig, getAdditionalConfig, saveAdditionalConfig } = require('../config');
const tmi = require('tmi.js');

// Load package.json data
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));

function createExpressApp() {
  const app = express();

  // Serve static files
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Serve shared component files (like footer)
  app.use('/components', express.static(path.join(__dirname, '..', 'public/components')));

  app.use(express.json());

  // Twitch config saving
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

  // App info endpoint
  app.get('/api/app-info', (req, res) => {
    const { name, version, author } = packageJson;
    res.json({ name, version, author });
  });

  // Fallback route
  app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });

  return app;
}

module.exports = { createExpressApp };
