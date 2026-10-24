import React from 'react';
// Recover App Entry
import { View, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import AppOpenSplashScreen from './src/screens/AppOpenSplashScreen';
import HowItWorksScreen from './src/screens/HowItWorksScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import LoginScreen from './src/screens/LoginScreen';
import PermissionsScreen from './src/screens/PermissionsScreen';
import RecoverProScreen from './src/screens/RecoverProScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import PricingScreen from './src/screens/PricingScreen';
import TransactionsScreen, { Transaction } from './src/screens/TransactionsScreen';
import WithdrawScreen from './src/screens/WithdrawScreen';
import FocusSessionSetupScreen from './src/screens/FocusSessionSetupScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import CardCustomizationScreen from './src/screens/CardCustomizationScreen';
import GetStartedScreen from './src/screens/GetStartedScreen';
import { AppProvider } from './src/context/AppContext';
import ErrorBoundary from './src/components/ErrorBoundary';

export type RootStackParamList = {
  AppOpen: undefined;
  HowItWorks: undefined;
  SignUp: undefined;
  Login: undefined;
  RecoverPro: { fromOnboarding?: boolean } | undefined;
  Permissions: undefined;
  Dashboard: undefined;
  Pricing: { fromOnboarding?: boolean } | undefined;
  Transactions: {
    userName?: string;
    credits?: number;
    transactions?: Transaction[];
  } | undefined;
  Withdraw: undefined;
  FocusSessionSetup: undefined;
  Analytics: undefined;
  CardCustomization: undefined;
  GetStarted: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Web-only helper for screenshot comparison: ?screen=SignUp / Dashboard / Pricing
const webParam = typeof window !== 'undefined' && (window as any).location?.search
  ? new URLSearchParams((window as any).location.search).get('screen')
  : null;
const initialRoute = (webParam as keyof RootStackParamList) || 'AppOpen';

export default function App() {
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
          source={require('./assets/recover-logo-winged.png')}
          style={{ width: 90, height: 70 }}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppProvider>
          <NavigationContainer theme={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: '#000' } }}>
            <StatusBar style="light" />
            <Stack.Navigator
              initialRouteName={initialRoute}
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#000' },
              }}
            >
              <Stack.Screen
                name="AppOpen"
                component={AppOpenSplashScreen}
                options={{ animation: 'fade' }}
              />
              <Stack.Screen
                name="HowItWorks"
                component={HowItWorksScreen}
                options={{ animation: 'fade' }}
              />
              <Stack.Screen
                name="SignUp"
                component={SignUpScreen}
                options={{ animation: 'slide_from_right' }}
              />
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ animation: 'slide_from_right' }}
              />
              <Stack.Screen
                name="RecoverPro"
                component={RecoverProScreen}
                options={{ animation: 'slide_from_right' }}
              />
              <Stack.Screen
                name="Permissions"
                component={PermissionsScreen}
                options={{ animation: 'slide_from_right' }}
              />
              <Stack.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ gestureEnabled: false, animation: 'fade' }}
              />
              <Stack.Screen
                name="Pricing"
                component={PricingScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="Transactions"
                component={TransactionsScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="Withdraw"
                component={WithdrawScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="FocusSessionSetup"
                component={FocusSessionSetupScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="Analytics"
                component={AnalyticsScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="CardCustomization"
                component={CardCustomizationScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="GetStarted"
                component={GetStartedScreen}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </AppProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
