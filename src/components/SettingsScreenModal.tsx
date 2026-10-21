import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BRAND_NAME, fonts } from '../theme';
import { useApp } from '../context/AppContext';
import { AVATAR_PRESETS } from './EditProfileModal';
import LegalNoticeModal, { LegalModalType } from './LegalNoticeModal';
import { FirebaseAuthService } from '../services/firebaseAuthService';

interface SettingsScreenModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenEditProfile: () => void;
}

export default function SettingsScreenModal({
  visible,
  onClose,
  onOpenEditProfile,
}: SettingsScreenModalProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { userName, userHandle, userAvatarIndex, deleteAccount } = useApp();

  const [activeLegalType, setActiveLegalType] = useState<LegalModalType | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
            FirebaseAuthService.logout().catch(() => {});
            AsyncStorage.removeItem('@recover_user_authenticated').catch(() => {});
            try {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (e) {
              navigation.navigate('Login');
            }
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

          {/* Group 1: Display & Language */}
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

          {/* Group 2: Help & Legal */}
          <View style={styles.cardGroup}>
            <Pressable
              style={({ pressed }) => [styles.itemRow, pressed && { opacity: 0.7 }]}
              onPress={() => setActiveLegalType('faq')}
            >
              <View style={styles.itemLeft}>
                <Ionicons name="help-circle-outline" size={19} color="#FFFFFF" style={styles.itemIcon} />
                <Text style={styles.itemTitle}>FAQ & How It Works</Text>
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

          {/* Delete Account Button */}
          <Pressable
            style={({ pressed }) => [styles.deleteAccountBtn, pressed && { opacity: 0.85 }]}
            onPress={() => setShowDeleteModal(true)}
          >
            <Ionicons name="trash-outline" size={17} color="#EF4444" style={{ marginRight: 6 }} />
            <Text style={styles.deleteAccountText}>Delete Account</Text>
          </Pressable>
        </ScrollView>

        <LegalNoticeModal
          visible={activeLegalType !== null}
          type={activeLegalType}
          onClose={() => setActiveLegalType(null)}
        />

        {/* Apple-style Permission Dialog for Delete Account (Centered Modal) */}
        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={styles.dialogBackdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowDeleteModal(false)} />
            <View style={styles.systemAlert}>
              <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(30,30,34,0.96)' }]} />
              <View style={styles.alertBody}>
                <Text style={styles.alertTitle}>Delete Account</Text>
                <Text style={styles.alertMessage}>
                  All your data will be permanently deleted from the database.
                </Text>
              </View>
              <View style={styles.alertButtons}>
                <Pressable
                  style={styles.alertBtn}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={styles.alertBtnTextNormal}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.alertBtn, styles.alertBtnBorderLeft]}
                  onPress={async () => {
                    setShowDeleteModal(false);
                    await deleteAccount();
                    onClose();
                    try {
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'HowItWorks' }],
                      });
                    } catch (e) {
                      navigation.navigate('HowItWorks');
                    }
                  }}
                >
                  <Text style={styles.alertBtnTextDestructive}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
    marginBottom: 10,
  },
  logOutText: {
    color: '#EF4444',
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  deleteAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 26,
    height: 52,
    marginBottom: 20,
  },
  deleteAccountText: {
    color: '#EF4444',
    fontFamily: fonts.semibold,
    fontSize: 15,
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
