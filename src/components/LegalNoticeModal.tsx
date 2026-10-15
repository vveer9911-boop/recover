import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND_NAME, fonts } from '../theme';

interface LegalNoticeModalProps {
  visible: boolean;
  type: 'terms' | 'privacy' | 'notices' | null;
  onClose: () => void;
}

export default function LegalNoticeModal({ visible, type, onClose }: LegalNoticeModalProps) {
  const insets = useSafeAreaInsets();

  if (!visible || !type) return null;

  const isTerms = type === 'terms';
  const isPrivacy = type === 'privacy';

  const title = isTerms
    ? 'Terms & Conditions'
    : isPrivacy
    ? 'Privacy Policy'
    : 'Legal Notices & Compliance';

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
            onPress={onClose}
            hitSlop={12}
          >
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.effectiveDate}>Effective Date: October 2026</Text>

          {isTerms && (
            <>
              <Text style={styles.sectionHeading}>1. Acceptance of Terms</Text>
              <Text style={styles.paragraph}>
                By downloading, accessing, or using {BRAND_NAME}, you agree to be bound by these Terms and Conditions. {BRAND_NAME} provides a focus accountability and screen time regulation system where credits earned through focus sessions can be utilized to unlock applications.
              </Text>

              <Text style={styles.sectionHeading}>2. Focus Credits & Wallet Usage</Text>
              <Text style={styles.paragraph}>
                Focus credits represent in-app utility units calculated as 1 credit = 1 minute of unlocked screen time. Credits hold no cash value and cannot be exchanged for fiat currency outside {BRAND_NAME} ecosystem.
              </Text>

              <Text style={styles.sectionHeading}>3. Spend Limits & Calm Down Protocols</Text>
              <Text style={styles.paragraph}>
                Users may configure daily, weekly, and annual spend limits. When spend limits are reached, the application initiates an intentional Calm Down cooldown (e.g. 1 hour, 2 hours, 3 hours) to prevent compulsive device usage.
              </Text>

              <Text style={styles.sectionHeading}>4. Subscription & Billing</Text>
              <Text style={styles.paragraph}>
                {BRAND_NAME} offers a Free Current Plan and a Plus subscription tier. Plus subscriptions renew automatically through Google Play or Apple App Store unless canceled at least 24 hours prior to the renewal date.
              </Text>
            </>
          )}

          {isPrivacy && (
            <>
              <Text style={styles.sectionHeading}>1. Information We Collect</Text>
              <Text style={styles.paragraph}>
                {BRAND_NAME} prioritizes local-first privacy. We collect usage statistics including session duration, focus credits earned, and spend limit configurations. We never sell your personal data to third parties.
              </Text>

              <Text style={styles.sectionHeading}>2. Device Permissions & Accessibility</Text>
              <Text style={styles.paragraph}>
                Screen time and accessibility permissions are exclusively used on-device to detect foreground applications during active focus sessions. No keystrokes, personal messages, or browsed content are captured or transmitted.
              </Text>

              <Text style={styles.sectionHeading}>3. Storage & Security</Text>
              <Text style={styles.paragraph}>
                All wallet transactions and cardholder settings are stored securely with industry-standard encryption. You may request account deletion or data clearance at any time.
              </Text>
            </>
          )}

          {!isTerms && !isPrivacy && (
            <>
              <Text style={styles.sectionHeading}>1. Regulatory Compliance</Text>
              <Text style={styles.paragraph}>
                {BRAND_NAME} complies with digital wellbeing standards and mobile platform accessibility guidelines.
              </Text>

              <Text style={styles.sectionHeading}>2. Open Source Licenses</Text>
              <Text style={styles.paragraph}>
                This application utilizes open-source components including React Native, Expo, and vector icons under the MIT and Apache 2.0 licenses.
              </Text>
            </>
          )}

          <Pressable style={styles.gotItBtn} onPress={onClose}>
            <Text style={styles.gotItText}>Close</Text>
          </Pressable>
        </ScrollView>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#242428',
  },
  closeBtn: {
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
    fontSize: 16.5,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  effectiveDate: {
    color: '#71717A',
    fontFamily: fonts.regular,
    fontSize: 12,
    marginBottom: 16,
  },
  sectionHeading: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 15,
    marginTop: 14,
    marginBottom: 6,
  },
  paragraph: {
    color: '#A1A1AA',
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 10,
  },
  gotItBtn: {
    marginTop: 24,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gotItText: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 14.5,
  },
});
