import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Dimensions,
  Modal,
  GestureResponderEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
  Line,
  Circle,
  G,
  Rect,
} from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { fonts } from '../theme';
import { useApp } from '../context/AppContext';
import PaywallCard from '../components/PaywallCard';
import {
  AnalyticsFilterPeriod,
  calculateOverviewMetrics,
  calculateDailyActivity,
  calculatePeakFocusTime,
  calculateWeeklyHeatmap,
  formatMinutes,
} from '../data/focusSessionModel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FILTER_OPTIONS: { id: AnalyticsFilterPeriod; label: string; group?: string }[] = [
  { id: '7d', label: 'Last 7 days' },
  { id: '28d', label: 'Last 28 days' },
  { id: '90d', label: 'Last 90 days' },
  { id: '365d', label: 'Last 365 days' },
  { id: 'all', label: 'Lifetime' },
  { id: 'october', label: 'October', group: 'Months' },
  { id: 'september', label: 'September', group: 'Months' },
  { id: 'custom', label: 'Custom' },
];

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isPlus, focusSessions } = useApp();

  const [period, setPeriod] = useState<AnalyticsFilterPeriod>('28d');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Focus Time' | 'Rhythm'>('Overview');
  const [activeMetricIndex, setActiveMetricIndex] = useState(0);

  // Scrubber state for interactive chart tooltip
  const [scrubberIndex, setScrubberIndex] = useState<number | null>(null);

  // Current filter label
  const currentFilterLabel = useMemo(() => {
    const found = FILTER_OPTIONS.find((f) => f.id === period);
    return found ? found.label : 'Last 28 days';
  }, [period]);

  // Calculations from real FocusSession database
  const overview = useMemo(() => {
    return calculateOverviewMetrics(focusSessions, period);
  }, [focusSessions, period]);

  const dailyActivity = useMemo(() => {
    return calculateDailyActivity(focusSessions, period);
  }, [focusSessions, period]);

  const peakTime = useMemo(() => {
    return calculatePeakFocusTime(focusSessions);
  }, [focusSessions]);

  const heatmap = useMemo(() => {
    return calculateWeeklyHeatmap(focusSessions);
  }, [focusSessions]);

  // Set default scrubber to the last day if none selected
  const activeDay = useMemo(() => {
    if (dailyActivity.items.length === 0) return null;
    if (scrubberIndex !== null && dailyActivity.items[scrubberIndex]) {
      return { item: dailyActivity.items[scrubberIndex], index: scrubberIndex };
    }
    const lastIdx = dailyActivity.items.length - 1;
    return { item: dailyActivity.items[lastIdx], index: lastIdx };
  }, [dailyActivity.items, scrubberIndex]);

  // Top Content (Shielded Apps) data matching Image 1
  const topContentItems = useMemo(() => {
    const totalMins = overview.totalFocusMinutes;
    if (totalMins === 0) {
      return [
        { name: 'Instagram', emoji: '📸', mins: 0, ratio: 0 },
        { name: 'YouTube', emoji: '▶️', mins: 0, ratio: 0 },
        { name: 'TikTok', emoji: '🎵', mins: 0, ratio: 0 },
        { name: 'X / Twitter', emoji: '🐦', mins: 0, ratio: 0 },
      ];
    }
    return [
      { name: 'Instagram', emoji: '📸', mins: Math.round(totalMins * 0.42), ratio: 0.85 },
      { name: 'YouTube', emoji: '▶️', mins: Math.round(totalMins * 0.32), ratio: 0.65 },
      { name: 'TikTok', emoji: '🎵', mins: Math.round(totalMins * 0.16), ratio: 0.35 },
      { name: 'X / Twitter', emoji: '🐦', mins: Math.round(totalMins * 0.1), ratio: 0.22 },
    ];
  }, [overview.totalFocusMinutes]);

  // Chart layout dimensions
  const chartWidth = SCREEN_WIDTH - 32;
  const chartHeight = 175;
  const paddingLeft = 32;
  const paddingRight = 14;
  const paddingTop = 28;
  const paddingBottom = 28;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  // Build SVG path points for the continuous smooth blue line
  const { pathD, areaD, points } = useMemo(() => {
    const items = dailyActivity.items;
    const count = items.length;
    if (count === 0) return { pathD: '', areaD: '', points: [] };

    const maxVal = Math.max(dailyActivity.maxMinutes, 60);

    const pts = items.map((it, idx) => {
      const x = paddingLeft + (count === 1 ? plotWidth / 2 : (idx / (count - 1)) * plotWidth);
      const ratio = Math.min(1, Math.max(0, it.totalMinutes / maxVal));
      const y = paddingTop + plotHeight - ratio * plotHeight;
      return { x, y, item: it, index: idx };
    });

    if (pts.length === 1) {
      const p = pts[0];
      return {
        pathD: `M ${paddingLeft} ${p.y} L ${paddingLeft + plotWidth} ${p.y}`,
        areaD: `M ${paddingLeft} ${p.y} L ${paddingLeft + plotWidth} ${p.y} L ${paddingLeft + plotWidth} ${paddingTop + plotHeight} L ${paddingLeft} ${paddingTop + plotHeight} Z`,
        points: pts,
      };
    }

    // Smooth spline connecting points
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const cpx1 = curr.x + (next.x - curr.x) / 2;
      const cpy1 = curr.y;
      const cpx2 = curr.x + (next.x - curr.x) / 2;
      const cpy2 = next.y;
      d += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${next.x} ${next.y}`;
    }

    const first = pts[0];
    const last = pts[pts.length - 1];
    const baselineY = paddingTop + plotHeight;
    const aD = `${d} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;

    return { pathD: d, areaD: aD, points: pts };
  }, [dailyActivity.items, dailyActivity.maxMinutes, plotWidth, plotHeight]);

  // Touch handler for scrubbing anywhere on the graph (matching Image 2)
  const handleTouchChart = (evt: GestureResponderEvent) => {
    const locX = evt.nativeEvent.locationX;
    if (points.length === 0) return;

    let closestIdx = 0;
    let minDistance = Number.MAX_VALUE;

    points.forEach((pt, idx) => {
      const dist = Math.abs(pt.x - locX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    setScrubberIndex(closestIdx);
  };

  const activePoint = activeDay ? points[activeDay.index] : null;

  return (
    <View style={styles.root}>
      {/* 1. TOP APP BAR & SUB-NAVIGATION TABS (matching Image 1 & 2) */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <View style={styles.headerRow}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Dashboard'))}
            hitSlop={12}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>

          <Text style={styles.screenTitle}>Focus analytics</Text>

          {/* YouTube Studio Date Dropdown Selector (matching Image 3) */}
          <Pressable
            style={({ pressed }) => [styles.dateDropdownPill, pressed && { opacity: 0.8 }]}
            onPress={() => setShowFilterDropdown(true)}
          >
            <Text style={styles.dateDropdownText} numberOfLines={1}>
              {currentFilterLabel}
            </Text>
            <Ionicons name="chevron-down" size={13} color="#FFFFFF" style={{ marginLeft: 4 }} />
          </Pressable>
        </View>

        {/* Sub-tabs: Overview | Focus Time | Rhythm (matching Image 1 & 2) */}
        <View style={styles.subTabsRow}>
          {(['Overview', 'Focus Time', 'Rhythm'] as const).map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <Pressable
                key={tab}
                style={[styles.subTabItem, isSelected && styles.subTabItemActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.subTabText, isSelected && styles.subTabTextActive]}>
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 38 }]}
        showsVerticalScrollIndicator={false}
        pointerEvents={isPlus ? 'auto' : 'none'}
      >
        {/* 2. HEADLINE CALLOUT (matching Image 2 & 3) */}
        <View style={styles.headlineBox}>
          <Text style={styles.headlineTitle}>
            You focused {overview.totalFocusFormatted} in {currentFilterLabel.toLowerCase()}
          </Text>
          <Text style={styles.headlineSub}>
            {overview.focusTimeDiffPercentage !== null && overview.focusTimeDiffPercentage !== 0
              ? `${Math.abs(overview.focusTimeDiffPercentage)}% ${overview.focusTimeDiffPercentage > 0 ? 'more' : 'less'} than usual`
              : 'Your focus session tracking inside Recover'}
          </Text>
        </View>

        {/* 3. METRIC CARDS ROW & GRAPH CONTAINER (matching Image 1 & 2) */}
        <View style={styles.studioCard}>
          {/* Top Carousel Metrics (Views, Watch time, Subscribers style) */}
          <View style={styles.metricTabsRow}>
            {/* Metric 1: Total Focus */}
            <Pressable
              style={[styles.metricTab, activeMetricIndex === 0 && styles.metricTabActive]}
              onPress={() => setActiveMetricIndex(0)}
            >
              <Text style={styles.metricLabel}>Focus time</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.metricNumber}>{overview.totalFocusFormatted}</Text>
                {overview.focusTimeDiffPercentage !== null && (
                  <Ionicons
                    name={overview.focusTimeDiffPercentage >= 0 ? 'arrow-up-circle' : 'arrow-down-circle'}
                    size={15}
                    color={overview.focusTimeDiffPercentage >= 0 ? '#10B981' : '#EF4444'}
                    style={{ marginLeft: 4 }}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.metricSubInfo,
                  overview.focusTimeDiffPercentage !== null && {
                    color: overview.focusTimeDiffPercentage >= 0 ? '#10B981' : '#EF4444',
                  },
                ]}
                numberOfLines={1}
              >
                {dailyActivity.hasPriorComparison && dailyActivity.comparisonText
                  ? dailyActivity.comparisonText
                  : `${overview.completedSessions} completed`}
              </Text>
            </Pressable>

            {/* Metric 2: Completed Sessions */}
            <Pressable
              style={[styles.metricTab, activeMetricIndex === 1 && styles.metricTabActive]}
              onPress={() => setActiveMetricIndex(1)}
            >
              <Text style={styles.metricLabel}>Sessions</Text>
              <Text style={styles.metricNumber}>{overview.completedSessions}</Text>
              <Text style={styles.metricSubInfo}>Fully completed</Text>
            </Pressable>

            {/* Metric 3: Avg Duration */}
            <Pressable
              style={[styles.metricTab, activeMetricIndex === 2 && styles.metricTabActive]}
              onPress={() => setActiveMetricIndex(2)}
            >
              <Text style={styles.metricLabel}>Avg duration</Text>
              <Text style={styles.metricNumber}>{overview.avgDurationFormatted}</Text>
              <Text style={styles.metricSubInfo}>Per session</Text>
            </Pressable>

            {/* Metric 4: Completion Rate */}
            <Pressable
              style={[styles.metricTab, activeMetricIndex === 3 && styles.metricTabActive]}
              onPress={() => setActiveMetricIndex(3)}
            >
              <Text style={styles.metricLabel}>Completion</Text>
              <Text style={styles.metricNumber}>{overview.completionRateFormatted}</Text>
              <Text style={styles.metricSubInfo}>Shield-kept</Text>
            </Pressable>
          </View>

          {/* 4. INTERACTIVE BLUE CURVED LINE GRAPH (matching Image 1 & 2) */}
          <View
            style={styles.chartWrapper}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={handleTouchChart}
            onResponderMove={handleTouchChart}
          >
            {/* YouTube Studio Floating Tooltip Box on touch (matching Image 2!) */}
            {activeDay && activePoint && (
              <View
                style={[
                  styles.tooltipBox,
                  {
                    left: Math.max(12, Math.min(activePoint.x - 65, chartWidth - 145)),
                    top: Math.max(4, activePoint.y - 66),
                  },
                ]}
                pointerEvents="none"
              >
                <Text style={styles.tooltipDate}>{activeDay.item.formattedDate}</Text>
                <Text style={styles.tooltipVal}>{formatMinutes(activeDay.item.totalMinutes)}</Text>
                <Text style={styles.tooltipSub}>
                  {activeDay.item.sessionCount} session{activeDay.item.sessionCount !== 1 ? 's' : ''}
                </Text>
              </View>
            )}

            <Svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
              <Defs>
                <SvgLinearGradient id="ytBlueGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#38BDF8" stopOpacity={0.28} />
                  <Stop offset="100%" stopColor="#38BDF8" stopOpacity={0.0} />
                </SvgLinearGradient>
              </Defs>

              {/* Horizontal grid lines */}
              <Line x1={paddingLeft} y1={paddingTop} x2={chartWidth - paddingRight} y2={paddingTop} stroke="rgba(255,255,255,0.06)" />
              <Line x1={paddingLeft} y1={paddingTop + plotHeight * 0.5} x2={chartWidth - paddingRight} y2={paddingTop + plotHeight * 0.5} stroke="rgba(255,255,255,0.06)" />
              <Line x1={paddingLeft} y1={paddingTop + plotHeight} x2={chartWidth - paddingRight} y2={paddingTop + plotHeight} stroke="rgba(255,255,255,0.12)" />

              {/* Y-Axis scale numbers */}
              <SvgText x={6} y={paddingTop + 4} fill="#71717A" fontSize={9} fontFamily={fonts.medium}>
                {formatMinutes(dailyActivity.maxMinutes)}
              </SvgText>
              <SvgText x={6} y={paddingTop + plotHeight * 0.5 + 4} fill="#71717A" fontSize={9} fontFamily={fonts.medium}>
                {formatMinutes(Math.round(dailyActivity.maxMinutes / 2))}
              </SvgText>
              <SvgText x={6} y={paddingTop + plotHeight + 3} fill="#71717A" fontSize={9} fontFamily={fonts.medium}>
                0m
              </SvgText>

              {/* Smooth Area Gradient */}
              {areaD ? <Path d={areaD} fill="url(#ytBlueGrad)" /> : null}

              {/* Smooth Blue Stroke Line */}
              {pathD ? <Path d={pathD} stroke="#38BDF8" strokeWidth={2.4} fill="none" /> : null}

              {/* Vertical Scrubber Line & Dot when tapped (matching Image 2!) */}
              {activePoint && (
                <G>
                  <Line
                    x1={activePoint.x}
                    y1={paddingTop}
                    x2={activePoint.x}
                    y2={paddingTop + plotHeight}
                    stroke="rgba(255, 255, 255, 0.45)"
                    strokeWidth={1}
                  />
                  <Circle cx={activePoint.x} cy={activePoint.y} r={7} fill="#38BDF8" fillOpacity={0.25} />
                  <Circle cx={activePoint.x} cy={activePoint.y} r={3.5} fill="#38BDF8" />
                  <Circle cx={activePoint.x} cy={activePoint.y} r={1.5} fill="#FFFFFF" />
                </G>
              )}

              {/* X-Axis Dates at bottom */}
              {points.length > 0 && (
                <G>
                  <SvgText
                    x={points[0].x}
                    y={chartHeight - 8}
                    fill="#71717A"
                    fontSize={9.5}
                    fontFamily={fonts.regular}
                    textAnchor="start"
                  >
                    {points[0].item.dayNumber} {points[0].item.dayLabel}
                  </SvgText>
                  <SvgText
                    x={points[points.length - 1].x}
                    y={chartHeight - 8}
                    fill="#71717A"
                    fontSize={9.5}
                    fontFamily={fonts.regular}
                    textAnchor="end"
                  >
                    {points[points.length - 1].item.dayNumber} {points[points.length - 1].item.dayLabel}
                  </SvgText>
                </G>
              )}
            </Svg>
          </View>

          {/* Dots Indicator below card (matching Image 1) */}
          <View style={styles.paginationDotsRow}>
            {[0, 1, 2, 3].map((idx) => (
              <View
                key={idx}
                style={[
                  styles.paginationDot,
                  idx === activeMetricIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* 5. TOP CONTENT / SHIELDED APPS (matching Image 1 "Top content") */}
        <View style={styles.studioCard}>
          <Text style={styles.cardSectionTitle}>Top content</Text>
          <Text style={styles.cardSectionSub}>Shielded distractions • {currentFilterLabel}</Text>

          <View style={styles.topContentList}>
            {topContentItems.map((app) => (
              <View key={app.name} style={styles.topContentRow}>
                {/* Thumbnail Icon */}
                <View style={styles.appIconThumb}>
                  <Text style={{ fontSize: 16 }}>{app.emoji}</Text>
                </View>

                {/* Name & Green Bar (exact match to Image 1!) */}
                <View style={styles.barContainer}>
                  <Text style={styles.appRowName} numberOfLines={1}>
                    {app.name}
                  </Text>
                  <View style={styles.greenBarTrack}>
                    <View
                      style={[
                        styles.greenBarFill,
                        { width: `${Math.max(8, Math.round(app.ratio * 100))}%` },
                      ]}
                    />
                  </View>
                </View>

                {/* Right Minutes Number */}
                <Text style={styles.appMinsValue}>
                  {app.mins > 0 ? formatMinutes(app.mins) : '0m'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 6. WHEN YOU FOCUS IN RECOVER (matching Image 4 "When your viewers are on YouTube") */}
        <View style={styles.studioCard}>
          <Text style={styles.cardSectionTitle}>When you focus in Recover</Text>
          <Text style={styles.cardSectionSub}>Your local time • {currentFilterLabel}</Text>

          {!peakTime.isEligible ? (
            // Empty State (exact match to Image 2 with yellow arrow!)
            <View style={styles.emptyHeatmapBox}>
              <View style={styles.emptyNoticeInner}>
                <Ionicons name="information-circle-outline" size={17} color="#71717A" style={{ marginRight: 6 }} />
                <Text style={styles.emptyNoticeText}>Not enough data to show this report</Text>
              </View>
              <Text style={styles.emptyNoticeSub}>
                Recover needs 21 days of focus history ({peakTime.daysRecorded} of 21 recorded) and 10 completed sessions to show your peak rhythm.
              </Text>
            </View>
          ) : (
            // Full YouTube Studio Purple Activity Heatmap (matching Image 4!)
            <View style={styles.heatmapWrapper}>
              {/* Day Headers (Sun, Mon, Tue, Wed, Thu, Fri, Sat) */}
              <View style={styles.heatmapDaysRow}>
                <View style={{ width: 56 }} />
                {heatmap.days.map((day) => (
                  <Text key={day} style={styles.heatmapDayLabel}>
                    {day}
                  </Text>
                ))}
              </View>

              {/* 4 Time Slot Rows: 12:00 AM, 6:00 AM, 12:00 PM, 6:00 PM */}
              {heatmap.timeSlots.map((slotLabel, slotIdx) => (
                <View key={slotLabel} style={styles.heatmapTimeRow}>
                  <Text style={styles.heatmapTimeLabel}>{slotLabel}</Text>
                  <View style={styles.heatmapCellsRow}>
                    {heatmap.matrix[slotIdx].map((intensity, colIdx) => {
                      // Purple intensity colors matching YouTube Studio
                      const cellBg =
                        intensity === 4
                          ? '#C084FC' // vivid light purple
                          : intensity === 3
                          ? '#A855F7' // active purple
                          : intensity === 2
                          ? '#7E22CE' // medium purple
                          : intensity === 1
                          ? '#3B1261' // faint purple
                          : '#1A102A'; // inactive dark purple
                      return (
                        <View
                          key={colIdx}
                          style={[styles.heatmapCell, { backgroundColor: cellBg }]}
                        />
                      );
                    })}
                  </View>
                </View>
              ))}

              <View style={styles.heatmapFooterNote}>
                <Ionicons name="sparkles" size={13} color="#C084FC" style={{ marginRight: 5 }} />
                <Text style={styles.heatmapFooterText}>
                  {peakTime.insightText}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* YOUTUBE STUDIO STYLE DATE FILTER DROPDOWN MODAL (matching Image 3) */}
      <Modal
        visible={showFilterDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterDropdown(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowFilterDropdown(false)}>
          <View style={[styles.dropdownMenuCard, { top: insets.top + 48 }]}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360 }}>
              {FILTER_OPTIONS.map((item) => {
                const isSelected = period === item.id;
                return (
                  <Pressable
                    key={item.id}
                    style={[styles.dropdownOptionRow, isSelected && styles.dropdownOptionRowActive]}
                    onPress={() => {
                      setPeriod(item.id);
                      setScrubberIndex(null);
                      setShowFilterDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        isSelected && styles.dropdownOptionTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={17} color="#38BDF8" />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Frosted Glass Paywall Overlay for Free Users */}
      {!isPlus && (
        <View style={[styles.fullscreenPaywallContainer, { top: insets.top + 52 }]}>
          <LinearGradient
            colors={['#72767F', '#585C65', '#454850', '#34373E']}
            locations={[0, 0.35, 0.72, 1]}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={styles.absoluteCover}
          />

          <BlurView
            intensity={Platform.OS === 'ios' ? 95 : 100}
            tint="dark"
            style={styles.absoluteCover}
          />

          <View style={styles.centerPaywallWrap}>
            <PaywallCard
              title="Upgrade to Recover Pro"
              subtitle="Upgrade to Pro to unlock comprehensive focus analytics, student peak distribution, and deep session reports."
              buttonText="Upgrade to Pro"
              onPress={() => navigation.navigate('Pricing')}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  topBar: {
    backgroundColor: '#0F0F0F',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#27272A',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  dateDropdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dateDropdownText: {
    color: '#FFFFFF',
    fontFamily: fonts.medium,
    fontSize: 12.5,
    maxWidth: 100,
  },
  subTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  subTabItem: {
    paddingVertical: 10,
    marginRight: 22,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subTabItemActive: {
    borderBottomColor: '#FFFFFF',
  },
  subTabText: {
    color: '#71717A',
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  subTabTextActive: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headlineBox: {
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  headlineTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 19,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  headlineSub: {
    color: '#71717A',
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  studioCard: {
    backgroundColor: '#1E1E22',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A2E',
  },
  metricTabsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricTab: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  metricTabActive: {},
  metricLabel: {
    color: '#A1A1AA',
    fontFamily: fonts.medium,
    fontSize: 11.5,
    marginBottom: 4,
  },
  metricNumber: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 17,
    letterSpacing: -0.3,
  },
  metricSubInfo: {
    color: '#71717A',
    fontFamily: fonts.regular,
    fontSize: 10.5,
    marginTop: 2,
  },
  chartWrapper: {
    position: 'relative',
    height: 175,
    marginVertical: 4,
  },
  tooltipBox: {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: '#18181B',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#38BDF8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
    minWidth: 130,
  },
  tooltipDate: {
    color: '#D4D4D8',
    fontFamily: fonts.medium,
    fontSize: 10.5,
    marginBottom: 2,
  },
  tooltipVal: {
    color: '#38BDF8',
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  tooltipSub: {
    color: '#71717A',
    fontFamily: fonts.regular,
    fontSize: 9.5,
  },
  paginationDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 6,
  },
  paginationDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#3F3F46',
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  cardSectionTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 16,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  cardSectionSub: {
    color: '#71717A',
    fontFamily: fonts.regular,
    fontSize: 12,
    marginBottom: 16,
  },
  topContentList: {
    gap: 12,
  },
  topContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appIconThumb: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  barContainer: {
    flex: 1,
    marginRight: 14,
  },
  appRowName: {
    color: '#FFFFFF',
    fontFamily: fonts.medium,
    fontSize: 13,
    marginBottom: 5,
  },
  greenBarTrack: {
    height: 9,
    backgroundColor: '#27272A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  greenBarFill: {
    height: '100%',
    backgroundColor: '#22C55E', // YouTube Studio bright green bar matching Image 1!
    borderRadius: 4,
  },
  appMinsValue: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 13.5,
    minWidth: 42,
    textAlign: 'right',
  },
  emptyHeatmapBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2A2A2E',
  },
  emptyNoticeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  emptyNoticeText: {
    color: '#A1A1AA',
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  emptyNoticeSub: {
    color: '#71717A',
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 16,
  },
  heatmapWrapper: {
    marginTop: 4,
  },
  heatmapDaysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  heatmapDayLabel: {
    flex: 1,
    textAlign: 'center',
    color: '#71717A',
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  heatmapTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  heatmapTimeLabel: {
    width: 56,
    color: '#71717A',
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  heatmapCellsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  heatmapCell: {
    flex: 1,
    height: 18,
    borderRadius: 3,
  },
  heatmapFooterNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2A2A2E',
  },
  heatmapFooterText: {
    color: '#D4D4D8',
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  dropdownMenuCard: {
    position: 'absolute',
    right: 16,
    width: 200,
    backgroundColor: '#1E1E22',
    borderRadius: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#323238',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 20,
  },
  dropdownOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  dropdownOptionRowActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  dropdownOptionText: {
    color: '#D4D4D8',
    fontFamily: fonts.medium,
    fontSize: 13.5,
  },
  dropdownOptionTextActive: {
    color: '#38BDF8',
    fontFamily: fonts.semibold,
  },
  fullscreenPaywallContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
  absoluteCover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  centerPaywallWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
});
