import React, { useEffect } from 'react';
import { Image, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';

export const COINS: [any, number, number, number, number][] = [
  [require('../../assets/coin1.png'), 268, 336, 150, 80],
  [require('../../assets/coin2.png'), 505, 365, 75, 155],
  [require('../../assets/coin3.png'), 570, 550, 135, 155],
  [require('../../assets/coin4.png'), 518, 755, 105, 140],
  [require('../../assets/coin5.png'), 308, 838, 160, 160],
  [require('../../assets/coin6.png'), 130, 782, 112, 138],
  [require('../../assets/coin7.png'), 30, 604, 128, 124],
  [require('../../assets/coin8.png'), 82, 390, 155, 155],
];

export const REF_W = 736;
export const REF_TITLE_Y = 628;

function Coin({ src, x, y, w, h, i, scale }: { src: any; x: number; y: number; w: number; h: number; i: number; scale: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      i * 250,
      withRepeat(withTiming(1, { duration: 2800 + i * 200, easing: Easing.inOut(Easing.sin) }), -1, true)
    );
  }, [i, t]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: (t.value - 0.5) * 10 }, { rotate: `${(t.value - 0.5) * 6}deg` }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: x * scale,
          top: (y - REF_TITLE_Y) * scale,
          width: w * scale,
          height: h * scale,
        },
        style,
      ]}
    >
      <Image source={src} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
    </Animated.View>
  );
}

interface FloatingCoinRingProps {
  width: number;
  centerY: number;
  scale: number;
}

export default function FloatingCoinRing({ width, centerY, scale }: FloatingCoinRingProps) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: centerY, left: 0, width }}>
      {COINS.map(([src, x, y, w, h], i) => (
        <Coin key={i} src={src} x={x} y={y} w={w} h={h} i={i} scale={scale} />
      ))}
    </View>
  );
}
