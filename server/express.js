import express from 'express';
import path from 'path';
import fs from 'fs';
import tmi from 'tmi.js';
import { fileURLToPath } from 'url';
import {
  saveTwitchConfig,
  getTwitchConfig,
  getMessageConfig,
  saveMessageConfig
} from '../config.js';
import { startBot } from './bot.js';
import {
  loadStats,
  loadAppConfig,       // ✅ NEW
  saveAppConfig        // ✅ NEW
} from './storage.js';

// Create __filename and __dirname equivalents
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load package.json data
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')
);

function createExpressApp() {
  const app = express();

  // Serve static files
  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.use('/components', express.static(path.join(__dirname, '..', 'public/components')));
  app.use(express.json());

  // Bot state variables
  let botRunning = false;
  let botClient = null;

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

  app.post('/save-message-config', (req, res) => {
    const {
      welcomeNewPosters,
      welcomeFirstTimeToday,
      welcomeFirstTimeViewers,
      welcomeMessagesNewPosters,
      welcomeMessagesFirstToday,
      welcomeMessagesFirstViewer,
      messages,
    } = req.body;

    saveMessageConfig({
      welcomeNewPosters,
      welcomeFirstTimeToday,
      welcomeFirstTimeViewers,
      welcomeMessagesNewPosters,
      welcomeMessagesFirstToday,
      welcomeMessagesFirstViewer,
      messages,
    });

    res.json({ message: '✅ Messsage settings saved successfully!' });
  });

  app.get('/get-message-config', (req, res) => {
    const config = getMessageConfig();
    res.json(config);
  });

  // ✅ App config APIs
  app.get('/api/app-config', (req, res) => {
    try {
      const config = loadAppConfig();
      res.json(config);
    } catch (err) {
      res.status(500).json({ message: `❌ Failed to load app config: ${err.message}` });
    }
  });

  app.post('/api/app-config', (req, res) => {
    try {
      const config = req.body;
      saveAppConfig(config);
      res.json({ message: '✅ App config saved successfully!' });
    } catch (err) {
      res.status(500).json({ message: `❌ Failed to save app config: ${err.message}` });
    }
  });

  // App info
  app.get('/api/app-info', (req, res) => {
    const { name, version, author } = packageJson;
    res.json({ name, version, author });
  });

  app.get('/api/welcome-stats', (req, res) => {
    const stats = loadStats();
    res.json(stats);
  });

  // Bot controls
  app.post('/launch-bot', (req, res) => {
    try {
      const config = getTwitchConfig();

      if (!config || !config.username || !config.password || !config.channels) {
        return res.status(400).json({ message: '❌ Missing Twitch configuration. Please save it first.' });
      }

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

  // Fallback route
  app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '..', 'public', 'auth-config.html'));
  });

  // ✅ Auto-start bot if config is enabled
  try {
    const appConfig = loadAppConfig();
    const twitchConfig = getTwitchConfig();

    if (
      appConfig.startBotOnLaunch &&
      twitchConfig?.username &&
      twitchConfig?.password &&
      twitchConfig?.channels?.[0]
    ) {
      console.log('🚀 Auto-starting bot...');
      botClient = startBot({
        username: twitchConfig.username,
        password: twitchConfig.password,
        channels: [twitchConfig.channels[0]]
      });
      botRunning = true;
    }
  } catch (err) {
    console.error('⚠️ Failed to auto-start bot:', err.message);
  }

  return app;
}

export { createExpressApp };
