require('dotenv').config();

const tmi = require('tmi.js');
const express = require('express');
const http = require('http');
const path = require('path');
const config = require('./config');

// Settings
const app = express();
const server = http.createServer(app);
const PORT_START = 3000;
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

// Randomized Welcome Messages
const welcomeMessagesFirstTime = [
  "🎉 WOOHOO!! 🎉 Everyone welcome @{user} to the chat! 🚀 You’re officially part of the fam now!! 🫶 LET'S GOOO!",
  "🔥 YO @{user} just dropped into the chat! Show them some love!! 🚀🎤",
  "🎊 HYPE ALERT!! 🎊 Welcome @{user} for their FIRST message! Let’s make it a party!! 🎉💥",
  "🚀 @{user} has entered the chat!! TIME TO GET WILD!! 🕺💃",
  "🥳 YOOO @{user} is here for the FIRST TIME! Big hugs and even bigger vibes!! 🎈🎉",
];

const welcomeMessagesFirstToday = [
  "👋 Welcome back @{user}! So glad to have you hanging with us today! 🎉",
  "🌟 Hey @{user}! Thanks for joining us today! You rock! 🤘",
  "💬 First chat today from @{user}! Everyone say hi! 👋🚀",
];

// Helper to pick random message
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Twitch connection
twitchClient.connect();

twitchClient.on('message', (channel, tags, message, self) => {
  if (self) return;

  const username = tags['display-name'] || tags['username'];

  if (tags['first-msg']) {
    console.log(`🎉 First-time chatter detected: ${username}`);
    const template = pickRandom(welcomeMessagesFirstTime);
    const finalMessage = template.replace('{user}', username);
    twitchClient.say(channel, finalMessage);
    return;
  }

  if (!knownUsers.has(username)) {
    knownUsers.add(username);
    console.log(`👋 (Backup) First time today: ${username}`);
    const template = pickRandom(welcomeMessagesFirstToday);
    const finalMessage = template.replace('{user}', username);
    twitchClient.say(channel, finalMessage);
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
