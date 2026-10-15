import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { colors, fonts } from '../theme';
import { CardIcon, CoinGlobe, WalletCard } from './Icons';
import { Ionicons } from '@expo/vector-icons';

export const TABS = ['Card', 'Rankings', 'Account'] as const;
export type TabType = (typeof TABS)[number];

interface TabBarProps {
  active?: TabType;
  onTabChange?: (tab: TabType) => void;
}

export default function TabBar({ active = 'Card', onTabChange }: TabBarProps) {
  return (
    <View style={styles.bar}>
      {TABS.map((t) => {
        const on = t === active;
        let icon: React.ReactNode;
        if (t === 'Card') icon = <CardIcon size={22} />;
        else if (t === 'Rankings') icon = <CoinGlobe size={22} />;
        else icon = <Ionicons name="person" size={20} color="#fff" />;
        return (
          <Pressable
            key={t}
            style={({ pressed }) => [
              styles.item,
              on && styles.active,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => onTabChange?.(t)}
          >
            <View style={styles.iconBox}>{icon}</View>
            <Text style={styles.label}>{t}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row', backgroundColor: colors.tabBar, borderRadius: 999, padding: 4, height: 54,
    borderWidth: 1, borderColor: '#2A2A2D',
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  active: { backgroundColor: colors.tabActive },
  iconBox: { height: 22, justifyContent: 'center', alignItems: 'center' },
  score: { color: '#fff', fontFamily: fonts.bold, fontSize: 18, lineHeight: 22 },
  label: { color: '#fff', fontFamily: fonts.medium, fontSize: 11.5, marginTop: 3 },
});
