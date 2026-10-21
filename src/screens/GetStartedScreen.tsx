import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import PillButton from '../components/PillButton';
import FloatingCoinRing, { REF_TITLE_Y, REF_W } from '../components/FloatingCoinRing';
import { BRAND_NAME, colors, fonts } from '../theme';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'GetStarted'>;

export default function GetStartedScreen({ navigation }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scale = width / REF_W;
  const centerY = height * (REF_TITLE_Y / 1600);

  return (
    <View style={styles.root}>
      {/* Floating 3D Coin Ring */}
      <FloatingCoinRing width={width} centerY={centerY} scale={scale} />

      {/* Hero Title & Subtitle */}
      <View style={[styles.titleWrap, { top: centerY - 26 }]}>
        <Text style={styles.title}>
          <Text style={{ fontFamily: fonts.bold, letterSpacing: -1 }}>{BRAND_NAME}</Text>
          <Text style={{ fontFamily: fonts.regular, letterSpacing: -0.8 }}> Wallet</Text>
        </Text>
        <Text style={styles.subtitle}>Earn your screen time</Text>
      </View>

      {/* Bottom CTA Block */}
      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 16) + 34 }]}>
        <Text style={styles.body}>
          Earn credits through focus sessions,{'\n'}spend credits to unlock addictive apps.
        </Text>
        <PillButton
          title="Get started"
          onPress={() => navigation.navigate('SignUp')}
          height={46}
          fontSize={14.5}
        />
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
  body: {
    color: '#8A8A8E',
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 18,
  },
});
