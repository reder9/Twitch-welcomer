const tmi = require('tmi.js');

let client = null;
const knownUsers = new Set();

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
    if (self) return;

    const username = tags['display-name'] || tags['username'];

    if (tags['first-msg']) {
      const msg = pickRandom(welcomeMessagesFirstTime).replace('{user}', username);
      client.say(channel, msg);
    } else if (!knownUsers.has(username)) {
      knownUsers.add(username);
      const msg = pickRandom(welcomeMessagesFirstToday).replace('{user}', username);
      client.say(channel, msg);
    }
  });

  console.log('✅ Twitch bot started!');
}

module.exports = { startBot };
