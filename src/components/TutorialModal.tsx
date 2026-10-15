import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { fonts, radii } from '../theme';

interface TutorialModalProps {
  visible: boolean;
  onClose: () => void;
}

interface StepData {
  stepNum: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  arrowDir: 'down' | 'up';
  buttonLabel: string;
  getSpotlightCoords: (w: number, h: number, insetsBottom: number, insetsTop: number) => {
    x: number;
    y: number;
    size: number;
  };
  getTextCoords: (w: number, h: number, insetsBottom: number, insetsTop: number) => {
    top?: number;
    bottom?: number;
  };
}

export default function TutorialModal({ visible, onClose }: TutorialModalProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [currentStep, setCurrentStep] = useState(0);
  const [isExpanding, setIsExpanding] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const expandAnim = useRef(new Animated.Value(1)).current;
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const overlayFadeAnim = useRef(new Animated.Value(1)).current;
  const stepTransitionAnim = useRef(new Animated.Value(1)).current;
  const arrowBounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      setIsExpanding(false);
      setShowCompleted(false);
      expandAnim.setValue(1);
      contentFadeAnim.setValue(0);
      overlayFadeAnim.setValue(1);
      stepTransitionAnim.setValue(1);

      // Start continuous gentle arrow bounce
      const bounceLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(arrowBounceAnim, {
            toValue: 8,
            duration: 650,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(arrowBounceAnim, {
            toValue: 0,
            duration: 650,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      bounceLoop.start();

      return () => {
        bounceLoop.stop();
      };
    }
  }, [visible]);

  const steps: StepData[] = [
    // 1. Focus Session Starter ("Add funds" button at bottom)
    {
      stepNum: 1,
      totalSteps: 5,
      title: 'Start a focus session',
      subtitle: 'Lock distracting apps and start a focus session to earn credits for your card.',
      arrowDir: 'down',
      buttonLabel: 'Focus Starter',
      getSpotlightCoords: (w, h, insetsB) => ({
        x: w / 2,
        y: h - insetsB - 105,
        size: 96,
      }),
      getTextCoords: (w, h, insetsB) => ({
        bottom: insetsB + 210,
      }),
    },
    // 2. Withdraw
    {
      stepNum: 2,
      totalSteps: 5,
      title: 'Withdraw your focus',
      subtitle: 'Spend earned credits to temporarily unblock apps for a controlled break.',
      arrowDir: 'up',
      buttonLabel: 'Withdraw',
      getSpotlightCoords: (w, h, insetsB, insetsT) => ({
        x: w * 0.50,
        y: insetsT + 378,
        size: 78,
      }),
      getTextCoords: (w, h, insetsB, insetsT) => ({
        top: insetsT + 470,
      }),
    },
    // 3. Transactions
    {
      stepNum: 3,
      totalSteps: 5,
      title: 'View transactions',
      subtitle: 'Review your complete history of earned focus credits and unlocked sessions.',
      arrowDir: 'up',
      buttonLabel: 'Transactions',
      getSpotlightCoords: (w, h, insetsB, insetsT) => ({
        x: w * 0.20,
        y: insetsT + 378,
        size: 78,
      }),
      getTextCoords: (w, h, insetsB, insetsT) => ({
        top: insetsT + 470,
      }),
    },
    // 4. Analytics
    {
      stepNum: 4,
      totalSteps: 5,
      title: 'Detailed analytics',
      subtitle: 'Track your focus time, student peak study hours, and weekly consistency trends.',
      arrowDir: 'up',
      buttonLabel: 'Analytics',
      getSpotlightCoords: (w, h, insetsB, insetsT) => ({
        x: w * 0.80,
        y: insetsT + 378,
        size: 78,
      }),
      getTextCoords: (w, h, insetsB, insetsT) => ({
        top: insetsT + 470,
      }),
    },
    // 5. Edit Widgets
    {
      stepNum: 5,
      totalSteps: 5,
      title: 'Customize widgets',
      subtitle: 'Personalize your dashboard with modular focus trackers, streak widgets, and cards.',
      arrowDir: 'down',
      buttonLabel: 'Edit widgets',
      getSpotlightCoords: (w, h, insetsB, insetsT) => ({
        x: w / 2,
        y: insetsT + 655,
        size: 88,
      }),
      getTextCoords: (w, h, insetsB, insetsT) => ({
        top: insetsT + 400,
      }),
    },
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      Animated.sequence([
        Animated.timing(stepTransitionAnim, {
          toValue: 0.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(stepTransitionAnim, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
      setCurrentStep((prev) => prev + 1);
    } else {
      // LAST STEP: Animate white spotlight expanding to fill screen
      handleFinishExpansion();
    }
  };

  const handleFinishExpansion = () => {
    setIsExpanding(true);

    // Smooth white flash animation: expand white spot over the screen, then immediately fade back to dashboard!
    Animated.timing(expandAnim, {
      toValue: 45,
      duration: 550,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: true,
    }).start(() => {
      // Smoothly fade out the white flash, dissolving directly into the dashboard (no text, no completed screen)
      Animated.timing(overlayFadeAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        onClose();
      });
    });
  };

  if (!visible) return null;

  const spotlight = currentStepData.getSpotlightCoords(width, height, insets.bottom, insets.top);
  const textPos = currentStepData.getTextCoords(width, height, insets.bottom, insets.top);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Animated.View style={[styles.root, { opacity: overlayFadeAnim }]}>
        {/* Darkened background */}
        <View style={styles.darkDimmer} />

        {/* Top Header bar with Skip button */}
        {!isExpanding && (
          <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
            <Text style={styles.topLogo}>recover</Text>
            <Pressable
              style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.6 }]}
              onPress={onClose}
              hitSlop={14}
            >
              <Text style={styles.skipBtnText}>Skip</Text>
            </Pressable>
          </View>
        )}

        {/* INSTRUCTION TEXT CALLOUT (Matching Reference Image) */}
        {!isExpanding && (
          <Animated.View
            style={[
              styles.calloutCard,
              textPos.top !== undefined ? { top: textPos.top } : { bottom: textPos.bottom },
              { opacity: stepTransitionAnim },
            ]}
          >
            <Text style={styles.stepCounter}>
              {currentStepData.stepNum} of {currentStepData.totalSteps}
            </Text>

            <Text style={styles.calloutTitle}>{currentStepData.title}</Text>

            <View style={styles.subtitleRow}>
              {/* Directional Arrow matching reference image */}
              <View style={styles.inlineArrowWrap}>
                {currentStepData.arrowDir === 'down' ? (
                  <Feather name="arrow-down" size={17} color="#FFFFFF" />
                ) : (
                  <Feather name="arrow-up" size={17} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.calloutSubtitle}>{currentStepData.subtitle}</Text>
            </View>

            {/* Next / Finish Button */}
            <View style={styles.actionRow}>
              <View style={{ flex: 1 }} />
              <Pressable
                style={({ pressed }) => [
                  styles.nextBtn,
                  pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                ]}
                onPress={handleNext}
                hitSlop={12}
              >
                <Text style={styles.nextBtnText}>
                  {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                </Text>
                <Feather
                  name={currentStep === steps.length - 1 ? 'check' : 'arrow-right'}
                  size={16}
                  color="#000000"
                  style={{ marginLeft: 6 }}
                />
              </Pressable>
            </View>
          </Animated.View>
        )}

        {/* BOUNCING ARROW MARK POINTING TO THAT EXACT PLACE (NO ICONS INSIDE SPOTLIGHT) */}
        {!isExpanding && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.targetArrowContainer,
              currentStepData.arrowDir === 'down'
                ? {
                    left: spotlight.x - 20,
                    top: spotlight.y - spotlight.size / 2 - 46,
                    transform: [{ translateY: arrowBounceAnim }],
                  }
                : {
                    left: spotlight.x - 20,
                    top: spotlight.y + spotlight.size / 2 + 10,
                    transform: [
                      {
                        translateY: arrowBounceAnim.interpolate({
                          inputRange: [0, 8],
                          outputRange: [0, -8],
                        }),
                      },
                    ],
                  },
            ]}
          >
            <View style={styles.arrowGlowPill}>
              {currentStepData.arrowDir === 'down' ? (
                <Ionicons name="arrow-down-sharp" size={32} color="#FFFFFF" />
              ) : (
                <Ionicons name="arrow-up-sharp" size={32} color="#FFFFFF" />
              )}
            </View>
          </Animated.View>
        )}

        {/* SPOTLIGHT DISC OVER THE EXACT PLACE (NO ICONS INSIDE - CLEAN RING CUTOUT) */}
        <Animated.View
          pointerEvents={isExpanding ? 'none' : 'auto'}
          style={[
            styles.spotlightWrap,
            {
              left: spotlight.x - spotlight.size / 2,
              top: spotlight.y - spotlight.size / 2,
              width: spotlight.size,
              height: spotlight.size,
              borderRadius: spotlight.size / 2,
              transform: [{ scale: expandAnim }],
            },
          ]}
        >
          <View
            style={[
              isExpanding ? styles.expandingSolidDisc : styles.spotlightDisc,
              {
                width: spotlight.size,
                height: spotlight.size,
                borderRadius: spotlight.size / 2,
              },
            ]}
          />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  darkDimmer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    zIndex: 10,
  },
  topLogo: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 18,
    letterSpacing: -0.4,
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  skipBtnText: {
    color: '#E4E4E7',
    fontFamily: fonts.medium,
    fontSize: 13.5,
  },
  // INSTRUCTION CALLOUT CARD
  calloutCard: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 20,
    paddingHorizontal: 10,
  },
  stepCounter: {
    color: '#A1A1AA',
    fontFamily: fonts.semibold,
    fontSize: 14,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  calloutTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 27,
    lineHeight: 33,
    letterSpacing: -0.6,
    marginBottom: 10,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  inlineArrowWrap: {
    marginRight: 8,
    marginTop: 2,
  },
  calloutSubtitle: {
    flex: 1,
    color: '#D4D4D8',
    fontFamily: fonts.regular,
    fontSize: 14.5,
    lineHeight: 20.5,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: radii.pill,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  nextBtnText: {
    color: '#000000',
    fontFamily: fonts.bold,
    fontSize: 15.5,
    letterSpacing: -0.2,
  },
  // PROMINENT ARROW MARK POINTING TO TARGET
  targetArrowContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
    width: 40,
    height: 40,
  },
  arrowGlowPill: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  // SPOTLIGHT DISC: NO ICONS INSIDE - CLEAN RING HIGHLIGHTING THAT EXACT PLACE
  spotlightWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
  },
  spotlightDisc: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.85,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  expandingSolidDisc: {
    backgroundColor: '#FFFFFF',
  },
  // COMPLETED OVERLAY (ON WHITE BACKGROUND)
  completedOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
    paddingHorizontal: 24,
  },
  completedContent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  checkBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  completedTitle: {
    color: '#000000',
    fontFamily: fonts.bold,
    fontSize: 34,
    letterSpacing: -0.8,
    textAlign: 'center',
    marginBottom: 10,
  },
  completedSubtitle: {
    color: '#52525B',
    fontFamily: fonts.medium,
    fontSize: 15.5,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  backToDashboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    height: 54,
    width: '100%',
    borderRadius: radii.pill,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  backToDashboardText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 16,
    letterSpacing: -0.2,
  },
});
