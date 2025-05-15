import AutoLaunch from 'auto-launch';
import { loadAppConfig } from './storage.js';

const launchPath = process.execPath;

console.log(`🛠 Auto-launch configured with path: ${launchPath}`);

const appAutoLauncher = new AutoLaunch({
  name: 'ChatWave',
  path: launchPath,
});

export async function setupAutoStartOnBoot() {
  const config = loadAppConfig();
  console.log(`📝 Auto-start config: ${config.autoStart}`);

  if (config.autoStart) {
    try {
      const isEnabled = await appAutoLauncher.isEnabled();
      console.log(`🔍 Auto-launch already enabled? ${isEnabled}`);
      if (!isEnabled) {
        await appAutoLauncher.enable();
        console.log('✅ Auto-launch enabled on boot.');
      }
    } catch (err) {
      console.error('❌ Failed to enable auto-launch:', err);
    }
  } else {
    try {
      const isEnabled = await appAutoLauncher.isEnabled();
      console.log(`🔍 Auto-launch already enabled? ${isEnabled}`);
      if (isEnabled) {
        await appAutoLauncher.disable();
        console.log('🚫 Auto-launch disabled on boot.');
      }
    } catch (err) {
      console.error('❌ Failed to disable auto-launch:', err);
    }
  }
}
