import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { fonts } from '../theme';
import { useApp } from '../context/AppContext';

const PRESETS = [
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '1h', minutes: 60 },
  { label: '2h', minutes: 120 },
  { label: '4h', minutes: 240 },
];

export default function WithdrawScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const {
    credits,
    withdrawCredits,
    isCalmDownActive,
    calmDownHours,
    endCalmDown,
    emergencyAdsWatched,
    watchEmergencyAd,
  } = useApp();

  const [inputMinutes, setInputMinutes] = useState<number>(15);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [calmDownTriggered, setCalmDownTriggered] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Emergency Ad States
  const [showEmergencyAdPrompt, setShowEmergencyAdPrompt] = useState(false);
  const [showEmergencyLimitAlert, setShowEmergencyLimitAlert] = useState(false);
  const [isPlayingAd, setIsPlayingAd] = useState(false);
  const [adSecondsRemaining, setAdSecondsRemaining] = useState(30);
  const [showRewardToast, setShowRewardToast] = useState(false);

  // Ad 30-Second Countdown Timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isPlayingAd && adSecondsRemaining > 0) {
      timer = setInterval(() => {
        setAdSecondsRemaining((prev) => {
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlayingAd, adSecondsRemaining]);

  const handleFinishAd = () => {
    setIsPlayingAd(false);
    const res = watchEmergencyAd();
    if (res.success) {
      setErrorMessage(null);
      setShowRewardToast(true);
      setTimeout(() => {
        setShowRewardToast(false);
      }, 4000);
    }
  };

  const handleKeyPress = (digit: string) => {
    setErrorMessage(null);
    setInputMinutes((prev) => {
      const currentStr = prev === 0 ? '' : prev.toString();
      if (currentStr.length >= 4) return prev; // max 4 digits
      const nextStr = currentStr + digit;
      const num = parseInt(nextStr, 10);
      return isNaN(num) ? 0 : num;
    });
  };

  const handleBackspace = () => {
    setErrorMessage(null);
    setInputMinutes((prev) => {
      const str = prev.toString();
      if (str.length <= 1) return 0;
      const nextStr = str.slice(0, -1);
      return parseInt(nextStr, 10) || 0;
    });
  };

  const handleSelectPreset = (minutes: number) => {
    setErrorMessage(null);
    setInputMinutes(minutes);
  };

  const handleWithdraw = () => {
    if (isCalmDownActive) {
      setErrorMessage(
        `Calm Down is currently active (${calmDownHours}h cooldown). Take a break before unlocking more time!`
      );
      return;
    }

    // When user has 0 credits and tries to withdraw: show emergency ad prompt
    if (credits <= 0) {
      if (emergencyAdsWatched >= 3) {
        setShowEmergencyLimitAlert(true);
      } else {
        setShowEmergencyAdPrompt(true);
      }
      return;
    }

    if (inputMinutes <= 0) {
      setErrorMessage('Please enter an amount greater than 0.');
      return;
    }

    if (inputMinutes > credits) {
      setErrorMessage(
        `Insufficient credits. You have ${credits} credits, but tried to withdraw ${inputMinutes}m.`
      );
      return;
    }

    const result = withdrawCredits(inputMinutes);
    if (result.success) {
      setCalmDownTriggered(!!result.calmDownTriggered);
      setSuccessModalVisible(true);
    } else {
      setErrorMessage(result.message || 'Withdrawal failed.');
    }
  };

  const handleSuccessDone = () => {
    setSuccessModalVisible(false);
    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* Top Navigation Bar */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={({ pressed }) => [styles.circleCloseBtn, pressed && { opacity: 0.7 }]}
          onPress={() => navigation.goBack()}
          hitSlop={12}
        >
          <Ionicons name="chevron-down" size={20} color="#111827" />
        </Pressable>

        <Text style={styles.headerTitle}>Withdraw</Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* If Calm Down is currently active */}
      {isCalmDownActive && (
        <View style={styles.calmDownBanner}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="hourglass" size={14} color="#B45309" style={{ marginRight: 5 }} />
              <Text style={styles.calmDownBannerTitle}>Calm Down Active ({calmDownHours}h)</Text>
            </View>
            <Text style={styles.calmDownBannerSub}>
              Calm down mode active. Cooldown active to help you reset.
            </Text>
          </View>
          <Pressable
            style={styles.bypassBtn}
            onPress={endCalmDown}
          >
            <Text style={styles.bypassBtnText}>End (Test)</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.body}>
        {/* Main Value Display: 15 min */}
        <View style={styles.displaySection}>
          <View style={styles.valueRow}>
            <Text style={styles.valueNumber}>{inputMinutes}</Text>
            <Text style={styles.valueUnit}>min</Text>
          </View>

          {/* Subtitle Badge: ⚡ 15 credits (1 credit = 1 min) */}
          <View style={styles.creditsBadgeRow}>
            <View style={styles.lightningCircle}>
              <Ionicons name="flash-outline" size={11} color="#8E95A5" />
            </View>
            <Text style={styles.creditsBadgeText}>
              {inputMinutes} credits
            </Text>
          </View>

          {/* Available balance indicator */}
          <Text style={styles.availableBalanceText}>
            Available balance: <Text style={styles.boldDark}>{credits} credits</Text>
          </Text>

          {/* Error message banner */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}
        </View>

        {/* Quick Presets: 15m, 30m, 1h, 2h, 4h */}
        <View style={styles.presetsRow}>
          {PRESETS.map((p) => {
            const isSelected = inputMinutes === p.minutes;
            return (
              <Pressable
                key={p.label}
                style={({ pressed }) => [
                  styles.presetPill,
                  isSelected && styles.presetPillActive,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => handleSelectPreset(p.minutes)}
              >
                <Text
                  style={[
                    styles.presetLabel,
                    isSelected && styles.presetLabelActive,
                  ]}
                >
                  {p.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Numeric Keypad */}
        <View style={styles.keypadContainer}>
          <View style={styles.keypadRow}>
            <KeypadButton digit="1" onPress={() => handleKeyPress('1')} />
            <KeypadButton digit="2" onPress={() => handleKeyPress('2')} />
            <KeypadButton digit="3" onPress={() => handleKeyPress('3')} />
          </View>
          <View style={styles.keypadRow}>
            <KeypadButton digit="4" onPress={() => handleKeyPress('4')} />
            <KeypadButton digit="5" onPress={() => handleKeyPress('5')} />
            <KeypadButton digit="6" onPress={() => handleKeyPress('6')} />
          </View>
          <View style={styles.keypadRow}>
            <KeypadButton digit="7" onPress={() => handleKeyPress('7')} />
            <KeypadButton digit="8" onPress={() => handleKeyPress('8')} />
            <KeypadButton digit="9" onPress={() => handleKeyPress('9')} />
          </View>
          <View style={styles.keypadRow}>
            <View style={styles.keypadBtn} />
            <KeypadButton digit="0" onPress={() => handleKeyPress('0')} />
            <Pressable
              style={({ pressed }) => [styles.keypadBtn, pressed && { opacity: 0.5 }]}
              onPress={handleBackspace}
              hitSlop={10}
            >
              <Feather name="chevron-left" size={26} color="#111827" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Bottom Action Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.withdrawBtn,
            (credits > 0 && (inputMinutes <= 0 || inputMinutes > credits)) && styles.withdrawBtnDisabled,
            pressed && { opacity: 0.85 },
          ]}
          onPress={handleWithdraw}
        >
          <Text style={styles.withdrawBtnText}>Withdraw</Text>
        </Pressable>
      </View>

      {/* Success Modal - Matching Exact Reference Image */}
      <Modal
        visible={successModalVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={handleSuccessDone}
      >
        <View style={[styles.successRoot, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
          <StatusBar style="dark" />
          <View style={styles.successCenterContent}>
            {/* Exact Blue Tick Circle Matching Reference */}
            <View style={styles.blueTickCircle}>
              <Svg width={72} height={72} viewBox="0 0 100 100" fill="none">
                <Path
                  d="M26 50 L42 66 L74 34"
                  stroke="#FFFFFF"
                  strokeWidth={9}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>

            <Text style={styles.successMainTitle}>Your apps are unlocked</Text>
            <Text style={styles.successSubTitle}>
              You withdrew <Text style={styles.boldDark}>{inputMinutes} credits</Text> and unlocked{' '}
              <Text style={styles.boldDark}>{inputMinutes} minutes</Text> of app usage (1 credit = 1 min).
            </Text>

            {calmDownTriggered && (
              <View style={styles.modalCalmDownAlert}>
                <Ionicons name="hourglass-outline" size={16} color="#B45309" style={{ marginRight: 6 }} />
                <Text style={styles.modalCalmDownAlertText}>
                  A {calmDownHours}h calm down is now active before more time can be unlocked.
                </Text>
              </View>
            )}
          </View>

          {/* Return to Dashboard Action Button */}
          <View style={styles.successBottomBar}>
            <Pressable
              style={({ pressed }) => [
                styles.returnDashboardBtn,
                pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
              ]}
              onPress={handleSuccessDone}
            >
              <Text style={styles.returnDashboardBtnText}>Return to dashboard</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* 1. APPLE-STYLE EMERGENCY CREDITS AD PERMISSION MODAL */}
      <Modal
        visible={showEmergencyAdPrompt}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEmergencyAdPrompt(false)}
      >
        <View style={styles.appleModalBackdrop}>
          <View style={styles.appleAlertCard}>
            <View style={styles.appleAlertContent}>
              <Text style={styles.appleAlertTitle}>Emergency Credits</Text>
              <Text style={styles.appleAlertReason}>
                Watch an 30 seconds ad to get 10 credits for emergency. You can watch up to 3 ads ({emergencyAdsWatched}/3 watched).
              </Text>
            </View>

            <View style={styles.appleAlertBtnRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.appleAlertBtn,
                  pressed && { backgroundColor: '#E5E5EA' },
                ]}
                onPress={() => setShowEmergencyAdPrompt(false)}
              >
                <Text style={styles.appleCancelText}>Cancel</Text>
              </Pressable>

              <View style={styles.appleAlertDividerV} />

              <Pressable
                style={({ pressed }) => [
                  styles.appleAlertBtn,
                  pressed && { backgroundColor: '#E5E5EA' },
                ]}
                onPress={() => {
                  setShowEmergencyAdPrompt(false);
                  setAdSecondsRemaining(30);
                  setIsPlayingAd(true);
                }}
              >
                <Text style={styles.appleAllowText}>Continue</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. APPLE-STYLE EMERGENCY LIMIT REACHED MODAL (3/3 WATCHED) */}
      <Modal
        visible={showEmergencyLimitAlert}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEmergencyLimitAlert(false)}
      >
        <View style={styles.appleModalBackdrop}>
          <View style={styles.appleAlertCard}>
            <View style={styles.appleAlertContent}>
              <Text style={styles.appleAlertTitle}>Ad Limit Reached</Text>
              <Text style={styles.appleAlertReason}>
                You have already watched 3 of 3 emergency ads. Complete focus sessions to earn more credits!
              </Text>
            </View>

            <View style={styles.appleAlertBtnRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.appleAlertBtn,
                  pressed && { backgroundColor: '#E5E5EA' },
                ]}
                onPress={() => setShowEmergencyLimitAlert(false)}
              >
                <Text style={styles.appleAllowText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. FULLSCREEN BLACK DEMO AD PLAYING SCREEN */}
      <Modal
        visible={isPlayingAd}
        transparent={false}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          if (adSecondsRemaining === 0) {
            handleFinishAd();
          }
        }}
      >
        <View style={styles.adFullscreenRoot}>
          <StatusBar style="light" />

          {/* Top 30-Second White Filling Progress Bar Option */}
          <View style={[styles.adTopBar, { paddingTop: insets.top + 10 }]}>
            <View style={styles.adProgressTrack}>
              <View
                style={[
                  styles.adProgressFill,
                  { width: `${((30 - adSecondsRemaining) / 30) * 100}%` },
                ]}
              />
            </View>

            <View style={styles.adHeaderControlsRow}>
              <View style={styles.adTimerBadge}>
                <Ionicons
                  name={adSecondsRemaining === 0 ? "checkmark-circle" : "time-outline"}
                  size={14}
                  color={adSecondsRemaining === 0 ? "#4ADE80" : "#D4D4D8"}
                  style={{ marginRight: 5 }}
                />
                <Text style={styles.adTimerText}>
                  {adSecondsRemaining > 0 ? `Reward in ${adSecondsRemaining}s` : 'Reward Verified ✓'}
                </Text>
              </View>

              {/* Once 30 seconds over, 'X' option appears! */}
              {adSecondsRemaining === 0 ? (
                <Pressable
                  style={({ pressed }) => [styles.adCloseBtn, pressed && { opacity: 0.7 }]}
                  onPress={handleFinishAd}
                  hitSlop={14}
                >
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </Pressable>
              ) : (
                <View style={{ width: 36, height: 36 }} />
              )}
            </View>
          </View>

          {/* Centered Content: "demo ad playing" */}
          <View style={styles.adCenterBody}>
            <View style={styles.adPlayIconCircle}>
              <Ionicons name="play" size={32} color="#FFFFFF" style={{ marginLeft: 3 }} />
            </View>

            <Text style={styles.adPlayingHeadline}>demo ad playing</Text>
            <Text style={styles.adPlayingSub}>
              {adSecondsRemaining > 0
                ? `Please watch the 30-second demo ad to receive 10 Emergency Credits.`
                : 'Ad completed! Tap the ✕ above to collect your 10 credits.'}
            </Text>

            <View style={styles.adCounterPill}>
              <Text style={styles.adCounterPillText}>
                Emergency Ad {Math.min(emergencyAdsWatched + 1, 3)} of 3
              </Text>
            </View>
          </View>

          {/* Bottom Footer Note */}
          <View style={[styles.adFooterNoteWrap, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
            <Text style={styles.adFooterNoteText}>
              Recover Emergency Credit System • 10 credits per ad (Max 3)
            </Text>
          </View>
        </View>
      </Modal>

      {/* 4. REWARD TOAST */}
      {showRewardToast && (
        <View style={[styles.rewardToast, { top: insets.top + 16 }]}>
          <Ionicons name="checkmark-circle" size={18} color="#4ADE80" style={{ marginRight: 6 }} />
          <Text style={styles.rewardToastText}>
            10 credits credited to card (Ad credits)
          </Text>
        </View>
      )}
    </View>
  );
}

function KeypadButton({ digit, onPress }: { digit: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.keypadBtn, pressed && { opacity: 0.4 }]}
      onPress={onPress}
      hitSlop={10}
    >
      <Text style={styles.keypadDigit}>{digit}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  circleCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: '#111827',
  },
  headerSpacer: {
    width: 38,
  },
  body: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  displaySection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  valueNumber: {
    fontFamily: fonts.bold,
    fontSize: 52,
    lineHeight: 56,
    color: '#111827',
    letterSpacing: -1,
  },
  valueUnit: {
    fontFamily: fonts.semibold,
    fontSize: 32,
    lineHeight: 40,
    color: '#8E95A5',
    marginLeft: 6,
    marginBottom: 6,
  },
  creditsBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  lightningCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.2,
    borderColor: '#8E95A5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  creditsBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: '#8E95A5',
  },
  availableBalanceText: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    color: '#9CA3AF',
    marginTop: 8,
  },
  boldDark: {
    color: '#111827',
    fontFamily: fonts.semibold,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#DC2626',
    flexShrink: 1,
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginVertical: 14,
  },
  presetPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    minWidth: 46,
    alignItems: 'center',
  },
  presetPillActive: {
    backgroundColor: '#111827',
  },
  presetLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: '#374151',
  },
  presetLabelActive: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
  },
  keypadContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 6,
  },
  keypadBtn: {
    width: 72,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadDigit: {
    fontFamily: fonts.medium,
    fontSize: 25,
    color: '#111827',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  withdrawBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  withdrawBtnDisabled: {
    opacity: 0.5,
  },
  withdrawBtnText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  successRoot: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  successCenterContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  blueTickCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#0062FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#0062FF',
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  successMainTitle: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  successSubTitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 23,
    maxWidth: 320,
  },
  successBottomBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  returnDashboardBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  returnDashboardBtnText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  calmDownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  calmDownBannerTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: '#92400E',
  },
  calmDownBannerSub: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: '#78350F',
    marginTop: 1,
  },
  bypassBtn: {
    backgroundColor: '#92400E',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  bypassBtnText: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 11,
  },
  modalCalmDownAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 10,
  },
  modalCalmDownAlertText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#92400E',
    flexShrink: 1,
  },

  // -------------------------------------------------------------------------
  // APPLE-STYLE ALERT MODAL (Matches Permission Asking Style)
  // -------------------------------------------------------------------------
  appleModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  appleAlertCard: {
    width: '100%',
    maxWidth: 290,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 20,
  },
  appleAlertContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  appleAlertTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: '#000000',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  appleAlertReason: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: '#3C3C43',
    textAlign: 'center',
    lineHeight: 18,
  },
  appleAlertBtnRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C6C6C8',
    height: 44,
  },
  appleAlertBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleAlertDividerV: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#C6C6C8',
  },
  appleCancelText: {
    fontFamily: fonts.regular,
    fontSize: 16.5,
    color: '#007AFF',
  },
  appleAllowText: {
    fontFamily: fonts.bold,
    fontSize: 16.5,
    color: '#007AFF',
  },

  // -------------------------------------------------------------------------
  // FULLSCREEN BLACK DEMO AD SCREEN
  // -------------------------------------------------------------------------
  adFullscreenRoot: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
  },
  adTopBar: {
    paddingHorizontal: 20,
  },
  adProgressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  adProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  adHeaderControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  adTimerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  adTimerText: {
    color: '#FFFFFF',
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  adCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adCenterBody: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  adPlayIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  adPlayingHeadline: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 26,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  adPlayingSub: {
    color: '#9CA3AF',
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
    maxWidth: 290,
  },
  adCounterPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  adCounterPillText: {
    color: '#E5E7EB',
    fontFamily: fonts.medium,
    fontSize: 12.5,
  },
  adFooterNoteWrap: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  adFooterNoteText: {
    color: '#6B7280',
    fontFamily: fonts.regular,
    fontSize: 11.5,
    textAlign: 'center',
  },

  // Reward toast
  rewardToast: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 99,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
  },
  rewardToastText: {
    color: '#FFFFFF',
    fontFamily: fonts.medium,
    fontSize: 13,
  },
});
