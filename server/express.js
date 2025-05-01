const express = require('express');
const path = require('path');
const fs = require('fs');
const tmi = require('tmi.js');
const { saveTwitchConfig, getTwitchConfig, getAdditionalConfig, saveAdditionalConfig } = require('../config');
const { startBot } = require('./bot');

// Load package.json data
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));

function createExpressApp() {
  const app = express();

  // Serve static files
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Serve shared components
  app.use('/components', express.static(path.join(__dirname, '..', 'public/components')));

  app.use(express.json());

  // Twitch config saving
  app.post('/save-config', async (req, res) => {
    const { username, password, channel } = req.body;

    if (!username || !password || !channel) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const client = new tmi.Client({
      identity: { username, password },
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

  // Bot management
  let botRunning = false;
  let botClient = null;

  app.post('/launch-bot', (req, res) => {
    try {
      const config = getTwitchConfig();

      if (!config || !config.username || !config.password || !config.channels) {
        return res.status(400).json({ message: '❌ Missing Twitch configuration. Please save it first.' });
      }

      // Start and save client
      botClient = startBot({
        username: config.username,
        password: config.password,
        channels: [config.channels[0]]
      });

      botRunning = true;
      res.status(200).json({ message: '✅ Bot launched successfully!' });

    } catch (err) {
      console.error('Error launching bot:', err.message);
      res.status(500).json({ message: `❌ Failed to launch bot: ${err.message}` });
    }
  });

  app.post('/stop-bot', (req, res) => {
    try {
      if (botClient) {
        botClient.disconnect();
        botClient = null;
        botRunning = false;
        res.status(200).json({ message: '🛑 Bot stopped successfully!' });
      } else {
        res.status(400).json({ message: '⚠️ Bot is not currently running.' });
      }
    } catch (err) {
      res.status(500).json({ message: `❌ Failed to stop bot: ${err.message}` });
    }
  });

  app.get('/bot-status', (req, res) => {
    res.json({ running: botRunning });
  });

  // Fallback to main page
  app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '..', 'public', 'auth-config.html'));
  });

  return app;
}

module.exports = { createExpressApp };
 