const express = require('express');
const fs = require('fs');
const path = require('path');
const { startBot } = require('./bot');

const configPath = path.join(__dirname, '../config/config.json');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.post('/save-config', (req, res) => {
  fs.writeFileSync(configPath, JSON.stringify(req.body, null, 2));
  startBot(req.body);
  res.send('✅ Configuration saved and bot restarted!');
});

function getSavedConfig() {
  if (!fs.existsSync(configPath)) return null;
  const config = JSON.parse(fs.readFileSync(configPath));
  return config;
}

function startExpressServer(port = 3000) {
  return new Promise((resolve, reject) => {
    app.listen(port, () => {
      console.log(`🌐 Express running on http://localhost:${port}`);
      const config = getSavedConfig();
      if (config && config.username && config.password && config.channels.length) {
        startBot(config);
      }
      resolve();
    }).on('error', (err) => {
      reject(err);
    });
  });
}

module.exports = { startExpressServer };
