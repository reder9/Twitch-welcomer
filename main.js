const { app, BrowserWindow } = require('electron');
const path = require('path');
const { startServer } = require('./server');
const { getTwitchConfig } = require('./config');

let mainWindow;

async function createWindow() {
  try {
    const port = await startServer();

    const config = getTwitchConfig();
    const hasValidAuth = config.username && config.password;

    mainWindow = new BrowserWindow({
      width: 900,
      height: 700,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      show: false
    });

    const page = hasValidAuth ? 'config-extra.html' : 'index.html';
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
