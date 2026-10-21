import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND_NAME, colors, fonts } from '../theme';
import { useApp } from '../context/AppContext';
import MiniCardThumbnail from './MiniCardThumbnail';

export interface LeaderboardUser {
  id: string;
  name: string;
  focusMinutes: number;
  achievedAt: number; // timestamp in ms (newest wins ties)
  isCurrentUser?: boolean;
  cardVariant?: 'user' | 'gold' | 'silver' | 'bronze' | 'dark';
}

function formatFocusTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

// Laurel Wreath SVG for Global Rank
function LaurelWreath() {
  return (
    <Svg width="18" height="24" viewBox="0 0 18 24" fill="none">
      <Path
        d="M2 20C4 16 7 12 7 6M2 15C5 14 7 12 7 9M3 9C6 8 8 6 8 3M5 3C8 3 9 1 9 0"
        stroke="#60A5FA"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <Path
        d="M1 21C2.5 19 3 17 3 15M2 13C3.5 12 4.5 10 4.5 8"
        stroke="#93C5FD"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function LaurelWreathRight() {
  return (
    <Svg width="18" height="24" viewBox="0 0 18 24" fill="none" style={{ transform: [{ scaleX: -1 }] }}>
      <Path
        d="M2 20C4 16 7 12 7 6M2 15C5 14 7 12 7 9M3 9C6 8 8 6 8 3M5 3C8 3 9 1 9 0"
        stroke="#60A5FA"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <Path
        d="M1 21C2.5 19 3 17 3 15M2 13C3.5 12 4.5 10 4.5 8"
        stroke="#93C5FD"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function RankingsView({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const insets = useSafeAreaInsets();
  const { userName, userHandle, credits } = useApp();

  const displayName = userName.trim() ? userName : 'there';

  // 7-Day Cycle Countdown Calculation
  const [countdown, setCountdown] = useState<{ days: number; hours: number; dateRange: string }>({
    days: 6,
    hours: 23,
    dateRange: 'Active Cycle',
  });

  // Toggle for testing single user vs community leaderboard
  const [singleUserOnly, setSingleUserOnly] = useState(false);

  useEffect(() => {
    const calculateWeeklyCycle = () => {
      const now = new Date();
      // 7-day cycle ending on upcoming Sunday 23:59:59
      const dayOfWeek = now.getDay(); // 0 is Sunday
      const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() + daysUntilSunday);
      endOfWeek.setHours(23, 59, 59, 999);

      const diffMs = Math.max(0, endOfWeek.getTime() - now.getTime());
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      // Calculate start and end date string (e.g., 14 Sep – 20 Sep)
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - ((dayOfWeek + 6) % 7)); // Monday
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dateRange = `${startOfWeek.getDate()} ${monthNames[startOfWeek.getMonth()]} – ${endOfWeek.getDate()} ${monthNames[endOfWeek.getMonth()]}`;

      setCountdown({ days, hours, dateRange });
    };

    calculateWeeklyCycle();
    const interval = setInterval(calculateWeeklyCycle, 60000);
    return () => clearInterval(interval);
  }, []);

  // Base focus time for current user (convert credits earned / active focus)
  const userFocusMinutes = Math.max(15, credits);

  // Community participants with names (handles removed)
  const defaultParticipants: LeaderboardUser[] = useMemo(() => [
    { id: 'u1', name: 'Malo', focusMinutes: 4200, achievedAt: 1000, cardVariant: 'gold' },
    { id: 'u2', name: 'Tonkster', focusMinutes: 3220, achievedAt: 2000, cardVariant: 'silver' },
    { id: 'u3', name: 'Discipline', focusMinutes: 2700, achievedAt: 3000, cardVariant: 'bronze' },
    { id: 'u4', name: 'Uplink', focusMinutes: 2310, achievedAt: 4000, cardVariant: 'dark' },
    { id: 'u5', name: 'Rex', focusMinutes: 2155, achievedAt: 5000, cardVariant: 'silver' },
    { id: 'u6', name: 'Climb', focusMinutes: 2140, achievedAt: 6000, cardVariant: 'dark' },
    // Exact tie with reserve9301 to prove tie-breaker rule: newest achieved gets leader!
    { id: 'u7', name: 'Reserve', focusMinutes: 2140, achievedAt: 7000, cardVariant: 'user' },
  ], []);

  // Compute leaderboard with sorting & tie-breaker rule
  const leaderboard = useMemo(() => {
    const currentUserEntry: LeaderboardUser = {
      id: 'current-user',
      name: displayName,
      focusMinutes: userFocusMinutes,
      achievedAt: 9999999999, // latest achieved
      isCurrentUser: true,
      cardVariant: 'user',
    };

    const list = singleUserOnly
      ? [currentUserEntry]
      : [...defaultParticipants, currentUserEntry];

    // SORTING & TIE-BREAKER RULE:
    // 1. Primary: highest focus time wins.
    // 2. Tie-breaker: if focus times are equal, the newest achieved/joined wins (leader)!
    return list.sort((a, b) => {
      if (b.focusMinutes !== a.focusMinutes) {
        return b.focusMinutes - a.focusMinutes;
      }
      return b.achievedAt - a.achievedAt; // Newest timestamp ranked higher
    });
  }, [displayName, userFocusMinutes, singleUserOnly, defaultParticipants]);

  // Find current user's rank
  const currentUserRankIndex = leaderboard.findIndex((u) => u.isCurrentUser);
  const currentUserRank = currentUserRankIndex >= 0 ? currentUserRankIndex + 1 : 1;

  return (
    <View style={styles.root}>
      {/* Top Header Row */}
      <View style={[styles.headerRow, { paddingTop: insets.top + 6 }]}>
        <Pressable
          style={({ pressed }) => [styles.circleHeaderBtn, pressed && { opacity: 0.7 }]}
          onPress={onOpenSettings}
        >
          <Ionicons name="settings-sharp" size={19} color="#FFFFFF" />
        </Pressable>

        <Text style={styles.headerTitle}>{BRAND_NAME} Ranks</Text>

        <Pressable
          style={({ pressed }) => [styles.circleHeaderBtn, pressed && { opacity: 0.7 }]}
          onPress={() => setSingleUserOnly(!singleUserOnly)}
        >
          <Ionicons name="person-add" size={17} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 105 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Results & Top Stats Card matching screenshot */}
        <View style={styles.resultsCard}>
          {/* Top Banner Row */}
          <View style={styles.resultsBannerRow}>
            <View style={styles.trophyCircle}>
              <Ionicons name="trophy" size={17} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.resultsBannerTitle}>Results • Top 100 card holders</Text>
              <Text style={styles.resultsDateRange}>{countdown.dateRange}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.cardDivider} />

          {/* 3-Column Stats Row */}
          <View style={styles.statsRow}>
            {/* Left: Resets in (7-Day Cycle) */}
            <View style={styles.statColLeft}>
              <Text style={styles.statLabel}>Resets in</Text>
              <Text style={styles.statValueBold}>
                {countdown.days}d {countdown.hours}h
              </Text>
            </View>

            {/* Center: Global Rank with Laurel Wreath */}
            <View style={styles.statColCenter}>
              <View style={styles.wreathRow}>
                <LaurelWreath />
                <View style={styles.wreathCenter}>
                  <Text style={styles.globalRankNumber}>#{currentUserRank}</Text>
                  <Text style={styles.globalRankLabel}>Global rank</Text>
                </View>
                <LaurelWreathRight />
              </View>
            </View>

            {/* Right: User's Focus Time */}
            <View style={styles.statColRight}>
              <Text style={styles.statLabel}>Time</Text>
              <Text style={styles.statValueBold}>{formatFocusTime(userFocusMinutes)}</Text>
            </View>
          </View>
        </View>

        {/* Prototype Situation Notice */}
        <View style={styles.situationNoticeRow}>
          <Text style={styles.situationNoticeText}>
            {singleUserOnly
              ? 'Showing 1 User situation (User is Top #1)'
              : 'Showing Community Leaderboard with Tie-Breaker (Newest = Leader)'}
          </Text>
          <Pressable
            style={styles.toggleSituationBtn}
            onPress={() => setSingleUserOnly(!singleUserOnly)}
          >
            <Text style={styles.toggleSituationText}>
              {singleUserOnly ? 'Show All' : 'Test 1 User'}
            </Text>
          </Pressable>
        </View>

        {/* Leaderboard Table Container */}
        <View style={styles.tableCard}>
          {/* Table Header Row */}
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.thText, styles.colRank]}>Rank</Text>
            <Text style={[styles.thText, styles.colCardHolder]}>Card holder</Text>
            <Text style={[styles.thText, styles.colTime]}>Time</Text>
          </View>

          {/* Table Rows */}
          {leaderboard.map((user, index) => {
            const rankNumber = index + 1;
            const isSelf = user.isCurrentUser;

            return (
              <View
                key={user.id}
                style={[
                  styles.tableRow,
                  isSelf && styles.tableRowHighlight,
                ]}
              >
                {/* Rank Number */}
                <View style={styles.colRank}>
                  <Text style={[styles.rankNumberText, isSelf && styles.boldWhite]}>
                    #{rankNumber}
                  </Text>
                </View>

                {/* Cardholder Column: Mini Card Image + Name */}
                <View style={[styles.colCardHolder, styles.cardHolderCell]}>
                  <MiniCardThumbnail
                    variant={isSelf ? 'user' : (user.cardVariant || (rankNumber === 1 ? 'gold' : 'silver'))}
                    cardholderName={user.name}
                  />
                  <Text
                    style={[styles.cardHolderName, isSelf && styles.boldWhite]}
                    numberOfLines={1}
                  >
                    {user.name} {isSelf && <Text style={styles.youBadge}>(You)</Text>}
                  </Text>
                </View>

                {/* Focus Time */}
                <View style={styles.colTime}>
                  <Text style={[styles.timeText, isSelf && styles.boldWhite]}>
                    {formatFocusTime(user.focusMinutes)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  circleHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2A2A2D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 4,
  },
  resultsCard: {
    backgroundColor: '#141416',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222226',
    marginBottom: 12,
  },
  resultsBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  trophyCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#242429',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultsBannerTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 14.5,
    letterSpacing: -0.1,
  },
  resultsDateRange: {
    color: '#8E8E93',
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#202024',
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  statColLeft: {
    alignItems: 'flex-start',
    flex: 1,
  },
  statColCenter: {
    alignItems: 'center',
    flex: 1.4,
  },
  statColRight: {
    alignItems: 'flex-end',
    flex: 1,
  },
  statLabel: {
    color: '#8E8E93',
    fontFamily: fonts.regular,
    fontSize: 11.5,
    marginBottom: 4,
  },
  statValueBold: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 16,
    letterSpacing: -0.2,
  },
  wreathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wreathCenter: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  globalRankNumber: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 20,
    letterSpacing: -0.4,
  },
  globalRankLabel: {
    color: '#8E8E93',
    fontFamily: fonts.regular,
    fontSize: 10.5,
    marginTop: 1,
  },
  situationNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    marginBottom: 10,
  },
  situationNoticeText: {
    color: '#71717A',
    fontFamily: fonts.regular,
    fontSize: 11,
    flex: 1,
  },
  toggleSituationBtn: {
    backgroundColor: '#1E1E22',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2E',
    marginLeft: 8,
  },
  toggleSituationText: {
    color: '#D4D4D8',
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  tableCard: {
    backgroundColor: '#141416',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#222226',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#202024',
  },
  thText: {
    color: '#71717A',
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  colRank: {
    width: 44,
  },
  colCardHolder: {
    flex: 1,
  },
  colTime: {
    width: 72,
    alignItems: 'flex-end',
  },
  cardHolderCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1E1E22',
  },
  tableRowHighlight: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  rankNumberText: {
    color: '#A1A1AA',
    fontFamily: fonts.semibold,
    fontSize: 13.5,
  },
  cardHolderName: {
    color: '#E4E4E7',
    fontFamily: fonts.medium,
    fontSize: 14,
    flexShrink: 1,
  },
  youBadge: {
    color: '#60A5FA',
    fontFamily: fonts.semibold,
    fontSize: 11,
  },
  timeText: {
    color: '#E4E4E7',
    fontFamily: fonts.medium,
    fontSize: 13.5,
    textAlign: 'right',
  },
  boldWhite: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
  },
});
