import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { BRAND_NAME, fonts } from '../theme';
import { useApp } from '../context/AppContext';

type PlanType = 'yearly' | 'monthly' | 'weekly';

export default function PricingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { isPlus, setIsPlus } = useApp();

  // Selected plan on main upgrade page
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');

  // Selected plan in trial bottom sheet
  const [modalSelectedPlan, setModalSelectedPlan] = useState<PlanType>('yearly');

  // Bottom-sheet trial modal state
  const [showTrialModal, setShowTrialModal] = useState(false);

  // State when Pro user clicks "Plan Details" to see the full pricing page
  const [viewingPlanDetails, setViewingPlanDetails] = useState(false);

  // Apple-style cancel subscription modal state
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleStartTrial = async () => {
    await setIsPlus(true);
    setShowTrialModal(false);
    navigation.goBack();
  };

  const renderTrialModal = () => (
    <Modal
      visible={showTrialModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowTrialModal(false)}
    >
      <View style={styles.modalOverlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setShowTrialModal(false)}
        />

        <View
          style={[
            styles.whiteModalCard,
            { paddingBottom: Math.max(insets.bottom, 16) + 12 },
          ]}
        >
          {/* 1. Yearly Option (FREE TRIAL ONLY HERE + 20% OFF BADGE + ONLY YEARLY PRICE) */}
          <Pressable
            style={({ pressed }) => [
              styles.whiteOptionCard,
              modalSelectedPlan === 'yearly' && styles.whiteOptionCardSelected,
              pressed && { opacity: 0.9 },
            ]}
            onPress={() => setModalSelectedPlan('yearly')}
          >
            <View style={styles.whiteOptionLeft}>
              <View
                style={[
                  styles.whiteRadioCircle,
                  modalSelectedPlan === 'yearly' && styles.whiteRadioCircleSelected,
                ]}
              >
                {modalSelectedPlan === 'yearly' && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
              <View style={{ marginLeft: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Text style={styles.whiteOptionTitle}>Yearly</Text>
                  <View style={styles.whiteDiscountTag}>
                    <Text style={styles.whiteDiscountTagText}>20% OFF</Text>
                  </View>
                </View>
                <Text style={styles.whiteOptionSubTrial}>3-day free trial</Text>
              </View>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.whitePriceMo}>₹1,910 / yr</Text>
            </View>
          </Pressable>

          {/* 2. Monthly Option (NO free trial) */}
          <Pressable
            style={({ pressed }) => [
              styles.whiteOptionCard,
              modalSelectedPlan === 'monthly' && styles.whiteOptionCardSelected,
              pressed && { opacity: 0.9 },
            ]}
            onPress={() => setModalSelectedPlan('monthly')}
          >
            <View style={styles.whiteOptionLeft}>
              <View
                style={[
                  styles.whiteRadioCircle,
                  modalSelectedPlan === 'monthly' && styles.whiteRadioCircleSelected,
                ]}
              >
                {modalSelectedPlan === 'monthly' && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
              <View style={{ marginLeft: 14 }}>
                <Text style={styles.whiteOptionTitle}>Monthly</Text>
                <Text style={styles.whiteOptionSub}>Billed monthly</Text>
              </View>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.whitePriceMo}>₹199 / mo</Text>
            </View>
          </Pressable>

          {/* 3. Weekly Option (NO free trial) */}
          <Pressable
            style={({ pressed }) => [
              styles.whiteOptionCard,
              modalSelectedPlan === 'weekly' && styles.whiteOptionCardSelected,
              pressed && { opacity: 0.9 },
            ]}
            onPress={() => setModalSelectedPlan('weekly')}
          >
            <View style={styles.whiteOptionLeft}>
              <View
                style={[
                  styles.whiteRadioCircle,
                  modalSelectedPlan === 'weekly' && styles.whiteRadioCircleSelected,
                ]}
              >
                {modalSelectedPlan === 'weekly' && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
              <View style={{ marginLeft: 14 }}>
                <Text style={styles.whiteOptionTitle}>Weekly</Text>
                <Text style={styles.whiteOptionSub}>Billed weekly</Text>
              </View>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.whitePriceMo}>₹49 / wk</Text>
            </View>
          </Pressable>

          {/* Subtitle: "Cancel anytime." (per instructions) */}
          <Text style={styles.cancelAnytimeNotice}>Cancel anytime.</Text>

          {/* Action button: Disabled & faded with "Current plan" for Pro users */}
          <Pressable
            disabled={isPlus}
            style={({ pressed }) => [
              styles.blackTrialBtn,
              isPlus && { opacity: 0.38 },
              !isPlus && pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
            ]}
            onPress={isPlus ? undefined : handleStartTrial}
          >
            <Text style={styles.blackTrialBtnText}>
              {isPlus
                ? 'Current plan'
                : modalSelectedPlan === 'yearly'
                ? '›››   Start free trial   ‹‹‹'
                : '›››   Get full access   ‹‹‹'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  // =========================================================================
  // VIEW 2: PRO / PLUS USER SUBSCRIPTION MANAGEMENT (Matching Image 2)
  // =========================================================================
  if (isPlus && !viewingPlanDetails) {
    return (
      <View style={styles.root}>
        {/* Top Header */}
        <View style={[styles.proHeaderBar, { paddingTop: insets.top + 8 }]}>
          <View style={styles.proAvatarWrap}>
            <Text style={styles.proAvatarText}>A</Text>
          </View>
          <Pressable
            onPress={() => navigation.goBack()}
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
              <Text style={styles.proCurrentPlanName}>Pro</Text>
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
              onPress={() => {}}
            >
              <View style={styles.proRowIconWrap}>
                <Ionicons name="card-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.proRowTitle}>Billing</Text>
                <Text style={styles.proRowSub}>Update your payment method</Text>
              </View>
              <Feather name="chevron-right" size={17} color="#52525B" />
            </Pressable>

            <View style={styles.proDivider} />

            <Pressable
              style={({ pressed }) => [styles.proRowItem, pressed && { opacity: 0.75 }]}
              onPress={() => {}}
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

          {/* SECTION 2: Cancel Subscription */}
          <View style={styles.proCardGroup}>
            <Pressable
              style={({ pressed }) => [styles.proRowItem, pressed && { opacity: 0.75 }]}
              onPress={() => setShowCancelModal(true)}
            >
              <Text style={styles.proCancelText}>Cancel Subscription</Text>
              <Feather name="chevron-right" size={17} color="#52525B" />
            </Pressable>
          </View>

          {/* SECTION 3: Support */}
          <View style={styles.proCardGroup}>
            <Pressable
              style={({ pressed }) => [styles.proRowItem, pressed && { opacity: 0.75 }]}
              onPress={() => {}}
            >
              <View style={styles.proRowIconWrap}>
                <Ionicons name="help-circle-outline" size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.proRowTitle}>Need help?</Text>
                <Text style={styles.proRowSub}>Visit our help center</Text>
              </View>
              <Feather name="external-link" size={16} color="#71717A" />
            </Pressable>
          </View>
        </ScrollView>

        {/* ========================================================================= */}
        {/* APPLE-STYLE PERMISSION POP-UP FOR CANCEL SUBSCRIPTION (CENTERED MODAL)   */}
        {/* ========================================================================= */}
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
                    navigation.goBack();
                  }}
                >
                  <Text style={styles.alertBtnTextDestructive}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Plan Details Bottom Sheet Modal for Pro User */}
        {renderTrialModal()}
      </View>
    );
  }

  // =========================================================================
  // VIEW 1: UPGRADE / PRICING PAGE FOR FREE USERS (Matching Image 1)
  // =========================================================================
  return (
    <View style={styles.root}>
      {/* Top Header: Title "Pricing" with (X) button at top right */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <View style={{ width: 36 }} />
        <Text style={styles.headerTitle}>Pricing</Text>
        <Pressable
          onPress={() => {
            if (viewingPlanDetails) {
              setViewingPlanDetails(false);
            } else {
              navigation.goBack();
            }
          }}
          style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.75 }]}
          hitSlop={14}
        >
          <Ionicons name="close" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 36 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Headline */}
        <View style={styles.titleSection}>
          <Text style={styles.mainHeadline}>Get unlimited</Text>
          <Text style={styles.mainHeadline}>access to all features</Text>
        </View>

        {/* 3 PLAN SELECTOR CONTAINER (Matching Image 1) */}
        <View style={styles.planContainer}>
          {/* 1. Monthly (NO free trial) */}
          <Pressable
            style={({ pressed }) => [
              styles.planRow,
              selectedPlan === 'monthly' && styles.planRowSelected,
              pressed && { opacity: 0.9 },
            ]}
            onPress={() => {
              setSelectedPlan('monthly');
              setModalSelectedPlan('monthly');
            }}
          >
            <View style={styles.radioSquare}>
              {selectedPlan === 'monthly' && (
                <View style={styles.radioInnerFill}>
                  <Ionicons name="checkmark" size={13} color="#000000" />
                </View>
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.planNameText}>Monthly</Text>
              <Text style={styles.planPriceText}>₹199 / month</Text>
            </View>
          </Pressable>

          <View style={styles.planDivider} />

          {/* 2. Yearly (ONLY yearly price + 20% OFF badge on top + 3-day free trial) */}
          <Pressable
            style={({ pressed }) => [
              styles.planRow,
              selectedPlan === 'yearly' && styles.planRowSelected,
              pressed && { opacity: 0.9 },
            ]}
            onPress={() => {
              setSelectedPlan('yearly');
              setModalSelectedPlan('yearly');
            }}
          >
            <View style={styles.radioSquare}>
              {selectedPlan === 'yearly' && (
                <View style={styles.radioInnerFill}>
                  <Ionicons name="checkmark" size={13} color="#000000" />
                </View>
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.yearlyTopBadgeRow}>
                <View style={styles.badgeDiscountPill}>
                  <Text style={styles.badgeDiscountPillText}>20% OFF</Text>
                </View>
              </View>
              <Text style={styles.planNameText}>Yearly</Text>
              <Text style={styles.planPriceText}>₹1,910 / year</Text>
            </View>
            <View style={styles.trialBadgePill}>
              <Text style={styles.trialBadgePillText}>3-DAY TRIAL</Text>
            </View>
          </Pressable>

          <View style={styles.planDivider} />

          {/* 3. Weekly (NO free trial) */}
          <Pressable
            style={({ pressed }) => [
              styles.planRow,
              selectedPlan === 'weekly' && styles.planRowSelected,
              pressed && { opacity: 0.9 },
            ]}
            onPress={() => {
              setSelectedPlan('weekly');
              setModalSelectedPlan('weekly');
            }}
          >
            <View style={styles.radioSquare}>
              {selectedPlan === 'weekly' && (
                <View style={styles.radioInnerFill}>
                  <Ionicons name="checkmark" size={13} color="#000000" />
                </View>
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.planNameText}>Weekly</Text>
              <Text style={styles.planPriceText}>₹49 / week</Text>
            </View>
          </Pressable>
        </View>

        {/* WHAT'S INCLUDED SECTION */}
        <View style={styles.whatsIncludedSection}>
          <Text style={styles.whatsIncludedTitle}>What's included</Text>

          <View style={styles.benefitRow}>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{ marginRight: 12 }} />
            <Text style={styles.benefitText}>Change cards and wallets</Text>
          </View>

          <View style={styles.benefitRow}>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{ marginRight: 12 }} />
            <Text style={styles.benefitText}>View detailed analytics</Text>
          </View>

          <View style={styles.benefitRow}>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{ marginRight: 12 }} />
            <Text style={styles.benefitText}>No ads</Text>
          </View>

          <View style={styles.benefitRow}>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{ marginRight: 12 }} />
            <Text style={styles.benefitText}>Access to experimental features</Text>
          </View>
        </View>

        {/* GET FULL ACCESS / CURRENT PLAN BUTTON */}
        <Pressable
          disabled={viewingPlanDetails || isPlus}
          style={({ pressed }) => [
            styles.getFullAccessBtn,
            (viewingPlanDetails || isPlus) && { opacity: 0.38 },
            !(viewingPlanDetails || isPlus) && pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
          ]}
          onPress={() => {
            if (!viewingPlanDetails && !isPlus) {
              setShowTrialModal(true);
            }
          }}
        >
          <Text style={styles.getFullAccessBtnText}>
            {viewingPlanDetails || isPlus ? 'Current Plan' : 'Get Full Access'}
          </Text>
        </Pressable>

        {/* FOOTER LINKS */}
        <View style={styles.footerRow}>
          <Text style={styles.footerLink}>Terms of Use</Text>
          <Text style={styles.footerDot}>•</Text>
          <Text style={styles.footerLink}>Privacy Policy</Text>
          <Text style={styles.footerDot}>•</Text>
          <Text style={styles.footerLink}>Restore</Text>
        </View>
      </ScrollView>

      {/* POP-UP MODAL: START FREE TRIAL / PLAN DETAILS */}
      {renderTrialModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0E',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 17,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  mainHeadline: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 31,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  planContainer: {
    backgroundColor: '#15151B',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    marginBottom: 26,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  planRowSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  radioSquare: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#71717A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInnerFill: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearlyTopBadgeRow: {
    marginBottom: 3,
  },
  badgeDiscountPill: {
    backgroundColor: '#EC4899',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  badgeDiscountPillText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 9.5,
    letterSpacing: 0.5,
  },
  planNameText: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 15.5,
  },
  planPriceText: {
    color: '#9CA3AF',
    fontFamily: fonts.regular,
    fontSize: 13,
    marginTop: 2,
  },
  trialBadgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  trialBadgePillText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 9.5,
    letterSpacing: 0.5,
  },
  planDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginHorizontal: 16,
  },
  whatsIncludedSection: {
    paddingHorizontal: 4,
    marginBottom: 26,
  },
  whatsIncludedTitle: {
    color: '#8E8E93',
    fontFamily: fonts.regular,
    fontSize: 13,
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  benefitText: {
    color: '#FFFFFF',
    fontFamily: fonts.regular,
    fontSize: 14.5,
  },
  getFullAccessBtn: {
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 18,
  },
  getFullAccessBtnText: {
    color: '#000000',
    fontFamily: fonts.bold,
    fontSize: 16,
    letterSpacing: -0.2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLink: {
    color: '#71717A',
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  footerDot: {
    color: '#52525B',
    marginHorizontal: 8,
    fontSize: 12,
  },

  // -------------------------------------------------------------------------
  // MODAL STYLES (Matching Image 3)
  // -------------------------------------------------------------------------
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  whiteModalCard: {
    backgroundColor: '#F3F4F6',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 },
    elevation: 20,
  },
  whiteOptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  whiteOptionCardSelected: {
    borderColor: '#000000',
  },
  whiteOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  whiteRadioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whiteRadioCircleSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  whiteOptionTitle: {
    color: '#000000',
    fontFamily: fonts.bold,
    fontSize: 19,
    letterSpacing: -0.3,
  },
  whiteDiscountTag: {
    backgroundColor: '#EC4899',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  whiteDiscountTagText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 9.5,
    letterSpacing: 0.5,
  },
  whiteOptionSubTrial: {
    color: '#10B981',
    fontFamily: fonts.semibold,
    fontSize: 13,
    marginTop: 2,
  },
  whiteOptionSub: {
    color: '#6B7280',
    fontFamily: fonts.regular,
    fontSize: 13,
    marginTop: 2,
  },
  whitePriceMo: {
    color: '#000000',
    fontFamily: fonts.bold,
    fontSize: 16.5,
  },
  cancelAnytimeNotice: {
    color: '#6B7280',
    fontFamily: fonts.regular,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  blackTrialBtn: {
    backgroundColor: '#000000',
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  blackTrialBtnText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 15.5,
    letterSpacing: 0.2,
  },

  // -------------------------------------------------------------------------
  // PRO USER SUBSCRIPTION STYLES (Matching Image 2)
  // -------------------------------------------------------------------------
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
  proPauseRow: {
    alignItems: 'center',
  },
  proPauseText: {
    color: '#F97316',
    fontFamily: fonts.semibold,
    fontSize: 15,
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
    paddingHorizontal: 20,
  },
  systemAlert: {
    width: 280,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOpacity: 0.65,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
  },
  alertBody: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
    alignItems: 'center',
  },
  alertTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 17,
    lineHeight: 22,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  alertMessage: {
    color: '#D1D1D6',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
  },
  alertButtons: {
    flexDirection: 'row',
    height: 44,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.18)',
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
    color: '#0A84FF',
    fontFamily: fonts.regular,
    fontSize: 16,
  },
  alertBtnTextDestructive: {
    color: '#FF453A',
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
});
