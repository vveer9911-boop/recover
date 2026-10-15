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
import GetStartedScreen from './src/screens/GetStartedScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import PricingScreen from './src/screens/PricingScreen';
import TransactionsScreen, { Transaction } from './src/screens/TransactionsScreen';
import WithdrawScreen from './src/screens/WithdrawScreen';
import SpendLimitScreen from './src/screens/SpendLimitScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import CardCustomizationScreen from './src/screens/CardCustomizationScreen';
import { AppProvider } from './src/context/AppContext';

export type RootStackParamList = {
  GetStarted: undefined;
  SignUp: undefined;
  Dashboard: undefined;
  Pricing: undefined;
  Transactions: {
    userName?: string;
    credits?: number;
    transactions?: Transaction[];
  } | undefined;
  Withdraw: undefined;
  SpendLimit: undefined;
  Analytics: undefined;
  CardCustomization: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Web-only helper for screenshot comparison: ?screen=SignUp / Dashboard / Pricing
const webParam = typeof window !== 'undefined' && (window as any).location?.search
  ? new URLSearchParams((window as any).location.search).get('screen')
  : null;
const initialRoute = (webParam as keyof RootStackParamList) || 'GetStarted';

export default function App() {
  const [loaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold });
  if (!loaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' }}>
        <Image
          source={require('./assets/splash-coin.png')}
          style={{ width: 140, height: 160 }}
          resizeMode="contain"
        />
      </View>
    );
  }
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer theme={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: '#000' } }}>
          <StatusBar style="light" />
          <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }}>
            <Stack.Screen name="GetStarted" component={GetStartedScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ gestureEnabled: false }} />
            <Stack.Screen name="Pricing" component={PricingScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Transactions" component={TransactionsScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Withdraw" component={WithdrawScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="SpendLimit" component={SpendLimitScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="CardCustomization" component={CardCustomizationScreen} options={{ animation: 'slide_from_bottom' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
