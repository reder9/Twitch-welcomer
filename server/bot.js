const tmi = require('tmi.js');

let client = null;
const knownUsers = new Set();

// Common bots to ignore (case insensitive)
const BOT_LIST = [
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

// Enhanced welcome messages
const welcomeMessagesFirstTime = [
  "🎉 WOOHOO!! 🎉 Everyone welcome @{user} to the chat! 🚀",
  "🔥 YO @{user} just dropped into the chat! Show them some love!!",
  "🎊 HYPE ALERT!! 🎊 Welcome @{user}!",
  "🚀 @{user} has entered the chat!! TIME TO GET WILD!!",
  "🥳 @{user} is here for the FIRST TIME! Big vibes!!",
];

const welcomeMessagesFirstToday = [
  "👋 Welcome back @{user}! So glad to have you hanging with us today!",
  "🌟 Hey @{user}! Thanks for joining us today! You rock!",
  "💬 First chat today from @{user}! Everyone say hi! 👋",
];

// Check if user is a bot
function isBotUser(username) {
  if (!username) return true; // Skip if no username
  
  const lowerUsername = username.toLowerCase();
  
  // Check against known bot list
  if (BOT_LIST.some(bot => lowerUsername.includes(bot))) {
    return true;
  }
  
  // Check for bot-like patterns in username
  const botPatterns = [
    /bot$/i,       // Ends with "bot"
    /\[bot\]/i,     // Contains "[bot]"
    /\(bot\)/i,     // Contains "(bot)"
    /_bot_/i,       // Contains "_bot_"
    /command/i,     // Common in command bots
    /helper/i       // Common in helper bots
  ];
  
  return botPatterns.some(pattern => pattern.test(username));
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function startBot(config) {
  if (client) {
    client.disconnect();
  }

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
    if (self) return; // Ignore messages from the bot itself
    
    const username = tags['display-name'] || tags['username'];
    
    // Skip if user is a bot
    if (isBotUser(username)) {
      return;
    }

    if (tags['first-msg']) {
      const msg = pickRandom(welcomeMessagesFirstTime).replace('{user}', username);
      client.say(channel, msg);
      knownUsers.add(username); // Add to known users after first message
    } else if (!knownUsers.has(username)) {
      knownUsers.add(username);
      const msg = pickRandom(welcomeMessagesFirstToday).replace('{user}', username);
      client.say(channel, msg);
    }
  });

  console.log('✅ Twitch bot started with bot detection!');
  return client;
}

module.exports = { startBot, BOT_LIST }; // Export BOT_LIST for external modification