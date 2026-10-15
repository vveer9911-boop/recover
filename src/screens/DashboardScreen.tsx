import React, { useState, useRef, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, Rect } from 'react-native-svg';
import FocusCard from '../components/FocusCard';
import TabBar, { TabType } from '../components/TabBar';
import RewardBanner from '../components/RewardBanner';
import StatCard from '../components/StatCard';
import OnboardingModal from '../components/OnboardingModal';
import AppPickerModal from '../components/AppPickerModal';
import RankingsView from '../components/RankingsView';
import AccountView from '../components/AccountView';
import SettingsScreenModal from '../components/SettingsScreenModal';
import EditProfileModal from '../components/EditProfileModal';
import TutorialModal from '../components/TutorialModal';
import { CardClock, CardIcon, CoinPlus, BrandLogo } from '../components/Icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Transaction } from './TransactionsScreen';
import { BRAND_NAME, colors, fonts, radii } from '../theme';
import { useApp } from '../context/AppContext';

const H_PAD = 15;

function RoundBtn({ children }: { children: React.ReactNode }) {
  return <View style={styles.roundBtn}>{children}</View>;
}

function Action({ label, icon, disabled, onPress }: { label: string; icon: React.ReactNode; disabled?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.action,
        disabled && { opacity: 0.5 },
        pressed && !disabled && { opacity: 0.75 },
      ]}
    >
      <View style={[styles.actionCircle, disabled && { backgroundColor: '#141416' }]}>{icon}</View>
      <Text style={[styles.actionLabel, disabled && { color: '#5C5C60' }]}>{label}</Text>
    </Pressable>
  );
}

function PromoTile({ isPlus, onUpgrade }: { isPlus?: boolean; onUpgrade?: () => void }) {
  const benefits = isPlus
    ? [
        'Ad-free active',
        'Custom card finishes',
        'Detailed analytics',
        'Background optimized',
      ]
    : [
        'No ads',
        'Customizable cards',
        'Customizable widgets',
        'Background optimized',
      ];

  return (
    <View style={[styles.tile, { overflow: 'hidden', borderWidth: 0 }]}>
      <LinearGradient colors={['#2E3A55', '#1B2234', '#0E1424']} start={{ x: 0, y: 0 }} end={{ x: 0.7, y: 1 }} style={StyleSheet.absoluteFill} />
      {/* Dark tilted card stack image */}
      <Svg width="100%" height="100%" viewBox="0 0 174 192" style={StyleSheet.absoluteFill}>
        <Path d="M30 30 L150 4 L180 150 L60 183 Z" fill="#141924" />
        <Path d="M22 26 L142 0 L176 140 L50 170 Z" fill="#1E2535" />
        <Path d="M14 22 L134 -4 L168 132 L44 160 Z" fill="#3B475F" />
        <Path d="M14 22 L134 -4 L136 6 L16 32 Z" fill="#56637C" opacity={0.6} />
        <Rect x="104" y="44" width="16" height="10" rx="2" fill="#7D889C" transform="rotate(-12 112 49)" />
        <Path d="M96 120 L174 88 L174 120 L120 145 Z" fill="#0B0F18" opacity={0.85} />
        <Path d="M0 160 L174 110 L174 192 L0 192 Z" fill="#0B1020" opacity={0.6} />
      </Svg>
      <View style={{ position: 'absolute', left: 20, top: 38, transform: [{ rotate: '-12deg' }], opacity: 0.65 }}>
        <Text style={{ color: '#C9CFDA', fontFamily: fonts.bold, fontSize: 11 }}>recover</Text>
      </View>
      <View style={{ flex: 1, padding: 13, paddingTop: 12 }}>
        <Text style={styles.promoTitle}>{isPlus ? 'Recover Plus' : 'Unlock more benefits'}</Text>
        <View style={{ flex: 1 }} />
        {benefits.map((b) => (
          <Text key={b} style={styles.bullet} numberOfLines={1}>• {b}</Text>
        ))}
        <Pressable
          style={({ pressed }) => [styles.tryBtn, pressed && { opacity: 0.8 }]}
          onPress={onUpgrade}
        >
          <Text style={styles.tryText}>{isPlus ? 'Membership' : 'Upgrade now'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function WeekChart() {
  return (
    <View style={{ position: 'absolute', left: 14, right: 14, top: 60, height: 92 }}>
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 0 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={i} style={{ width: 1, backgroundColor: '#3A3A3E' }} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 4 }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <Text key={i} style={{ color: '#3A3A3E', fontSize: 7, fontFamily: fonts.medium }}>{d}</Text>
        ))}
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('Card');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showDistractingAppsModal, setShowDistractingAppsModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const {
    userName,
    setUserName,
    credits,
    transactions,
    claimedReward,
    claimWelcomeReward,
    isPlus,
    distractingApps,
  } = useApp();

  const insets = useSafeAreaInsets();
  const headerH = insets.top + 50;
  const tabBottom = Math.max(insets.bottom - 14, 12);
  const bottomStack = tabBottom + 54 + 15 + 59 + (claimedReward ? 0 : 9 + 60); // tab + gap + addFunds + (banner if active)

  const openCardCustomization = useCallback(() => {
    if (!isPlus) {
      navigation.navigate('Pricing');
    } else {
      navigation.navigate('CardCustomization');
    }
  }, [navigation, isPlus]);

  const openAnalytics = useCallback(() => {
    if (!isPlus) {
      navigation.navigate('Pricing');
    } else {
      navigation.navigate('Analytics');
    }
  }, [navigation, isPlus]);

  return (
    <View style={styles.root}>
      {/* 1. CARD VIEW (MAIN DASHBOARD) */}
      {activeTab === 'Card' && (
        <>
          <ScrollView
            contentContainerStyle={{ paddingTop: headerH + 8, paddingBottom: bottomStack + 24, paddingHorizontal: H_PAD }}
            showsVerticalScrollIndicator={false}
            scrollIndicatorInsets={{ top: headerH }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {/* User Greeting & Tutorial Button top right above card */}
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.greetingHi}>hi</Text>
                <Text style={styles.greetingName}>{userName.trim() ? userName : 'there'}</Text>
              </View>

              <Pressable
                style={({ pressed }) => [styles.tutorialBtn, pressed && { opacity: 0.75 }]}
                onPress={() => setShowTutorial(true)}
                hitSlop={8}
              >
                <Ionicons name="sparkles" size={13} color="#E4E4E7" style={{ marginRight: 5 }} />
                <Text style={styles.tutorialBtnText}>Tutorial</Text>
              </Pressable>
            </View>

            <View style={{ paddingHorizontal: 15 }}>
              <FocusCard
                credits={credits}
                cardholderName={userName.trim() ? userName : undefined}
                onPress={openCardCustomization}
              />
            </View>

            <View style={styles.actions}>
              <Action
                label="Transactions"
                icon={<CardClock size={26} />}
                onPress={() => navigation.navigate('Transactions', {
                  userName: userName.trim() ? userName : 'there',
                  credits,
                  transactions,
                })}
              />
              <Action
                label="Withdraw"
                icon={<Feather name="arrow-down" size={22} color="#fff" />}
                onPress={() => navigation.navigate('Withdraw')}
              />
              <Action
                label="Analytics"
                icon={<Ionicons name="stats-chart" size={22} color="#fff" />}
                onPress={openAnalytics}
              />
            </View>

            {/* Ad Placement (ONLY FOR FREE USERS) */}
            {!isPlus && (
              <View style={styles.adCard}>
                <View style={styles.adBadge}>
                  <Text style={styles.adBadgeText}>AD</Text>
                </View>
                <View style={styles.adContent}>
                  <Ionicons name="megaphone-outline" size={20} color="#71717A" style={{ marginBottom: 6 }} />
                  <Text style={styles.adText}>ad placement here</Text>
                </View>
              </View>
            )}

            {/* Widgets */}
            <View style={[styles.row, { marginTop: 15 }]}>
              <PromoTile isPlus={isPlus} onUpgrade={() => navigation.navigate('Pricing')} />
              <StatCard title="Time Focused" value="0m" footer="This Week" style={styles.tileRight}>
                <WeekChart />
              </StatCard>
            </View>
            <View style={[styles.row, { marginTop: 16 }]}>
              <Pressable
                style={({ pressed }) => [
                  styles.distractingAppsCard,
                  pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => setShowDistractingAppsModal(true)}
              >
                <View style={styles.distractingAppsHeader}>
                  <Text style={styles.distractingAppsTitle} numberOfLines={1}>Choose distracting apps</Text>
                  <Feather name="chevron-right" size={15} color="#71717A" />
                </View>
                <Text style={styles.distractingAppsCount}>
                  {distractingApps.length} {distractingApps.length === 1 ? 'app' : 'apps'}
                </Text>
                <Text style={styles.distractingAppsNames} numberOfLines={2}>
                  {distractingApps.length > 0
                    ? distractingApps.slice(0, 3).join(', ') + (distractingApps.length > 3 ? ` +${distractingApps.length - 3}` : '')
                    : 'Tap to select'}
                </Text>
                <Text style={styles.distractingAppsFooter}>Screen Time</Text>
              </Pressable>
              {isPlus ? (
                <StatCard title="Focus Streak" value="1 day" caption="Daily consistency" footer="Recover Plus" style={styles.tileRight} />
              ) : (
                <View style={[styles.tile, styles.tileRight, styles.adTileSpot]}>
                  <View style={styles.adBadgeMini}>
                    <Text style={styles.adBadgeTextMini}>AD</Text>
                  </View>
                  <Ionicons name="megaphone-outline" size={22} color="#71717A" style={{ marginBottom: 6 }} />
                  <Text style={styles.adTileTitle}>Ad placement</Text>
                  <Text style={styles.adTileSub}>reserved space</Text>
                </View>
              )}
            </View>
            <View style={{ alignItems: 'center', marginTop: 16 }}>
              <Pressable
                style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] }]}
                onPress={openCardCustomization}
                hitSlop={14}
              >
                <Feather name="plus" size={18} color="#fff" />
                <Text style={styles.editText}>Edit widgets</Text>
              </Pressable>
            </View>
          </ScrollView>

          {/* Fixed header for Card */}
          <View style={[styles.header, { height: headerH, paddingTop: insets.top }]}>
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(11,11,12,0.75)' }]} />
            <View style={styles.headerRow}>
              <Pressable
                style={({ pressed }) => [styles.roundBtn, pressed && { opacity: 0.7 }]}
                onPress={() => setShowSettingsModal(true)}
              >
                <Ionicons name="settings-sharp" size={20} color="#fff" />
              </Pressable>
              <Text style={styles.headerTitle}>recover</Text>
              <Pressable
                style={({ pressed }) => [styles.upgradeHeaderBtn, pressed && { opacity: 0.7 }]}
                onPress={() => navigation.navigate('Pricing')}
              >
                <Text style={styles.upgradeHeaderText}>{isPlus ? 'Pro' : 'Upgrade'}</Text>
              </Pressable>
            </View>
          </View>
        </>
      )}

      {/* 2. RANKINGS VIEW (LEADERBOARD) */}
      {activeTab === 'Rankings' && (
        <RankingsView onOpenSettings={() => setShowSettingsModal(true)} />
      )}

      {/* 3. ACCOUNT VIEW */}
      {activeTab === 'Account' && (
        <AccountView />
      )}

      {/* COMMON FIXED BOTTOM AREA ACROSS ALL 3 PAGES */}
      <View style={[styles.bottom, { bottom: tabBottom }]} pointerEvents="box-none">
        {activeTab === 'Card' && (
          <View style={{ paddingHorizontal: 14 }}>
            {!claimedReward && <RewardBanner onClaim={claimWelcomeReward} />}
            <Pressable style={[styles.addFunds, claimedReward && { marginTop: 0 }]}>
              <View style={{ position: 'absolute', left: 30 }}><CoinPlus size={24} color="#000" /></View>
              <Text style={styles.addTitle}>Add funds</Text>
              <Text style={styles.addSub}>Start a focus session to earn</Text>
            </Pressable>
          </View>
        )}
        <View style={{ paddingHorizontal: 20, marginTop: activeTab === 'Card' ? 15 : 0 }}>
          <TabBar active={activeTab} onTabChange={setActiveTab} />
        </View>
      </View>

      {/* Onboarding walkthrough modal overlay */}
      <OnboardingModal
        visible={showOnboarding}
        onClose={(name) => {
          if (name) setUserName(name);
          setShowOnboarding(false);
          setTimeout(() => setShowTutorial(true), 350);
        }}
      />

      {/* Settings Screen Modal */}
      <SettingsScreenModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onOpenEditProfile={() => {
          setShowSettingsModal(false);
          setTimeout(() => setShowEditProfileModal(true), 250);
        }}
        onStartTutorial={() => {
          setShowSettingsModal(false);
          setTimeout(() => setShowTutorial(true), 300);
        }}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
      />

      {/* Distracting Apps Device Picker Modal (Image 3) */}
      <AppPickerModal
        visible={showDistractingAppsModal}
        onClose={() => setShowDistractingAppsModal(false)}
      />

      {/* Interactive Spotlight Tutorial Walkthrough */}
      <TutorialModal
        visible={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#232326' },
  headerRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18 },
  roundBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#1E1E20', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2A2A2D' },
  tutorialHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E1E20',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#2A2A2D',
  },
  upgradeHeaderBtn: {
    height: 32,
    paddingHorizontal: 13,
    borderRadius: 16,
    backgroundColor: '#1C1C1F',
    borderWidth: 1,
    borderColor: '#2C2C30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeHeaderText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    letterSpacing: -0.2,
  },
  headerTitle: { color: colors.white, fontFamily: fonts.bold, fontSize: 19, letterSpacing: -0.5 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 34, paddingHorizontal: 10 },
  action: { alignItems: 'center', width: 110 },
  actionCircle: { width: 43, height: 43, borderRadius: 22, backgroundColor: colors.circle, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { color: colors.white, fontFamily: fonts.medium, fontSize: 14, marginTop: 13 },
  adCard: {
    marginTop: 14,
    backgroundColor: '#161618',
    borderRadius: radii.card,
    height: 104,
    borderWidth: 1,
    borderColor: '#26262B',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  adBadge: {
    position: 'absolute',
    top: 10,
    left: 12,
    backgroundColor: '#242428',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#303036',
  },
  adBadgeText: {
    color: '#71717A',
    fontSize: 9.5,
    fontFamily: fonts.semibold,
    letterSpacing: 0.5,
  },
  adContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  adText: {
    color: '#8E8E93',
    fontFamily: fonts.medium,
    fontSize: 13,
    letterSpacing: 0.3,
  },
  row: { flexDirection: 'row' },
  tile: { flex: 1, height: 192, borderRadius: radii.tile },
  tileRight: { marginLeft: 15 },
  promoTitle: { color: colors.white, fontFamily: fonts.semibold, fontSize: 13, lineHeight: 16 },
  bullet: { color: colors.white, fontFamily: fonts.regular, fontSize: 10, lineHeight: 15.5 },
  tryBtn: { marginTop: 6, backgroundColor: colors.blue, borderRadius: 999, height: 33, alignItems: 'center', justifyContent: 'center' },
  tryText: { color: colors.white, fontFamily: fonts.medium, fontSize: 12.5 },
  editBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card2, borderRadius: 999, height: 36, paddingHorizontal: 16 },
  editText: { color: colors.white, fontFamily: fonts.medium, fontSize: 13.5, marginLeft: 6 },
  bottom: { position: 'absolute', left: 0, right: 0 },
  addFunds: { marginTop: 9, height: 59, backgroundColor: colors.white, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  addTitle: { color: '#000', fontFamily: fonts.regular, fontSize: 15 },
  addSub: { color: '#1A1A1A', fontFamily: fonts.regular, fontSize: 12.5, marginTop: 1 },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 8,
  },
  greetingHi: {
    color: '#8E8E93',
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: -0.2,
  },
  greetingName: {
    color: colors.white,
    fontFamily: fonts.semibold,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.4,
  },
  tutorialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E22',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2E2E34',
  },
  tutorialBtnText: {
    color: '#E4E4E7',
    fontFamily: fonts.medium,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  adTileSpot: {
    backgroundColor: '#161618',
    borderRadius: radii.tile,
    borderWidth: 1,
    borderColor: '#26262B',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  adBadgeMini: {
    position: 'absolute',
    top: 10,
    left: 12,
    backgroundColor: '#242428',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderWidth: 1,
    borderColor: '#303036',
  },
  adBadgeTextMini: {
    color: '#71717A',
    fontSize: 9,
    fontFamily: fonts.semibold,
    letterSpacing: 0.5,
  },
  adTileTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.medium,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  adTileSub: {
    color: '#71717A',
    fontFamily: fonts.regular,
    fontSize: 11,
    marginTop: 2,
  },
  distractingAppsCard: {
    flex: 1,
    height: 192,
    backgroundColor: colors.card,
    borderRadius: radii.tile,
    paddingHorizontal: 14,
    paddingTop: 14,
    borderWidth: 1,
    borderColor: '#202023',
  },
  distractingAppsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  distractingAppsTitle: {
    flex: 1,
    color: colors.gray2,
    fontFamily: fonts.medium,
    fontSize: 14,
    marginRight: 4,
  },
  distractingAppsCount: {
    color: '#D8D8DC',
    fontFamily: fonts.semibold,
    fontSize: 24,
    marginTop: 6,
  },
  distractingAppsNames: {
    color: colors.gray,
    fontFamily: fonts.regular,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  distractingAppsFooter: {
    position: 'absolute',
    left: 14,
    bottom: 14,
    color: colors.gray,
    fontFamily: fonts.regular,
    fontSize: 15,
  },
});

