import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import PillButton from '../components/PillButton';
import { GoogleG } from '../components/Icons';
import { BRAND_NAME, colors, fonts } from '../theme';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

const HERO = require('../../assets/hero-photo.jpg');

export default function SignUpScreen({ navigation }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const go = () => navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
  // Hero photo (1024x1536) fills full width, anchored to top and centered
  const imgH = width * 1.5;

  return (
    <View style={styles.root}>
      <Image
        source={HERO}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: Math.max(imgH, height * 0.65),
        }}
        resizeMode="cover"
      />
      {/* Smooth gradient transition fading into solid black behind text */}
      <LinearGradient
        colors={[
          'rgba(0,0,0,0)',
          'rgba(0,0,0,0.18)',
          'rgba(0,0,0,0.65)',
          'rgba(0,0,0,0.95)',
          '#000000',
        ]}
        locations={[0, 0.35, 0.65, 0.88, 1]}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: height * 0.35,
          height: height * 0.28,
        }}
      />
      {/* Solid black from the fade point down to the bottom */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: height * 0.62,
          bottom: 0,
          backgroundColor: '#000000',
        }}
      />

      <Text style={[styles.brand, { marginTop: insets.top + 16 }]}>{BRAND_NAME.toUpperCase()}</Text>

      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 12) + 36 }]}>
        <Text style={styles.headline}>Your focus.{'\n'}Your rewards.</Text>
        <Text style={styles.sub}>Focus to earn credits. Spend them to unlock apps.</Text>

        <View style={{ height: 36 }} />
        <PillButton variant="dark" title="Continue with Google" icon={<GoogleG size={24} />} onPress={go} height={49} fontSize={15.5} style={styles.btn} />
        <View style={{ height: 9 }} />
        <PillButton variant="dark" title="Sign up with email" icon={<Feather name="mail" size={22} color="#fff" />} onPress={go} height={49} fontSize={15.5} style={styles.btn} />

        <Text style={styles.legal}>
          By continuing, you agree to {BRAND_NAME}'s <Text style={styles.legalBold}>Terms of Service</Text>
          {'\n'}and <Text style={styles.legalBold}>Privacy Policy</Text>.
        </Text>
        <Pressable onPress={go}>
          <Text style={styles.signin}>Already have an account? Sign in</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000', overflow: 'hidden' },
  brand: { color: colors.white, fontFamily: fonts.semibold, fontSize: 18, letterSpacing: 7.5, textAlign: 'center', paddingLeft: 7.5 },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 18, alignItems: 'center' },
  headline: { color: colors.white, fontFamily: fonts.bold, fontSize: 40, lineHeight: 41, letterSpacing: -1.6, textAlign: 'center' },
  sub: { color: '#D2D2D6', fontFamily: fonts.regular, fontSize: 14.5, marginTop: 12, textAlign: 'center' },
  btn: { alignSelf: 'stretch' },
  legal: { color: '#A1A1A6', fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, textAlign: 'center', marginTop: 32 },
  legalBold: { color: colors.white, fontFamily: fonts.semibold },
  signin: { color: colors.white, fontFamily: fonts.regular, fontSize: 14.5, textDecorationLine: 'underline', marginTop: 22 },
});

