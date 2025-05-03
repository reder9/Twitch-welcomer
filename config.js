// config.js (ESM version)
import Store from 'electron-store';

const store = new Store({
  defaults: {
    twitch: {
      username: '',
      password: '',
      channels: [],
    },
    messageConfig: {
      welcomeNewPosters: true,
      welcomeFirstTimeToday: false,
      welcomeFirstTimeViewers: false,

      welcomeMesssagesNewPosters: [
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

      welcomeMessagesFirstView: [
        "👀 @{user} is lurking for the first time — welcome to the stream!",
        "🆕 First-time viewer @{user} is watching! Let’s make it memorable!",
        "👋 @{user}, thanks for stopping by to watch for the first time!",
      ]
    },
  },
});

export function saveTwitchConfig({ username, password, channel }) {
  store.set('twitch.username', username);
  store.set('twitch.password', password);
  store.set('twitch.channels', [channel]);
}

export function getTwitchConfig() {
  return store.get('twitch');
}

export function saveMessageConfig(config = {}) {
  const {
    welcomeNewPosters,
    welcomeFirstTimeToday,
    welcomeFirstTimeViewers,
    welcomeMesssagesNewPosters,
    welcomeMessagesFirstToday,
    welcomeMessagesFirstView,
    messages,
  } = config;

  if (welcomeNewPosters !== undefined) {
    store.set('messageConfig.welcomeNewPosters', welcomeNewPosters);
  }

  if (welcomeFirstTimeToday !== undefined) {
    store.set('messageConfig.welcomeFirstTimeToday', welcomeFirstTimeToday);
  }

  if (welcomeFirstTimeViewers !== undefined) {
    store.set('messageConfig.welcomeFirstTimeViewers', welcomeFirstTimeViewers);
  }

  if (welcomeMesssagesNewPosters !== undefined) {
    store.set('messageConfig.welcomeMesssagesNewPosters', welcomeMesssagesNewPosters);
  }

  if (welcomeMessagesFirstToday !== undefined) {
    store.set('messageConfig.welcomeMessagesFirstToday', welcomeMessagesFirstToday);
  }

  if (welcomeMessagesFirstView !== undefined) {
    store.set('messageConfig.welcomeMessagesFirstView', welcomeMessagesFirstView);
  }
}

export function getMessageConfig() {
  return store.get('messageConfig');
}

// In config.js
export function saveWelcomeStats(stats = {}) {
  store.set('welcomeStats', stats);
}

export function getWelcomeStats() {
  return store.get('welcomeStats', {
    newPostersCount: 0,
    firstTodayCount: 0,
    firstViewersCount: 0
  });
}
