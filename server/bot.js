import tmi from 'tmi.js';
import { getMessageConfig } from '../config.js';
import player from 'play-sound';
import { broadcastToast } from '../server.js';
import { loadStats, saveStats, loadUserData, saveUserData } from './storage.js';

let client = null;
const play = player({});

// Persisted stats
export const welcomeStats = loadStats();
const userData = loadUserData();

export const BOT_LIST = [
  'streamelements',
  'streamlabs',
  'nightbot',
  'moobot',
  'wizebot',
  'blerp',
  'ankhbot',
  'vivbot',
  'coebot',
  'phantombot',
  'deepbot'
];

let lastMessageIndex = {
  newPosters: -1,
  firstToday: -1,
  firstViewers: -1
};

function playWelcomeSound() {
  play.play('./sounds/welcome.mp3', function (err) {
    if (err) console.error('Sound error:', err);
  });
}

function isBotUser(username) {
  if (!username) return true;

  const lowerUsername = username.toLowerCase();

  if (BOT_LIST.some(bot => lowerUsername.includes(bot))) return true;

  const botPatterns = [
    /bot$/i,
    /\[bot\]/i,
    /\(bot\)/i,
    /_bot_/i,
    /command/i,
    /helper/i
  ];

  return botPatterns.some(pattern => pattern.test(username));
}

function pickRandomNonRepeating(arr, lastIndexKey) {
  if (!Array.isArray(arr) || arr.length === 0) return '';
  if (arr.length === 1) return arr[0];

  let index;
  do {
    index = Math.floor(Math.random() * arr.length);
  } while (index === lastMessageIndex[lastIndexKey]);

  lastMessageIndex[lastIndexKey] = index;
  return arr[index];
}

function isToday(dateStr) {
  const today = new Date();
  const date = new Date(dateStr);
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function startBot(config) {
  if (client) {
    client.disconnect();
  }

  const messageConfig = getMessageConfig();

  client = new tmi.Client({
    options: { debug: true },
    identity: {
      username: config.username,
      password: config.password
    },
    channels: config.channels
  });

  client.connect();

  client.on('message', (channel, tags, message, self) => {
    if (self) return;

    const username = (tags['display-name'] || tags['username']).toLowerCase();
    if (isBotUser(username)) return;

    const now = new Date().toISOString();
    const user = userData[username] || { joinedAt: now, lastMessageDate: null };

    // First message ever (new poster)
    if (!user.lastMessageDate && tags['first-msg'] && messageConfig.welcomeNewPosters) {
      const msg = pickRandomNonRepeating(
        messageConfig.welcomeMessagesNewPosters,
        'newPosters'
      ).replace('{user}', username);
      client.say(channel, msg);
      playWelcomeSound();
      broadcastToast(`🎉 Welcomed first time messager: ${username} to the chat!`);
      welcomeStats.newPostersCount++;
      saveStats(welcomeStats);
      user.lastMessageDate = now;
      userData[username] = user;
      saveUserData(userData);
      return;
    }

    // First message today
    if (!isToday(user.lastMessageDate) && messageConfig.welcomeFirstTimeToday) {
      const msg = pickRandomNonRepeating(
        messageConfig.welcomeMessagesFirstToday,
        'firstToday'
      ).replace('{user}', username);
      client.say(channel, msg);
      playWelcomeSound();
      broadcastToast(`🎉 Welcomed returning user, but first time posting today: ${username} to the chat!`);
      welcomeStats.firstTodayCount++;
      saveStats(welcomeStats);
      user.lastMessageDate = now;
      userData[username] = user;
      saveUserData(userData);
      return;
    }

    // First-time viewer (no badges, no mod, no sub, never seen before)
    const isFirstTimeViewer =
      messageConfig.welcomeFirstTimeViewers &&
      !tags['mod'] &&
      !tags['subscriber'] &&
      !tags['vip'] &&
      tags['badges'] === null &&
      !userData[username];

    if (isFirstTimeViewer) {
      const msg = pickRandomNonRepeating(
        messageConfig.welcomeMessagesFirstViewer,
        'firstViewers'
      ).replace('{user}', username);
      client.say(channel, msg);
      playWelcomeSound();
      broadcastToast(`🎉 Welcomed first time lurker: ${username} to the chat!`);
      welcomeStats.firstViewersCount++;
      saveStats(welcomeStats);
      userData[username] = { joinedAt: now, lastMessageDate: now };
      saveUserData(userData);
    } else {
      // Update last seen for any message
      user.lastMessageDate = now;
      userData[username] = user;
      saveUserData(userData);
    }
  });

  console.log('✅ Twitch bot started with persistent user tracking and welcome logic!');
  return client;
}
