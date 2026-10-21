import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import Svg, { Path, Rect, Circle, G, Line } from 'react-native-svg';

const RECOVER_LOGO = require('../../assets/recover.jpg');
const WINGED_LOGO = require('../../assets/recover-logo-winged.png');
const WINGED_LOGO_BLACK = require('../../assets/recover-logo-winged-black.png');
const WORDMARK_LOGO = require('../../assets/recover-wordmark.png');

type P = { size?: number; color?: string; style?: StyleProp<ImageStyle> };

export const RecoverWingedLogo = ({ size = 72, color, style }: P) => {
  const isBlack = color === 'black' || color === '#000000' || color === '#000';
  return (
    <Image
      source={isBlack ? WINGED_LOGO_BLACK : WINGED_LOGO}
      style={[
        { width: size, height: size * (92 / 120) },
        color && !isBlack && color !== 'white' && color !== '#FFFFFF' && color !== '#fff'
          ? { tintColor: color }
          : null,
        style,
      ]}
      resizeMode="contain"
    />
  );
};

export const RecoverWordmark = ({ width = 230, style }: { width?: number; style?: StyleProp<ImageStyle> }) => (
  <Image
    source={WORDMARK_LOGO}
    style={[{ width, height: width * (41 / 285) }, style]}
    resizeMode="contain"
  />
);

export const GoogleG = ({ size = 24 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <Path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <Path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <Path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </Svg>
);

/** Official Recover App Brand Logo (coin on solid black background, no text) */
export const BrandLogo = ({ size = 48, style }: P) => (
  <Image
    source={RECOVER_LOGO}
    style={[
      {
        width: size,
        height: size,
        backgroundColor: '#000000',
        borderRadius: size > 20 ? 6 : 2,
      },
      style,
    ]}
    resizeMode="contain"
  />
);

export const Chevrons = ({ size = 110, color = '#D5D5D8' }: P) => (
  <Svg width={size} height={size * 0.56} viewBox="0 0 110 62">
    {[0, 36, 72].map((x) => (
      <G key={x}>
        <Path fill={color} d={`M${x + 20} 0h18L${x + 14} 26H${x - 4}z`} />
        <Path fill={color} d={`M${x - 4} 36h18l${24} 26H${x + 20}z`} />
      </G>
    ))}
  </Svg>
);

export const ChipIcon = ({ size = 76, fill = '#D9D9DC', stroke = '#F2F2F4' }: P & { fill?: string; stroke?: string }) => (
  <Svg width={size} height={size * 0.76} viewBox="0 0 76 58">
    <Rect x="1" y="1" width="74" height="56" rx="8" fill={fill} stroke={stroke} strokeWidth="1.5" />
    <Path d="M14 22l6-6h24M62 36l-6 6H32M24 30h28M20 42l10-12M56 16l-10 14" stroke="#9A9AA0" strokeWidth="2" fill="none" />
  </Svg>
);

export const CoinPlus = ({ size = 24, color = '#fff', bg }: P & { bg?: string }) => {
  const k = bg ?? (color === '#000' ? '#fff' : '#000');
  return (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G fill={color}>
      <Rect x="2" y="3" width="13" height="4.4" rx="2.2" />
      <Rect x="2" y="8.8" width="13" height="4.4" rx="2.2" />
      <Rect x="2" y="14.6" width="10" height="4.4" rx="2.2" />
    </G>
    <Circle cx="17" cy="17" r="5.6" fill={k} />
    <Circle cx="17" cy="17" r="4.6" fill="none" stroke={color} strokeWidth="1.4" />
    <Line x1="17" y1="14.8" x2="17" y2="19.2" stroke={color} strokeWidth="1.5" />
    <Line x1="14.8" y1="17" x2="19.2" y2="17" stroke={color} strokeWidth="1.5" />
  </Svg>
  );
};

export const CardClock = ({ size = 28, color = '#fff' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 28 28">
    <Rect x="2" y="6" width="20" height="15" rx="3" fill={color} />
    <Rect x="2" y="10" width="20" height="2.5" fill="#1E1E21" />
    <Rect x="5" y="15.5" width="8" height="2" rx="1" fill="#1E1E21" />
    <Circle cx="21" cy="9" r="6" fill={color} stroke="#1E1E21" strokeWidth="2" />
    <Path d="M21 6v3.4l2 1.4" stroke="#1E1E21" strokeWidth="1.6" fill="none" strokeLinecap="round" />
  </Svg>
);

export const CoinGlobe = ({ size = 24, color = '#fff' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G fill={color}>
      <Rect x="2" y="2" width="12" height="4.2" rx="2.1" />
      <Rect x="2" y="7.6" width="12" height="4.2" rx="2.1" />
      <Rect x="2" y="13.2" width="9" height="4.2" rx="2.1" />
    </G>
    <Circle cx="17" cy="17" r="5.2" fill={color} stroke="#000" strokeWidth="1.2" />
    <Path d="M12 17h10M17 11.8c-2.4 3-2.4 7.4 0 10.4M17 11.8c2.4 3 2.4 7.4 0 10.4" stroke="#000" strokeWidth="1.1" fill="none" />
  </Svg>
);

export const WalletCard = ({ size = 24, color = '#fff' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="1.5" y="4" width="21" height="16" rx="3" fill={color} />
    <Path d="M1.5 9.5h6.5a4 4 0 0 0 8 0h6.5" stroke="#1C1C1E" strokeWidth="2" fill="none" />
  </Svg>
);

export const CardIcon = ({ size = 24, color = '#fff' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="1.5" y="4" width="21" height="16" rx="3" fill={color} />
    <Rect x="1.5" y="8" width="21" height="3" fill="#000" />
    <Rect x="4.5" y="14" width="8" height="2.4" rx="1.2" fill="#000" />
  </Svg>
);

export const ShieldLock = ({ size = 20, color = '#fff' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 2L4 5V11C4 16.5 7.4 21.6 12 23C16.6 21.6 20 16.5 20 11V5L12 2Z" fill={color} />
    <Rect x="9" y="11" width="6" height="5" rx="1.5" fill="#1C1C1F" />
    <Path d="M10 11V9.5C10 8.4 10.9 7.5 12 7.5C13.1 7.5 14 8.4 14 9.5V11" stroke="#1C1C1F" strokeWidth="1.5" />
  </Svg>
);
