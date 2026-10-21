import React from 'react';
import { View, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import AppANavigator from './navigation/AppANavigator';

/**
 * App A — Recover Installer
 * Display name: Recover Installer
 * Internal component name: AppAInstaller
 *
 * Isolated application entry point for the standalone Recover Installer.
 * Houses its own isolated navigation stack and does not load App B's
 * state, authentication, or dashboard.
 */
export default function AppAInstaller() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!loaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#028BFF', alignItems: 'center', justifyContent: 'center' }}>
        <Image
          source={require('../../assets/recover-logo-winged.png')}
          style={{ width: 92, height: 72 }}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={{
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: '#000000',
          },
        }}
      >
        <StatusBar style="light" />
        <AppANavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
