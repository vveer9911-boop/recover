import React, { useState, useEffect, useCallback } from 'react';
import {
  AppState,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  Platform,
  Linking,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fonts } from '../theme';
import { RecoverBlocker } from '../services/recoverBlocker';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Permissions'>;

type PermissionKey = 'accessibility' | 'notifications' | 'overlay';

interface PermissionConfig {
  key: PermissionKey;
  iconName: string;
  iconType: 'ionic' | 'material';
  iconColor: string;
  title: string;
  description: string;
  dialogTitle: string;
  dialogReason: string;
}

const PERMISSIONS: PermissionConfig[] = [
  {
    key: 'accessibility',
    iconName: 'shield-checkmark',
    iconType: 'ionic',
    iconColor: '#3B82F6',
    title: 'Accessibility Service',
    description: 'Allow Recover to detect and restrict selected distracting apps during focus sessions.',
    dialogTitle: '“Recover” Would Like to Use Accessibility Service',
    dialogReason:
      'Recover uses Accessibility to detect when you open blocked apps and restrict them during your focus session so you stay focused.',
  },
  {
    key: 'notifications',
    iconName: 'notifications',
    iconType: 'ionic',
    iconColor: '#F59E0B',
    title: 'Notifications',
    description: 'Receive focus session updates, reminders, and completion alerts.',
    dialogTitle: '“Recover” Would Like to Send You Notifications',
    dialogReason:
      'Recover uses notifications to send you focus session updates, session completion alerts, and streak reminders.',
  },
  {
    key: 'overlay',
    iconName: 'layers-triple',
    iconType: 'material',
    iconColor: '#A855F7',
    title: 'Display over other apps',
    description:
      'Allow Recover to show overlays like blocks, timers, and important alerts on top of other apps.',
    dialogTitle: '“Recover” Would Like to Display Over Other Apps',
    dialogReason:
      'Recover needs this permission to show the full-screen focus block overlay, timer, and alerts over distracting apps so you cannot access blocked apps.',
  },
];

export default function PermissionsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  // State of each permission toggle
  const [granted, setGranted] = useState<{ [key in PermissionKey]: boolean }>({
    accessibility: false,
    notifications: false,
    overlay: false,
  });

  // Active dialog asking for permission with reason
  const [activeDialog, setActiveDialog] = useState<PermissionConfig | null>(null);

  // Alert shown if user tries to proceed without granting all 3 permissions
  const [showIncompleteAlert, setShowIncompleteAlert] = useState(false);

  const isSmall = height < 700;

  const allPermissionsGranted = granted.accessibility && granted.notifications && granted.overlay;

  // Check if native permissions are active and re-check on AppState focus
  const checkPermissions = useCallback(async () => {
    try {
      const [acc, ovr] = await Promise.all([
        RecoverBlocker.isAccessibilityEnabled(),
        RecoverBlocker.isOverlayEnabled(),
      ]);
      setGranted((prev) => ({
        ...prev,
        accessibility: acc || prev.accessibility,
        overlay: ovr || prev.overlay,
        notifications: true, // notifications default to allowed
      }));
    } catch {}
  }, []);

  useEffect(() => {
    checkPermissions();
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkPermissions();
      }
    });
    return () => sub.remove();
  }, [checkPermissions]);

  const handleToggle = (perm: PermissionConfig) => {
    if (granted[perm.key]) {
      // Toggle off directly if user wants
      setGranted((prev) => ({ ...prev, [perm.key]: false }));
    } else {
      // Open Apple/iOS style permission prompt giving the reason
      setActiveDialog(perm);
    }
  };

  const handleAllow = async () => {
    if (activeDialog) {
      const key = activeDialog.key;
      setGranted((prev) => ({ ...prev, [key]: true }));
      setActiveDialog(null);

      if (key === 'accessibility') {
        await RecoverBlocker.openAccessibilitySettings();
      } else if (key === 'overlay') {
        await RecoverBlocker.openOverlaySettings();
      }
    }
  };

  const handleDontAllow = () => {
    setActiveDialog(null);
  };

  const handleContinue = async () => {
    await AsyncStorage.setItem('@recover_user_authenticated', 'true').catch(() => {});
    // Navigates directly into the Dashboard
    navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + (isSmall ? 16 : 30),
            paddingBottom: Math.max(insets.bottom, 16) + 16,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Block */}
        <View style={styles.headerBlock}>
          <Text style={styles.title}>App Permissions</Text>
          <Text style={styles.subtitle}>
            One last thing! Enable the following permissions to help Recover manage your focus sessions and block distractions.
          </Text>
        </View>

        {/* Permission Cards */}
        <View style={styles.cardsWrap}>
          {PERMISSIONS.map((perm) => {
            const isEnabled = granted[perm.key];
            return (
              <Pressable
                key={perm.key}
                style={({ pressed }) => [
                  styles.card,
                  pressed && { opacity: 0.9 },
                ]}
                onPress={() => handleToggle(perm)}
              >
                {/* Left Icon */}
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: `${perm.iconColor}1F` },
                  ]}
                >
                  {perm.iconType === 'ionic' ? (
                    <Ionicons
                      name={perm.iconName as any}
                      size={22}
                      color={perm.iconColor}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name={perm.iconName as any}
                      size={22}
                      color={perm.iconColor}
                    />
                  )}
                </View>

                {/* Center Content */}
                <View style={styles.cardTextCol}>
                  <Text style={styles.cardTitle}>{perm.title}</Text>
                  <Text style={styles.cardDesc}>{perm.description}</Text>
                </View>

                {/* Right Switch (White toggle when active) */}
                <Switch
                  value={isEnabled}
                  onValueChange={() => handleToggle(perm)}
                  trackColor={{ false: '#39393D', true: '#FFFFFF' }}
                  thumbColor={isEnabled ? '#000000' : '#FFFFFF'}
                  style={styles.switch}
                />
              </Pressable>
            );
          })}
        </View>

        {/* Footer info link */}
        <Text style={styles.footerNote}>
          You can review{' '}
          <Text style={styles.footerLink}>why these permissions are needed</Text>
          {' '}and manage them later in your phone’s Settings.
        </Text>

        <View style={{ flex: 1, minHeight: 32 }} />

        {/* Continue Button (Disabled unless all 3 permissions are turned on) */}
        <Pressable
          style={({ pressed }) => [
            styles.continueBtn,
            !allPermissionsGranted && styles.continueBtnDisabled,
            pressed && allPermissionsGranted && { opacity: 0.88, transform: [{ scale: 0.99 }] },
          ]}
          onPress={handleContinue}
        >
          <Text
            style={[
              styles.continueBtnText,
              !allPermissionsGranted && styles.continueBtnTextDisabled,
            ]}
          >
            Continue {allPermissionsGranted ? '' : `(${Object.values(granted).filter(Boolean).length}/3)`}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Alert when user tries to continue without enabling all permissions */}
      <Modal
        visible={showIncompleteAlert}
        transparent
        animationType="fade"
        onRequestClose={() => setShowIncompleteAlert(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.alertCard}>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Permissions Required</Text>
              <Text style={styles.alertReason}>
                Please turn on all 3 permissions (Accessibility Service, Notifications, and Display Over Other Apps) to continue and activate app blocking.
              </Text>
            </View>

            <View style={styles.alertBtnRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.alertBtn,
                  pressed && { backgroundColor: '#E5E5EA' },
                ]}
                onPress={() => setShowIncompleteAlert(false)}
              >
                <Text style={styles.allowText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Permission Reason Dialog Popup (Image 4 style) */}
      <Modal
        visible={activeDialog !== null}
        transparent
        animationType="fade"
        onRequestClose={handleDontAllow}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.alertCard}>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                {activeDialog?.dialogTitle}
              </Text>
              <Text style={styles.alertReason}>
                {activeDialog?.dialogReason}
              </Text>
            </View>

            {/* Bottom Button Row */}
            <View style={styles.alertBtnRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.alertBtn,
                  pressed && { backgroundColor: '#E5E5EA' },
                ]}
                onPress={handleDontAllow}
              >
                <Text style={styles.dontAllowText}>Don’t Allow</Text>
              </Pressable>

              <View style={styles.alertDividerV} />

              <Pressable
                style={({ pressed }) => [
                  styles.alertBtn,
                  pressed && { backgroundColor: '#E5E5EA' },
                ]}
                onPress={handleAllow}
              >
                <Text style={styles.allowText}>Allow</Text>
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
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 27,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  subtitle: {
    color: '#A1A1A6',
    fontFamily: fonts.regular,
    fontSize: 14.5,
    lineHeight: 20.5,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 6,
  },
  cardsWrap: {
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141417',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222227',
    padding: 18,
    marginBottom: 14,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 16,
    letterSpacing: -0.2,
  },
  cardDesc: {
    color: '#8E8E93',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  footerNote: {
    color: '#8E8E93',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
  },
  footerLink: {
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  continueBtn: {
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  continueBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  continueBtnText: {
    color: '#000000',
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  continueBtnTextDisabled: {
    color: 'rgba(255, 255, 255, 0.42)',
  },

  /* Apple-style Permission Dialog (Image 4) */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  alertCard: {
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
  alertContent: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 18,
    alignItems: 'center',
  },
  alertTitle: {
    color: '#000000',
    fontFamily: fonts.bold,
    fontSize: 17,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  alertReason: {
    color: '#3C3C43',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  alertBtnRow: {
    flexDirection: 'row',
    height: 46,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#C6C6C8',
  },
  alertBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dontAllowText: {
    color: '#007AFF',
    fontFamily: fonts.regular,
    fontSize: 17,
  },
  allowText: {
    color: '#007AFF',
    fontFamily: fonts.bold,
    fontSize: 17,
  },
  alertDividerV: {
    width: StyleSheet.hairlineWidth,
    height: '100%',
    backgroundColor: '#C6C6C8',
  },
});
