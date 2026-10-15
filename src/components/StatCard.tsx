import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts, radii } from '../theme';

type Props = {
  title: string;
  value: string;
  caption?: string;
  footer?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function StatCard({ title, value, caption, footer, children, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      {children}
      {footer ? <Text style={styles.footer}>{footer}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, height: 192, backgroundColor: colors.card, borderRadius: radii.tile, paddingHorizontal: 14, paddingTop: 14, borderWidth: 1, borderColor: '#202023' },
  title: { color: colors.gray2, fontFamily: fonts.medium, fontSize: 15 },
  value: { color: '#D8D8DC', fontFamily: fonts.semibold, fontSize: 24, marginTop: 6 },
  caption: { color: colors.gray, fontFamily: fonts.regular, fontSize: 15, marginTop: 4 },
  footer: { position: 'absolute', left: 14, bottom: 14, color: colors.gray, fontFamily: fonts.regular, fontSize: 15 },
});
