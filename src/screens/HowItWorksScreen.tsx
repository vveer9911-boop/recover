import React, { useRef, useState } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fonts } from '../theme';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'HowItWorks'>;

interface SlideData {
  id: string;
  type: 'phone' | 'cards';
  image: any;
  caption?: string;
  bullets?: string[];
  activeDots: number;
  btnText: string;
}

const SLIDES: SlideData[] = [
  {
    id: '1',
    type: 'phone',
    image: require('../../assets/onboarding-phone-1.png'),
    caption: 'START A FOCUS SESSION AND EARN SCREEN TIME BY THE MINUTE.',
    activeDots: 1,
    btnText: 'Next',
  },
  {
    id: '2',
    type: 'phone',
    image: require('../../assets/onboarding-phone-2.png'),
    caption: 'PUT YOUR PHONE DOWN - MOTION DETECTION KEEPS YOU HONEST.',
    activeDots: 2,
    btnText: 'Next',
  },
  {
    id: '3',
    type: 'phone',
    image: require('../../assets/onboarding-phone-3.png'),
    caption: 'READY TO SCROLL? WITHDRAW TO UNLOCK YOUR APPS - ANYTIME.',
    activeDots: 3,
    btnText: 'Next',
  },
  {
    id: '4',
    type: 'cards',
    image: require('../../assets/onboarding-cards-fan.png'),
    bullets: [
      'Spending limits that stop you over-scrolling',
      'A visible cost that makes every minute count',
      'A balance you’ve earned — and won’t want to lose',
      'A growing record that proves you’re improving',
    ],
    activeDots: 4,
    btnText: 'Continue',
  },
];

const SKY_BG = require('../../assets/onboarding-sky-bg.png');

export default function HowItWorksScreen({ navigation }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isSmall = height < 700;

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    if (idx >= 0 && idx < SLIDES.length) {
      setCurrentIndex(idx);
    }
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIdx = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIdx, animated: true });
      setCurrentIndex(nextIdx);
    } else {
      // Transition to new Sign Up screen
      navigation.navigate('SignUp');
    }
  };

  const currentSlide = SLIDES[currentIndex] || SLIDES[0];

  return (
    <View style={styles.root}>
      {/* Pristine Clean Sky & Clouds Background */}
      <ImageBackground
        source={SKY_BG}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* Header Area with generous, even breathing space above */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) + (isSmall ? 16 : 26) }]}>
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>HOW IT WORKS</Text>
        </View>

        {currentIndex === 3 ? (
          <Text style={[styles.title, isSmall && { fontSize: 20, lineHeight: 25 }]}>
            Your <Text style={{ color: '#88D6FF' }}>Focus Card</Text> is how you pay for screen time.
          </Text>
        ) : (
          <Text style={[styles.title, isSmall && { fontSize: 20, lineHeight: 25 }]}>
            How Recover Helps You Overcome Social-Media Addiction
          </Text>
        )}
      </View>

      {/* Slide Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.slideContainer, { width }]}>
            {item.type === 'phone' ? (
              <>
                {/* Phone Mockup */}
                <View
                  style={[
                    styles.phoneWrap,
                    {
                      height: height * (isSmall ? 0.44 : 0.47),
                      marginTop: isSmall ? 6 : 14,
                    },
                  ]}
                >
                  <Image
                    source={item.image}
                    style={styles.phoneImage}
                    resizeMode="contain"
                  />
                </View>

                {/* Caption */}
                <Text
                  style={[
                    styles.caption,
                    isSmall && { fontSize: 13, lineHeight: 18, marginTop: 10 },
                  ]}
                >
                  {item.caption}
                </Text>
              </>
            ) : (
              /* Slide 4: Cards Fan + 4 Bullet Points */
              <View style={styles.slide4Wrap}>
                <View
                  style={[
                    styles.cardsFanWrap,
                    {
                      height: height * (isSmall ? 0.32 : 0.36),
                      marginTop: isSmall ? 4 : 10,
                    },
                  ]}
                >
                  <Image
                    source={item.image}
                    style={styles.cardsFanImage}
                    resizeMode="contain"
                  />
                </View>

                {/* 4 Bullet Points */}
                <View style={[styles.bulletsList, isSmall && { marginTop: 8 }]}>
                  {item.bullets?.map((bullet: string, idx: number) => (
                    <View key={idx} style={styles.bulletRow}>
                      <View style={styles.bulletDot} />
                      <Text style={[styles.bulletText, isSmall && { fontSize: 12.5, lineHeight: 17 }]}>
                        {bullet}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      />

      {/* Bottom Area: Pagination Dots & Next/Continue Button */}
      <View
        style={[
          styles.bottomArea,
          {
            paddingBottom: Math.max(insets.bottom, 16) + (isSmall ? 8 : 16),
          },
        ]}
      >
        {/* 4 Pagination Indicators */}
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((dotIdx) => {
            const isFilled = dotIdx < currentSlide.activeDots;
            return (
              <View
                key={dotIdx}
                style={[
                  styles.dot,
                  isFilled ? styles.dotActive : styles.dotInactive,
                ]}
              />
            );
          })}
        </View>

        {/* Primary Action Button */}
        <Pressable
          style={({ pressed }) => [
            styles.nextBtn,
            pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
          ]}
          onPress={handleNext}
        >
          <Text style={styles.nextBtnText}>{currentSlide.btnText}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#2B9BEF',
  },
  header: {
    paddingHorizontal: 22,
    zIndex: 10,
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 13,
    paddingVertical: 5.5,
    borderRadius: 999,
  },
  badgeText: {
    color: '#374151',
    fontFamily: fonts.bold,
    fontSize: 11.5,
    letterSpacing: 0.6,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 23,
    lineHeight: 28,
    letterSpacing: -0.4,
    marginTop: 10,
  },
  slideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  phoneWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneImage: {
    width: '100%',
    height: '100%',
  },
  caption: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
    letterSpacing: 0.2,
  },
  slide4Wrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardsFanWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardsFanImage: {
    width: '100%',
    height: '100%',
  },
  bulletsList: {
    width: '100%',
    paddingHorizontal: 12,
    marginTop: 18,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 9,
  },
  bulletDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 3.5,
    backgroundColor: '#FFFFFF',
    marginTop: 6,
    marginRight: 11,
  },
  bulletText: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: fonts.medium,
    fontSize: 13.5,
    lineHeight: 18.5,
    letterSpacing: 0.1,
  },
  bottomArea: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  dot: {
    width: 24,
    height: 5,
    borderRadius: 3,
    marginHorizontal: 3.5,
  },
  dotActive: {
    backgroundColor: '#FF007F', // vibrant magenta matching reference
  },
  dotInactive: {
    backgroundColor: 'rgba(120, 140, 160, 0.55)',
  },
  nextBtn: {
    backgroundColor: '#000000',
    width: '100%',
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
