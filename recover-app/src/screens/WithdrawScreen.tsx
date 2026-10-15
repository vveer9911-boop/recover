import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
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
    calmDownUntil,
  } = useApp();

  const [inputMinutes, setInputMinutes] = useState<number>(15);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [calmDownTriggered, setCalmDownTriggered] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
              Spend limit reached. Cooldown active to help you reset.
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
            (inputMinutes <= 0 || inputMinutes > credits) && styles.withdrawBtnDisabled,
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
                  Spend limit reached! A {calmDownHours}h calm down is now active before more time can be unlocked.
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
});
