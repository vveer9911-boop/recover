import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Circle,
  Path,
  Rect,
  Line,
  G,
  Ellipse,
} from 'react-native-svg';

/**
 * 100% vector SVG Profile / Name illustration.
 * Razor-sharp on all retina displays.
 * Completely monochrome (white, silver, frosted glass, pure black) - zero purple, zero blue.
 */
export function NameAvatarGraphic({ size = 220, name = '' }: { size?: number; name?: string }) {
  const h = size * 0.8;
  return (
    <View style={{ width: size, height: h, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={h} viewBox="0 0 300 240" fill="none">
        <Defs>
          {/* Glass fill for head and shoulders */}
          <LinearGradient id="glassHead" x1="0.3" y1="0" x2="0.7" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.22" />
            <Stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0.08" />
            <Stop offset="1" stopColor="#000000" stopOpacity="0.35" />
          </LinearGradient>

          <LinearGradient id="glassBody" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.18" />
            <Stop offset="0.7" stopColor="#FFFFFF" stopOpacity="0.05" />
            <Stop offset="1" stopColor="#000000" stopOpacity="0.5" />
          </LinearGradient>

          {/* Frosted badge surface */}
          <LinearGradient id="badgeFill" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#25252A" stopOpacity="0.95" />
            <Stop offset="0.5" stopColor="#1C1C20" stopOpacity="0.95" />
            <Stop offset="1" stopColor="#141417" stopOpacity="0.98" />
          </LinearGradient>

          {/* Badge glass border gradient */}
          <LinearGradient id="badgeStroke" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.65" />
            <Stop offset="0.4" stopColor="#FFFFFF" stopOpacity="0.2" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.4" />
          </LinearGradient>

          {/* Torso rim light */}
          <LinearGradient id="torsoRim" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
            <Stop offset="0.2" stopColor="#FFFFFF" stopOpacity="0.75" />
            <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.95" />
            <Stop offset="0.8" stopColor="#FFFFFF" stopOpacity="0.75" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Ambient shadow beneath figure */}
        <Ellipse cx="150" cy="216" rx="95" ry="16" fill="rgba(0,0,0,0.5)" />

        {/* Torso / Shoulders */}
        <Path
          d="M68 206 C72 152 108 126 150 126 C192 126 228 152 232 206 Z"
          fill="url(#glassBody)"
        />
        {/* Torso top crest rim highlight */}
        <Path
          d="M78 194 C85 152 114 126 150 126 C186 126 215 152 222 194"
          stroke="url(#torsoRim)"
          strokeWidth="2.5"
          fill="none"
        />

        {/* Head */}
        <Circle cx="150" cy="80" r="36" fill="url(#glassHead)" />
        {/* Head crisp glass rim light */}
        <Path
          d="M124 56 C132 47 141 44 150 44 C170 44 186 60 186 80 C186 89 183 98 176 106"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          strokeOpacity="0.85"
        />
        <Circle cx="150" cy="80" r="36" stroke="rgba(255,255,255,0.18)" strokeWidth="1" fill="none" />

        {/* 3 crisp white accent rays (radiating from top-right) */}
        <Line x1="198" y1="46" x2="204" y2="28" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
        <Line x1="214" y1="60" x2="232" y2="46" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
        <Line x1="218" y1="78" x2="237" y2="82" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />

        {/* Floating badge across chest: tilted -8 degrees */}
        <G transform="rotate(-8 150 178)">
          {/* Badge shadow on torso */}
          <Rect x="46" y="156" width="208" height="52" rx="16" fill="rgba(0,0,0,0.55)" />

          {/* Badge card body */}
          <Rect
            x="48"
            y="152"
            width="204"
            height="50"
            rx="15"
            fill="url(#badgeFill)"
            stroke="url(#badgeStroke)"
            strokeWidth="1.6"
          />

          {/* Internal top glass sheen */}
          <Path
            d="M50 166 C50 159 55 154 62 154 L238 154 C245 154 250 159 250 166 L250 172 C200 172 100 176 50 184 Z"
            fill="rgba(255,255,255,0.08)"
          />

          {/* "Your name... |" text simulated in crisp vector */}
          <G transform="translate(74, 184)">
            {/* Soft silver text */}
            <Path
              d="M0 -14 L4 -5 L8 -14 M4 -5 L4 2" // Y
              stroke="#8E8E93"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0"
            />
          </G>

          {/* Blinking bright white cursor */}
          <Line
            x1="202"
            y1="164"
            x2="202"
            y2="190"
            stroke="#FFFFFF"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        </G>
      </Svg>

      {/* Real crisp text overlay placed over the tilted badge for 100% typography perfection */}
      <View
        style={[
          styles.badgeTextWrap,
          {
            transform: [{ rotate: '-8deg' }],
          },
        ]}
        pointerEvents="none"
      >
        <Text style={[styles.badgePlaceholder, !!name && { color: '#FFFFFF' }]}>
          {name ? `${name}` : 'Your name...'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeTextWrap: {
    position: 'absolute',
    top: '64%',
    left: '26%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgePlaceholder: {
    color: '#8E8E93',
    fontFamily: 'Inter_400Regular',
    fontSize: 16.5,
    letterSpacing: -0.3,
  },
});
