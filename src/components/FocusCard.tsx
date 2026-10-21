import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { fonts, radii } from '../theme';
import { useApp } from '../context/AppContext';
import { getCardDesign, CardDesign } from '../data/cardDesigns';
import CardPatternRenderer from './CardPatternRenderer';
import { RecoverWingedLogo, ChipIcon } from './Icons';

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

  const isSmall = width !== undefined && width < 260;
  const cardWidth = width || '100%';
  const cardHeight = height || (width ? Math.round((width / 280) * 176) : 180);

  const displayName = cardholderName && cardholderName.trim()
    ? `${cardholderName.trim().toUpperCase()}'S CARD`
    : "PETER'S CARD";

  const cardContent = (
    <View
      style={[
        styles.cardOuter,
        typeof cardWidth === 'number' ? { width: cardWidth, height: cardHeight } : { width: '100%', height: cardHeight },
        isSelected && styles.cardSelectedOuter,
      ]}
    >
      <LinearGradient
        colors={palette.gradient}
        start={palette.gradientStart || { x: 0, y: 0 }}
        end={palette.gradientEnd || { x: 0.9, y: 1 }}
        style={[
          styles.cardInner,
          {
            borderColor: isSelected ? '#FFFFFF' : palette.borderColor,
            borderWidth: isSelected ? 2.5 : 1,
          },
        ]}
      >
        {/* Subtle SVG Vector Surface Texture / Micro-Pattern */}
        <CardPatternRenderer
          patternType={design.patternType}
          palette={palette}
          orientation={orientation}
        />

        {/* TOP LEFT: Recover Winged Logo (Black on bright cards 1, 4, 5, 6, 7, 9, 12, 13, 16; White on dark cards) */}
        <View style={[styles.topLeftLogoWrap, isSmall && styles.topLeftLogoWrapSmall]}>
          <RecoverWingedLogo
            size={isSmall ? 32 : 44}
            color={
              palette.logoColor === 'black' || [1, 4, 5, 6, 7, 9, 12, 13, 16].includes(design.cardNumber)
                ? 'black'
                : 'white'
            }
          />
        </View>

        {/* CENTER RIGHT: EMV Metallic Chip */}
        <View style={[styles.chipWrap, isSmall && styles.chipWrapSmall]}>
          <ChipIcon
            size={isSmall ? 34 : 46}
            fill={palette.chipFill || '#D9D9DC'}
            stroke={palette.chipBorder || '#F2F2F4'}
          />
        </View>

        {/* MIDDLE LEFT: Balance Number & "credits" */}
        <View style={[styles.balanceWrap, isSmall && styles.balanceWrapSmall]}>
          <Text
            style={[
              styles.creditsNum,
              isSmall && styles.creditsNumSmall,
              { color: palette.textColor },
            ]}
          >
            {credits}
          </Text>
          <Text
            style={[
              styles.creditsUnit,
              isSmall && styles.creditsUnitSmall,
              { color: palette.textColor },
            ]}
          >
            {' '}credits
          </Text>
        </View>

        {/* BOTTOM LEFT: Cardholder Name */}
        <Text
          numberOfLines={1}
          style={[
            styles.cardholderLabel,
            isSmall && styles.cardholderLabelSmall,
            { color: palette.textColor },
          ]}
        >
          {displayName}
        </Text>

        {/* APPLIED BADGE (CURRENT) */}
        {isApplied && (
          <View style={[styles.appliedPill, isSmall && styles.appliedPillSmall]}>
            <Text style={[styles.appliedPillText, isSmall && styles.appliedPillTextSmall]}>
              CURRENT
            </Text>
          </View>
        )}

        {/* SELECTED CHECKMARK BADGE */}
        {isSelected && (
          <View style={[styles.selectedBadge, isSmall && styles.selectedBadgeSmall]}>
            <Ionicons name="checkmark-circle" size={isSmall ? 18 : 22} color="#FFFFFF" />
          </View>
        )}
      </LinearGradient>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.pressableWrap,
          typeof cardWidth === 'number' ? { width: cardWidth } : { width: '100%' },
          pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
        ]}
      >
        {cardContent}
      </Pressable>
    );
  }

  return (
    <View style={[styles.pressableWrap, typeof cardWidth === 'number' ? { width: cardWidth } : { width: '100%' }]}>
      {cardContent}
    </View>
  );
}

export default React.memo(FocusCardComponent);

const styles = StyleSheet.create({
  pressableWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardOuter: {
    borderRadius: radii.focusCard || 22,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  cardSelectedOuter: {
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  cardInner: {
    flex: 1,
    borderRadius: radii.focusCard || 22,
    position: 'relative',
    overflow: 'hidden',
  },

  // Top Left Winged Logo
  topLeftLogoWrap: {
    position: 'absolute',
    top: 16,
    left: 18,
    zIndex: 2,
  },
  topLeftLogoWrapSmall: {
    top: 10,
    left: 12,
  },

  // Center Right EMV Chip
  chipWrap: {
    position: 'absolute',
    right: 20,
    top: '46%',
    transform: [{ translateY: -18 }],
    zIndex: 2,
  },
  chipWrapSmall: {
    right: 12,
    top: '46%',
    transform: [{ translateY: -14 }],
  },

  // Middle Left Balance
  balanceWrap: {
    position: 'absolute',
    left: 18,
    top: '50%',
    transform: [{ translateY: -16 }],
    flexDirection: 'row',
    alignItems: 'baseline',
    zIndex: 2,
  },
  balanceWrapSmall: {
    left: 12,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  creditsNum: {
    fontFamily: fonts.bold,
    fontSize: 28,
    letterSpacing: -0.6,
  },
  creditsNumSmall: {
    fontSize: 20,
    letterSpacing: -0.4,
  },
  creditsUnit: {
    fontFamily: fonts.medium,
    fontSize: 15,
    letterSpacing: -0.2,
  },
  creditsUnitSmall: {
    fontSize: 11.5,
    letterSpacing: -0.1,
  },

  // Bottom Left Cardholder Label
  cardholderLabel: {
    position: 'absolute',
    left: 18,
    bottom: 16,
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    letterSpacing: 1.2,
    opacity: 0.88,
    zIndex: 2,
    maxWidth: '65%',
  },
  cardholderLabelSmall: {
    left: 12,
    bottom: 10,
    fontSize: 9,
    letterSpacing: 0.8,
  },

  // Top Right Applied Pill (CURRENT)
  appliedPill: {
    position: 'absolute',
    top: 14,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 3,
  },
  appliedPillSmall: {
    top: 8,
    right: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  appliedPillText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  appliedPillTextSmall: {
    fontSize: 7.5,
  },

  // Selected Checkmark Badge
  selectedBadge: {
    position: 'absolute',
    bottom: 14,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 12,
    zIndex: 3,
  },
  selectedBadgeSmall: {
    bottom: 8,
    right: 8,
    borderRadius: 10,
  },
});
