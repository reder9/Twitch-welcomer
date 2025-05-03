import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { startServer } from './server.js';
import { getTwitchConfig, getAdditionalConfig } from './config.js';

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
    const additionalConfig = getAdditionalConfig();

    console.log('Loaded Twitch config:', twitchConfig);
    console.log('Loaded additional config:', additionalConfig);

    const hasValidAuth = twitchConfig.username && twitchConfig.password;
    const hasWelcomeMessages =
      Array.isArray(additionalConfig.messages) && additionalConfig.messages.length > 0;

    let page;
    if (!hasValidAuth) {
      page = 'auth-config.html';
    } else if (!hasWelcomeMessages) {
      page = 'message-config.html';
    } else {
      page = 'home.html';
    }

    console.log(`Page to load: ${page}`);

    // Determine the correct icon path by platform
    let iconPath;
    if (process.platform === 'win32') {
      iconPath = path.join(__dirname, 'build/icons/win/icon.ico');
    } else if (process.platform === 'darwin') {
       const iconPath = path.join(process.resourcesPath, 'assets', '256x256.png');
      app.dock.setIcon(iconPath);
      console.log(`Set macOS dock icon: ${iconPath}`);
    } else {
      iconPath = path.join(__dirname, 'build/icons/png/256x256.png');
    }

    mainWindow = new BrowserWindow({
      width: 900,
      height: 700,
      icon: iconPath,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      show: false,
    });

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

app.whenReady().then(() => {
  console.log('App is ready');
  createWindow();
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
