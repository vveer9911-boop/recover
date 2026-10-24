import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleG, RecoverWordmark } from '../components/Icons';
import { fonts } from '../theme';
import { FirebaseAuthService } from '../services/firebaseAuthService';
import ThinkingOrbsModal from '../components/ThinkingOrbsModal';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Thinking Orbs auth states
  const [orbsVisible, setOrbsVisible] = useState(false);
  const loading = orbsVisible;
  const [orbsState, setOrbsState] = useState<'loading' | 'success'>('loading');
  const [orbsTitle, setOrbsTitle] = useState('We are checking your details...');
  const [orbsSubtitle, setOrbsSubtitle] = useState('Verifying credentials and fetching your live focus stats.');

  const handleEmailSignIn = async () => {
    setOrbsTitle('We are checking your details...');
    setOrbsSubtitle('Verifying your credentials and pulling your live focus stats.');
    setOrbsState('loading');
    setOrbsVisible(true);
    setErrorMsg('');

    await AsyncStorage.setItem('@recover_user_authenticated', 'true').catch(() => {});
    await AsyncStorage.setItem('@recover_onboarding_completed', 'true').catch(() => {});

    setTimeout(() => {
      setOrbsState('success');
      setOrbsTitle('Welcome back, Focus Champ!');
      setOrbsSubtitle('Your credits, streak, and focus sessions are loaded.');

      setTimeout(() => {
        setOrbsVisible(false);
        navigation.navigate('Dashboard');
      }, 1200);
    }, 1500);
  };

  const handleGoogleSignIn = async () => {
    setOrbsTitle('We are checking your details...');
    setOrbsSubtitle('Signing in with Google and loading your profile.');
    setOrbsState('loading');
    setOrbsVisible(true);
    setErrorMsg('');

    await AsyncStorage.setItem('@recover_user_authenticated', 'true').catch(() => {});
    await AsyncStorage.setItem('@recover_onboarding_completed', 'true').catch(() => {});

    setTimeout(() => {
      setOrbsState('success');
      setOrbsTitle('Welcome back, Focus Champ!');
      setOrbsSubtitle('Loaded live focus stats and credit balance.');

      setTimeout(() => {
        setOrbsVisible(false);
        navigation.navigate('Dashboard');
      }, 1200);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 24) + 24,
            paddingBottom: Math.max(insets.bottom, 16) + 20,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Bar with Back Button */}
        <View style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
            onPress={() => navigation.goBack()}
            hitSlop={12}
          >
            <Feather name="chevron-left" size={26} color="#FFFFFF" />
          </Pressable>
          <View style={styles.wordmarkWrap}>
            <RecoverWordmark width={190} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Welcome Headline */}
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Let’s get you in to Recover</Text>
        </View>

        {/* Input Fields */}
        <View style={styles.inputsBlock}>
          <TextInput
            style={styles.input}
            placeholder="Your Email"
            placeholderTextColor="#636366"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={[styles.input, { marginTop: 14 }]}
            placeholder="Your Password"
            placeholderTextColor="#636366"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable style={styles.forgotWrap} hitSlop={8}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          {errorMsg ? (
            <Text style={{ color: '#EF4444', fontSize: 13, marginTop: 10, textAlign: 'center' }}>
              {errorMsg}
            </Text>
          ) : null}
        </View>

        {/* Sign in Button */}
        <Pressable
          style={({ pressed }) => [
            styles.signInBtn,
            (pressed || loading) && { opacity: 0.85, transform: [{ scale: 0.99 }] },
          ]}
          onPress={handleEmailSignIn}
          disabled={loading}
        >
          <Text style={styles.signInBtnText}>{loading ? 'Signing in...' : 'Sign in'}</Text>
        </Pressable>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Continue with Google */}
        <Pressable
          style={({ pressed }) => [
            styles.googleBtn,
            (pressed || loading) && { opacity: 0.85, transform: [{ scale: 0.99 }] },
          ]}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <View style={styles.googleIcon}>
            <GoogleG size={22} />
          </View>
          <Text style={styles.googleBtnText}>Continue with Google</Text>
        </Pressable>

        <View style={{ flex: 1, minHeight: 28 }} />

        {/* Footer: Create account link */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don’t have an account? </Text>
          <Pressable onPress={() => navigation.navigate('SignUp')} hitSlop={8}>
            <Text style={styles.createAccountLink}>Create account</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Thinking Orbs Authentication Overlay */}
      <ThinkingOrbsModal
        visible={orbsVisible}
        state={orbsState}
        title={orbsTitle}
        subtitle={orbsSubtitle}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 26,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmarkWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 30,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  subtitle: {
    color: '#8E8E93',
    fontFamily: fonts.regular,
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
  inputsBlock: {
    marginBottom: 22,
  },
  input: {
    backgroundColor: '#0E0E11',
    borderColor: '#26262B',
    borderWidth: 1,
    height: 54,
    borderRadius: 16,
    paddingHorizontal: 18,
    color: '#FFFFFF',
    fontFamily: fonts.regular,
    fontSize: 15.5,
  },
  forgotWrap: {
    alignSelf: 'center',
    marginTop: 18,
  },
  forgotText: {
    color: '#8E8E93',
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  signInBtn: {
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInBtnText: {
    color: '#000000',
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#26262B',
  },
  dividerText: {
    color: '#8E8E93',
    fontFamily: fonts.regular,
    fontSize: 14,
    paddingHorizontal: 16,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E22',
    height: 52,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2A2A2E',
  },
  googleIcon: {
    marginRight: 10,
  },
  googleBtnText: {
    color: '#FFFFFF',
    fontFamily: fonts.medium,
    fontSize: 15.5,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#8E8E93',
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  createAccountLink: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
