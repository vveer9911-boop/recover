import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { fonts } from '../theme';
import { useApp } from '../context/AppContext';
import { CARD_DESIGNS, CardDesign } from '../data/cardDesigns';
import FocusCard from '../components/FocusCard';

export default function CardCustomizationScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { activeCardId, setActiveCardId, credits, userName, isPlus } = useApp();

  // The card currently selected for preview
  const [selectedId, setSelectedId] = useState<string>(activeCardId);

  // Free users are redirected to Pricing
  useEffect(() => {
    if (!isPlus) {
      navigation.replace('Pricing');
    }
  }, [isPlus, navigation]);

  const selectedCard = CARD_DESIGNS.find((c) => c.id === selectedId) || CARD_DESIGNS[2];
  const isCurrentlyApplied = selectedId === activeCardId;

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Dashboard');
    }
  }, [navigation]);

  const handleApply = useCallback(async () => {
    if (!isPlus) {
      navigation.navigate('Pricing');
      return;
    }
    if (selectedId && selectedId !== activeCardId) {
      await setActiveCardId(selectedId);
    }
    handleBack();
  }, [isPlus, selectedId, activeCardId, setActiveCardId, handleBack, navigation]);

  const sanitizedUserName = userName.trim() ? userName : undefined;
  const cardPreviewWidth = Math.min(width - 40, 340);
  const cardPreviewHeight = Math.round((cardPreviewWidth / 280) * 176);

  // Gallery item card width (two column grid or full row)
  const isTabletOrWide = width >= 600;
  const gridItemWidth = isTabletOrWide ? (width - 60) / 2 : width - 40;
  const gridCardHeight = Math.round((gridItemWidth / 280) * 176);

  return (
    <View style={styles.root}>
      {/* Top Header: Back Button & Title */}
      <View style={[styles.navHeader, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          onPress={handleBack}
          hitSlop={16}
          accessibilityLabel="Back to dashboard"
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Card Gallery</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Main Scrollable Collections Area */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Editorial Title & Subtitle */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Make it yours.</Text>
          <Text style={styles.subTitle}>17 brushed-steel cards crafted for Recover Pro.</Text>
        </View>

        {/* Selected Card Spotlight */}
        <View style={styles.spotlightContainer}>
          <Text style={styles.spotlightLabel}>PREVIEW</Text>
          <View style={styles.spotlightCardWrap}>
            <FocusCard
              width={cardPreviewWidth}
              height={cardPreviewHeight}
              designId={selectedCard.id}
              customDesign={selectedCard}
              credits={credits}
              cardholderName={sanitizedUserName}
              isApplied={isCurrentlyApplied}
            />
          </View>
          <View style={styles.spotlightMeta}>
            <View style={styles.spotlightNumberBadge}>
              <Text style={styles.spotlightNumberText}>#{selectedCard.cardNumber}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.spotlightName}>{selectedCard.name}</Text>
              <Text style={styles.spotlightDesc}>{selectedCard.description}</Text>
            </View>
          </View>
        </View>

        {/* Section Divider */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ALL 17 CARDS</Text>
          <Text style={styles.sectionCount}>17 Editions</Text>
        </View>

        {/* Full Gallery Grid (Cards 1 to 18) */}
        <View style={styles.cardsGrid}>
          {CARD_DESIGNS.map((card) => {
            const isSelected = card.id === selectedId;
            const isApplied = card.id === activeCardId;
            const isCard3 = card.cardNumber === 3;

            return (
              <Pressable
                key={card.id}
                onPress={() => handleSelect(card.id)}
                style={({ pressed }) => [
                  styles.cardTile,
                  { width: gridItemWidth },
                  isSelected && styles.cardTileSelected,
                  pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
                ]}
              >
                {/* Card Number Badge matching the reference image numbering */}
                <View style={styles.cardTileHeader}>
                  <View style={[styles.numberBadge, isSelected && styles.numberBadgeSelected]}>
                    <Text style={[styles.numberBadgeText, isSelected && styles.numberBadgeTextSelected]}>
                      {card.cardNumber}
                    </Text>
                  </View>
                  <Text style={styles.cardTileTitle}>{card.name}</Text>
                  {isCard3 && (
                    <View style={styles.defaultPill}>
                      <Text style={styles.defaultPillText}>FREE DEFAULT</Text>
                    </View>
                  )}
                  {isApplied && (
                    <View style={styles.appliedPill}>
                      <Text style={styles.appliedPillText}>CURRENT</Text>
                    </View>
                  )}
                </View>

                {/* Card Render */}
                <View style={styles.cardRenderWrap}>
                  <FocusCard
                    width={gridItemWidth}
                    height={gridCardHeight}
                    designId={card.id}
                    customDesign={card}
                    credits={credits}
                    cardholderName={sanitizedUserName}
                    isSelected={isSelected}
                    isApplied={isApplied}
                  />
                </View>

                {/* Subtitle / Description */}
                <Text style={styles.cardTileDesc}>{card.description}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Persistent Bottom Action: "Apply Card" / "Current Card" */}
      <View
        style={[
          styles.bottomActionContainer,
          { paddingBottom: Math.max(insets.bottom, 14) + 6 },
        ]}
        pointerEvents="box-none"
      >
        <Pressable
          style={({ pressed }) => [
            styles.chooseBtn,
            isCurrentlyApplied && styles.chooseBtnApplied,
            pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
          ]}
          onPress={handleApply}
        >
          <Text
            style={[
              styles.chooseBtnText,
              isCurrentlyApplied && styles.chooseBtnTextApplied,
            ]}
          >
            {isCurrentlyApplied ? 'Current card applied' : `Apply Card #${selectedCard.cardNumber}`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0E',
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#18181C',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 17,
  },
  scrollContent: {
    paddingTop: 16,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  mainTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 30,
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  subTitle: {
    color: '#9CA3AF',
    fontFamily: fonts.regular,
    fontSize: 14,
  },

  // Spotlight Preview
  spotlightContainer: {
    marginHorizontal: 20,
    backgroundColor: '#131318',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#222228',
    padding: 18,
    marginBottom: 28,
  },
  spotlightLabel: {
    color: '#71717A',
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  spotlightCardWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotlightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#1F1F26',
  },
  spotlightNumberBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  spotlightNumberText: {
    color: '#000000',
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  spotlightName: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  spotlightDesc: {
    color: '#8E8E93',
    fontFamily: fonts.regular,
    fontSize: 12.5,
    marginTop: 2,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#71717A',
    fontFamily: fonts.bold,
    fontSize: 11.5,
    letterSpacing: 0.8,
  },
  sectionCount: {
    color: '#52525B',
    fontFamily: fonts.medium,
    fontSize: 12,
  },

  // Cards Grid
  cardsGrid: {
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 22,
  },
  cardTile: {
    backgroundColor: '#131317',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#202026',
    padding: 14,
  },
  cardTileSelected: {
    borderColor: '#FFFFFF',
    backgroundColor: '#17171D',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  cardTileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#222228',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  numberBadgeSelected: {
    backgroundColor: '#FFFFFF',
  },
  numberBadgeText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  numberBadgeTextSelected: {
    color: '#000000',
  },
  cardTileTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  defaultPill: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    marginRight: 6,
  },
  defaultPillText: {
    color: '#60A5FA',
    fontFamily: fonts.bold,
    fontSize: 9.5,
    letterSpacing: 0.4,
  },
  appliedPill: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  appliedPillText: {
    color: '#4ADE80',
    fontFamily: fonts.bold,
    fontSize: 9.5,
    letterSpacing: 0.4,
  },
  cardRenderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTileDesc: {
    color: '#8E8E93',
    fontFamily: fonts.regular,
    fontSize: 12.5,
    marginTop: 10,
    lineHeight: 17,
  },

  // Bottom Floating Button
  bottomActionContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(10, 10, 14, 0.92)',
    borderTopWidth: 1,
    borderTopColor: '#1A1A20',
  },
  chooseBtn: {
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chooseBtnApplied: {
    backgroundColor: '#1E1E24',
    borderWidth: 1,
    borderColor: '#2E2E36',
  },
  chooseBtnText: {
    color: '#000000',
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  chooseBtnTextApplied: {
    color: '#A1A1AA',
  },
});
