require('dotenv').config();

module.exports = {
  twitch: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_OAUTH,
    channels: [process.env.TWITCH_CHANNEL]
  }
};

['TWITCH_USERNAME', 'TWITCH_OAUTH', 'TWITCH_CHANNEL'].forEach(key => {
  if (!process.env[key]) {
    console.error(`❌ Missing required ENV var: ${key}`);
    process.exit(1);
  }
});
