import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import PillButton from '../../components/PillButton';
import FloatingCoinRing, { REF_TITLE_Y, REF_W } from '../../components/FloatingCoinRing';
import { colors, fonts } from '../../theme';
import type { AppAStackParamList } from '../navigation/AppANavigator';

type Props = NativeStackScreenProps<AppAStackParamList, 'InstallerIntro'>;

/**
 * App A: Recover Introductory Screen
 * Clean, minimalistic branding with floating metallic coin animation
 * and Apple-style permission prompt.
 */
export default function InstallerIntroScreen({ navigation }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scale = width / REF_W;
  const centerY = height * (REF_TITLE_Y / 1600);

  const isSmallScreen = height < 700;

  // Apple-style permission dialog state
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const handleContinuePress = () => {
    setShowPermissionModal(true);
  };

  const handleDeny = () => {
    setShowPermissionModal(false);
  };

  const handleConfirmContinue = () => {
    // Simply dismiss popup — no fake install or anything
    setShowPermissionModal(false);
  };

  return (
    <View style={styles.root}>
      {/* Floating 3D Metallic Coin Ring */}
      <FloatingCoinRing width={width} centerY={centerY} scale={scale} />

      {/* Main Title & Subtitle in Coin Center — says just "recover" */}
      <View style={[styles.titleWrap, { top: centerY - 28 }]}>
        <Text style={styles.title}>
          <Text style={{ fontFamily: fonts.bold, letterSpacing: -0.6 }}>recover</Text>
        </Text>
        <Text style={styles.subtitle}>Your path to distraction-free focus</Text>
      </View>

      {/* Bottom CTA & Description Block */}
      <View
        style={[
          styles.bottom,
          {
            paddingBottom: Math.max(insets.bottom, 16) + (isSmallScreen ? 18 : 28),
          },
        ]}
      >
        <Text
          style={[
            styles.description,
            isSmallScreen && { fontSize: 12.5, lineHeight: 18, marginBottom: 14 },
          ]}
        >
          Manage distracting apps, complete focus sessions, and earn credits toward temporary screen-time unlocks.
        </Text>

        <PillButton
          title="Continue"
          onPress={handleContinuePress}
          height={isSmallScreen ? 44 : 48}
          fontSize={15}
        />
      </View>

      {/* APPLE-STYLE PERMISSION POPUP: Allow Installing App */}
      <Modal
        visible={showPermissionModal}
        transparent
        animationType="fade"
        onRequestClose={handleDeny}
      >
        <View style={styles.appleModalBackdrop}>
          <View style={styles.appleAlertCard}>
            <View style={styles.appleAlertContent}>
              <Text style={styles.appleAlertTitle}>Allow Installing App?</Text>
              <Text style={styles.appleAlertReason}>
                Allow &ldquo;Recover&rdquo; to install and configure focus rules on your device so that distraction blocking, focus sessions, and screen-time unlock features work properly.
              </Text>
            </View>

            <View style={styles.appleAlertBtnRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.appleAlertBtn,
                  pressed && { backgroundColor: '#E5E5EA' },
                ]}
                onPress={handleDeny}
              >
                <Text style={styles.appleCancelText}>Deny</Text>
              </Pressable>

              <View style={styles.appleAlertDividerV} />

              <Pressable
                style={({ pressed }) => [
                  styles.appleAlertBtn,
                  pressed && { backgroundColor: '#E5E5EA' },
                ]}
                onPress={handleConfirmContinue}
              >
                <Text style={styles.appleAllowText}>Continue</Text>
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
    backgroundColor: colors.black,
  },
  titleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  title: {
    color: colors.white,
    fontSize: 26,
    includeFontPadding: false,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.gray2,
    fontSize: 14,
    fontFamily: fonts.regular,
    marginTop: 8,
    textAlign: 'center',
  },
  bottom: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 0,
  },
  description: {
    color: '#8A8A8E',
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 19.5,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },

  // APPLE-STYLE PERMISSION POPUP
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
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
    alignItems: 'center',
  },
  appleAlertTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: '#000000',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  appleAlertReason: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: '#3C3C43',
    textAlign: 'center',
    lineHeight: 18.5,
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
});
