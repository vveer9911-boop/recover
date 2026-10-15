import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { BRAND_NAME, colors, fonts, radii } from '../theme';
import FocusCard from '../components/FocusCard';
import { useApp } from '../context/AppContext';

export interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  time: string;
  icon?: string;
}

type TransactionsScreenRouteProp = RouteProp<RootStackParamList, 'Transactions'>;

export default function TransactionsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<TransactionsScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const context = useApp();

  const userName = route.params?.userName && route.params.userName !== 'there'
    ? route.params.userName
    : (context.userName.trim() ? context.userName : 'there');
  const credits = route.params?.credits !== undefined ? route.params.credits : context.credits;
  const transactions: Transaction[] = route.params?.transactions && route.params.transactions.length > 0
    ? route.params.transactions
    : context.transactions;

  return (
    <View style={styles.root}>
      {/* Top Header Bar - Clean without notifications */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.userHeaderLeft}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </Pressable>

          {/* User Avatar Circle */}
          <View style={styles.avatarCircle}>
            {userName && userName !== 'there' ? (
              <Text style={styles.avatarInitial}>
                {userName.trim().charAt(0).toUpperCase()}
              </Text>
            ) : (
              <Ionicons name="person" size={16} color="#FFFFFF" />
            )}
          </View>

          <Text style={styles.welcomeText}>
            Welcome, <Text style={styles.welcomeName}>{userName}!</Text>
          </Text>
        </View>

        {/* No notifications bell as per requirements */}
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* THE CARD: Exact same card as user picked on Dashboard */}
        <View style={styles.cardContainer}>
          <FocusCard
            credits={credits}
            cardholderName={userName !== 'there' ? userName : undefined}
          />
        </View>

        {/* OPERATIONS / TRANSACTIONS SHEET */}
        <View style={styles.operationsSheet}>
          {/* Drag pill handle */}
          <View style={styles.dragHandleWrap}>
            <View style={styles.dragHandle} />
          </View>

          {/* Operations Header */}
          <View style={styles.operationsHeader}>
            <Text style={styles.operationsTitle}>Operations</Text>
            <Text style={styles.fullRecordsText}>Full records</Text>
          </View>

          {/* If there are NO transactions: Clean 'No transactions' message (NO FAKE DATA) */}
          {transactions.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconCircle}>
                <MaterialCommunityIcons name="swap-horizontal" size={28} color="#71717A" />
              </View>
              <Text style={styles.emptyTitle}>No transactions</Text>
              <Text style={styles.emptySubtitle}>
                No transactions yet. Any funds received or used will appear here.
              </Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              <Text style={styles.dateHeader}>TODAY</Text>

              {transactions.map((tx) => {
                const isPositive = tx.type === 'credit' || tx.amount > 0;
                return (
                  <View key={tx.id} style={styles.transactionRow}>
                    <View style={styles.txIconContainer}>
                      <Ionicons
                        name={isPositive ? 'arrow-down' : 'arrow-up'}
                        size={20}
                        color={isPositive ? '#30D158' : '#FF453A'}
                      />
                    </View>

                    <View style={styles.txDetailsCol}>
                      <Text style={styles.txTitle}>{tx.title}</Text>
                      <Text style={styles.txSubtitle}>{tx.subtitle}</Text>
                    </View>

                    <View style={styles.txAmountCol}>
                      <Text
                        style={[
                          styles.txAmount,
                          isPositive && styles.txAmountPositive,
                        ]}
                      >
                        {isPositive ? `+${tx.amount} credits` : `-${Math.abs(tx.amount)} credits`}
                      </Text>
                      <Text style={styles.txTime}>{tx.time}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0D0D0E',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  userHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 10,
    padding: 2,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#27272A',
    borderWidth: 1.2,
    borderColor: '#3F3F46',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  welcomeText: {
    color: '#D4D4D8',
    fontFamily: fonts.regular,
    fontSize: 16,
  },
  welcomeName: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
  },
  headerRightSpacer: {
    width: 24,
  },
  scrollContent: {
    paddingTop: 4,
  },
  cardContainer: {
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  operationsSheet: {
    backgroundColor: '#161618',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: '#242428',
    minHeight: 380,
  },
  dragHandleWrap: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3E3E42',
  },
  operationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  operationsTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 19,
    letterSpacing: -0.3,
  },
  fullRecordsText: {
    color: '#8E8E93',
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#202024',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2A2A2E',
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    color: '#71717A',
    fontFamily: fonts.regular,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  transactionsList: {
    paddingTop: 4,
  },
  dateHeader: {
    color: '#71717A',
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#242428',
  },
  txIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#202024',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  txDetailsCol: {
    flex: 1,
  },
  txTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 14.5,
    marginBottom: 2,
  },
  txSubtitle: {
    color: '#8E8E93',
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  txAmountCol: {
    alignItems: 'flex-end',
  },
  txAmount: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 14.5,
    marginBottom: 2,
  },
  txAmountPositive: {
    color: '#30D158',
  },
  txTime: {
    color: '#71717A',
    fontFamily: fonts.regular,
    fontSize: 11.5,
  },
  ledgerLegalSection: {
    marginTop: 24,
    paddingTop: 10,
  },
  ledgerLegalDivider: {
    height: 1,
    backgroundColor: '#242428',
    marginBottom: 16,
  },
  ledgerLegalHeader: {
    color: '#71717A',
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  ledgerLegalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#202024',
  },
  ledgerLegalTitle: {
    flex: 1,
    color: '#D4D4D8',
    fontFamily: fonts.medium,
    fontSize: 14,
  },
});
