import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { fonts } from '../theme';
import { useApp } from '../context/AppContext';

export type LegalModalType = 'terms' | 'privacy' | 'notices' | 'faq';

interface LegalNoticeModalProps {
  visible: boolean;
  type: LegalModalType | null;
  onClose: () => void;
  onDeleteAccount?: () => void;
}

export default function LegalNoticeModal({ visible, type, onClose, onDeleteAccount }: LegalNoticeModalProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { deleteAccount } = useApp();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!visible || !type) return null;

  const isTerms = type === 'terms';
  const isPrivacy = type === 'privacy';
  const isFaq = type === 'faq';

  const title = isTerms
    ? 'User Agreement'
    : isPrivacy
    ? 'Privacy Policy'
    : isFaq
    ? 'FAQ & How It Works'
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
          {isTerms && (
            <>
              <Text style={styles.documentMainTitle}>Recover User Agreement</Text>
              <Text style={styles.effectiveDate}>Last updated: oct 20 2026</Text>

              <Text style={styles.leadParagraph}>
                Welcome to Recover! Please read this User Agreement carefully before using the app. This agreement constitutes a legal contract between you and Regrind.
              </Text>

              <Text style={styles.sectionHeading}>1. Service Description</Text>
              <Text style={styles.paragraph}>
                Recover is a focus management app designed to help users improve their concentration and productivity. By using this app, you agree to comply with this agreement and relevant laws and regulations.
              </Text>

              <Text style={styles.sectionHeading}>2. User Account</Text>
              <Text style={styles.subHeading}>2.1 Account Registration</Text>
              <Text style={styles.paragraph}>
                You must provide accurate and truthful information during registration. If false information is detected, Regrind reserves the right to suspend or terminate the service.
              </Text>

              <Text style={styles.subHeading}>2.2 Account Security</Text>
              <Text style={styles.paragraph}>
                You are responsible for safeguarding your account information. Regrind is not liable for any account breaches resulting from user negligence.
              </Text>

              <Text style={styles.sectionHeading}>3. Usage Rules</Text>
              <Text style={styles.paragraph}>
                When using recover, you agree to the following:
              </Text>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  Users are prohibited from using the app to publish or distribute illegal, harmful, or infringing content.
                </Text>
              </View>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  Reverse engineering, hacking, or unauthorized access and manipulation of the app are strictly prohibited.
                </Text>
              </View>

              <Text style={styles.sectionHeading}>4. Intellectual Property</Text>
              <Text style={styles.paragraph}>
                Recover owns all rights to the app and related content, including but not limited to software code, interface design, and written content. Without permission, reproduction, modification, or distribution of any content is prohibited.
              </Text>

              <Text style={styles.sectionHeading}>5. Limitation of Liability</Text>
              <Text style={styles.paragraph}>
                While Recover strives to ensure service stability, we are not liable for service interruptions or data loss caused by force majeure or factors beyond our control.
              </Text>

              <Text style={styles.sectionHeading}>6. Agreement Modifications</Text>
              <Text style={styles.paragraph}>
                We reserve the right to modify the terms of this agreement at any time. In case of changes, we will notify users via in-app notifications or other appropriate means. Continued use of the app implies acceptance of the revised terms.
              </Text>

              <Text style={styles.sectionHeading}>7. Subscription, Billing, and In-App Purchases</Text>
              <Text style={styles.paragraph}>
                Purchases and subscriptions are processed through third-party platforms such as RevenueCat, Stripe, the Apple App Store, Google Play, or other authorized payment processors. Their respective terms govern payment processing, renewals, and refunds.
              </Text>
              <Text style={styles.paragraph}>
                Subscriptions automatically renew unless cancelled at least 24 hours before the current period ends.
              </Text>

              <Text style={styles.sectionHeading}>8. User Data Ownership & Deletion Rights</Text>
              <Text style={styles.paragraph}>
                Recover collects only focus session and wallet balance data strictly required to calculate your personal focus analytics and rewards on-device. You retain full control over your personal data and may delete your account at any time via the in-app &ldquo;Delete Account&rdquo; button. Deletion immediately and permanently erases all stored focus history, credits, and profile data from the database.
              </Text>

              <Text style={styles.sectionHeading}>9. Contact Information</Text>
              <Text style={styles.paragraph}>
                If you have any questions about this agreement or our services, please contact us:
              </Text>
              <Text style={styles.contactEmail}>contact.studyterminal@gmail.com</Text>
            </>
          )}

          {isFaq && (
            <>
              <Text style={styles.documentMainTitle}>Frequently Asked Questions</Text>
              <Text style={styles.effectiveDate}>Everything you need to know about how Recover works</Text>

              <Text style={styles.sectionHeading}>1. How does Recover work?</Text>
              <Text style={styles.paragraph}>
                Recover turns screen time management into an intentional, rewarding process. During active focus sessions, Recover blocks distracting apps that you select. For every minute you stay focused, you earn 1 Focus Credit that can be redeemed toward temporary, guilt-free screen time.
              </Text>

              <Text style={styles.sectionHeading}>2. What are Focus Credits?</Text>
              <Text style={styles.paragraph}>
                Focus Credits represent your personal focus currency (1 credit = 1 minute of unlocked screen time). You earn credits by completing focus sessions and keeping distracting apps closed.
              </Text>

              <Text style={styles.sectionHeading}>3. How does App Blocking work?</Text>
              <Text style={styles.paragraph}>
                When you attempt to open a designated distracting app (such as YouTube, Instagram, or TikTok) during a session, Recover detects the app launch via device Accessibility Service and displays a focus shield overlay, prompting you to stay on track.
              </Text>

              <Text style={styles.sectionHeading}>4. Free Plan vs. Recover Pro</Text>
              <Text style={styles.paragraph}>
                • <Text style={styles.boldSpan}>Free Users</Text>: Block up to 3 distracting apps at once, earn focus credits, and track weekly focus time.
              </Text>
              <Text style={styles.paragraph}>
                • <Text style={styles.boldSpan}>Recover Pro</Text>: Block unlimited distracting apps, unlock custom Recover Wallet card skins, enjoy an ad-free experience, and access in-depth focus analytics.
              </Text>

              <Text style={styles.sectionHeading}>5. How do I delete my account?</Text>
              <Text style={styles.paragraph}>
                All your data will be permanently deleted from the database. You can delete your account at any time in your Account settings or by tapping the button below. Once confirmed, your focus credits, session history, and customized card settings are permanently removed.
              </Text>
              <Pressable
                style={({ pressed }) => [styles.faqDeleteAccountBtn, pressed && { opacity: 0.8 }]}
                onPress={() => setShowDeleteModal(true)}
              >
                <Ionicons name="trash-outline" size={14} color="#EF4444" style={{ marginRight: 6 }} />
                <Text style={styles.faqDeleteAccountText}>Delete Account</Text>
              </Pressable>

              <Text style={styles.sectionHeading}>6. Are my messages and private data safe?</Text>
              <Text style={styles.paragraph}>
                Yes. All app detection runs locally on your device. Recover never reads your private messages, keystrokes, personal photos, or browsing content.
              </Text>

              <Text style={styles.sectionHeading}>7. How do I manage or cancel my subscription?</Text>
              <Text style={styles.paragraph}>
                You can manage payment methods or cancel anytime in Account → Subscription, or through your device&apos;s app store subscription settings.
              </Text>

              <Text style={styles.sectionHeading}>8. Have more questions?</Text>
              <Text style={styles.paragraph}>
                Our team is always here to assist. Drop us an email at:
              </Text>
              <Text style={styles.contactEmail}>contact.studyterminal@gmail.com</Text>
            </>
          )}

          {isPrivacy && (
            <>
              <Text style={styles.documentMainTitle}>Privacy Policy</Text>
              <Text style={styles.effectiveDate}>Effective Date: October 2026</Text>

              <Text style={styles.sectionHeading}>1. Information We Collect</Text>
              <Text style={styles.paragraph}>
                Recover prioritizes local-first privacy. We collect usage statistics including session duration and focus credits earned. We never sell your personal data to third parties.
              </Text>

              <Text style={styles.sectionHeading}>2. Device Permissions & Accessibility</Text>
              <Text style={styles.paragraph}>
                Screen time and accessibility permissions are exclusively used on-device to detect foreground applications during active focus sessions. No keystrokes, personal messages, or browsed content are captured or transmitted.
              </Text>

              <Text style={styles.sectionHeading}>3. Storage, Analytics & Complete Data Deletion</Text>
              <Text style={styles.paragraph}>
                Focus session statistics and analytics are processed locally on your device to help you understand your personal focus rhythm and peak focus time. We never sell, transmit, or monetize your personal usage logs. You can delete all your stored data anytime by choosing &ldquo;Delete Account&rdquo; in settings, which permanently and irreversibly deletes all focus sessions, credits, and profile data from the database.
              </Text>

              <Text style={styles.sectionHeading}>4. Contact Us</Text>
              <Text style={styles.paragraph}>
                For privacy inquiries:
              </Text>
              <Text style={styles.contactEmail}>contact.studyterminal@gmail.com</Text>
            </>
          )}

          {!isTerms && !isPrivacy && !isFaq && (
            <>
              <Text style={styles.documentMainTitle}>Legal Notices & Compliance</Text>
              <Text style={styles.effectiveDate}>Effective Date: October 2026</Text>

              <Text style={styles.sectionHeading}>1. Regulatory Compliance</Text>
              <Text style={styles.paragraph}>
                Recover complies with digital wellbeing standards and mobile platform accessibility guidelines.
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
                    if (onDeleteAccount) {
                      onDeleteAccount();
                    }
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
  documentMainTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 22,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  effectiveDate: {
    color: '#71717A',
    fontFamily: fonts.regular,
    fontSize: 12.5,
    marginBottom: 16,
  },
  leadParagraph: {
    color: '#D4D4D8',
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  sectionHeading: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 15.5,
    marginTop: 16,
    marginBottom: 8,
  },
  subHeading: {
    color: '#E4E4E7',
    fontFamily: fonts.semibold,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    color: '#A1A1AA',
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    paddingLeft: 6,
    marginBottom: 6,
  },
  bulletDot: {
    color: '#3B82F6',
    fontSize: 16,
    marginRight: 8,
    lineHeight: 20,
  },
  bulletText: {
    flex: 1,
    color: '#A1A1AA',
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 20,
  },
  contactEmail: {
    color: '#38BDF8',
    fontFamily: fonts.semibold,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 12,
  },
  boldSpan: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
  },
  gotItBtn: {
    marginTop: 26,
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
  faqDeleteAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 6,
    marginBottom: 14,
  },
  faqDeleteAccountText: {
    color: '#EF4444',
    fontFamily: fonts.semibold,
    fontSize: 13,
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
