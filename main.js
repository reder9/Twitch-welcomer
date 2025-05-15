import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { startServer } from './server.js';
import { getTwitchConfig, getMessageConfig, isMessageConfigCustomized } from './config.js';
import { setupAutoStartOnBoot } from './server/autostart.js'; // ✅ Auto-launch integration

// Create equivalents for __filename and __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

async function createWindow() {
  console.log('Creating window...');

  try {
    const port = await startServer();
    console.log(`Server started on port ${port}`);

    const twitchConfig = getTwitchConfig();
    const messageConfig = getMessageConfig();

    console.log('Loaded Twitch config:', twitchConfig);
    console.log('Loaded message config:', messageConfig);

    const hasValidAuth = twitchConfig.username && twitchConfig.password;

    let page;
    if (!hasValidAuth) {
      page = 'auth-config.html';
    } else if (!isMessageConfigCustomized()) {
      page = 'message-config.html';
    } else {
      page = 'home.html';
    }

    console.log(`Page to load: ${page}`);

    // Determine the correct icon path by platform
    let iconPath = null;
    if (process.platform === 'win32') {
      iconPath = path.join(__dirname, 'build/icons/win/icon.ico');
    } else if (process.platform === 'darwin') {
      const macIconPath = path.join(__dirname, 'build/icons/png/256x256.png');
      if (fs.existsSync(macIconPath)) {
        app.dock.setIcon(macIconPath);
        console.log(`Set macOS dock icon: ${macIconPath}`);
      }
      // Not setting icon for BrowserWindow on macOS — not strictly necessary
    } else {
      iconPath = path.join(__dirname, 'build/icons/png/256x256.png');
    }

    const windowOptions = {
      width: 900,
      height: 700,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      show: false,
    };

    if (iconPath && fs.existsSync(iconPath)) {
      windowOptions.icon = iconPath;
    }

    mainWindow = new BrowserWindow(windowOptions);

    const fullURL = `http://localhost:${port}/${page}`;
    console.log(`Loading URL: ${fullURL}`);
    mainWindow.loadURL(fullURL);

    mainWindow.once('ready-to-show', () => {
      console.log('Window ready to show');
      mainWindow.show();
    });

    mainWindow.on('closed', () => {
      console.log('Main window closed');
      mainWindow = null;
    });

  } catch (err) {
    console.error('Failed to start application:', err);
    app.quit();
  }
}

console.log('App is initializing...');

app.whenReady().then(async () => {
  console.log('App is ready');

  // ✅ Auto-launch logic here
  await setupAutoStartOnBoot();

  await createWindow();
});

app.on('window-all-closed', () => {
  console.log('All windows closed');
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  console.log('App activated');
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
