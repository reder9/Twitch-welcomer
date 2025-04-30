const { createExpressApp } = require('./server/express');
const { startBot } = require('./server/bot');
const { getTwitchConfig } = require('./config');
const http = require('http');

const PORT_RANGE = { min: 3000, max: 4000 };

async function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    function tryPort(port) {
      if (port > PORT_RANGE.max) {
        return reject(new Error(`No available ports between ${PORT_RANGE.min}-${PORT_RANGE.max}`));
      }

      const testServer = http.createServer()
        .listen(port, () => {
          testServer.close(() => resolve(port));
        })
        .on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            tryPort(port + 1);
          } else {
            reject(err);
          }
        });
    }

    tryPort(startPort);
  });
}

async function startServer() {
  try {
    const port = await findAvailablePort(PORT_RANGE.min);

    const app = createExpressApp(); // Create app AFTER selecting the port
    const server = http.createServer(app);

    // Start the bot with saved config
    const config = { twitch: getTwitchConfig() };
    startBot(config);

    return new Promise((resolve, reject) => {
      server.listen(port, () => {
        console.log(`🚀 Server running at http://localhost:${port}`);
        resolve(port);
      }).on('error', (err) => {
        console.error('❌ Server failed to start:', err);
        reject(err);
      });
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    throw err;
  }
}

module.exports = { startServer };
