import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND_NAME, fonts } from '../theme';
import { useApp } from '../context/AppContext';
import { AVATAR_PRESETS } from './EditProfileModal';
import LegalNoticeModal from './LegalNoticeModal';

interface SettingsScreenModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenEditProfile: () => void;
  onStartTutorial?: () => void;
}

export default function SettingsScreenModal({
  visible,
  onClose,
  onOpenEditProfile,
  onStartTutorial,
}: SettingsScreenModalProps) {
  const insets = useSafeAreaInsets();
  const { userName, userHandle, userAvatarIndex } = useApp();

  const [activeLegalType, setActiveLegalType] = useState<'terms' | 'privacy' | 'notices' | null>(null);

  const displayName = userName.trim() ? userName : 'there';
  const displayHandle = userHandle.trim() ? `@${userHandle.replace(/^@/, '')}` : '@focus_champ';
  const currentAvatar = AVATAR_PRESETS[userAvatarIndex || 0] || AVATAR_PRESETS[0];

  const handleLogOut = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your Recover account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
            onPress={onClose}
            hitSlop={12}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>

          <Text style={styles.headerTitle}>Settings</Text>

          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 34 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* User Profile Card (Clickable to Edit Profile) */}
          <Pressable
            style={({ pressed }) => [styles.profileCard, pressed && { opacity: 0.85 }]}
            onPress={onOpenEditProfile}
          >
            <View style={[styles.profileAvatar, { backgroundColor: currentAvatar.bg }]}>
              <Text style={styles.profileEmoji}>{currentAvatar.emoji}</Text>
            </View>
            <View style={styles.profileTextCol}>
              <Text style={styles.profileName}>{displayName}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#71717A" />
          </Pressable>

          {/* Group 1: General Settings & Walkthrough */}
          <View style={styles.cardGroup}>
            <Pressable
              style={({ pressed }) => [styles.itemRow, pressed && { opacity: 0.7 }]}
              onPress={() => {
                onClose();
                onStartTutorial?.();
              }}
            >
              <View style={styles.itemLeft}>
                <Ionicons name="sparkles-outline" size={19} color="#FFFFFF" style={styles.itemIcon} />
                <Text style={styles.itemTitle}>Walkthrough tutorial</Text>
              </View>
              <Feather name="chevron-right" size={19} color="#71717A" />
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={({ pressed }) => [styles.itemRow, pressed && { opacity: 0.7 }]}>
              <View style={styles.itemLeft}>
                <Ionicons name="options-outline" size={19} color="#FFFFFF" style={styles.itemIcon} />
                <Text style={styles.itemTitle}>General settings</Text>
              </View>
              <Feather name="chevron-right" size={19} color="#71717A" />
            </Pressable>
          </View>

          {/* Group 2: Display & Language */}
          <View style={styles.cardGroup}>
            <Pressable style={({ pressed }) => [styles.itemRow, pressed && { opacity: 0.7 }]}>
              <View style={styles.itemLeft}>
                <Ionicons name="language-outline" size={19} color="#FFFFFF" style={styles.itemIcon} />
                <Text style={styles.itemTitle}>Language</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.itemDetailText}>English</Text>
                <Feather name="chevron-right" size={18} color="#71717A" style={{ marginLeft: 4 }} />
              </View>
            </Pressable>
          </View>

          {/* Group 3: Help & Legal */}
          <View style={styles.cardGroup}>
            <Pressable style={({ pressed }) => [styles.itemRow, pressed && { opacity: 0.7 }]}>
              <View style={styles.itemLeft}>
                <Ionicons name="help-circle-outline" size={19} color="#FFFFFF" style={styles.itemIcon} />
                <Text style={styles.itemTitle}>FAQ</Text>
              </View>
              <Feather name="chevron-right" size={19} color="#71717A" />
            </Pressable>

            <View style={styles.divider} />

            <Pressable
              style={({ pressed }) => [styles.itemRow, pressed && { opacity: 0.7 }]}
              onPress={() => setActiveLegalType('terms')}
            >
              <View style={styles.itemLeft}>
                <Ionicons name="information-circle-outline" size={19} color="#FFFFFF" style={styles.itemIcon} />
                <Text style={styles.itemTitle}>Terms of service</Text>
              </View>
              <Feather name="chevron-right" size={19} color="#71717A" />
            </Pressable>

            <View style={styles.divider} />

            <Pressable
              style={({ pressed }) => [styles.itemRow, pressed && { opacity: 0.7 }]}
              onPress={() => setActiveLegalType('privacy')}
            >
              <View style={styles.itemLeft}>
                <Ionicons name="shield-checkmark-outline" size={19} color="#FFFFFF" style={styles.itemIcon} />
                <Text style={styles.itemTitle}>User policy</Text>
              </View>
              <Feather name="chevron-right" size={19} color="#71717A" />
            </Pressable>

            <View style={styles.divider} />

            <Pressable
              style={({ pressed }) => [styles.itemRow, pressed && { opacity: 0.7 }]}
              onPress={() => setActiveLegalType('notices')}
            >
              <View style={styles.itemLeft}>
                <Ionicons name="document-text-outline" size={19} color="#FFFFFF" style={styles.itemIcon} />
                <Text style={styles.itemTitle}>Legal notices</Text>
              </View>
              <Feather name="chevron-right" size={19} color="#71717A" />
            </Pressable>
          </View>

          {/* Log Out Button matching screenshot */}
          <Pressable
            style={({ pressed }) => [styles.logOutBtn, pressed && { opacity: 0.85 }]}
            onPress={handleLogOut}
          >
            <Ionicons name="exit-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
            <Text style={styles.logOutText}>Log Out</Text>
          </Pressable>
        </ScrollView>

        <LegalNoticeModal
          visible={activeLegalType !== null}
          type={activeLegalType}
          onClose={() => setActiveLegalType(null)}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E0E10',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E1E22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 17,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2A2A2E',
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  profileEmoji: {
    fontSize: 22,
  },
  profileTextCol: {
    flex: 1,
  },
  profileName: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 16,
    marginBottom: 2,
  },
  profileHandle: {
    color: '#8E8E93',
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  cardGroup: {
    backgroundColor: '#1C1C1E',
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2A2A2E',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    marginRight: 12,
  },
  itemTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.medium,
    fontSize: 14.5,
  },
  itemDetailText: {
    color: '#8E8E93',
    fontFamily: fonts.regular,
    fontSize: 13.5,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#2A2A2E',
  },
  logOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    height: 52,
    marginTop: 10,
    marginBottom: 16,
  },
  logOutText: {
    color: '#EF4444',
    fontFamily: fonts.bold,
    fontSize: 15,
  },
});
