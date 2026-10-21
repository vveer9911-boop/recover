import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RecoverWingedLogo } from '../components/Icons';
import { auth } from '../config/firebase';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'AppOpen'>;

export const SKY_BLUE = '#028BFF';

/**
 * App B Initial Screen: Sky Blue App Open / Splash Screen
 * Features the signature white winged 'R' logo centered on the vivid sky-blue background.
 * Checks authentication status and smoothly routes returning users directly to Dashboard.
 */
export default function AppOpenSplashScreen({ navigation, route }: any) {
  const scale = useSharedValue(1.0);
  const nextScreen = (route?.params as any)?.nextScreen || 'HowItWorks';

  useEffect(() => {
    // Elegant breathing pulse while splash is displayed
    scale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1250 }),
        withTiming(1.0, { duration: 1250 })
      ),
      -1,
      true
    );

    const checkAuthAndRoute = async () => {
      try {
        const isAuth = await AsyncStorage.getItem('@recover_user_authenticated');
        if (isAuth === 'true' || auth.currentUser) {
          navigation.replace('Dashboard');
          return;
        }
      } catch {}
      navigation.replace(nextScreen as any);
    };

    const timer = setTimeout(checkAuthAndRoute, 2500);

    return () => clearTimeout(timer);
  }, [navigation, scale, nextScreen]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, animStyle]}>
        <RecoverWingedLogo size={92} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SKY_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
