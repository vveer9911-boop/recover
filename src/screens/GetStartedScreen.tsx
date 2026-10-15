import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import PillButton from '../components/PillButton';
import { BRAND_NAME, colors, fonts } from '../theme';
import type { RootStackParamList } from '../../App';

// Coin crops from 03-get-started.png (736x1600 reference). [file, x, y, w, h]
const COINS: [any, number, number, number, number][] = [
  [require('../../assets/coin1.png'), 268, 336, 150, 80],
  [require('../../assets/coin2.png'), 505, 365, 75, 155],
  [require('../../assets/coin3.png'), 570, 550, 135, 155],
  [require('../../assets/coin4.png'), 518, 755, 105, 140],
  [require('../../assets/coin5.png'), 308, 838, 160, 160],
  [require('../../assets/coin6.png'), 130, 782, 112, 138],
  [require('../../assets/coin7.png'), 30, 604, 128, 124],
  [require('../../assets/coin8.png'), 82, 390, 155, 155],
];
const REF_W = 736;
const REF_TITLE_Y = 628; // title center in reference

function Coin({ src, x, y, w, h, i, scale }: { src: any; x: number; y: number; w: number; h: number; i: number; scale: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(i * 250, withRepeat(withTiming(1, { duration: 2800 + i * 200, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: (t.value - 0.5) * 10 }, { rotate: `${(t.value - 0.5) * 6}deg` }],
  }));
  return (
    <Animated.View style={[{ position: 'absolute', left: x * scale, top: (y - REF_TITLE_Y) * scale, width: w * scale, height: h * scale }, style]}>
      <Image source={src} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
    </Animated.View>
  );
}

type Props = NativeStackScreenProps<RootStackParamList, 'GetStarted'>;

export default function GetStartedScreen({ navigation }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scale = width / REF_W;
  const centerY = height * (REF_TITLE_Y / 1600);

  return (
    <View style={styles.root}>
      <View style={{ position: 'absolute', top: centerY, left: 0, width }}>
        {COINS.map(([src, x, y, w, h], i) => (
          <Coin key={i} src={src} x={x} y={y} w={w} h={h} i={i} scale={scale} />
        ))}
      </View>
      <View style={[styles.titleWrap, { top: centerY - 26 }]}>
        <Text style={styles.title}>
          <Text style={{ fontFamily: fonts.bold, letterSpacing: -1 }}>{BRAND_NAME}</Text>
          <Text style={{ fontFamily: fonts.regular, letterSpacing: -0.8 }}> Wallet</Text>
        </Text>
        <Text style={styles.subtitle}>Earn your screen time</Text>
      </View>

      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 16) + 34 }]}>
        <Text style={styles.body}>Earn credits through focus sessions,{'\n'}spend credits to unlock addictive apps.</Text>
        <PillButton title="Get started" onPress={() => navigation.navigate('SignUp')} height={46} fontSize={14.5} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.black },
  titleWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  title: { color: colors.white, fontSize: 24, includeFontPadding: false },
  subtitle: { color: colors.gray2, fontSize: 14, fontFamily: fonts.regular, marginTop: 8 },
  bottom: { position: 'absolute', left: 15, right: 15, bottom: 0 },
  body: { color: '#8A8A8E', fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 19, textAlign: 'center', marginBottom: 18 },
});

