import Store from 'electron-store';

const defaultMessageConfig = {
  welcomeNewPosters: true,
  welcomeFirstTimeToday: false,
  welcomeFirstTimeViewers: false,

  welcomeMessagesNewPosters: [
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

  welcomeMessagesFirstViewer: [
    "👀 @{user} is lurking for the first time — welcome to the stream!",
    "🆕 First-time viewer @{user} is watching! Let’s make it memorable!",
    "👋 @{user}, thanks for stopping by to watch for the first time!",
  ]
};

const store = new Store({
  defaults: {
    twitch: {
      username: '',
      password: '',
      channels: [],
    },
    messageConfig: defaultMessageConfig,
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
    welcomeMessagesNewPosters,
    welcomeMessagesFirstToday,
    welcomeMessagesFirstViewer,
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

  if (welcomeMessagesNewPosters !== undefined) {
    store.set('messageConfig.welcomeMessagesNewPosters', welcomeMessagesNewPosters);
  }

  if (welcomeMessagesFirstToday !== undefined) {
    store.set('messageConfig.welcomeMessagesFirstToday', welcomeMessagesFirstToday);
  }

  if (welcomeMessagesFirstViewer !== undefined) {
    store.set('messageConfig.welcomeMessagesFirstViewer', welcomeMessagesFirstViewer);
  }
}

export function getMessageConfig() {
  return store.get('messageConfig');
}

export function isMessageConfigCustomized() {
  const current = store.get('messageConfig') || {};
  const defaults = defaultMessageConfig;

  const booleanKeys = [
    'welcomeNewPosters',
    'welcomeFirstTimeToday',
    'welcomeFirstTimeViewers',
  ];
  for (const key of booleanKeys) {
    if (current[key] !== defaults[key]) {
      return true;
    }
  }

  const arrayKeys = [
    'welcomeMessagesNewPosters',
    'welcomeMessagesFirstToday',
    'welcomeMessagesFirstViewer',
  ];
  for (const key of arrayKeys) {
    const curArray = current[key] || [];
    const defArray = defaults[key] || [];
    if (
      curArray.length !== defArray.length ||
      !curArray.every((val, i) => val === defArray[i])
    ) {
      return true;
    }
  }

  return false;
}

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
