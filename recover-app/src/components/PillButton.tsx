import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts, radii } from '../theme';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: 'white' | 'dark' | 'blue';
  icon?: React.ReactNode;
  height?: number;
  style?: StyleProp<ViewStyle>;
  fontSize?: number;
};

export default function PillButton({ title, onPress, variant = 'white', icon, height = 56, style, fontSize = 18 }: Props) {
  const bg = variant === 'white' ? colors.white : variant === 'blue' ? colors.blue : colors.pill;
  const fg = variant === 'white' ? '#000' : '#fff';
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.base, { backgroundColor: bg, height, opacity: pressed ? 0.85 : 1 }, style]}>
      <View style={styles.row}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <Text style={[styles.text, { color: fg, fontSize }]}>{title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 40 },
  text: { fontFamily: fonts.regular },
});
