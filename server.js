const { startExpressServer } = require('./server/express');

const PORT = 3000;

startExpressServer(PORT).catch((err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    console.error('❌ Failed to start server:', err);
  }
});
