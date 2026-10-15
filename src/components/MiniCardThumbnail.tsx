import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, G, Circle, Rect } from 'react-native-svg';
import { BrandLogo, Chevrons, ChipIcon } from './Icons';
import { fonts } from '../theme';
import { useApp } from '../context/AppContext';
import { getCardDesign } from '../data/cardDesigns';

interface MiniCardThumbnailProps {
  variant?: 'user' | 'gold' | 'silver' | 'bronze' | 'dark';
  cardholderName?: string;
  credits?: number;
}

/** Miniature circuit lines matching FocusCard */
function MiniCircuit() {
  const stroke = 'rgba(0,0,0,0.45)';
  const hi = 'rgba(255,255,255,0.18)';
  return (
    <Svg width="100%" height="100%" viewBox="0 0 48 30" style={StyleSheet.absoluteFill}>
      <Path d="M0 8 H22 L26 5 H48" stroke={stroke} strokeWidth={0.8} fill="none" />
      <Path d="M0 8 H22 L26 5 H48" stroke={hi} strokeWidth={0.4} fill="none" transform="translate(0,0.4)" />
      <Path d="M0 20 H22 L26 23 H48" stroke={stroke} strokeWidth={0.8} fill="none" />
      <Path d="M0 20 H22 L26 23 H48" stroke={hi} strokeWidth={0.4} fill="none" transform="translate(0,0.4)" />
      <Path d="M26 10 H48" stroke={hi} strokeWidth={0.3} fill="none" />
      <Path d="M26 19 H48" stroke={hi} strokeWidth={0.3} fill="none" />
      <Circle cx={26} cy={10} r={0.6} fill="rgba(255,255,255,0.5)" />
      <Circle cx={44} cy={10} r={0.6} fill="rgba(255,255,255,0.5)" />
      <Circle cx={26} cy={19} r={0.6} fill="rgba(255,255,255,0.5)" />
      <Circle cx={44} cy={19} r={0.6} fill="rgba(255,255,255,0.5)" />
    </Svg>
  );
}

export default function MiniCardThumbnail({ variant = 'user', cardholderName, credits }: MiniCardThumbnailProps) {
  const { activeCardId } = useApp();
  const activeDesign = getCardDesign(activeCardId);

  let colors: [string, string, ...string[]] = activeDesign.palette.gradient;
  let chevColor = activeDesign.palette.chevronColor;
  let textColor = activeDesign.palette.textColor;

  if (variant === 'gold') {
    colors = ['#D4AF37', '#996515', '#5C4010'];
    chevColor = '#FFE082';
    textColor = '#FFFFFF';
  } else if (variant === 'silver') {
    colors = ['#A8A8A8', '#6E6E6E', '#3D3D3D'];
    chevColor = '#E0E0E0';
    textColor = '#FFFFFF';
  } else if (variant === 'bronze') {
    colors = ['#CD7F32', '#8B4513', '#4A2508'];
    chevColor = '#FFCC80';
    textColor = '#FFFFFF';
  } else if (variant === 'dark') {
    colors = ['#38383B', '#222225', '#141416'];
    chevColor = '#D8D8DB';
    textColor = '#FFFFFF';
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Exact Circuit Lines */}
        <MiniCircuit />

        {/* Brand Text on Top Left (matching FocusCard) */}
        <View style={styles.logoWrap}>
          <Text style={styles.cardLogoMini}>recover</Text>
        </View>

        {/* Chevrons in the center (matching FocusCard) */}
        <View style={styles.chevWrap}>
          <Chevrons size={13} color="#D8D8DB" />
        </View>

        {/* EMV Chip on the right (matching FocusCard) */}
        <View style={styles.chipWrap}>
          <ChipIcon size={9} />
        </View>

        {/* Bottom Card Label */}
        <View style={styles.bottomRow}>
          <Text style={styles.labelText} numberOfLines={1}>
            {cardholderName ? cardholderName.slice(0, 5).toUpperCase() : 'FOCUS'}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 30,
    borderRadius: 5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1.5 },
    marginRight: 10,
    borderWidth: 0.6,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  card: {
    flex: 1,
    position: 'relative',
    borderRadius: 5,
    overflow: 'hidden',
  },
  logoWrap: {
    position: 'absolute',
    left: 3.5,
    top: 3,
  },
  cardLogoMini: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 4,
    letterSpacing: -0.2,
  },
  chevWrap: {
    position: 'absolute',
    left: 20,
    top: 10,
    opacity: 0.85,
  },
  chipWrap: {
    position: 'absolute',
    right: 3,
    top: 11,
  },
  bottomRow: {
    position: 'absolute',
    left: 3.5,
    bottom: 2,
  },
  labelText: {
    color: '#F2F2F4',
    fontSize: 5,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
