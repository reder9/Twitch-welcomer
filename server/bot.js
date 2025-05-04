import tmi from 'tmi.js';
import { getMessageConfig } from '../config.js';
import player from 'play-sound';

let client = null;
const knownUsers = new Set();
const play = player({});

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

export const welcomeStats = {
  newPostersCount: 0,
  firstTodayCount: 0,
  firstViewersCount: 0,
};

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

    if (tags['first-msg'] && messageConfig.welcomeNewPosters) {
      const msg = pickRandomNonRepeating(
        messageConfig.welcomeMessagesNewPosters,
        'newPosters'
      ).replace('{user}', username);
      client.say(channel, msg);
      playWelcomeSound();
      welcomeStats.newPostersCount++;
      knownUsers.add(username);
      return;
    }

    if (!knownUsers.has(username) && messageConfig.welcomeFirstTimeToday) {
      const msg = pickRandomNonRepeating(
        messageConfig.welcomeMessagesFirstToday,
        'firstToday'
      ).replace('{user}', username);
      client.say(channel, msg);
      playWelcomeSound();
      welcomeStats.firstTodayCount++;
      knownUsers.add(username);
      return;
    }

    const isFirstTimeViewer =
      messageConfig.welcomeFirstTimeViewers &&
      !tags['mod'] &&
      !tags['subscriber'] &&
      !tags['vip'] &&
      tags['badges'] === null &&
      !knownUsers.has(username);

    if (isFirstTimeViewer) {
      const msg = pickRandomNonRepeating(
        messageConfig.welcomeMessagesFirstViewer,
        'firstViewers'
      ).replace('{user}', username);
      client.say(channel, msg);
      playWelcomeSound();
      welcomeStats.firstViewersCount++;
      knownUsers.add(username);
    }
  });

  console.log('✅ Twitch bot started with bot detection and welcome tracking!');
  return client;
}
