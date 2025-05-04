import fs from 'fs';
import path from 'path';
import os from 'os';

const APP_NAME = 'ChatWave';

function getAppDataPath() {
  const homeDir = os.homedir();

  switch (process.platform) {
    case 'darwin': // macOS
      return path.join(homeDir, 'Library', 'Application Support', APP_NAME);
    case 'win32':
      return path.join(process.env.APPDATA || path.join(homeDir, 'AppData', 'Roaming'), APP_NAME);
    default: // Linux or others
      return path.join(homeDir, '.config', APP_NAME);
  }
}

const APP_DATA_DIR = getAppDataPath();
const STATS_FILE = path.join(APP_DATA_DIR, 'welcome-stats.json');

// Ensure the directory exists
fs.mkdirSync(APP_DATA_DIR, { recursive: true });

export function loadStats() {
  try {
    const data = fs.readFileSync(STATS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {
      newPostersCount: 0,
      firstTodayCount: 0,
      firstViewersCount: 0
    };
  }
}

export function saveStats(stats) {
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
}
