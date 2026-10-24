import { NativeModules, Platform } from 'react-native';

const { RecoverBlockerModule } = NativeModules;

export interface RecoverBlockerInterface {
  isAvailable: boolean;
  startFocusSession: (minutes: number, blockedApps: string[]) => Promise<boolean>;
  stopFocusSession: () => Promise<boolean>;
  updateBlockedApps: (blockedApps: string[]) => Promise<boolean>;
  isAccessibilityEnabled: () => Promise<boolean>;
  openAccessibilitySettings: () => Promise<boolean>;
  isOverlayEnabled: () => Promise<boolean>;
  openOverlaySettings: () => Promise<boolean>;
}

// Map common display names to Android package identifiers
export const APP_PACKAGE_MAP: Record<string, string> = {
  YouTube: 'com.google.android.youtube',
  Instagram: 'com.instagram.android',
  TikTok: 'com.zhiliaoapp.musically',
  Snapchat: 'com.snapchat.android',
  Twitter: 'com.twitter.android',
  X: 'com.twitter.android',
  Reddit: 'com.reddit.frontpage',
  Facebook: 'com.facebook.katana',
  Netflix: 'com.netflix.mediaclient',
  Twitch: 'tv.twitch.android.app',
  WhatsApp: 'com.whatsapp',
  FaceTime: 'com.apple.facetime',
  Threads: 'com.instagram.barcelona',
  LinkedIn: 'com.linkedin.android',
  Chrome: 'com.android.chrome',
};

export const resolvePackageName = (appNameOrPackage: string): string => {
  return APP_PACKAGE_MAP[appNameOrPackage] || appNameOrPackage;
};

export const RecoverBlocker: RecoverBlockerInterface = {
  isAvailable: Platform.OS === 'android' && Boolean(RecoverBlockerModule),

  async startFocusSession(minutes: number, blockedApps: string[]): Promise<boolean> {
    if (Platform.OS !== 'android' || !RecoverBlockerModule) {
      return true;
    }
    try {
      const packageList = blockedApps.map(resolvePackageName);
      return await RecoverBlockerModule.startFocus(minutes, packageList);
    } catch (err) {
      console.warn('[RecoverBlocker] Failed to start native focus:', err);
      return false;
    }
  },

  async stopFocusSession(): Promise<boolean> {
    if (Platform.OS !== 'android' || !RecoverBlockerModule) {
      return true;
    }
    try {
      return await RecoverBlockerModule.stopFocus();
    } catch (err) {
      console.warn('[RecoverBlocker] Failed to stop native focus:', err);
      return false;
    }
  },

  async updateBlockedApps(blockedApps: string[]): Promise<boolean> {
    if (Platform.OS !== 'android' || !RecoverBlockerModule) {
      return true;
    }
    try {
      const packageList = blockedApps.map(resolvePackageName);
      return await RecoverBlockerModule.setBlockedApps(packageList);
    } catch (err) {
      console.warn('[RecoverBlocker] Failed to update blocked apps:', err);
      return false;
    }
  },

  async isAccessibilityEnabled(): Promise<boolean> {
    if (Platform.OS !== 'android' || !RecoverBlockerModule) {
      return false;
    }
    try {
      return await RecoverBlockerModule.isAccessibilityEnabled();
    } catch {
      return false;
    }
  },

  async openAccessibilitySettings(): Promise<boolean> {
    if (Platform.OS !== 'android' || !RecoverBlockerModule) {
      return false;
    }
    try {
      return await RecoverBlockerModule.openAccessibilitySettings();
    } catch {
      return false;
    }
  },

  async isOverlayEnabled(): Promise<boolean> {
    if (Platform.OS !== 'android' || !RecoverBlockerModule) {
      return false;
    }
    try {
      return await RecoverBlockerModule.isOverlayEnabled();
    } catch {
      return false;
    }
  },

  async openOverlaySettings(): Promise<boolean> {
    if (Platform.OS !== 'android' || !RecoverBlockerModule) {
      return false;
    }
    try {
      return await RecoverBlockerModule.openOverlaySettings();
    } catch {
      return false;
    }
  },
};
