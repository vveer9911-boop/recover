import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { fonts } from '../theme';
import { useApp } from '../context/AppContext';

type PeriodType = 'day' | 'week' | 'year';

const PERIOD_PRESETS: Record<PeriodType, { label: string; minutes: number }[]> = {
  day: [
    { label: '15m', minutes: 15 },
    { label: '30m', minutes: 30 },
    { label: '1h', minutes: 60 },
    { label: '2h', minutes: 120 },
    { label: '4h', minutes: 240 },
  ],
  week: [
    { label: '2h', minutes: 120 },
    { label: '5h', minutes: 300 },
    { label: '10h', minutes: 600 },
    { label: '20h', minutes: 1200 },
    { label: '35h', minutes: 2100 },
  ],
  year: [
    { label: '50h', minutes: 3000 },
    { label: '100h', minutes: 6000 },
    { label: '250h', minutes: 15000 },
    { label: '500h', minutes: 30000 },
    { label: '1000h', minutes: 60000 },
  ],
};

const CALM_DOWN_PRESETS = [1, 2, 3, 4, 6];

export default function SpendLimitScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const {
    spendLimits,
    setSpendLimit,
    calmDownHours,
    setCalmDownHours,
    isPlus,
  } = useApp();

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('day');
  const [inputMinutes, setInputMinutes] = useState<number>(spendLimits.day);
  const [selectedCalmHours, setSelectedCalmHours] = useState<number>(calmDownHours || 1);
  const [activeInput, setActiveInput] = useState<'limit' | 'calm'>('limit');
  const [savedModalVisible, setSavedModalVisible] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(!isPlus);

  const handlePeriodChange = (period: PeriodType) => {
    setSelectedPeriod(period);
    setInputMinutes(spendLimits[period]);
  };

  const handleKeyPress = (digit: string) => {
    if (activeInput === 'limit') {
      setInputMinutes((prev) => {
        const currentStr = prev === 0 ? '' : prev.toString();
        if (currentStr.length >= 5) return prev;
        const nextStr = currentStr + digit;
        const num = parseInt(nextStr, 10);
        return isNaN(num) ? 0 : num;
      });
    } else {
      setSelectedCalmHours((prev) => {
        const currentStr = prev === 0 ? '' : prev.toString();
        if (currentStr.length >= 2) return prev;
        const nextStr = currentStr + digit;
        const num = parseInt(nextStr, 10);
        return isNaN(num) ? 1 : Math.max(1, num);
      });
    }
  };

  const handleBackspace = () => {
    if (activeInput === 'limit') {
      setInputMinutes((prev) => {
        const str = prev.toString();
        if (str.length <= 1) return 0;
        const nextStr = str.slice(0, -1);
        return parseInt(nextStr, 10) || 0;
      });
    } else {
      setSelectedCalmHours((prev) => {
        const str = prev.toString();
        if (str.length <= 1) return 1;
        const nextStr = str.slice(0, -1);
        return parseInt(nextStr, 10) || 1;
      });
    }
  };

  const handleSaveLimit = () => {
    setSpendLimit(selectedPeriod, inputMinutes);
    setCalmDownHours(selectedCalmHours);
    setSavedModalVisible(true);
  };

  const handleSavedDone = () => {
    setSavedModalVisible(false);
    navigation.goBack();
  };

  const presets = PERIOD_PRESETS[selectedPeriod];

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* Top Header Bar */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={({ pressed }) => [styles.circleCloseBtn, pressed && { opacity: 0.7 }]}
          onPress={() => navigation.goBack()}
          hitSlop={12}
        >
          <Ionicons name="chevron-down" size={20} color="#111827" />
        </Pressable>

        <Text style={styles.headerTitle}>Spend Limit</Text>

        {/* PLUS Badge */}
        <Pressable
          style={styles.plusBadge}
          onPress={() => navigation.navigate('Pricing')}
        >
          <Text style={styles.plusBadgeText}>PLUS</Text>
        </Pressable>
      </View>

      {/* PLUS Plan Feature Notice for Prototype */}
      {!isPlus && showUpgradePrompt && (
        <View style={styles.plusNoticeBox}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="lock-closed" size={13} color="#991B1B" style={{ marginRight: 4 }} />
              <Text style={styles.plusNoticeTitle}>Plus Plan Feature</Text>
            </View>
            <Text style={styles.plusNoticeSub}>
              Spend limits with custom calm down are exclusive to Plus. (Prototype testing enabled)
            </Text>
          </View>
          <Pressable
            style={styles.upgradeBtnMini}
            onPress={() => navigation.navigate('Pricing')}
          >
            <Text style={styles.upgradeBtnMiniText}>Upgrade</Text>
          </Pressable>
        </View>
      )}

      {/* Period Selector: Day | Week | Year */}
      <View style={styles.periodTabsRow}>
        {(['day', 'week', 'year'] as PeriodType[]).map((period) => {
          const isActive = selectedPeriod === period;
          return (
            <Pressable
              key={period}
              style={[
                styles.periodTab,
                isActive && styles.periodTabActive,
              ]}
              onPress={() => handlePeriodChange(period)}
            >
              <Text
                style={[
                  styles.periodTabText,
                  isActive && styles.periodTabTextActive,
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Display: {minutes} min */}
        <Pressable
          style={[styles.displaySection, activeInput === 'limit' && styles.displaySectionFocused]}
          onPress={() => setActiveInput('limit')}
        >
          <Text style={styles.sectionSmallLabel}>SPEND LIMIT</Text>
          <View style={styles.valueRow}>
            <Text style={styles.valueNumber}>{inputMinutes}</Text>
            <Text style={styles.valueUnit}>min</Text>
          </View>

          {/* Subtitle Badge */}
          <View style={styles.creditsBadgeRow}>
            <View style={styles.lightningCircle}>
              <Ionicons name="shield-checkmark-outline" size={11} color="#8E95A5" />
            </View>
            <Text style={styles.creditsBadgeText}>
              Limit: {inputMinutes} credits / {selectedPeriod}
            </Text>
          </View>
        </Pressable>

        {/* Quick Presets for Limit */}
        <View style={styles.presetsRow}>
          {presets.map((p) => {
            const isSelected = inputMinutes === p.minutes;
            return (
              <Pressable
                key={p.label}
                style={({ pressed }) => [
                  styles.presetPill,
                  isSelected && styles.presetPillActive,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => {
                  setActiveInput('limit');
                  setInputMinutes(p.minutes);
                }}
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

        {/* CALM DOWN DURATION SECTION (User Intent Cooldown) */}
        <View style={styles.calmDownCard}>
          <View style={styles.calmDownHeader}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="hourglass-outline" size={15} color="#111827" style={{ marginRight: 5 }} />
                <Text style={styles.calmDownTitle}>Calm Down Duration</Text>
              </View>
              <Text style={styles.calmDownSubtitle}>
                When limit is reached, cooldown activates instead of permanently locking.
              </Text>
            </View>

            {/* Stepper for custom hours */}
            <View style={styles.calmStepper}>
              <Pressable
                style={styles.stepperBtn}
                onPress={() => setSelectedCalmHours((prev) => Math.max(1, prev - 1))}
              >
                <Feather name="minus" size={14} color="#111827" />
              </Pressable>
              <Pressable onPress={() => setActiveInput('calm')} style={styles.stepperValueBox}>
                <Text style={styles.stepperValueText}>{selectedCalmHours}h</Text>
              </Pressable>
              <Pressable
                style={styles.stepperBtn}
                onPress={() => setSelectedCalmHours((prev) => Math.min(48, prev + 1))}
              >
                <Feather name="plus" size={14} color="#111827" />
              </Pressable>
            </View>
          </View>

          {/* Quick Calm Down Presets: 1h, 2h, 3h, 4h, 6h */}
          <View style={styles.calmPresetsRow}>
            {CALM_DOWN_PRESETS.map((hrs) => {
              const isSelected = selectedCalmHours === hrs;
              return (
                <Pressable
                  key={hrs}
                  style={[
                    styles.calmPill,
                    isSelected && styles.calmPillActive,
                  ]}
                  onPress={() => setSelectedCalmHours(hrs)}
                >
                  <Text
                    style={[
                      styles.calmPillText,
                      isSelected && styles.calmPillTextActive,
                    ]}
                  >
                    {hrs} {hrs === 1 ? 'hour' : 'hours'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.calmDownExplanation}>
            💡 After {inputMinutes}m of screen time this {selectedPeriod}, a <Text style={styles.boldDark}>{selectedCalmHours}-hour calm down</Text> starts before you can unlock more apps.
          </Text>
        </View>

        {/* Numeric Keypad for manual adjustments */}
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
      </ScrollView>

      {/* Bottom Action Button: Set Spend Limit */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.setLimitBtn,
            inputMinutes <= 0 && styles.setLimitBtnDisabled,
            pressed && { opacity: 0.85 },
          ]}
          onPress={handleSaveLimit}
        >
          <Text style={styles.setLimitBtnText}>Set Spend Limit & Calm Down</Text>
        </Pressable>
      </View>

      {/* Saved Confirmation Modal */}
      <Modal
        visible={savedModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleSavedDone}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalSuccessIcon}>
              <Ionicons name="shield-checkmark" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.modalTitle}>Spend Limit Saved!</Text>
            <Text style={styles.modalSubtitle}>
              Your <Text style={styles.boldDark}>{selectedPeriod.toUpperCase()}</Text> limit is set to{' '}
              <Text style={styles.boldDark}>{inputMinutes} minutes</Text>.
            </Text>
            <View style={styles.modalCalmDownDetail}>
              <Ionicons name="time-outline" size={15} color="#2563EB" style={{ marginRight: 6 }} />
              <Text style={styles.modalCalmDownText}>
                Calm Down: <Text style={styles.boldDark}>{selectedCalmHours} hour{selectedCalmHours > 1 ? 's' : ''}</Text> cooldown on limit reached.
              </Text>
            </View>
            {!isPlus && (
              <Text style={styles.modalPrototypeNote}>
                Saved for prototype testing. In production, this requires Recover Plus.
              </Text>
            )}
            <Pressable
              style={({ pressed }) => [styles.modalDoneBtn, pressed && { opacity: 0.85 }]}
              onPress={handleSavedDone}
            >
              <Text style={styles.modalDoneText}>Return to Dashboard</Text>
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
    paddingBottom: 8,
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
  plusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#8B0000',
  },
  plusBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  plusNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  plusNoticeTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: '#991B1B',
  },
  plusNoticeSub: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: '#7F1D1D',
    marginTop: 1,
  },
  upgradeBtnMini: {
    backgroundColor: '#991B1B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  upgradeBtnMiniText: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 11,
  },
  periodTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    padding: 3,
    marginHorizontal: 20,
    marginTop: 6,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  periodTabActive: {
    backgroundColor: '#111827',
  },
  periodTabText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: '#4B5563',
  },
  periodTabTextActive: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  displaySection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  displaySectionFocused: {
    borderColor: '#111827',
  },
  sectionSmallLabel: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    color: '#9CA3AF',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  valueNumber: {
    fontFamily: fonts.bold,
    fontSize: 48,
    lineHeight: 52,
    color: '#111827',
    letterSpacing: -1,
  },
  valueUnit: {
    fontFamily: fonts.semibold,
    fontSize: 28,
    lineHeight: 36,
    color: '#8E95A5',
    marginLeft: 6,
    marginBottom: 4,
  },
  creditsBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  lightningCircle: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    borderWidth: 1.2,
    borderColor: '#8E95A5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  creditsBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: '#8E95A5',
  },
  boldDark: {
    color: '#111827',
    fontFamily: fonts.semibold,
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  presetPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    minWidth: 44,
    alignItems: 'center',
  },
  presetPillActive: {
    backgroundColor: '#111827',
  },
  presetLabel: {
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: '#374151',
  },
  presetLabelActive: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
  },
  calmDownCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
    marginBottom: 10,
  },
  calmDownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  calmDownTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: '#111827',
  },
  calmDownSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 15,
  },
  calmStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepperBtn: {
    padding: 6,
  },
  stepperValueBox: {
    paddingHorizontal: 6,
  },
  stepperValueText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: '#111827',
  },
  calmPresetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calmPill: {
    flex: 1,
    marginHorizontal: 2,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  calmPillActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  calmPillText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: '#374151',
  },
  calmPillTextActive: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
  },
  calmDownExplanation: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: '#6B7280',
    lineHeight: 16,
  },
  keypadContainer: {
    paddingHorizontal: 12,
    marginTop: 6,
    marginBottom: 6,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 4,
  },
  keypadBtn: {
    width: 68,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadDigit: {
    fontFamily: fonts.medium,
    fontSize: 23,
    color: '#111827',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 6,
    backgroundColor: '#FFFFFF',
  },
  setLimitBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setLimitBtnDisabled: {
    opacity: 0.5,
  },
  setLimitBtnText: {
    fontFamily: fonts.semibold,
    fontSize: 15.5,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalSuccessIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: '#111827',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  modalCalmDownDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  modalCalmDownText: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    color: '#1E40AF',
  },
  modalPrototypeNote: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#B45309',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalDoneBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDoneText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
