import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
  Rect,
  Circle,
  G,
} from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { fonts } from '../theme';
import { useApp } from '../context/AppContext';
import PaywallCard from '../components/PaywallCard';

type PeriodMode = 'Daily' | 'Weekly' | 'Monthly';

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userName, userHandle, credits, isPlus } = useApp();

  const [focusPeriod, setFocusPeriod] = useState<PeriodMode>('Daily');

  React.useEffect(() => {
    if (!isPlus) {
      navigation.replace('Pricing');
    }
  }, [isPlus, navigation]);

  const displayName = userName.trim() ? userName : 'Student';
  const displayHandle = userHandle.trim() ? `@${userHandle.replace(/^@/, '')}` : '@focus_scholar';

  // Dynamic Data based on period
  const focusPeriodData = {
    Daily: {
      time: '3 hr, 45 min',
      sub: 'Avg Daily Focus',
      approx: 'Today',
      approxLabel: '4 Sessions',
      curveArea: 'M0 95 C45 90, 90 80, 140 62 C185 48, 220 44, 270 50 L270 110 L0 110 Z',
      curveLine: 'M0 95 C45 90, 90 80, 140 62 C185 48, 220 44, 270 50',
      peakX: 195,
      peakY: 46,
    },
    Weekly: {
      time: '24 hr, 10 min',
      sub: 'Total Weekly Focus',
      approx: '7 Days',
      approxLabel: '28 Sessions',
      curveArea: 'M0 92 C50 85, 100 68, 160 56 C210 48, 240 44, 270 48 L270 110 L0 110 Z',
      curveLine: 'M0 92 C50 85, 100 68, 160 56 C210 48, 240 44, 270 48',
      peakX: 220,
      peakY: 46,
    },
    Monthly: {
      time: '98 hr, 30 min',
      sub: 'Total Monthly Focus',
      approx: '30 Days',
      approxLabel: '112 Sessions',
      curveArea: 'M0 98 C60 90, 110 72, 170 58 C220 48, 250 44, 270 48 L270 110 L0 110 Z',
      curveLine: 'M0 98 C60 90, 110 72, 170 58 C220 48, 250 44, 270 48',
      peakX: 235,
      peakY: 46,
    },
  }[focusPeriod];

  return (
    <View style={styles.root}>
      {/* Top Header: [ ✕ ] ... Analytics */}
      <View style={[styles.headerRow, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Dashboard'))}
          hitSlop={12}
        >
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </Pressable>

        <Text style={styles.headerTitle}>Analytics</Text>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
        pointerEvents={isPlus ? 'auto' : 'none'}
        style={!isPlus && styles.scrollViewLocked}
      >
        {/* Minimal User Bar */}
        <View style={styles.userBar}>
          <View style={styles.userLeft}>
            <View style={styles.avatarRing}>
              <Ionicons name="sparkles" size={15} color="#2DD4BF" />
            </View>
            <View>
              <View style={styles.nameRow}>
                <Text style={styles.userNameText}>{displayName}</Text>
                <View style={isPlus ? styles.proBadge : styles.freeBadge}>
                  <Text style={isPlus ? styles.proBadgeText : styles.freeBadgeText}>
                    {isPlus ? 'PLUS' : 'FREE'}
                  </Text>
                </View>
              </View>
              <Text style={styles.userHandleText}>{displayHandle}</Text>
            </View>
          </View>
          <View style={styles.creditsPill}>
            <Text style={styles.creditsPillText}>{credits} credits</Text>
          </View>
        </View>

        {/* 1. Main Focus Time Card matching screenshot */}
        <View style={styles.heroCard}>
          {/* Period Switcher: Daily | Weekly | Monthly */}
          <View style={styles.periodSwitcher}>
            {(['Daily', 'Weekly', 'Monthly'] as PeriodMode[]).map((p) => {
              const isActive = focusPeriod === p;
              return (
                <Pressable
                  key={p}
                  style={[styles.periodBtn, isActive && styles.periodBtnActive]}
                  onPress={() => setFocusPeriod(p)}
                >
                  <Text style={[styles.periodBtnText, isActive && styles.periodBtnTextActive]}>
                    {p}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Main Headline Stat */}
          <View style={styles.statHeaderRow}>
            <View>
              <Text style={styles.heroNumber}>{focusPeriodData.time}</Text>
              <Text style={styles.heroSub}>{focusPeriodData.sub}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.approxUpper}>APPROX</Text>
              <Text style={styles.approxNumber}>{focusPeriodData.approx}</Text>
              <Text style={styles.approxDetail}>{focusPeriodData.approxLabel}</Text>
            </View>
          </View>

          {/* Glowing Bezier Curve Area Chart */}
          <View style={styles.chartWrapper}>
            <Svg width="100%" height={118} viewBox="0 0 300 118">
              <Defs>
                <SvgLinearGradient id="focusOledGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.35} />
                  <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.0} />
                </SvgLinearGradient>
              </Defs>

              {/* Horizontal grid lines */}
              <Path d="M0 16 H266" stroke="rgba(255,255,255,0.06)" />
              <Path d="M0 40 H266" stroke="rgba(255,255,255,0.06)" />
              <Path d="M0 64 H266" stroke="rgba(255,255,255,0.06)" />
              <Path d="M0 88 H266" stroke="rgba(255,255,255,0.06)" />
              <Path d="M0 110 H266" stroke="rgba(255,255,255,0.06)" />

              {/* Right Y-Axis */}
              <SvgText x={272} y={19} fill="#71717A" fontSize={8} fontFamily={fonts.medium}>6h</SvgText>
              <SvgText x={272} y={43} fill="#71717A" fontSize={8} fontFamily={fonts.medium}>4h</SvgText>
              <SvgText x={272} y={67} fill="#71717A" fontSize={8} fontFamily={fonts.medium}>2h</SvgText>
              <SvgText x={272} y={91} fill="#71717A" fontSize={8} fontFamily={fonts.medium}>1h</SvgText>
              <SvgText x={272} y={112} fill="#71717A" fontSize={8} fontFamily={fonts.medium}>0h</SvgText>

              {/* Area fill */}
              <Path d={focusPeriodData.curveArea} fill="url(#focusOledGrad)" />

              {/* Glowing line stroke */}
              <Path d={focusPeriodData.curveLine} stroke="#FFFFFF" strokeWidth={2.4} fill="none" />

              {/* Glowing peak dot */}
              <Circle cx={focusPeriodData.peakX} cy={focusPeriodData.peakY} r={3.5} fill="#FFFFFF" />
              <Circle cx={focusPeriodData.peakX} cy={focusPeriodData.peakY} r={6} stroke="#FFFFFF" strokeWidth={1.5} fill="none" opacity={0.6} />
            </Svg>
          </View>
        </View>

        {/* 2. Most Focused Time of the Student Graph */}
        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <View>
              <Text style={styles.cardTitle}>Most Focused Time</Text>
              <Text style={styles.cardSub}>Student Peak Study Distribution</Text>
            </View>
            <View style={styles.peakBadge}>
              <Text style={styles.peakBadgeText}>2 PM – 5 PM</Text>
            </View>
          </View>

          {/* Peak Waveform Heat-Chart */}
          <View style={styles.waveChartBox}>
            <Svg width="100%" height={124} viewBox="0 0 280 124">
              <Defs>
                <SvgLinearGradient id="studentPeakGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.35} />
                  <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.02} />
                </SvgLinearGradient>
              </Defs>

              {/* Grid guidelines */}
              <Path d="M0 30 H280" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <Path d="M0 65 H280" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <Path d="M0 100 H280" stroke="rgba(255,255,255,0.05)" />

              {/* Continuous Student Heatwave: Peaks at 3 PM (x=175) */}
              <Path
                d="M10 98 C35 96, 50 82, 70 70 C90 58, 110 74, 130 65 C150 50, 165 24, 185 24 C205 24, 220 54, 240 50 C255 48, 265 85, 275 98 L275 100 L10 100 Z"
                fill="url(#studentPeakGrad)"
              />
              <Path
                d="M10 98 C35 96, 50 82, 70 70 C90 58, 110 74, 130 65 C150 50, 165 24, 185 24 C205 24, 220 54, 240 50 C255 48, 265 85, 275 98"
                stroke="#FFFFFF"
                strokeWidth={2.4}
                fill="none"
              />

              {/* Peak Marker at 3 PM (x=185, y=24) */}
              <G>
                <Circle cx={185} cy={24} r={3.5} fill="#FFFFFF" />
                <Circle cx={185} cy={24} r={7} stroke="#FFFFFF" strokeWidth={1.5} fill="none" opacity={0.7} />
                {/* Vertical guideline */}
                <Path d="M185 32 V98" stroke="rgba(255, 255, 255, 0.4)" strokeDasharray="2 2" strokeWidth={1} />
              </G>

              {/* Time Axis Labels */}
              <SvgText x={15} y={115} fill="#71717A" fontSize={8.5} textAnchor="middle" fontFamily={fonts.medium}>6 AM</SvgText>
              <SvgText x={70} y={115} fill="#71717A" fontSize={8.5} textAnchor="middle" fontFamily={fonts.medium}>9 AM</SvgText>
              <SvgText x={125} y={115} fill="#71717A" fontSize={8.5} textAnchor="middle" fontFamily={fonts.medium}>12 PM</SvgText>
              <SvgText x={185} y={115} fill="#FFFFFF" fontSize={9} textAnchor="middle" fontFamily={fonts.bold}>3 PM</SvgText>
              <SvgText x={235} y={115} fill="#71717A" fontSize={8.5} textAnchor="middle" fontFamily={fonts.medium}>7 PM</SvgText>
              <SvgText x={270} y={115} fill="#71717A" fontSize={8.5} textAnchor="middle" fontFamily={fonts.medium}>11 PM</SvgText>
            </Svg>
          </View>

          {/* Minimal Key Insights Strip */}
          <View style={styles.insightsStrip}>
            <View style={styles.insightCol}>
              <Text style={styles.insightVal}>2 PM – 5 PM</Text>
              <Text style={styles.insightLabel}>Peak Window</Text>
            </View>
            <View style={styles.stripDivider} />
            <View style={styles.insightCol}>
              <Text style={styles.insightVal}>94%</Text>
              <Text style={styles.insightLabel}>Focus Quality</Text>
            </View>
            <View style={styles.stripDivider} />
            <View style={styles.insightCol}>
              <Text style={styles.insightVal}>52 mins</Text>
              <Text style={styles.insightLabel}>Avg Session</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fullscreen Frosted Glass Blur Overlay for Free Users matching reference */}
      {!isPlus && (
        <View style={[styles.fullscreenPaywallContainer, { top: insets.top + 52 }]}>
          {/* Frosted Base Linear Gradient matching user reference */}
          <LinearGradient
            colors={['#72767F', '#585C65', '#454850', '#34373E']}
            locations={[0, 0.35, 0.72, 1]}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Subtle soft light bloom bleeding through frost */}
          <View style={styles.frostBlobLight} pointerEvents="none" />

          {/* Hardware Gaussian BlurView */}
          <BlurView
            intensity={Platform.OS === 'ios' ? 95 : 100}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />

          {/* Frosted glass specular sheen & subtle border */}
          <View style={styles.frostGlassVeil} pointerEvents="none" />

          <View style={styles.centerPaywallWrap}>
            <PaywallCard
              title="Upgrade to Recover Plus"
              subtitle="Upgrade to Plus to unlock comprehensive focus analytics, student peak distribution, and deep session reports."
              buttonText="Upgrade to Plus"
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
    backgroundColor: '#000000',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  userBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111113',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#222226',
    marginBottom: 14,
  },
  userLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.25)',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userNameText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 14.5,
    marginRight: 6,
  },
  userHandleText: {
    color: '#71717A',
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  proBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
  },
  proBadgeText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  freeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
  },
  freeBadgeText: {
    color: '#D4D4D8',
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  creditsPill: {
    backgroundColor: '#18181B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  creditsPillText: {
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
  heroCard: {
    backgroundColor: '#111113',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 14,
  },
  periodSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: 18,
    padding: 3,
    alignSelf: 'flex-start',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#242428',
  },
  periodBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5.5,
    borderRadius: 15,
  },
  periodBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  periodBtnText: {
    color: '#9CA3AF',
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  periodBtnTextActive: {
    color: '#000000',
    fontFamily: fonts.bold,
  },
  statHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  heroNumber: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 26,
    letterSpacing: -0.5,
  },
  heroSub: {
    color: '#71717A',
    fontFamily: fonts.regular,
    fontSize: 12.5,
    marginTop: 2,
  },
  approxUpper: {
    color: '#71717A',
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    letterSpacing: 0.8,
  },
  approxNumber: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 16,
    marginTop: 1,
  },
  approxDetail: {
    color: '#71717A',
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  chartWrapper: {
    marginTop: 8,
  },
  card: {
    backgroundColor: '#111113',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  cardSub: {
    color: '#71717A',
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 2,
  },
  peakBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  peakBadgeText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 11.5,
  },
  waveChartBox: {
    marginVertical: 4,
  },
  insightsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#161618',
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#222226',
  },
  insightCol: {
    alignItems: 'center',
  },
  insightVal: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 13.5,
    marginBottom: 2,
  },
  insightLabel: {
    color: '#71717A',
    fontFamily: fonts.regular,
    fontSize: 10.5,
  },
  stripDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#26262B',
  },
  scrollViewLocked: {
    opacity: 0.12,
  },
  fullscreenPaywallContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  frostBlobLight: {
    position: 'absolute',
    top: '8%',
    right: '8%',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  frostGlassVeil: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.14)',
  },
  centerPaywallWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
});
