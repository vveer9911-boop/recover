import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleG, RecoverWordmark } from '../components/Icons';
import LegalNoticeModal from '../components/LegalNoticeModal';
import { fonts } from '../theme';
import { FirebaseAuthService } from '../services/firebaseAuthService';
import ThinkingOrbsModal from '../components/ThinkingOrbsModal';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export const SKY_BLUE = '#028BFF';

/**
 * App B Sign Up / Auth Screen
 * Features the signature sky-blue background matching the splash screen with centered RECOVER wordmark
 * and a sleek rounded dark card housing Google, Email, and Log in options.
 */
export default function SignUpScreen({ navigation }: Props) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | 'notices' | null>(null);

  const [orbsVisible, setOrbsVisible] = useState(false);
  const loading = orbsVisible;
  const [orbsState, setOrbsState] = useState<'loading' | 'success'>('loading');
  const [orbsTitle, setOrbsTitle] = useState('Creating your account...');
  const [orbsSubtitle, setOrbsSubtitle] = useState('Setting up your focus wallet & credit balance.');

  const handleSignUp = async () => {
    setOrbsTitle('Creating your account...');
    setOrbsSubtitle('Setting up your focus wallet & credit balance.');
    setOrbsState('loading');
    setOrbsVisible(true);

    await AsyncStorage.setItem('@recover_user_authenticated', 'true').catch(() => {});
    await AsyncStorage.setItem('@recover_onboarding_completed', 'true').catch(() => {});

    setTimeout(() => {
      setOrbsState('success');
      setOrbsTitle('Account created!');
      setOrbsSubtitle('15 welcome credits have been deposited in your wallet.');

      setTimeout(() => {
        setOrbsVisible(false);
        navigation.navigate('Dashboard');
      }, 1200);
    }, 1500);
  };

  const handleGoogleSignUp = async () => {
    setOrbsTitle('We are checking your details with Google...');
    setOrbsSubtitle('Connecting with Google and preparing your wallet.');
    setOrbsState('loading');
    setOrbsVisible(true);

    await AsyncStorage.setItem('@recover_user_authenticated', 'true').catch(() => {});
    await AsyncStorage.setItem('@recover_onboarding_completed', 'true').catch(() => {});

    setTimeout(() => {
      setOrbsState('success');
      setOrbsTitle('Welcome to Recover!');
      setOrbsSubtitle('15 welcome credits deposited into your wallet.');

      setTimeout(() => {
        setOrbsVisible(false);
        navigation.navigate('Dashboard');
      }, 1200);
    }, 1500);
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const isSmall = height < 700;

  return (
    <View style={styles.root}>
      {/* Upper Sky Blue Area with generous, even space above wordmark */}
      <View style={[styles.topBlueArea, { paddingTop: Math.max(insets.top, 24) + (isSmall ? 20 : 36) }]}>
        <View style={styles.wordmarkContainer}>
          <RecoverWordmark width={228} />
        </View>
      </View>

      {/* Bottom Dark Card */}
      <View
        style={[
          styles.bottomCard,
          {
            paddingBottom: Math.max(insets.bottom, 16) + (isSmall ? 10 : 18),
          },
        ]}
      >
        {/* Continue with Google */}
        <Pressable
          style={({ pressed }) => [
            styles.btnFilled,
            (pressed || loading) && styles.btnPressed,
          ]}
          onPress={handleGoogleSignUp}
          disabled={loading}
        >
          <View style={styles.btnIcon}>
            <GoogleG size={22} />
          </View>
          <Text style={styles.btnText}>
            {loading ? 'Connecting with Google...' : 'Continue with Google'}
          </Text>
        </Pressable>

        {/* Sign up with email */}
        <Pressable
          style={({ pressed }) => [styles.btnFilled, styles.btnSpacing, pressed && styles.btnPressed]}
          onPress={handleSignUp}
        >
          <View style={styles.btnIcon}>
            <Feather name="mail" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.btnText}>Sign up with email</Text>
        </Pressable>

        {/* Log in */}
        <Pressable
          style={({ pressed }) => [styles.btnOutlined, styles.btnSpacing, pressed && styles.btnPressed]}
          onPress={handleLogin}
        >
          <Text style={styles.btnText}>Log in</Text>
        </Pressable>

        {/* Legal Disclaimer */}
        <Text style={styles.legal}>
          By signing up with Google, you agree to our{'\n'}
          <Text
            style={styles.legalLink}
            onPress={() => setLegalModalType('terms')}
          >
            Terms of Service
          </Text>
          {' '}and consent to our{' '}
          <Text
            style={styles.legalLink}
            onPress={() => setLegalModalType('privacy')}
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </View>

      {/* Legal Notice Modal */}
      <LegalNoticeModal
        visible={legalModalType !== null}
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

      {/* Thinking Orbs Account Creation Overlay */}
      <ThinkingOrbsModal
        visible={orbsVisible}
        state={orbsState}
        title={orbsTitle}
        subtitle={orbsSubtitle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SKY_BLUE,
  },
  topBlueArea: {
    flex: 1,
    backgroundColor: SKY_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  wordmarkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomCard: {
    backgroundColor: '#0C0C0E',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderWidth: 1,
    borderColor: '#1D1D22',
    paddingHorizontal: 22,
    paddingTop: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 16,
  },
  btnFilled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#262629',
    height: 52,
    borderRadius: 999,
    paddingHorizontal: 20,
  },
  btnOutlined: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F0F12',
    height: 52,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#383840',
    paddingHorizontal: 20,
  },
  btnSpacing: {
    marginTop: 11,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  btnIcon: {
    marginRight: 10,
  },
  btnText: {
    color: '#FFFFFF',
    fontFamily: fonts.medium,
    fontSize: 15.5,
    letterSpacing: 0.1,
  },
  legal: {
    color: '#A1A1A6',
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 22,
    paddingHorizontal: 12,
  },
  legalLink: {
    color: '#FFFFFF',
    fontFamily: fonts.medium,
    textDecorationLine: 'underline',
  },
});
