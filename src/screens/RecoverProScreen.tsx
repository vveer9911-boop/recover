import React, { useState } from 'react';
import {
  Alert,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { RecoverWingedLogo } from '../components/Icons';
import LegalNoticeModal, { LegalModalType } from '../components/LegalNoticeModal';
import { fonts } from '../theme';
import { useApp } from '../context/AppContext';

type Props = {
  navigation: any;
  route?: any;
};

const PRO_SKY_BG = require('../../assets/pro-sky-bg.png');

const PRO_FEATURES = [
  'Ad-free experience',
  'Customise your Recover Wallet cards',
  'Block up to 10 distracting apps',
  'Unlock focus analytics',
];

export default function RecoverProScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { isPlus, setIsPlus, userName, distractingApps, setDistractingApps, deleteAccount } = useApp();

  const isSmall = height < 700;
  const fromOnboarding = route?.params?.fromOnboarding ?? false;

  // When Pro user taps "Plan Details" from Subscription Management
  const [viewingPlanDetails, setViewingPlanDetails] = useState(false);

  // When Pro user taps "Billing History" from Subscription Management
  const [viewingBillingHistory, setViewingBillingHistory] = useState(false);

  // Invoices list state (empty by default per user request)
  const [billingHistory, setBillingHistory] = useState<Array<{
    id: string;
    plan: string;
    date: string;
    amount: string;
    status: string;
  }>>([]);

  // Apple-style cancel subscription modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Legal / FAQ modal state
  const [activeLegalModal, setActiveLegalModal] = useState<LegalModalType | null>(null);

  // =========================================================================
  // VIEW 1.5: PRO USER BILLING HISTORY VIEW
  // Triggered when user taps "Billing History"
  // =========================================================================
  if (viewingBillingHistory) {
    return (
      <View style={styles.proRoot}>
        {/* Top Header Bar */}
        <View style={[styles.proHeaderBar, { paddingTop: insets.top + 8 }]}>
          <Pressable
            onPress={() => setViewingBillingHistory(false)}
            style={({ pressed }) => [styles.backBtnPill, pressed && { opacity: 0.7 }]}
            hitSlop={14}
          >
            <Feather name="chevron-left" size={20} color="#FFFFFF" />
            <Text style={styles.backBtnText}>Back</Text>
          </Pressable>
          <Text style={styles.billingHeaderTitle}>Billing History</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.proScrollContent,
            { paddingBottom: insets.bottom + 32, flexGrow: 1 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {billingHistory.length === 0 ? (
            <View style={styles.emptyBillingWrap}>
              <View style={styles.emptyBillingIconWrap}>
                <Ionicons name="receipt-outline" size={40} color="#71717A" />
              </View>
              <Text style={styles.emptyBillingTitle}>No payment history available</Text>
              <Text style={styles.emptyBillingSub}>
                You don&apos;t have any previous invoices or billing receipts. When your subscription is billed, details will appear here.
              </Text>
            </View>
          ) : (
            <View style={styles.proCardGroup}>
              {billingHistory.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index > 0 && <View style={styles.proDivider} />}
                  <View style={styles.billingItemRow}>
                    <View style={styles.billingItemLeft}>
                      <Text style={styles.billingItemPlan}>{item.plan}</Text>
                      <Text style={styles.billingItemDate}>{item.date}</Text>
                      <Text style={styles.billingItemId}>ID: {item.id}</Text>
                    </View>
                    <View style={styles.billingItemRight}>
                      <Text style={styles.billingItemAmount}>{item.amount}</Text>
                      <View style={styles.billingPaidBadge}>
                        <Text style={styles.billingPaidText}>{item.status}</Text>
                      </View>
                    </View>
                  </View>
                </React.Fragment>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // =========================================================================
  // VIEW 1: PRO USER SUBSCRIPTION MANAGEMENT VIEW
  // Triggered when isPlus is active, not during initial onboarding, and not viewing plan details
  // =========================================================================
  if (isPlus && !fromOnboarding && !viewingPlanDetails) {
    const userInitial = (userName.trim() ? userName.trim()[0] : 'R').toUpperCase();

    const handleConfirmCancel = () => {
      setShowCancelModal(false);
      setIsPlus(false);
      if (distractingApps.length > 3) {
        setDistractingApps(distractingApps.slice(0, 3));
      }
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Dashboard');
      }
    };

    const handleConfirmDelete = async () => {
      setShowDeleteModal(false);
      await deleteAccount();
      try {
        navigation.reset({
          index: 0,
          routes: [{ name: 'HowItWorks' }],
        });
      } catch (e) {
        navigation.navigate('HowItWorks');
      }
    };

    return (
      <View style={styles.proRoot}>
        {/* Top Header */}
        <View style={[styles.proHeaderBar, { paddingTop: insets.top + 8 }]}>
          <View style={styles.proAvatarWrap}>
            <Text style={styles.proAvatarText}>{userInitial}</Text>
          </View>
          <Pressable
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('Dashboard');
              }
            }}
            style={({ pressed }) => [styles.proCloseBtn, pressed && { opacity: 0.7 }]}
            hitSlop={14}
          >
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.proScrollContent,
            { paddingBottom: insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Headline */}
          <Text style={styles.proMainTitle}>Subscription</Text>
          <Text style={styles.proSubTitle}>Manage your plan and billing.</Text>

          {/* CURRENT PLAN CARD */}
          <View style={styles.proCurrentPlanCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.proCurrentPlanLabel}>CURRENT PLAN</Text>
              <Text style={styles.proCurrentPlanName}>Recover Pro</Text>
              <Text style={styles.proCurrentPlanPrice}>₹199 / month</Text>
              <Text style={styles.proCurrentPlanRenew}>Renews on May 24, 2026</Text>
            </View>
            <View style={styles.proSparkleBadge}>
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            </View>
          </View>

          {/* SECTION 1: Billing & Details */}
          <View style={styles.proCardGroup}>
            <Pressable
              style={({ pressed }) => [styles.proRowItem, pressed && { opacity: 0.75 }]}
              onPress={() => setViewingBillingHistory(true)}
            >
              <View style={styles.proRowIconWrap}>
                <Ionicons name="time-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.proRowTitle}>Billing History</Text>
                <Text style={styles.proRowSub}>View your past invoices</Text>
              </View>
              <Feather name="chevron-right" size={17} color="#52525B" />
            </Pressable>

            <View style={styles.proDivider} />

            <Pressable
              style={({ pressed }) => [styles.proRowItem, pressed && { opacity: 0.75 }]}
              onPress={() => setViewingPlanDetails(true)}
            >
              <View style={styles.proRowIconWrap}>
                <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.proRowTitle}>Plan Details</Text>
                <Text style={styles.proRowSub}>View features and limits</Text>
              </View>
              <Feather name="chevron-right" size={17} color="#52525B" />
            </Pressable>
          </View>

          {/* SECTION 2: Subscription & Account Management */}
          <View style={styles.proCardGroup}>
            <Pressable
              style={({ pressed }) => [styles.proRowItem, pressed && { opacity: 0.75 }]}
              onPress={() => setShowCancelModal(true)}
            >
              <Text style={styles.proCancelText}>Cancel Subscription</Text>
              <Feather name="chevron-right" size={17} color="#52525B" />
            </Pressable>
            <View style={styles.proDivider} />
            <Pressable
              style={({ pressed }) => [styles.proRowItem, pressed && { opacity: 0.75 }]}
              onPress={() => setShowDeleteModal(true)}
            >
              <Text style={styles.proCancelText}>Delete Account</Text>
              <Feather name="chevron-right" size={17} color="#52525B" />
            </Pressable>
          </View>

          {/* SECTION 3: Support */}
          <View style={styles.proCardGroup}>
            <Pressable
              style={({ pressed }) => [styles.proRowItem, pressed && { opacity: 0.75 }]}
              onPress={() => setActiveLegalModal('faq')}
            >
              <View style={styles.proRowIconWrap}>
                <Ionicons name="help-circle-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.proRowTitle}>Need help? FAQ</Text>
                <Text style={styles.proRowSub}>Visit our help center & FAQs</Text>
              </View>
              <Feather name="chevron-right" size={17} color="#52525B" />
            </Pressable>
          </View>
        </ScrollView>

        {/* LEGAL / FAQ MODAL */}
        <LegalNoticeModal
          visible={activeLegalModal !== null}
          type={activeLegalModal}
          onClose={() => setActiveLegalModal(null)}
        />

        {/* APPLE-STYLE POPUP FOR CANCEL SUBSCRIPTION */}
        <Modal
          visible={showCancelModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCancelModal(false)}
        >
          <View style={styles.dialogBackdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowCancelModal(false)} />
            <View style={styles.systemAlert}>
              <View style={styles.alertBody}>
                <Text style={styles.alertCancelTitle}>Cancel Subscription</Text>
                <Text style={styles.alertCancelMessage}>
                  Are you sure you want to cancel your Recover Pro subscription? Pro features, unlimited app blocks, and custom cards will be locked.
                </Text>
              </View>
              <View style={styles.alertButtons}>
                <Pressable
                  style={({ pressed }) => [styles.alertBtn, pressed && { backgroundColor: '#E5E5EA' }]}
                  onPress={() => setShowCancelModal(false)}
                >
                  <Text style={styles.alertBtnTextNormal}>Keep Subscription</Text>
                </Pressable>
                <View style={styles.alertDividerV} />
                <Pressable
                  style={({ pressed }) => [styles.alertBtn, pressed && { backgroundColor: '#E5E5EA' }]}
                  onPress={handleConfirmCancel}
                >
                  <Text style={styles.alertBtnTextDestructive}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* APPLE-STYLE POPUP FOR DELETE ACCOUNT */}
        <Modal
          visible={showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={styles.dialogBackdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowDeleteModal(false)} />
            <View style={styles.systemAlert}>
              <View style={styles.alertBody}>
                <Text style={styles.alertCancelTitle}>Delete Account</Text>
                <Text style={styles.alertCancelMessage}>
                  All your data will be permanently deleted from the database.
                </Text>
              </View>
              <View style={styles.alertButtons}>
                <Pressable
                  style={({ pressed }) => [styles.alertBtn, pressed && { backgroundColor: '#E5E5EA' }]}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={styles.alertBtnTextNormal}>Cancel</Text>
                </Pressable>
                <View style={styles.alertDividerV} />
                <Pressable
                  style={({ pressed }) => [styles.alertBtn, pressed && { backgroundColor: '#E5E5EA' }]}
                  onPress={handleConfirmDelete}
                >
                  <Text style={styles.alertBtnTextDestructive}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // =========================================================================
  // VIEW 2: RECOVER PRO UPGRADE / PLAN DETAILS SCREEN
  // Triggered for free users, onboarding flow, or Pro user clicking "Plan Details"
  // =========================================================================
  const handleExit = () => {
    if (viewingPlanDetails) {
      setViewingPlanDetails(false);
      return;
    }
    if (fromOnboarding) {
      // Proceed to Permissions screen per onboarding flow
      navigation.navigate('Permissions');
    } else {
      // Return to dashboard / modal
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Dashboard');
      }
    }
  };

  const handleUpgrade = () => {
    setIsPlus(true);
    if (fromOnboarding) {
      navigation.navigate('Permissions');
    } else {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Dashboard');
      }
    }
  };

  const handleRestore = () => {
    setIsPlus(true);
    if (fromOnboarding) {
      navigation.navigate('Permissions');
    } else {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Dashboard');
      }
    }
  };

  return (
    <View style={styles.root}>
      {/* Cloudy Sky Background with subtle dark vignette */}
      <ImageBackground
        source={PRO_SKY_BG}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View style={[StyleSheet.absoluteFill, styles.vignetteOverlay]} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + (isSmall ? 8 : 16),
            paddingBottom: Math.max(insets.bottom, 16) + 16,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Row with Skip / Close / Back Button */}
        <View style={styles.topNavRow}>
          {viewingPlanDetails ? (
            <Pressable
              style={({ pressed }) => [styles.backBtnPill, pressed && { opacity: 0.7 }]}
              onPress={() => setViewingPlanDetails(false)}
              hitSlop={12}
            >
              <Feather name="chevron-left" size={20} color="#FFFFFF" />
              <Text style={styles.backBtnText}>Back</Text>
            </Pressable>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          {fromOnboarding ? (
            <Pressable
              style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.65 }]}
              onPress={handleExit}
              hitSlop={12}
            >
              <Text style={styles.skipText}>Skip</Text>
              <Feather name="arrow-right" size={17} color="#FFFFFF" style={{ marginLeft: 5 }} />
            </Pressable>
          ) : !viewingPlanDetails ? (
            <Pressable
              style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.65 }]}
              onPress={handleExit}
              hitSlop={12}
            >
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </Pressable>
          ) : null}
        </View>

        {/* Centered App Icon Badge */}
        <View style={styles.appIconCard}>
          <RecoverWingedLogo size={46} />
        </View>

        {/* Headline & Subtitle */}
        <Text style={[styles.title, isSmall && { fontSize: 24, marginTop: 10 }]}>Recover Pro</Text>
        <Text style={[styles.subtitle, isSmall && { fontSize: 13.5, lineHeight: 19 }]}>
          Take control of your time.{'\n'}Unlock your full focus potential.
        </Text>

        {/* Glassmorphism Pro Membership Card */}
        <View style={[styles.proCard, isSmall && { padding: 18, marginTop: 16 }]}>
          <Text style={styles.cardHeaderTitle}>RECOVER PRO</Text>
          <Text style={styles.cardHeaderSub}>More focus. Fewer distractions. Greater control.</Text>

          {/* Membership Dropdown Pill */}
          <View style={styles.dropdownPill}>
            <Text style={styles.dropdownText}>Recover Pro Membership</Text>
            <Feather name="chevron-down" size={18} color="#FFFFFF" />
          </View>

          {/* Price display */}
          <View style={styles.priceRow}>
            <Text style={styles.priceAmount}>₹199</Text>
            <Text style={styles.pricePeriod}>/month</Text>
          </View>

          {/* Upgrade Button */}
          <Pressable
            style={({ pressed }) => [
              styles.upgradeBtn,
              pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
            ]}
            onPress={handleUpgrade}
          >
            <Text style={styles.upgradeBtnText}>
              {isPlus ? 'Membership Active' : 'Upgrade to Recover Pro'}
            </Text>
          </Pressable>

          {/* Divider */}
          <View style={styles.cardDivider} />

          {/* Feature Checklist */}
          <View style={styles.featuresList}>
            {PRO_FEATURES.map((feat, idx) => (
              <View key={idx} style={styles.featureRow}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.featureText}>{feat}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Legal Links */}
        <View style={styles.bottomLinksWrap}>
          <View style={styles.legalRow}>
            <Pressable onPress={() => setActiveLegalModal('terms')} hitSlop={8}>
              <Text style={styles.legalLink}>Terms of Service</Text>
            </Pressable>
            <Text style={styles.legalDot}>  •  </Text>
            <Pressable onPress={() => setActiveLegalModal('privacy')} hitSlop={8}>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </Pressable>
          </View>

          <Pressable onPress={handleRestore} hitSlop={8}>
            <Text style={styles.restoreText}>Restore Subscription</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* LEGAL / FAQ MODAL */}
      <LegalNoticeModal
        visible={activeLegalModal !== null}
        type={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // -------------------------------------------------------------------------
  // RECOVER PRO UPGRADE / PLAN DETAILS SCREEN STYLES
  // -------------------------------------------------------------------------
  root: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  vignetteOverlay: {
    backgroundColor: 'rgba(8, 14, 22, 0.42)',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  topNavRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginLeft: 'auto',
  },
  skipText: {
    color: '#FFFFFF',
    fontFamily: fonts.medium,
    fontSize: 15,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  backBtnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontFamily: fonts.medium,
    fontSize: 14,
    marginLeft: 2,
  },
  appIconCard: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 28,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginTop: 14,
  },
  subtitle: {
    color: '#D1D5DB',
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 6,
  },
  proCard: {
    width: '100%',
    backgroundColor: 'rgba(20, 26, 36, 0.88)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 22,
    marginTop: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 14,
  },
  cardHeaderTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontStyle: 'italic',
    fontSize: 19,
    letterSpacing: 0.6,
  },
  cardHeaderSub: {
    color: '#9CA3AF',
    fontFamily: fonts.regular,
    fontSize: 13.5,
    marginTop: 4,
  },
  dropdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    height: 48,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  dropdownText: {
    color: '#FFFFFF',
    fontFamily: fonts.medium,
    fontSize: 14.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 16,
  },
  priceAmount: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 35,
    letterSpacing: -0.6,
  },
  pricePeriod: {
    color: '#9CA3AF',
    fontFamily: fonts.medium,
    fontSize: 17,
    marginLeft: 6,
  },
  upgradeBtn: {
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  upgradeBtnText: {
    color: '#000000',
    fontFamily: fonts.semibold,
    fontSize: 16,
    letterSpacing: 0.1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    marginVertical: 18,
  },
  featuresList: {
    width: '100%',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },
  featureText: {
    color: '#E5E7EB',
    fontFamily: fonts.medium,
    fontSize: 14,
    marginLeft: 12,
  },
  bottomLinksWrap: {
    alignItems: 'center',
    marginTop: 20,
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legalLink: {
    color: '#9CA3AF',
    fontFamily: fonts.regular,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  legalDot: {
    color: '#6B7280',
    fontSize: 12,
  },
  restoreText: {
    color: '#D1D5DB',
    fontFamily: fonts.regular,
    fontSize: 13,
    marginTop: 8,
  },

  // -------------------------------------------------------------------------
  // PRO USER SUBSCRIPTION MANAGEMENT VIEW STYLES
  // -------------------------------------------------------------------------
  proRoot: {
    flex: 1,
    backgroundColor: '#0A0A0E',
  },
  proHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  proAvatarWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E1E24',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2E2E36',
  },
  proAvatarText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  proCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#18181C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  proScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  proMainTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 28,
    letterSpacing: -0.6,
  },
  proSubTitle: {
    color: '#8E8E93',
    fontFamily: fonts.regular,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 20,
  },
  proCurrentPlanCard: {
    backgroundColor: '#15151A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#24242C',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  proCurrentPlanLabel: {
    color: '#71717A',
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  proCurrentPlanName: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 24,
    letterSpacing: -0.4,
  },
  proCurrentPlanPrice: {
    color: '#9CA3AF',
    fontFamily: fonts.regular,
    fontSize: 14,
    marginTop: 3,
  },
  proCurrentPlanRenew: {
    color: '#71717A',
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 3,
  },
  proSparkleBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#202028',
    borderWidth: 1,
    borderColor: '#2E2E38',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proCardGroup: {
    backgroundColor: '#15151A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222228',
    overflow: 'hidden',
    marginBottom: 16,
  },
  proRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  proRowIconWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  proRowTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  proRowSub: {
    color: '#71717A',
    fontFamily: fonts.regular,
    fontSize: 12.5,
    marginTop: 2,
  },
  proDivider: {
    height: 1,
    backgroundColor: '#1E1E24',
    marginHorizontal: 18,
  },
  proCancelText: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 15,
  },

  // -------------------------------------------------------------------------
  // APPLE SYSTEM DIALOG STYLES
  // -------------------------------------------------------------------------
  dialogBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  systemAlert: {
    width: '100%',
    maxWidth: 290,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 20,
  },
  alertBody: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 18,
    alignItems: 'center',
  },
  alertCancelTitle: {
    color: '#000000',
    fontFamily: fonts.bold,
    fontSize: 16.5,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  alertCancelMessage: {
    color: '#3C3C43',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  alertButtons: {
    flexDirection: 'row',
    height: 44,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C6C6C8',
  },
  alertBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertDividerV: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#C6C6C8',
  },
  alertBtnTextNormal: {
    color: '#007AFF',
    fontFamily: fonts.regular,
    fontSize: 16.5,
  },
  alertBtnTextDestructive: {
    color: '#FF3B30',
    fontFamily: fonts.bold,
    fontSize: 16.5,
  },

  // -------------------------------------------------------------------------
  // BILLING HISTORY STYLES
  // -------------------------------------------------------------------------
  billingHeaderTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 17,
  },
  emptyBillingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 72,
    paddingHorizontal: 24,
  },
  emptyBillingIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#15151A',
    borderWidth: 1,
    borderColor: '#24242C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyBillingTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyBillingSub: {
    color: '#8E8E93',
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  billingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  billingItemLeft: {
    flex: 1,
  },
  billingItemPlan: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  billingItemDate: {
    color: '#8E8E93',
    fontFamily: fonts.regular,
    fontSize: 13,
    marginTop: 2,
  },
  billingItemId: {
    color: '#52525B',
    fontFamily: fonts.regular,
    fontSize: 11,
    marginTop: 2,
  },
  billingItemRight: {
    alignItems: 'flex-end',
  },
  billingItemAmount: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 16,
    marginBottom: 4,
  },
  billingPaidBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  billingPaidText: {
    color: '#4ADE80',
    fontFamily: fonts.medium,
    fontSize: 11,
  },
});
