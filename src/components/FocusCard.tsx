import React from 'react';
import { Platform, StyleSheet, Text, View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Chevrons, ChipIcon } from './Icons';
import { colors, fonts, radii } from '../theme';
import { useApp } from '../context/AppContext';
import { getCardDesign, CardDesign } from '../data/cardDesigns';
import CardPatternRenderer from './CardPatternRenderer';

const W = 280;
const H = 176;

export interface FocusCardProps {
  credits?: number;
  cardholderName?: string;
  designId?: string;
  customDesign?: CardDesign;
  orientation?: 'landscape' | 'portrait';
  width?: number;
  height?: number;
  isSelected?: boolean;
  isApplied?: boolean;
  onPress?: () => void;
}

function FocusCardComponent({
  credits: propCredits,
  cardholderName: propCardholderName,
  designId: propDesignId,
  customDesign,
  orientation = 'landscape',
  width,
  height,
  isSelected,
  isApplied,
  onPress,
}: FocusCardProps) {
  const { credits: appCredits, userName: appUserName, activeCardId } = useApp();

  const credits = propCredits !== undefined ? propCredits : appCredits;
  const cardholderName = propCardholderName !== undefined ? propCardholderName : appUserName;
  const design = customDesign || getCardDesign(propDesignId || activeCardId);
  const palette = design.palette;

  const isPortrait = orientation === 'portrait';

  // -------------------------------------------------------------------------
  // LANDSCAPE PREVIEW MODE (For Horizontal Rows in Gallery)
  // -------------------------------------------------------------------------
  if (!isPortrait && width && width <= 250) {
    const cardW = width;
    const cardH = height || Math.round((width / 280) * 176);

    const previewContent = (
      <View
        style={[
          styles.previewWrap,
          { width: cardW, height: cardH },
          isSelected && styles.previewSelectedWrap,
        ]}
      >
        <LinearGradient
          colors={palette.gradient}
          start={palette.gradientStart || { x: 0, y: 0 }}
          end={palette.gradientEnd || { x: 1, y: 1 }}
          style={[
            styles.previewCard,
            {
              borderColor: isSelected ? '#FFFFFF' : palette.borderColor,
              borderWidth: isSelected ? 2 : 1,
            },
          ]}
        >
          {/* Surface Pattern */}
          <CardPatternRenderer
            patternType={design.patternType}
            palette={palette}
            orientation="landscape"
          />

          {/* Top row: Brand & Chevrons */}
          <View style={styles.previewTopRow}>
            <Text style={[styles.previewBrand, { color: palette.textColor }]}>
              recover
            </Text>
            <View style={styles.previewChevWrap}>
              <Chevrons size={38} color={palette.chevronColor} />
            </View>
          </View>

          {/* Center right Chip */}
          <View style={styles.previewChipWrap}>
            <ChipIcon
              size={26}
              fill={palette.chipFill || '#D9D9DC'}
              stroke={palette.chipBorder || '#F2F2F4'}
            />
          </View>

          {/* Bottom live stats */}
          <View style={styles.previewBottom}>
            <View style={styles.previewBalanceRow}>
              <Text style={[styles.previewZero, { color: palette.textColor }]}>
                {credits}
              </Text>
              <Text style={[styles.previewUnit, { color: palette.subtextColor }]}>
                credits
              </Text>
            </View>
            <Text
              numberOfLines={1}
              style={[styles.previewLabel, { color: palette.subtextColor }]}
            >
              {cardholderName ? `FOCUS CARD • ${cardholderName.toUpperCase()}` : 'FOCUS CARD'}
            </Text>
          </View>

          {/* Current / Active pill */}
          {isApplied && (
            <View style={styles.appliedPill}>
              <Text style={styles.appliedPillText}>CURRENT</Text>
            </View>
          )}

          {/* Selected checkmark badge */}
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Ionicons name="checkmark-circle" size={17} color="#2DD4BF" />
            </View>
          )}
        </LinearGradient>
      </View>
    );

    if (onPress) {
      return (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] }]}
        >
          {previewContent}
        </Pressable>
      );
    }
    return previewContent;
  }

  // -------------------------------------------------------------------------
  // PORTRAIT MODE (Optional legacy fallback)
  // -------------------------------------------------------------------------
  if (isPortrait) {
    const cardW = width || 120;
    const cardH = height || 186;

    const content = (
      <View
        style={[
          styles.portraitWrap,
          { width: cardW, height: cardH },
          isSelected && styles.portraitSelectedWrap,
        ]}
      >
        <LinearGradient
          colors={palette.gradient}
          start={palette.gradientStart || { x: 0, y: 0 }}
          end={palette.gradientEnd || { x: 1, y: 1 }}
          style={[
            styles.portraitCard,
            { borderColor: isSelected ? '#FFFFFF' : palette.borderColor },
          ]}
        >
          {/* Surface Pattern */}
          <CardPatternRenderer
            patternType={design.patternType}
            palette={palette}
            orientation="portrait"
          />

          {/* Top Row: recover + chevrons */}
          <View style={styles.portraitTopRow}>
            <Text style={[styles.portraitBrand, { color: palette.textColor }]}>
              recover
            </Text>
            <View style={{ transform: [{ scale: 0.28 }], marginRight: -12, marginTop: -4 }}>
              <Chevrons size={70} color={palette.chevronColor} />
            </View>
          </View>

          {/* Center Chip */}
          <View style={styles.portraitCenter}>
            <ChipIcon
              size={32}
              fill={palette.chipFill || '#D9D9DC'}
              stroke={palette.chipBorder || '#F2F2F4'}
            />
          </View>

          {/* Bottom Live Data: Balance & Screen time equivalent */}
          <View style={styles.portraitBottom}>
            <View style={styles.portraitBalanceRow}>
              <Text style={[styles.portraitZero, { color: palette.textColor }]}>
                {credits}
              </Text>
              <Text style={[styles.portraitUnit, { color: palette.subtextColor }]}>
                cr
              </Text>
            </View>
            <Text
              numberOfLines={1}
              style={[styles.portraitLabel, { color: palette.subtextColor }]}
            >
              {cardholderName ? cardholderName.toUpperCase() : 'FOCUS CARD'}
            </Text>
          </View>

          {/* Active / Current indicator pill */}
          {isApplied && (
            <View style={styles.appliedPill}>
              <Text style={styles.appliedPillText}>CURRENT</Text>
            </View>
          )}

          {/* Selection indicator checkmark */}
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Ionicons name="checkmark-circle" size={17} color="#2DD4BF" />
            </View>
          )}
        </LinearGradient>
      </View>
    );

    if (onPress) {
      return (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] }]}
        >
          {content}
        </Pressable>
      );
    }
    return content;
  }

  // -------------------------------------------------------------------------
  // LANDSCAPE MODE (Full Dashboard Card)
  // -------------------------------------------------------------------------
  const cardElement = (
    <LinearGradient
      colors={palette.gradient}
      start={palette.gradientStart || { x: 0, y: 0 }}
      end={palette.gradientEnd || { x: 1, y: 1 }}
      style={[
        styles.card,
        {
          borderColor: isSelected ? '#FFFFFF' : palette.borderColor,
          borderWidth: isSelected ? 2.5 : 1,
        },
      ]}
    >
      {/* Surface Pattern */}
      <CardPatternRenderer
        patternType={design.patternType}
        palette={palette}
        orientation="landscape"
      />

      {/* Brand Text */}
      <View style={styles.logo}>
        <Text style={[styles.brandTitle, { color: palette.textColor }]}>recover</Text>
      </View>

      {/* Amount */}
      <View style={styles.amount}>
        <Text style={[styles.zero, { color: palette.textColor }]}>{credits}</Text>
        <Text style={[styles.credits, { color: palette.textColor }]}>credits</Text>
      </View>

      {/* Screen-Time Equivalent */}
      <Text style={[styles.eq, { color: palette.subtextColor }]}>
        = {credits}m screen time
      </Text>

      {/* Chevrons */}
      <View style={styles.chev}>
        <Chevrons size={64} color={palette.chevronColor} />
      </View>

      {/* Chip */}
      <View style={styles.chip}>
        <ChipIcon
          size={46}
          fill={palette.chipFill || '#D9D9DC'}
          stroke={palette.chipBorder || '#F2F2F4'}
        />
      </View>

      {/* Cardholder label */}
      <Text style={[styles.label, { color: palette.subtextColor }]}>
        {cardholderName ? `FOCUS CARD • ${cardholderName.toUpperCase()}` : 'FOCUS CARD'}
      </Text>

      {/* Current / Active pill */}
      {isApplied && (
        <View style={styles.appliedPill}>
          <Text style={styles.appliedPillText}>CURRENT</Text>
        </View>
      )}

      {/* Selected checkmark badge */}
      {isSelected && (
        <View style={styles.selectedBadge}>
          <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
        </View>
      )}
    </LinearGradient>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.wrap,
          width ? { width, height } : { width: '100%' },
          isSelected && {
            shadowColor: '#FFFFFF',
            shadowOpacity: 0.5,
            shadowRadius: 16,
            elevation: 8,
          },
          pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
        ]}
      >
        {cardElement}
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.wrap,
        width ? { width, height } : { width: '100%' },
        isSelected && {
          shadowColor: '#FFFFFF',
          shadowOpacity: 0.5,
          shadowRadius: 16,
          elevation: 8,
        },
      ]}
    >
      {cardElement}
    </View>
  );
}

const styles = StyleSheet.create({
  // Landscape
  wrap: {
    aspectRatio: W / H,
    borderRadius: radii.focusCard,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  card: {
    flex: 1,
    borderRadius: radii.focusCard,
    overflow: 'hidden',
    borderWidth: 1,
  },
  logo: {
    position: 'absolute',
    left: 14,
    top: 16,
  },
  brandTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    letterSpacing: -0.4,
  },
  amount: {
    position: 'absolute',
    left: 12,
    top: '38%',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  zero: {
    fontFamily: fonts.medium,
    fontSize: 36,
    lineHeight: 38,
  },
  credits: {
    fontFamily: fonts.medium,
    fontSize: 18,
    marginLeft: 4,
    marginBottom: 3,
  },
  eq: {
    position: 'absolute',
    left: 12,
    top: '57%',
    fontFamily: fonts.regular,
    fontSize: 15,
  },
  chev: {
    position: 'absolute',
    left: '48%',
    top: '42%',
  },
  chip: {
    position: 'absolute',
    left: '75%',
    top: '48%',
  },
  label: {
    position: 'absolute',
    left: 12,
    bottom: 18,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 1.2,
  },

  // Portrait
  portraitWrap: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  portraitSelectedWrap: {
    shadowColor: '#2DD4BF',
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  portraitCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.2,
    padding: 10,
    justifyContent: 'space-between',
  },
  portraitTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  portraitBrand: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: -0.3,
  },
  portraitCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  portraitBottom: {
    marginTop: 'auto',
  },
  portraitBalanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  portraitZero: {
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 20,
  },
  portraitUnit: {
    fontFamily: fonts.medium,
    fontSize: 10,
    marginLeft: 2,
  },
  portraitLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 8.5,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  appliedPill: {
    position: 'absolute',
    top: 7,
    left: 7,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  appliedPillText: {
    color: '#2DD4BF',
    fontFamily: fonts.bold,
    fontSize: 7.5,
    letterSpacing: 0.5,
  },
  // Landscape Preview (Horizontal Gallery Rows)
  previewWrap: {
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  previewSelectedWrap: {
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  previewCard: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    padding: 10,
    justifyContent: 'space-between',
  },
  previewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  previewBrand: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: -0.3,
  },
  previewChevWrap: {
    marginTop: -2,
    marginRight: -4,
  },
  previewChipWrap: {
    position: 'absolute',
    right: 14,
    top: '40%',
    zIndex: 2,
  },
  previewBottom: {
    marginTop: 'auto',
    zIndex: 2,
  },
  previewBalanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  previewZero: {
    fontFamily: fonts.medium,
    fontSize: 22,
    lineHeight: 24,
  },
  previewUnit: {
    fontFamily: fonts.medium,
    fontSize: 11,
    marginLeft: 3,
  },
  previewLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 8.5,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  selectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#000000',
    borderRadius: 9,
    zIndex: 10,
  },
});

const FocusCard = React.memo(FocusCardComponent);
export default FocusCard;
