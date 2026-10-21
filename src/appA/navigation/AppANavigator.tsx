import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppOpenSplashScreen from '../../screens/AppOpenSplashScreen';
import InstallerIntroScreen from '../screens/InstallerIntroScreen';

export type AppAStackParamList = {
  AppOpen: { nextScreen?: string } | undefined;
  InstallerIntro: undefined;
};

const Stack = createNativeStackNavigator<AppAStackParamList>();

/**
 * App A (Recover) Navigation Stack
 * Strictly isolated from App B's routes (Dashboard, SignUp, etc.)
 * Opens with the exact same blue splash welcome screen with the logo in the middle for 5 seconds.
 */
export default function AppANavigator() {
  return (
    <Stack.Navigator
      initialRouteName="AppOpen"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
        animation: 'fade',
      }}
    >
      <Stack.Screen
        name="AppOpen"
        component={AppOpenSplashScreen}
        initialParams={{ nextScreen: 'InstallerIntro' }}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen name="InstallerIntro" component={InstallerIntroScreen} />
    </Stack.Navigator>
  );
}
