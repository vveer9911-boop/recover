import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { fonts } from '../theme';
import ThinkingOrbCanvas from './ThinkingOrbCanvas';

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
  useEffect(() => {
    if (visible && state === 'success' && autoCloseMs && onDone) {
      const timer = setTimeout(() => {
        onDone();
      }, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [visible, state, autoCloseMs, onDone]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.canvasWrapper}>
            <ThinkingOrbCanvas size={140} state={state} />
          </View>

          <Text style={styles.title}>{title}</Text>

          {subtitle ? (
            <Text style={styles.subtitle}>{subtitle}</Text>
          ) : null}

          {state === 'success' && onDone && doneBtnText ? (
            <Pressable
              style={({ pressed }) => [styles.doneBtn, pressed && styles.btnPressed]}
              onPress={onDone}
            >
              <Text style={styles.doneBtnText}>{doneBtnText}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0F0F12',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  canvasWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  doneBtn: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 140,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#000000',
    fontSize: 14,
    fontFamily: fonts.semibold,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
