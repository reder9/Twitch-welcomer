const Store = require('electron-store').default;

const store = new Store({
  defaults: {
    twitch: {
      username: '',
      password: '',
      channels: [],
    },
    additionalConfig: {
      welcomeNewPosters: true,
      welcomeFirstTimeToday: false,
      welcomeFirstTimeViewers: false,
      welcomeMessagesFirstTime: [
        "🎉 WOOHOO!! 🎉 Everyone welcome @{user} to the chat! 🚀",
        "🔥 YO @{user} just dropped into the chat! Show them some love!!",
        "🎊 HYPE ALERT!! 🎊 Welcome @{user}!",
        "🚀 @{user} has entered the chat!! TIME TO GET WILD!!",
        "🥳 @{user} is here for the FIRST TIME! Big vibes!!",
      ],
      welcomeMessagesFirstToday: [
        "👋 Welcome back @{user}! So glad to have you hanging with us today!",
        "🌟 Hey @{user}! Thanks for joining us today! You rock!",
        "💬 First chat today from @{user}! Everyone say hi! 👋",
      ],
      messages: [
        'Welcome to the stream, {user}!',
        'Thanks for joining, {user} — hope you enjoy the stream!',
      ],
    },
  },
});

function saveTwitchConfig({ username, password, channel }) {
  store.set('twitch.username', username);
  store.set('twitch.password', password);
  store.set('twitch.channels', [channel]);
}

function getTwitchConfig() {
  return store.get('twitch');
}

function saveAdditionalConfig({ welcomeNewPosters, welcomeFirstTimeToday, welcomeFirstTimeViewers, messages }) {
  store.set('additionalConfig.welcomeNewPosters', welcomeNewPosters);
  store.set('additionalConfig.welcomeFirstTimeToday', welcomeFirstTimeToday);
  store.set('additionalConfig.welcomeFirstTimeViewers', welcomeFirstTimeViewers);
  store.set('additionalConfig.messages', messages);
}

function getAdditionalConfig() {
  return store.get('additionalConfig');
}

module.exports = {
  saveTwitchConfig,
  getTwitchConfig,
  saveAdditionalConfig,
  getAdditionalConfig,
};
