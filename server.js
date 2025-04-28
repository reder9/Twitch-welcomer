require('dotenv').config();

const tmi = require('tmi.js');
const express = require('express');
const http = require('http');
const path = require('path');
const open = require('open');
const config = require('./config');

// Settings
const app = express();
const server = http.createServer(app);
const PORT_START = 3000; // starting port
let currentPort = PORT_START;

app.use(express.static('public'));

// Twitch Setup
const twitchClient = new tmi.Client({
  options: { debug: true },
  identity: {
    username: config.twitch.username,
    password: config.twitch.password
  },
  channels: config.twitch.channels
});

// Keep track of users we've already welcomed
const knownUsers = new Set();

// Twitch connection
twitchClient.connect();

twitchClient.on('message', (channel, tags, message, self) => {
  if (self) return;

  const username = tags['display-name'] || tags['username'];

  if (tags['first-msg']) {
    console.log(`🎉 First-time chatter detected: ${username}`);
    twitchClient.say(channel, `Hey @${username}, welcome to the stream! 🎉`);
    return;
  }

  if (!knownUsers.has(username)) {
    knownUsers.add(username);
    console.log(`👋 (Backup) First time today: ${username}`);
  }
});

// Function to try starting the server
function tryListen(port) {
  server.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} in use, trying ${port + 1}...`);
      tryListen(port + 1);
    } else {
      console.error('❌ Server error:', err);
    }
  });
}

// Start trying
tryListen(currentPort);
