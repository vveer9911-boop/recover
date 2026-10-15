import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';

export default function RewardBanner({ onClaim }: { onClaim?: () => void }) {
  return (
    <View style={styles.wrap}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.inner}>
        <Ionicons name="gift-outline" size={22} color="#fff" style={{ marginLeft: 6 }} />
        <View style={{ flex: 1, marginLeft: 22 }}>
          <Text style={styles.title}>Get 15 credits</Text>
          <Text style={styles.sub}>Your first withdraw, on us</Text>
        </View>
        <Pressable
          onPress={onClaim}
          style={({ pressed }) => [styles.claim, pressed && { opacity: 0.75 }]}
          hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
        >
          <Text style={styles.claimText}>Claim</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 60, borderRadius: 999, overflow: 'hidden', borderWidth: 1, borderColor: '#2C2C2F', backgroundColor: 'rgba(28,28,30,0.82)' },
  inner: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  title: { color: colors.white, fontFamily: fonts.medium, fontSize: 16 },
  sub: { color: colors.gray, fontFamily: fonts.regular, fontSize: 14, marginTop: 2 },
  claim: { backgroundColor: colors.blue, borderRadius: 999, height: 32, paddingHorizontal: 18, justifyContent: 'center' },
  claimText: { color: colors.white, fontFamily: fonts.regular, fontSize: 16 },
});
