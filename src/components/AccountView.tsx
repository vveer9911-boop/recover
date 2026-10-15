import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { BRAND_NAME, fonts } from '../theme';
import { useApp } from '../context/AppContext';
import { AVATAR_PRESETS } from './EditProfileModal';
import EditProfileModal from './EditProfileModal';
import SettingsScreenModal from './SettingsScreenModal';
import LegalNoticeModal from './LegalNoticeModal';

export default function AccountView() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    userName,
    userBio,
    userHandle,
    userAvatarIndex,
    streak,
    credits,
    isPlus,
    setIsPlus,
  } = useApp();

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeLegalType, setActiveLegalType] = useState<'terms' | 'privacy' | 'notices' | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const displayName = userName.trim() ? userName : 'there';
  const displayHandle = userHandle.trim() ? `@${userHandle.replace(/^@/, '')}` : '@focus_champ';
  const currentAvatar = AVATAR_PRESETS[userAvatarIndex || 0] || AVATAR_PRESETS[0];

  const focusTimeDisplay = credits >= 60
    ? `${Math.floor(credits / 60)}h ${credits % 60}m`
    : `${credits}m`;

  return (
    <View style={styles.root}>
      {/* Minimal Top Header */}
      <View style={[styles.headerRow, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>My profile</Text>

        <View style={styles.headerRightRow}>
          {/* Minimal Settings button */}
          <Pressable
            style={({ pressed }) => [styles.settingsBtn, pressed && { opacity: 0.7 }]}
            onPress={() => setShowSettings(true)}
            hitSlop={10}
          >
            <Ionicons name="settings-sharp" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Minimal User Profile Header */}
        <View style={styles.userSection}>
          <Pressable
            style={({ pressed }) => [styles.avatarWrap, pressed && { opacity: 0.85 }]}
            onPress={() => setShowEditProfile(true)}
          >
            <View style={[styles.avatarCircle, { backgroundColor: currentAvatar.bg }]}>
              <Text style={styles.avatarEmoji}>{currentAvatar.emoji}</Text>
              <View style={styles.avatarEditPill}>
                <Ionicons name="pencil" size={10} color="#000000" />
              </View>
            </View>
          </Pressable>

          {/* Name & Plan Badge */}
          <View style={styles.nameRow}>
            <Text style={styles.userNameText}>{displayName}</Text>
            {isPlus ? (
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            ) : (
              <View style={styles.freeBadge}>
                <Text style={styles.freeBadgeText}>FREE</Text>
              </View>
            )}
          </View>

          <Text style={styles.userHandleText}>{displayHandle}</Text>
          <Text style={styles.userBioText}>{userBio}</Text>

          {/* Minimal Stats Pill */}
          <View style={styles.statsPill}>
            <Text style={styles.statLineText}>
              <Text style={styles.statBoldText}>{focusTimeDisplay}</Text> focused time
              <Text style={styles.statDot}> • </Text>
              <Text style={styles.statBoldText}>{credits}</Text> credits
            </Text>
          </View>
        </View>

        {/* EASY TO CHOOSE: MINIMAL ACTIONS (EDIT PROFILE & UPGRADE TO PRO ONLY) */}
        <View style={styles.optionsContainer}>
          {/* 1. Edit Profile Button */}
          <Pressable
            style={({ pressed }) => [styles.editProfileBtn, pressed && { opacity: 0.8 }]}
            onPress={() => setShowEditProfile(true)}
          >
            <Feather name="edit-2" size={15} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.editProfileText}>Edit profile</Text>
          </Pressable>

          {/* 2. Upgrade to Pro / Manage Plus Card */}
          <View style={styles.planCardWrapper}>
            <Pressable
              style={({ pressed }) => [styles.upgradeCard, pressed && { opacity: 0.85 }]}
              onPress={() => navigation.navigate('Pricing')}
            >
              <View style={styles.upgradeCardLeft}>
                <View style={[styles.upgradeIconBox, isPlus && styles.upgradeIconBoxPro]}>
                  <Ionicons name="sparkles" size={17} color={isPlus ? '#000000' : '#A78BFA'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.upgradeTitle}>
                    {isPlus ? `${BRAND_NAME} Plus` : `Upgrade to ${BRAND_NAME} Plus`}
                  </Text>
                  <Text style={styles.upgradeSubtitle}>
                    {isPlus ? 'Plus member • All features & cards unlocked' : 'Strict app blocker, ad-free & custom cards'}
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={17} color="#52525B" />
            </Pressable>

            {/* Little cancel subscription option for Plus users */}
            {isPlus && (
              <Pressable
                style={({ pressed }) => [styles.cancelSubBtn, pressed && { opacity: 0.6 }]}
                onPress={() => setShowCancelModal(true)}
                hitSlop={10}
              >
                <Text style={styles.cancelSubText}>Cancel subscription</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* DEVELOPER OPTIONS SECTION */}
        <View style={styles.devSection}>
          <Text style={styles.devSectionHeader}>DEVELOPER OPTIONS</Text>
          <View style={styles.devCard}>
            <View style={styles.devRow}>
              <View style={styles.devIconBox}>
                <Ionicons name="terminal-outline" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.devTitle}>Plus User Mode</Text>
                <Text style={styles.devSubtitle}>
                  {isPlus ? 'Enabled • Plus features & cards unlocked' : 'Toggle on to unlock all Plus features'}
                </Text>
              </View>
              <Switch
                value={isPlus}
                onValueChange={(val) => setIsPlus(val)}
                trackColor={{ false: '#27272A', true: '#FFFFFF' }}
                thumbColor={isPlus ? '#000000' : '#A1A1AA'}
              />
            </View>
          </View>
        </View>

        {/* OPEN SPACE RESERVED FOR ADS (ONLY FOR FREE USERS) */}
        {!isPlus && (
          <View style={styles.adSection}>
            <View style={styles.adCard}>
              <View style={styles.adBadge}>
                <Text style={styles.adBadgeText}>AD</Text>
              </View>
              <View style={styles.adContent}>
                <Ionicons name="megaphone-outline" size={20} color="#52525B" style={{ marginBottom: 5 }} />
                <Text style={styles.adMainTitle}>Open space reserved for ads</Text>
                <Text style={styles.adSubTitle}>Ad placement area • Ad-free with Plus</Text>
              </View>
            </View>
          </View>
        )}

        {/* LEGAL NOTICE AT THE END BELOW AD PLACE */}
        <View style={styles.legalSection}>
          <Text style={styles.legalHeader}>LEGAL & POLICIES</Text>

          <View style={styles.legalCard}>
            {/* Option 1: Terms & Conditions */}
            <Pressable
              style={({ pressed }) => [styles.legalRow, pressed && { opacity: 0.7 }]}
              onPress={() => setActiveLegalType('terms')}
            >
              <Text style={styles.legalRowTitle}>Terms & Conditions</Text>
              <Feather name="chevron-right" size={15} color="#52525B" />
            </Pressable>

            <View style={styles.legalDivider} />

            {/* Option 2: Privacy Policy */}
            <Pressable
              style={({ pressed }) => [styles.legalRow, pressed && { opacity: 0.7 }]}
              onPress={() => setActiveLegalType('privacy')}
            >
              <Text style={styles.legalRowTitle}>Privacy Policy</Text>
              <Feather name="chevron-right" size={15} color="#52525B" />
            </Pressable>

            <View style={styles.legalDivider} />

            {/* Option 3: Legal Notices */}
            <Pressable
              style={({ pressed }) => [styles.legalRow, pressed && { opacity: 0.7 }]}
              onPress={() => setActiveLegalType('notices')}
            >
              <Text style={styles.legalRowTitle}>Legal Notices & Licenses</Text>
              <Feather name="chevron-right" size={15} color="#52525B" />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
      />

      {/* Settings Screen Modal */}
      <SettingsScreenModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        onOpenEditProfile={() => {
          setShowSettings(false);
          setTimeout(() => setShowEditProfile(true), 250);
        }}
      />

      {/* Legal Notice Document Modal */}
      <LegalNoticeModal
        visible={activeLegalType !== null}
        type={activeLegalType}
        onClose={() => setActiveLegalType(null)}
      />

      {/* Apple-style Permission Dialog for Cancel Subscription (Centered Modal) */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.dialogBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowCancelModal(false)} />
          <View style={styles.systemAlert}>
            <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(30,30,34,0.96)' }]} />
            <View style={styles.alertBody}>
              <Text style={styles.alertTitle}>Cancel Subscription</Text>
              <Text style={styles.alertMessage}>
                Are you sure you want to cancel your {BRAND_NAME} Plus subscription? Pro features and custom cards will be locked.
              </Text>
            </View>
            <View style={styles.alertButtons}>
              <Pressable
                style={styles.alertBtn}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.alertBtnTextNormal}>Keep Subscription</Text>
              </Pressable>
              <Pressable
                style={[styles.alertBtn, styles.alertBtnBorderLeft]}
                onPress={async () => {
                  setShowCancelModal(false);
                  await setIsPlus(false);
                }}
              >
                <Text style={styles.alertBtnTextDestructive}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 22,
    letterSpacing: -0.3,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161618',
    borderWidth: 1,
    borderColor: '#26262A',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    marginRight: 10,
  },
  streakNumber: {
    color: '#F97316',
    fontFamily: fonts.bold,
    fontSize: 12.5,
    marginLeft: 3,
  },
  settingsBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#161618',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#26262A',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  userSection: {
    alignItems: 'center',
    marginBottom: 22,
  },
  avatarWrap: {
    marginBottom: 12,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  avatarEmoji: {
    fontSize: 34,
  },
  avatarEditPill: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  userNameText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 21,
    letterSpacing: -0.2,
    marginRight: 8,
  },
  proBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 7,
    paddingHorizontal: 6.5,
    paddingVertical: 2,
  },
  proBadgeText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  freeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 7,
    paddingHorizontal: 6.5,
    paddingVertical: 2,
  },
  freeBadgeText: {
    color: '#A1A1AA',
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  userHandleText: {
    color: '#71717A',
    fontFamily: fonts.medium,
    fontSize: 13,
    marginBottom: 6,
  },
  userBioText: {
    color: '#A1A1AA',
    fontFamily: fonts.regular,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 22,
    marginBottom: 12,
  },
  statsPill: {
    backgroundColor: '#121214',
    borderWidth: 1,
    borderColor: '#202024',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  statLineText: {
    color: '#A1A1AA',
    fontFamily: fonts.regular,
    fontSize: 12.5,
  },
  statBoldText: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
  },
  statDot: {
    color: '#52525B',
  },
  optionsContainer: {
    marginBottom: 18,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161618',
    borderRadius: 16,
    height: 44,
    borderWidth: 1,
    borderColor: '#27272A',
    marginBottom: 10,
  },
  editProfileText: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 13.5,
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  planCardWrapper: {
    backgroundColor: '#121214',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#242428',
    overflow: 'hidden',
  },
  upgradeIconBoxPro: {
    backgroundColor: '#FFFFFF',
  },
  cancelSubBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#242428',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  cancelSubText: {
    color: '#EF4444',
    fontFamily: fonts.medium,
    fontSize: 12,
    letterSpacing: -0.1,
  },
  devSection: {
    marginBottom: 20,
  },
  devSectionHeader: {
    color: '#71717A',
    fontFamily: fonts.bold,
    fontSize: 10.5,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  devCard: {
    backgroundColor: '#121214',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#242428',
  },
  devRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  devIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#1C1C20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  devTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 14,
    marginBottom: 2,
  },
  devSubtitle: {
    color: '#71717A',
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 15,
  },
  upgradeCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  upgradeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#1C1C20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  upgradeTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 14,
    marginBottom: 2,
  },
  upgradeSubtitle: {
    color: '#71717A',
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 15,
  },
  adSection: {
    marginBottom: 20,
  },
  adCard: {
    backgroundColor: '#0E0E10',
    borderRadius: 18,
    height: 104,
    borderWidth: 1,
    borderColor: '#222226',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  adBadge: {
    position: 'absolute',
    top: 9,
    left: 11,
    backgroundColor: '#1E1E22',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderWidth: 1,
    borderColor: '#2A2A2E',
  },
  adBadgeText: {
    color: '#71717A',
    fontSize: 9,
    fontFamily: fonts.semibold,
    letterSpacing: 0.5,
  },
  adContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  adMainTitle: {
    color: '#E4E4E7',
    fontFamily: fonts.medium,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  adSubTitle: {
    color: '#52525B',
    fontFamily: fonts.regular,
    fontSize: 11,
    marginTop: 2,
  },
  legalSection: {
    marginBottom: 10,
  },
  legalHeader: {
    color: '#52525B',
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  legalCard: {
    backgroundColor: '#121214',
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#222226',
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  legalRowTitle: {
    color: '#D4D4D8',
    fontFamily: fonts.medium,
    fontSize: 13.5,
  },
  legalDivider: {
    height: 1,
    backgroundColor: '#1C1C20',
  },
  // Apple-Style Alert Dialog
  dialogBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  systemAlert: {
    width: 280,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 28,
    elevation: 24,
  },
  alertBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 17,
    fontFamily: fonts.semibold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  alertMessage: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: 'rgba(255, 255, 255, 0.72)',
    textAlign: 'center',
    lineHeight: 18,
  },
  alertButtons: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.18)',
    height: 44,
  },
  alertBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertBtnBorderLeft: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: 'rgba(255, 255, 255, 0.18)',
  },
  alertBtnTextNormal: {
    fontSize: 17,
    fontFamily: fonts.semibold,
    color: '#0A84FF',
  },
  alertBtnTextDestructive: {
    fontSize: 17,
    fontFamily: fonts.regular,
    color: '#FF453A',
  },
});
