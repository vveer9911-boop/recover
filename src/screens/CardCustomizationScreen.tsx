import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { fonts, colors } from '../theme';
import { useApp } from '../context/AppContext';
import { CATEGORIES, getCardDesign, CardDesign, CategoryInfo } from '../data/cardDesigns';
import FocusCard from '../components/FocusCard';

// ---------------------------------------------------------------------------
// MEMOIZED GALLERY ITEM (Isolates re-renders to only the toggled cards)
// ---------------------------------------------------------------------------
interface CardGalleryItemProps {
  card: CardDesign;
  isSelected: boolean;
  isApplied: boolean;
  credits: number;
  userName?: string;
  onSelect: (id: string) => void;
}

const CardGalleryItem = React.memo(
  function CardGalleryItem({
    card,
    isSelected,
    isApplied,
    credits,
    userName,
    onSelect,
  }: CardGalleryItemProps) {
    const handlePress = useCallback(() => {
      onSelect(card.id);
    }, [card.id, onSelect]);

    return (
      <View style={styles.cardItemWrap}>
        <FocusCard
          orientation="landscape"
          width={204}
          height={128}
          designId={card.id}
          customDesign={card}
          credits={credits}
          cardholderName={userName}
          isSelected={isSelected}
          isApplied={isApplied}
          onPress={handlePress}
        />
        <Text
          numberOfLines={1}
          style={[
            styles.cardNameLabel,
            isSelected && styles.cardNameLabelSelected,
          ]}
        >
          {card.name}
        </Text>
      </View>
    );
  },
  (prev, next) =>
    prev.isSelected === next.isSelected &&
    prev.isApplied === next.isApplied &&
    prev.card.id === next.card.id &&
    prev.credits === next.credits &&
    prev.userName === next.userName
);

// ---------------------------------------------------------------------------
// MEMOIZED CATEGORY ROW
// ---------------------------------------------------------------------------
interface CategorySectionProps {
  category: CategoryInfo;
  selectedId: string;
  activeCardId: string;
  credits: number;
  userName?: string;
  onSelect: (id: string) => void;
}

const CategorySection = React.memo(
  function CategorySection({
    category,
    selectedId,
    activeCardId,
    credits,
    userName,
    onSelect,
  }: CategorySectionProps) {
    return (
      <View style={styles.categorySection}>
        {/* Category Header */}
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          {category.description ? (
            <Text style={styles.categoryDesc}>{category.description}</Text>
          ) : null}
        </View>

        {/* Horizontal Carousel of Cards (Horizontal Landscape Cards) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalRow}
          nestedScrollEnabled={true}
          directionalLockEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          {category.cards.map((card) => (
            <CardGalleryItem
              key={card.id}
              card={card}
              isSelected={card.id === selectedId}
              isApplied={card.id === activeCardId}
              credits={credits}
              userName={userName}
              onSelect={onSelect}
            />
          ))}
        </ScrollView>
      </View>
    );
  },
  (prev, next) => {
    // Only re-render category row if selected card was in this category or is now in this category
    const prevInCat = prev.category.cards.some((c) => c.id === prev.selectedId || c.id === prev.activeCardId);
    const nextInCat = next.category.cards.some((c) => c.id === next.selectedId || c.id === next.activeCardId);
    if (!prevInCat && !nextInCat) return true; // neither previous nor next selected card belongs here
    return (
      prev.selectedId === next.selectedId &&
      prev.activeCardId === next.activeCardId &&
      prev.credits === next.credits &&
      prev.userName === next.userName
    );
  }
);

// ---------------------------------------------------------------------------
// MAIN CARD CUSTOMIZATION SCREEN
// ---------------------------------------------------------------------------
export default function CardCustomizationScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { activeCardId, setActiveCardId, credits, userName, isPlus } = useApp();

  // The card currently selected for preview
  const [selectedId, setSelectedId] = useState<string>(activeCardId);

  const classicCategory = CATEGORIES.find((c) => c.id === 'Classic') || CATEGORIES[0];

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

  useEffect(() => {
    if (!isPlus) {
      navigation.replace('Pricing');
    }
  }, [isPlus, navigation]);

  const handleApply = useCallback(async () => {
    // Free User trying to change to another card:
    if (!isPlus) {
      navigation.navigate('Pricing');
      return;
    }

    // Pro User: apply the selected card!
    if (selectedId && selectedId !== activeCardId) {
      await setActiveCardId(selectedId);
    }
    handleBack();
  }, [isPlus, selectedId, activeCardId, setActiveCardId, handleBack, navigation]);

  const sanitizedUserName = userName.trim() ? userName : undefined;

  return (
    <View style={styles.root}>
      {/* Top Header: Back Button ONLY */}
      <View style={[styles.navHeader, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          onPress={handleBack}
          hitSlop={16}
          accessibilityLabel="Back to dashboard"
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Main Scrollable Collections Area */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 95 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        {/* Editorial Title & Subtitle matching reference */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Make it yours.</Text>
          <Text style={styles.subTitle}>Colour, finish and style your card.</Text>
        </View>

        {/* Classic Collection in Vertical Showcase - No Blur */}
        {classicCategory && (
          <View style={styles.verticalClassicSection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>{classicCategory.title}</Text>
              <Text style={styles.categorySub}>{classicCategory.description}</Text>
            </View>
            <View style={styles.verticalCardList}>
              {classicCategory.cards.map((card) => {
                const isSelected = card.id === selectedId;
                const isApplied = card.id === activeCardId;
                return (
                  <View key={card.id} style={styles.verticalCardItem}>
                    <Pressable
                      onPress={() => handleSelect(card.id)}
                      style={({ pressed }) => [
                        styles.verticalCardTouchable,
                        isSelected && styles.verticalCardTouchableSelected,
                        pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
                      ]}
                    >
                      <FocusCard
                        orientation="landscape"
                        width={304}
                        height={192}
                        designId={card.id}
                        customDesign={card}
                        credits={credits}
                        cardholderName={sanitizedUserName}
                        isSelected={isSelected}
                        isApplied={isApplied}
                      />

                      {/* Prominent Floating Checkmark Badge when selected */}
                      {isSelected && (
                        <View style={styles.selectedBadgeFloating}>
                          <Ionicons name="checkmark" size={17} color="#000000" />
                        </View>
                      )}

                      {/* Current Card Indicator Pill */}
                      {isApplied && (
                        <View style={styles.currentBadgeFloating}>
                          <Text style={styles.currentBadgeText}>CURRENT</Text>
                        </View>
                      )}
                    </Pressable>

                    <Text
                      numberOfLines={1}
                      style={[
                        styles.verticalCardNameLabel,
                        isSelected && styles.verticalCardNameLabelSelected,
                      ]}
                    >
                      {card.name}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Persistent Bottom Action: "Choose this" */}
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
            {isCurrentlyApplied ? 'Current card' : `Choose this`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 6,
    zIndex: 10,
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
  scrollContent: {
    paddingTop: 8,
  },
  titleSection: {
    paddingHorizontal: 22,
    marginBottom: 28,
  },
  mainTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 32,
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  subTitle: {
    color: '#9CA3AF',
    fontFamily: fonts.regular,
    fontSize: 15,
    letterSpacing: -0.2,
  },
  categorySection: {
    marginBottom: 28,
  },
  categoryHeader: {
    paddingHorizontal: 22,
    marginBottom: 12,
  },
  categoryTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 18,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  categoryDesc: {
    color: '#71717A',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  horizontalRow: {
    paddingHorizontal: 22,
    gap: 14,
  },
  cardItemWrap: {
    alignItems: 'center',
    width: 204,
  },
  cardNameLabel: {
    color: '#A1A1AA',
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  cardNameLabelSelected: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
  },
  bottomActionContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 0,
    alignItems: 'center',
  },
  chooseBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  chooseBtnApplied: {
    backgroundColor: '#1E1E22',
    borderColor: '#2E2E34',
  },
  chooseBtnText: {
    color: '#000000',
    fontFamily: fonts.bold,
    fontSize: 15.5,
    letterSpacing: -0.2,
  },
  chooseBtnTextApplied: {
    color: '#9CA3AF',
  },
  // Vertical Classic Cards
  verticalClassicSection: {
    marginBottom: 20,
  },
  categorySub: {
    color: colors.gray,
    fontFamily: fonts.regular,
    fontSize: 13,
    marginTop: 2,
  },
  verticalCardList: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  verticalCardItem: {
    alignItems: 'center',
    marginBottom: 22,
  },
  verticalCardTouchable: {
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: 'transparent',
    padding: 3,
    position: 'relative',
  },
  verticalCardTouchableSelected: {
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  selectedBadgeFloating: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 10,
  },
  currentBadgeFloating: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    zIndex: 10,
  },
  currentBadgeText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  verticalCardNameLabel: {
    color: '#A1A1AA',
    fontFamily: fonts.medium,
    fontSize: 13,
    letterSpacing: -0.1,
    marginTop: 8,
    textAlign: 'center',
  },
  verticalCardNameLabelSelected: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 14,
  },
});

