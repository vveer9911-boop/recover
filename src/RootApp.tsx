import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import App from '../App';
import AppAInstaller from './appA/AppAInstaller';
import targetConfig from '../app_target.json';

/**
 * Root Application Entry with Dual-App Routing:
 * - App A: Recover Installer (isolated preview)
 * - App B: Recover Wallet (main application)
 *
 * Routing Sources:
 * 1. Deep Link URL (e.g. exp://.../--/installer or exp://.../--/recover)
 * 2. URL search parameters (?app=installer / ?app=recover)
 * 3. EXPO_PUBLIC_APP_TARGET environment variable
 * 4. app_target.json persistent configuration
 * 5. On-screen floating app switcher badge
 */
export default function RootApp() {
  const [activeApp, setActiveApp] = useState<'installer' | 'recover'>(() => {
    const webParam = typeof window !== 'undefined' && (window as any).location?.search
      ? new URLSearchParams((window as any).location.search).get('app')
      : null;
    const envTarget = process.env.EXPO_PUBLIC_APP_TARGET;
    const initial = (webParam || envTarget || targetConfig.target || 'recover').toLowerCase();
    return initial === 'installer' || initial === 'appa' ? 'installer' : 'recover';
  });

  const checkUrl = (url: string | null) => {
    if (!url) return;
    const lower = url.toLowerCase();
    if (lower.includes('installer') || lower.includes('app=installer') || lower.includes('appa')) {
      setActiveApp('installer');
    } else if (lower.includes('recover') || lower.includes('app=recover') || lower.includes('appb')) {
      setActiveApp('recover');
    }
  };

  useEffect(() => {
    Linking.getInitialURL().then(checkUrl).catch(() => {});

    const sub = Linking.addEventListener('url', ({ url }) => {
      checkUrl(url);
    });

    return () => sub.remove();
  }, []);

  return (
    <View style={styles.container}>
      {activeApp === 'installer' ? <AppAInstaller /> : <App />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#028BFF',
  },
});
