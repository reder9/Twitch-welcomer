const { app, BrowserWindow } = require('electron');
const path = require('path');
const { startServer } = require('./server');
const { getTwitchConfig, getAdditionalConfig } = require('./config');

let mainWindow;

async function createWindow() {
  try {
    const port = await startServer();

    const twitchConfig = getTwitchConfig();
    const additionalConfig = getAdditionalConfig();

    const hasValidAuth = twitchConfig.username && twitchConfig.password;
    const hasWelcomeMessages =
      Array.isArray(additionalConfig.messages) && additionalConfig.messages.length > 0;

    let page;

    if (!hasValidAuth) {
      page = 'index.html'; // Auth setup
    } else if (!hasWelcomeMessages) {
      page = 'config-extra.html'; // Welcome message config
    } else {
      page = 'landing.html'; // All set
    }

    mainWindow = new BrowserWindow({
      width: 900,
      height: 700,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      show: false
    });

    mainWindow.loadURL(`http://localhost:${port}/${page}`);

    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

  } catch (err) {
    console.error('Failed to start application:', err);
    app.quit();
  }
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
