import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';

interface Props {
  visible: boolean;
  state?: 'loading' | 'success';
  title: string;
  subtitle?: string;
  onDone?: () => void;
  doneBtnText?: string;
  autoCloseMs?: number;
}

export default function ThinkingOrbsModal({
  visible,
  state = 'loading',
  title,
  subtitle,
  onDone,
  doneBtnText,
  autoCloseMs,
}: Props) {
  const [loopAnim] = useState(() => new Animated.Value(0));
  const [pulseAnim] = useState(() => new Animated.Value(0));
  const [successScale] = useState(() => new Animated.Value(0.3));
  const [successOpacity] = useState(() => new Animated.Value(0));

  // Orbit loop (360 degrees continuous rotation)
  useEffect(() => {
    if (!visible) return;

    loopAnim.setValue(0);
    pulseAnim.setValue(0);

    const orbitLoop = Animated.loop(
      Animated.timing(loopAnim, {
        toValue: 1,
        duration: 3200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const breatheLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    orbitLoop.start();
    breatheLoop.start();

    return () => {
      orbitLoop.stop();
      breatheLoop.stop();
    };
  }, [visible, loopAnim, pulseAnim]);

  // Success animation transition
  useEffect(() => {
    if (state === 'success') {
      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      if (autoCloseMs && onDone) {
        const timer = setTimeout(() => {
          onDone();
        }, autoCloseMs);
        return () => clearTimeout(timer);
      }
    } else {
      successScale.setValue(0.3);
      successOpacity.setValue(0);
    }
  }, [state, autoCloseMs, onDone, successScale, successOpacity]);

  if (!visible) return null;

  // Orbital rotations
  const spin1 = loopAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const spin2 = loopAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });
  const spin3 = loopAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['120deg', '480deg'],
  });

  const coreScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.15],
  });

  const auraOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.75],
  });

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {state === 'loading' ? (
            /* ============================================================ */
            /* THINKING ORBS CLUSTER (Jakubantalik/thinking-orbs inspired) */
            /* ============================================================ */
            <View style={styles.clusterContainer}>
              {/* Outer Ambient Glow Aura */}
              <Animated.View
                style={[
                  styles.glowAura,
                  {
                    opacity: auraOpacity,
                    transform: [{ scale: coreScale }],
                  },
                ]}
              />

              {/* Orbit Ring 1 (Clockwise) */}
              <Animated.View style={[styles.orbitArm, { transform: [{ rotate: spin1 }] }]}>
                <View style={[styles.orbNode, styles.orbWhite, { top: 6, left: 38 }]} />
                <View style={[styles.orbNode, styles.orbCyan, { bottom: 8, right: 34, width: 14, height: 14 }]} />
              </Animated.View>

              {/* Orbit Ring 2 (Counter-Clockwise) */}
              <Animated.View style={[styles.orbitArm, { transform: [{ rotate: spin2 }] }]}>
                <View style={[styles.orbNode, styles.orbBlue, { top: 38, right: 8, width: 16, height: 16 }]} />
                <View style={[styles.orbNode, styles.orbCyan, { bottom: 32, left: 10, width: 12, height: 12 }]} />
              </Animated.View>

              {/* Orbit Ring 3 (Harmonic Angled) */}
              <Animated.View style={[styles.orbitArm, { transform: [{ rotate: spin3 }] }]}>
                <View style={[styles.orbNode, styles.orbWhite, { top: 18, right: 26, width: 11, height: 11 }]} />
                <View style={[styles.orbNode, styles.orbBlue, { bottom: 16, left: 28, width: 13, height: 13 }]} />
              </Animated.View>

              {/* Central Glowing Nucleus */}
              <Animated.View
                style={[
                  styles.nucleusOrb,
                  {
                    transform: [{ scale: coreScale }],
                  },
                ]}
              >
                <View style={styles.nucleusInnerGlow} />
              </Animated.View>
            </View>
          ) : (
            /* ============================================================ */
            /* SUCCESS CELEBRATION RING & CHECKMARK */
            /* ============================================================ */
            <Animated.View
              style={[
                styles.successContainer,
                {
                  transform: [{ scale: successScale }],
                  opacity: successOpacity,
                },
              ]}
            >
              <View style={styles.successRing}>
                <Ionicons name="checkmark" size={38} color="#FFFFFF" />
              </View>
            </Animated.View>
          )}

          {/* Title & Subtitle */}
          <Text style={styles.titleText}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}

          {/* Action / Done Button if provided */}
          {!!doneBtnText && !!onDone && (
            <Pressable
              style={({ pressed }) => [styles.doneBtn, pressed && { opacity: 0.85 }]}
              onPress={onDone}
            >
              <Text style={styles.doneBtnText}>{doneBtnText}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#028BFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  clusterContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  glowAura: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(2, 139, 255, 0.28)',
  },
  orbitArm: {
    position: 'absolute',
    width: 130,
    height: 130,
  },
  orbNode: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbWhite: {
    width: 14,
    height: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  orbCyan: {
    width: 13,
    height: 13,
    backgroundColor: '#38BDF8',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  orbBlue: {
    width: 15,
    height: 15,
    backgroundColor: '#028BFF',
    shadowColor: '#028BFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  nucleusOrb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#028BFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 6,
  },
  nucleusInnerGlow: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },
  successContainer: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 25,
    fontFamily: fonts?.bold || undefined,
  },
  subtitleText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
    fontFamily: fonts?.regular || undefined,
  },
  doneBtn: {
    marginTop: 22,
    width: '100%',
    height: 48,
    backgroundColor: colors?.blue || '#028BFF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
