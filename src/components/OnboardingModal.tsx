import React, { useState, useEffect } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  Platform,
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShieldLock } from './Icons';
import { NameAvatarGraphic } from './NameAvatarGraphic';
import AppPickerModal from './AppPickerModal';
import { BRAND_NAME, colors, fonts, radii } from '../theme';
import { useApp } from '../context/AppContext';

const DISTRACTING_IMG = require('../../assets/onboarding-distracting.png');
const AR_IMG = require('../../assets/onboarding-ar.png');

type Props = {
  visible: boolean;
  onClose: (name?: string) => void;
};

type PermissionDialogType = 'screenTime' | 'accessibility' | 'arCamera' | null;

export default function OnboardingModal({ visible, onClose }: Props) {
  // Exact 3 bottom slides in original order:
  // 1: Distracting Apps & Screen Time
  // 2: AR Mode
  // 3: What's your name?
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [userName, setUserName] = useState('');
  const [nameError, setNameError] = useState('');
  const [showReadMore, setShowReadMore] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<PermissionDialogType>(null);
  const [showAppPicker, setShowAppPicker] = useState(false);
  const [prevVisible, setPrevVisible] = useState(visible);

  const { distractingApps } = useApp();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  if (prevVisible !== visible) {
    setPrevVisible(visible);
    if (visible) {
      setStep(1);
      setActiveDialog(null);
      setNameError('');
      setShowReadMore(false);
      setShowAppPicker(false);
    }
  }

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setIsKeyboardOpen(true);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setIsKeyboardOpen(false);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleAllowScreenTime = () => {
    // Prompt 1: Screen Time access
    setActiveDialog('screenTime');
  };

  const handleScreenTimeAllow = () => {
    // Prompt 2: Accessibility Blocker with detailed Android note
    setActiveDialog(null);
    setTimeout(() => {
      setActiveDialog('accessibility');
    }, 200);
  };

  const handleAccessibilityAllow = () => {
    setActiveDialog(null);
    setTimeout(() => {
      setStep(2);
    }, 200);
  };

  const handleArNext = () => {
    // Prompt 3: Camera permission for AR Mode
    setActiveDialog('arCamera');
  };

  const handleCameraAllow = () => {
    setActiveDialog(null);
    setTimeout(() => {
      setStep(3);
    }, 200);
  };

  const handleFinish = () => {
    if (!userName.trim()) {
      setNameError('Please enter your name to continue.');
      return;
    }
    setNameError('');
    Keyboard.dismiss();
    onClose(userName.trim());
    setStep(1);
  };

  if (!visible) return null;

  const bottomOffset = isKeyboardOpen
    ? (Platform.OS === 'ios' ? keyboardHeight + 8 : 12)
    : Math.max(insets.bottom, 16) + 10;

  return (
    <View style={styles.overlay}>
      <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFill} />
      <Pressable
        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.40)' }]}
        onPress={isKeyboardOpen ? Keyboard.dismiss : undefined}
      />

      <View
        style={[
          styles.card,
          {
            marginBottom: bottomOffset,
            paddingBottom: isKeyboardOpen ? 18 : 22,
            paddingTop: isKeyboardOpen ? 18 : 24,
          },
        ]}
      >
        {/* SLIDE 1: DISTRACTING APPS */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <View style={styles.imageBox}>
              <Image source={DISTRACTING_IMG} style={styles.imgDistracting} resizeMode="contain" />
            </View>

            <Text style={styles.title}>Select distracting apps{'\n'}for your card to block</Text>
            <Text style={styles.subtitle}>
              {BRAND_NAME} needs Screen Time access to block and unblock your apps. Without it, withdrawals can&apos;t operate.
            </Text>

            {/* Shield Info Box */}
            <View style={styles.infoBox}>
              <View style={styles.shieldIcon}>
                <ShieldLock size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.infoText}>
                Your Screen Time data stays on your device, protected by Apple. {BRAND_NAME} cannot see which apps you use or how long you use them.
              </Text>
            </View>

            <Pressable onPress={handleAllowScreenTime} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>Allow Screen Time</Text>
            </Pressable>

            {/* Choose apps shortcut button */}
            <Pressable
              onPress={() => setShowAppPicker(true)}
              style={styles.chooseAppsLink}
              hitSlop={8}
            >
              <Feather name="layers" size={13} color="#A1A1AA" style={{ marginRight: 5 }} />
              <Text style={styles.chooseAppsLinkText}>
                Choose blocked apps ({distractingApps?.length || 2} selected)
              </Text>
            </Pressable>
          </View>
        )}

        {/* SLIDE 2: AR MODE */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <View style={styles.imageBox}>
              <Image source={AR_IMG} style={styles.imgAr} resizeMode="contain" />
            </View>

            <Text style={styles.title}>Meet AR Mode</Text>
            <Text style={styles.subtitle}>
              Place your phone in a virtual box to stay distraction-free.
            </Text>

            <Pressable
              onPress={() => setShowReadMore(!showReadMore)}
              style={styles.readMorePill}
            >
              <Text style={styles.readMoreText}>Read more</Text>
              <Feather
                name={showReadMore ? 'chevron-up' : 'chevron-down'}
                size={14}
                color="#FFFFFF"
                style={{ marginLeft: 5 }}
              />
            </Pressable>

            {showReadMore && (
              <Text style={styles.expandedText}>
                AR Mode monitors your device&apos;s placement in real-time. If the phone is lifted during an active focus session, your card is automatically paused.
              </Text>
            )}

            <View style={styles.infoBox}>
              <View style={styles.cameraIconWrap}>
                <Ionicons name="camera" size={17} color="#000000" />
              </View>
              <Text style={styles.cameraInfoText}>
                Uses your camera only on your device.
              </Text>
            </View>

            <Pressable onPress={handleArNext} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>Next</Text>
            </Pressable>
          </View>
        )}

        {/* SLIDE 3: WHAT'S YOUR NAME */}
        {step === 3 && (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.stepContent}>
              {!isKeyboardOpen ? (
                <View style={styles.imageBox}>
                  <NameAvatarGraphic size={200} name={userName} />
                </View>
              ) : (
                <View style={styles.compactHeader}>
                  <Feather name="user" size={24} color="#FFFFFF" />
                </View>
              )}

              <Text style={[styles.title, isKeyboardOpen && styles.titleCompact]}>
                What&apos;s your name?
              </Text>
              {!isKeyboardOpen && (
                <Text style={styles.subtitle}>Let&apos;s personalize your experience.</Text>
              )}

              <View
                style={[
                  styles.inputContainer,
                  isKeyboardOpen && { marginTop: 14 },
                  !!nameError && styles.inputErrorBorder,
                ]}
              >
                <Feather
                  name="user"
                  size={18}
                  color={nameError ? '#FF453A' : '#8E8E93'}
                  style={{ marginRight: 12 }}
                />
                <TextInput
                  value={userName}
                  onChangeText={(text) => {
                    setUserName(text);
                    if (nameError) setNameError('');
                  }}
                  placeholder="Your name"
                  placeholderTextColor="#5C5C62"
                  style={styles.textInput}
                  selectionColor="#FFFFFF"
                  cursorColor="#FFFFFF"
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleFinish}
                />
              </View>

              {!!nameError && (
                <Text style={styles.errorText}>{nameError}</Text>
              )}

              <Pressable
                onPress={handleFinish}
                style={[styles.actionBtn, isKeyboardOpen && { marginTop: 14 }]}
              >
                <Text style={styles.actionBtnText}>Next</Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>

      {/* DUMMY SYSTEM PERMISSION DIALOGS (Screen Time -> Accessibility -> AR Camera) */}
      {activeDialog && (
        <View style={styles.dialogBackdrop}>
          <View style={[styles.systemAlert, activeDialog === 'accessibility' && styles.systemAlertLarge]}>
            <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(30,30,34,0.95)' }]} />

            {/* 1. SCREEN TIME PROMPT */}
            {activeDialog === 'screenTime' && (
              <>
                <View style={styles.alertBody}>
                  <Text style={styles.alertTitle}>“{BRAND_NAME}” Would Like to Access Screen Time</Text>
                  <Text style={styles.alertMessage}>
                    Screen Time access is required to lock distracting apps and track focus sessions.
                  </Text>
                </View>
                <View style={styles.alertButtons}>
                  <Pressable style={styles.alertBtn} onPress={handleScreenTimeAllow}>
                    <Text style={styles.alertBtnTextNormal}>Don’t Allow</Text>
                  </Pressable>
                  <Pressable style={[styles.alertBtn, styles.alertBtnBorderLeft]} onPress={handleScreenTimeAllow}>
                    <Text style={styles.alertBtnTextBold}>Continue</Text>
                  </Pressable>
                </View>
              </>
            )}

            {/* 2. ACCESSIBILITY PROMPT WITH DETAILED IMPORTANT NOTE */}
            {activeDialog === 'accessibility' && (
              <>
                <ScrollView
                  style={styles.alertScroll}
                  contentContainerStyle={styles.alertScrollContent}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                  bounces={true}
                  alwaysBounceVertical={true}
                  overScrollMode="always"
                  keyboardShouldPersistTaps="handled"
                >
                  <Text style={styles.alertTitle}>Enable Accessibility Service</Text>
                  <Text style={styles.alertMessage}>
                    Accessibility access is required to detect and block distracting apps during active focus sessions.
                  </Text>

                  {/* DETAILED IMPORTANT NOTE CALLOUT */}
                  <View style={styles.noteCallout}>
                    <View style={styles.noteHeader}>
                      <Ionicons name="warning" size={16} color="#FF9F0A" style={{ marginRight: 6 }} />
                      <Text style={styles.noteTitle}>IMPORTANT NOTE FOR ANDROID USERS</Text>
                    </View>

                    <Text style={styles.noteWarningText}>
                      Do not do this unless you first try to turn on Accessibility and see a warning!{'\n'}
                      (The 3 dots will not appear in settings until you try to turn it on at least once!)
                    </Text>

                    <Text style={styles.noteSubhead}>
                      If Android shows &ldquo;Restricted setting: For your security, this setting is currently unavailable&rdquo;, follow these exact steps:
                    </Text>

                    <View style={styles.stepItem}>
                      <Text style={styles.stepNum}>1.</Text>
                      <Text style={styles.stepText}><Text style={styles.stepBold}>Close the Settings app completely</Text> (swipe it away from your recent apps).</Text>
                    </View>
                    <View style={styles.stepItem}>
                      <Text style={styles.stepNum}>2.</Text>
                      <Text style={styles.stepText}><Text style={styles.stepBold}>Reopen Settings</Text> on your phone.</Text>
                    </View>
                    <View style={styles.stepItem}>
                      <Text style={styles.stepNum}>3.</Text>
                      <Text style={styles.stepText}>Tap <Text style={styles.stepBold}>Apps</Text> (or App info).</Text>
                    </View>
                    <View style={styles.stepItem}>
                      <Text style={styles.stepNum}>4.</Text>
                      <Text style={styles.stepText}>Look for and tap <Text style={styles.stepBold}>{BRAND_NAME}</Text>.</Text>
                    </View>
                    <View style={styles.stepItem}>
                      <Text style={styles.stepNum}>5.</Text>
                      <Text style={styles.stepText}>Tap the <Text style={styles.stepBold}>3 dots (⋮)</Text> in the top-right corner.</Text>
                    </View>
                    <View style={styles.stepItem}>
                      <Text style={styles.stepNum}>6.</Text>
                      <Text style={styles.stepText}>Tap <Text style={styles.stepBold}>&ldquo;Allow restricted settings&rdquo;</Text> (confirm with your fingerprint or PIN).</Text>
                    </View>
                    <View style={styles.stepItem}>
                      <Text style={styles.stepNum}>7.</Text>
                      <Text style={styles.stepText}>Now go back to <Text style={styles.stepBold}>Settings → Accessibility</Text> and turn on {BRAND_NAME}.</Text>
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.alertButtons}>
                  <Pressable style={styles.alertBtn} onPress={handleAccessibilityAllow}>
                    <Text style={styles.alertBtnTextNormal}>Cancel</Text>
                  </Pressable>
                  <Pressable style={[styles.alertBtn, styles.alertBtnBorderLeft]} onPress={handleAccessibilityAllow}>
                    <Text style={styles.alertBtnTextBold}>Continue</Text>
                  </Pressable>
                </View>
              </>
            )}

            {/* 3. AR CAMERA PROMPT */}
            {activeDialog === 'arCamera' && (
              <>
                <View style={styles.alertBody}>
                  <Text style={styles.alertTitle}>“{BRAND_NAME}” Would Like to Access the Camera</Text>
                  <Text style={styles.alertMessage}>
                    Camera access is required for AR Mode to place and track your phone in the virtual box.
                  </Text>
                </View>
                <View style={styles.alertButtons}>
                  <Pressable style={styles.alertBtn} onPress={handleCameraAllow}>
                    <Text style={styles.alertBtnTextNormal}>Don’t Allow</Text>
                  </Pressable>
                  <Pressable style={[styles.alertBtn, styles.alertBtnBorderLeft]} onPress={handleCameraAllow}>
                    <Text style={styles.alertBtnTextBold}>OK</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      )}

      {/* APPPICKER MODAL */}
      <AppPickerModal
        visible={showAppPicker}
        onClose={() => setShowAppPicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 12,
    zIndex: 9999,
  },
  card: {
    width: '100%',
    backgroundColor: '#161618',
    borderRadius: 36,
    borderWidth: 1,
    borderColor: '#242428',
    paddingHorizontal: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.7,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: -4 },
  },
  stepContent: {
    alignItems: 'center',
    width: '100%',
  },
  imageBox: {
    height: 175,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactHeader: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#222226',
    borderWidth: 1,
    borderColor: '#303036',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  imgDistracting: {
    width: 280,
    height: 170,
  },
  imgAr: {
    width: 320,
    height: 165,
  },
  title: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 29,
    textAlign: 'center',
    marginTop: 14,
    letterSpacing: -0.4,
  },
  titleCompact: {
    fontSize: 20,
    lineHeight: 25,
    marginTop: 4,
  },
  subtitle: {
    color: '#8E8E93',
    fontFamily: fonts.regular,
    fontSize: 14.5,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 10,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F23',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 18,
    width: '100%',
    borderWidth: 1,
    borderColor: '#26262B',
  },
  shieldIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    color: '#8E8E93',
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16.5,
  },
  readMorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E22',
    borderWidth: 1,
    borderColor: '#303036',
    borderRadius: radii.pill,
    height: 36,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  readMoreText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 13.5,
  },
  expandedText: {
    color: '#A1A1A6',
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 14,
  },
  cameraIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cameraInfoText: {
    flex: 1,
    color: '#8E8E93',
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E22',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#323238',
    height: 54,
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 18,
  },
  inputErrorBorder: {
    borderColor: '#FF453A',
    backgroundColor: 'rgba(255,69,58,0.06)',
  },
  errorText: {
    color: '#FF453A',
    fontFamily: fonts.medium,
    fontSize: 13,
    marginTop: 8,
    alignSelf: 'flex-start',
    marginLeft: 6,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: fonts.medium,
    fontSize: 16,
  },
  actionBtn: {
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  actionBtnText: {
    color: '#000000',
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  chooseAppsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 6,
  },
  chooseAppsLinkText: {
    color: '#8E8E93',
    fontFamily: fonts.medium,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  // SYSTEM PERMISSION DIALOG STYLES
  dialogBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.40)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
    paddingHorizontal: 20,
  },
  systemAlert: {
    width: 280,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOpacity: 0.65,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
  },
  systemAlertLarge: {
    width: '92%',
    maxWidth: 350,
    height: '78%',
    maxHeight: 560,
  },
  alertBody: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
    alignItems: 'center',
  },
  alertScroll: {
    flex: 1,
  },
  alertScrollContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
    alignItems: 'center',
  },
  alertTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 17,
    lineHeight: 22,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  alertMessage: {
    color: '#D1D1D6',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
  },
  noteCallout: {
    width: '100%',
    backgroundColor: 'rgba(255,159,10,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,159,10,0.3)',
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  noteTitle: {
    color: '#FF9F0A',
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  noteWarningText: {
    color: '#FFD60A',
    fontFamily: fonts.medium,
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 8,
  },
  noteSubhead: {
    color: '#C7C7CC',
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 8,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  stepNum: {
    color: '#FF9F0A',
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    width: 16,
  },
  stepText: {
    flex: 1,
    color: '#E5E5EA',
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 16,
  },
  stepBold: {
    fontFamily: fonts.semibold,
    color: '#FFFFFF',
  },
  alertButtons: {
    flexDirection: 'row',
    height: 44,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.18)',
  },
  alertBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertBtnBorderLeft: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: 'rgba(255,255,255,0.18)',
  },
  alertBtnTextNormal: {
    color: '#0A84FF',
    fontFamily: fonts.regular,
    fontSize: 17,
  },
  alertBtnTextBold: {
    color: '#0A84FF',
    fontFamily: fonts.semibold,
    fontSize: 17,
  },
});
