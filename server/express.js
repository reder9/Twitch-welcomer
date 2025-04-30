const express = require('express');
const { saveTwitchConfig, getTwitchConfig, getAdditionalConfig } = require('../config');
const tmi = require('tmi.js');

function createExpressApp() {
  const app = express();
  app.use(express.static('public'));
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

  // Save additional settings
  app.post('/save-additional-config', (req, res) => {
    const { welcomeNewPosters, welcomeFirstTimeToday, welcomeFirstTimeViewers, messages } = req.body;
    saveAdditionalConfig({ welcomeNewPosters, welcomeFirstTimeToday, welcomeFirstTimeViewers, messages });
    res.json({ message: '✅ Additional settings saved successfully!' });
  });

  // Get additional settings
  app.get('/get-additional-config', (req, res) => {
    const config = getAdditionalConfig();
    res.json(config);
  });

  return app;
}

module.exports = { createExpressApp };
