import tmi from 'tmi.js';
import { getMessageConfig } from '../config.js'; // Make sure this path is correct

let client = null;
const knownUsers = new Set();

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

// Message send counters
export const welcomeStats = {
  newPostersCount: 0,
  firstTodayCount: 0,
  firstViewersCount: 0,
};

function isBotUser(username) {
  if (!username) return true;

  const lowerUsername = username.toLowerCase();

  if (BOT_LIST.some(bot => lowerUsername.includes(bot))) {
    return true;
  }

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

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
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

    const username = tags['display-name'] || tags['username'];
    if (isBotUser(username)) return;

    // Handle first-time message in chat
    if (tags['first-msg'] && messageConfig.welcomeNewPosters) {
      const msg = pickRandom(messageConfig.welcomeMessagesNewPosters).replace('{user}', username);
      client.say(channel, msg);
      welcomeStats.newPostersCount++;
      knownUsers.add(username);
      return;
    }

    // Handle first message today from known user
    if (!knownUsers.has(username) && messageConfig.welcomeFirstTimeToday) {
      const msg = pickRandom(messageConfig.welcomeMessagesFirstToday).replace('{user}', username);
      client.say(channel, msg);
      welcomeStats.firstTodayCount++;
      knownUsers.add(username);
      return;
    }

    // Handle first-time viewer (passive/lurking viewer without badges/mod/sub)
    const isFirstTimeViewer =
      messageConfig.welcomeFirstTimeViewers &&
      !tags['mod'] &&
      !tags['subscriber'] &&
      !tags['vip'] &&
      tags['badges'] === null &&
      !knownUsers.has(username);

    if (isFirstTimeViewer) {
      const msg = pickRandom(messageConfig.welcomeMessagesFirstViewer).replace('{user}', username);
      client.say(channel, msg);
      welcomeStats.firstViewersCount++;
      knownUsers.add(username);
    }
  });

  console.log('✅ Twitch bot started with bot detection and welcome tracking!');
  return client;
}
