import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../theme';

interface PaywallCardProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function PaywallCard({
  title = 'Upgrade to Recover Pro',
  subtitle = 'Upgrade to Pro to unlock these features.',
  buttonText = 'Upgrade to Pro',
  onPress,
  style,
}: PaywallCardProps) {
  return (
    <View style={[styles.floatingCard, style]}>
      <View style={styles.iconCircle}>
        <Ionicons name="sparkles" size={20} color="#FFFFFF" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
        ]}
        onPress={onPress}
        hitSlop={8}
      >
        <Text style={styles.buttonText}>{buttonText}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingCard: {
    backgroundColor: '#161618',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#242428',
    paddingVertical: 24,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.65,
    shadowRadius: 20,
    elevation: 10,
    width: '92%',
    maxWidth: 340,
    alignSelf: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#222226',
    borderWidth: 1,
    borderColor: '#303036',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 18,
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9CA3AF',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18.5,
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 6,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#000000',
    fontFamily: fonts.bold,
    fontSize: 14.5,
    letterSpacing: 0.1,
  },
});
