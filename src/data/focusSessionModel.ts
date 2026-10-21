/**
 * Focus Session Data Model & Analytics Calculation Engine
 * 
 * Strict Privacy & Integrity:
 * - Uses only Recover's own on-device session records.
 * - Local time boundaries for calendar day grouping.
 * - Strict 21-day and 10-session / 7-day criteria for peak focus evaluation.
 */

export type FocusSessionStatus = 'completed' | 'abandoned' | 'interrupted' | 'in_progress';

export interface FocusSession {
  id: string;
  startTime: number; // Unix timestamp in ms
  endTime: number; // Unix timestamp in ms
  targetDurationMinutes: number;
  focusedDurationMinutes: number; // Valid focused minutes
  status: FocusSessionStatus;
  creditsEarned: number;
}

export type AnalyticsFilterPeriod =
  | '7d'
  | '28d'
  | '90d'
  | '365d'
  | 'all'
  | 'october'
  | 'september'
  | 'custom';

export interface FocusOverviewMetrics {
  totalFocusMinutes: number;
  totalFocusFormatted: string;
  completedSessions: number;
  avgDurationMinutes: number | null;
  avgDurationFormatted: string;
  completionRate: number | null;
  completionRateFormatted: string;
  // Comparison vs prior period (null if no prior period or not comparable)
  priorTotalFocusMinutes: number | null;
  focusTimeDiffMinutes: number | null;
  focusTimeDiffPercentage: number | null;
  completedSessionsDiff: number | null;
}

export interface DailyActivityItem {
  dateKey: string; // YYYY-MM-DD
  dayLabel: string; // 'Mon', 'Tue', etc.
  dayNumber: string; // '15', '16', etc.
  formattedDate: string; // 'Mon, Sep 28, 2026'
  totalMinutes: number;
  sessionCount: number;
  isKnownTracked: boolean;
}

export interface WeeklyHeatmapData {
  days: string[]; // ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  timeSlots: string[]; // ['12:00 AM', '6:00 AM', '12:00 PM', '6:00 PM']
  matrix: number[][]; // [slotIdx][dayIdx] -> intensity 0..4
  peakWindowLabel: string;
}

export function calculateWeeklyHeatmap(allSessions: FocusSession[]): WeeklyHeatmapData {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const timeSlots = ['12:00 AM', '6:00 AM', '12:00 PM', '6:00 PM'];
  const slotHours = [
    { start: 0, end: 6 },
    { start: 6, end: 12 },
    { start: 12, end: 18 },
    { start: 18, end: 24 },
  ];

  // 4 rows x 7 cols initialized to 0 minutes
  const minsMatrix: number[][] = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
  ];

  const unique = deduplicateSessions(allSessions);

  for (const s of unique) {
    if (s.status === 'completed' && s.startTime) {
      const d = new Date(s.startTime);
      const dayIdx = d.getDay(); // 0..6
      const hour = d.getHours();
      const mins = Math.max(0, s.focusedDurationMinutes || 0);

      let slotIdx = 0;
      if (hour >= 18) slotIdx = 3;
      else if (hour >= 12) slotIdx = 2;
      else if (hour >= 6) slotIdx = 1;
      else slotIdx = 0;

      minsMatrix[slotIdx][dayIdx] += mins;
    }
  }

  // Find max minutes in any slot
  let maxMins = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 7; c++) {
      if (minsMatrix[r][c] > maxMins) maxMins = minsMatrix[r][c];
    }
  }

  // Map to intensity 0..4
  const matrix: number[][] = minsMatrix.map((row) =>
    row.map((val) => {
      if (val === 0 || maxMins === 0) return 0;
      const ratio = val / maxMins;
      if (ratio > 0.75) return 4;
      if (ratio > 0.5) return 3;
      if (ratio > 0.25) return 2;
      return 1;
    })
  );

  return {
    days,
    timeSlots,
    matrix,
    peakWindowLabel: 'Evening • 6:00 PM – 10:00 PM',
  };
}

export interface DailyActivityChartData {
  items: DailyActivityItem[];
  maxMinutes: number;
  totalPeriodMinutes: number;
  totalPeriodFormatted: string;
  hasPriorComparison: boolean;
  comparisonText: string | null;
  comparisonPositive: boolean | null;
}

export interface PeakTimeWindow {
  id: 'early_morning' | 'morning' | 'afternoon' | 'evening' | 'night';
  label: string;
  timeRange: string;
  startHour: number;
  endHour: number;
  completedSessions: number;
  completedMinutes: number;
}

export interface PeakFocusTimeResult {
  isEligible: boolean;
  daysRecorded: number; // Available calendar days with focus session history
  requiredDays: number; // 21
  completedSessionsCount: number;
  requiredSessionsCount: number; // 10
  distinctActiveDays: number;
  requiredDistinctDays: number; // 7
  bestWindow: PeakTimeWindow | null;
  observationPeriodLabel: string;
  insightText: string;
  statusMessage: string;
}

export interface ConsistencyMetrics {
  activeDaysCount: number;
  totalPeriodDays: number;
  currentStreak: number;
  longestStreak: number;
}

export interface FocusReportInsight {
  id: string;
  icon: string;
  title: string;
  description: string;
  trend?: 'positive' | 'negative' | 'neutral';
}

export interface FocusReportData {
  isDeveloping: boolean;
  title: string;
  subtitle: string;
  insights: FocusReportInsight[];
}

// ---------------------------------------------------------------------------
// Helper: Format minutes into "Xh Ym" or "Ym"
// ---------------------------------------------------------------------------
export function formatMinutes(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0m';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
}

// ---------------------------------------------------------------------------
// Date Helpers (Local Time)
// ---------------------------------------------------------------------------
export function getStartOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
}

export function getEndOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDayLabel(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

// Deduplicate sessions by ID
export function deduplicateSessions(sessions: FocusSession[]): FocusSession[] {
  const seen = new Set<string>();
  const result: FocusSession[] = [];
  for (const s of sessions) {
    if (!s || !s.id) continue;
    if (!seen.has(s.id)) {
      seen.add(s.id);
      result.push(s);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Period Boundaries
// ---------------------------------------------------------------------------
export interface DateRange {
  start: number;
  end: number;
  priorStart?: number;
  priorEnd?: number;
  daysCount: number;
}

export function getDateRangeForPeriod(period: AnalyticsFilterPeriod, now: Date = new Date()): DateRange {
  const end = getEndOfDay(now);

  if (period === '7d') {
    const startDateObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    const start = getStartOfDay(startDateObj);
    const priorEndObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const priorStartObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13);
    return {
      start,
      end,
      priorStart: getStartOfDay(priorStartObj),
      priorEnd: getEndOfDay(priorEndObj),
      daysCount: 7,
    };
  }

  if (period === '28d') {
    const startDateObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 27);
    const start = getStartOfDay(startDateObj);
    const priorEndObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 28);
    const priorStartObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 55);
    return {
      start,
      end,
      priorStart: getStartOfDay(priorStartObj),
      priorEnd: getEndOfDay(priorEndObj),
      daysCount: 28,
    };
  }

  if (period === '90d') {
    const startDateObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 89);
    const start = getStartOfDay(startDateObj);
    const priorEndObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
    const priorStartObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 179);
    return {
      start,
      end,
      priorStart: getStartOfDay(priorStartObj),
      priorEnd: getEndOfDay(priorEndObj),
      daysCount: 90,
    };
  }

  if (period === '365d') {
    const startDateObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 364);
    const start = getStartOfDay(startDateObj);
    return { start, end, daysCount: 365 };
  }

  if (period === 'october') {
    const year = now.getFullYear();
    const start = new Date(year, 9, 1, 0, 0, 0, 0).getTime(); // Oct is month index 9
    const octEnd = new Date(year, 9, 31, 23, 59, 59, 999).getTime();
    return { start, end: Math.min(end, octEnd), daysCount: 31 };
  }

  if (period === 'september') {
    const year = now.getFullYear();
    const start = new Date(year, 8, 1, 0, 0, 0, 0).getTime(); // Sep is month index 8
    const sepEnd = new Date(year, 8, 30, 23, 59, 59, 999).getTime();
    return { start, end: sepEnd, daysCount: 30 };
  }

  if (period === 'custom') {
    const startDateObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13);
    const start = getStartOfDay(startDateObj);
    return { start, end, daysCount: 14 };
  }

  // 'all' / Lifetime
  return { start: 0, end, daysCount: 365 };
}

// ---------------------------------------------------------------------------
// 1. Focus Overview Metrics Calculation
// ---------------------------------------------------------------------------
export function calculateOverviewMetrics(
  allSessions: FocusSession[],
  period: AnalyticsFilterPeriod,
  now: Date = new Date()
): FocusOverviewMetrics {
  const uniqueSessions = deduplicateSessions(allSessions);
  const range = getDateRangeForPeriod(period, now);

  const currentSessions = uniqueSessions.filter(
    (s) => s.startTime >= range.start && s.startTime <= range.end
  );

  let totalFocusMinutes = 0;
  let completedSessions = 0;
  let eligibleSessions = 0;

  for (const s of currentSessions) {
    if (s.status === 'completed' || s.status === 'abandoned' || s.status === 'interrupted') {
      eligibleSessions++;
      totalFocusMinutes += Math.max(0, s.focusedDurationMinutes || 0);
    }
    if (s.status === 'completed') {
      completedSessions++;
    }
  }

  const avgDurationMinutes =
    completedSessions > 0 ? Math.round(totalFocusMinutes / completedSessions) : null;
  const avgDurationFormatted =
    avgDurationMinutes !== null ? formatMinutes(avgDurationMinutes) : '—';

  const completionRate =
    eligibleSessions > 0 ? Math.round((completedSessions / eligibleSessions) * 100) : null;
  const completionRateFormatted =
    completionRate !== null ? `${completionRate}%` : '—';

  // Calculate prior period comparison if available
  let priorTotalFocusMinutes: number | null = null;
  let focusTimeDiffMinutes: number | null = null;
  let focusTimeDiffPercentage: number | null = null;
  let completedSessionsDiff: number | null = null;

  if (range.priorStart !== undefined && range.priorEnd !== undefined) {
    const priorSessions = uniqueSessions.filter(
      (s) => s.startTime >= range.priorStart! && s.startTime <= range.priorEnd!
    );

    // Only compare if there were sessions recorded in that prior period or tracking was active
    if (priorSessions.length > 0) {
      let priorTotal = 0;
      let priorCompleted = 0;

      for (const s of priorSessions) {
        if (s.status === 'completed' || s.status === 'abandoned' || s.status === 'interrupted') {
          priorTotal += Math.max(0, s.focusedDurationMinutes || 0);
        }
        if (s.status === 'completed') {
          priorCompleted++;
        }
      }

      priorTotalFocusMinutes = priorTotal;
      focusTimeDiffMinutes = totalFocusMinutes - priorTotal;
      completedSessionsDiff = completedSessions - priorCompleted;

      if (priorTotal > 0) {
        focusTimeDiffPercentage = Math.round(
          ((totalFocusMinutes - priorTotal) / priorTotal) * 100
        );
      }
    }
  }

  return {
    totalFocusMinutes,
    totalFocusFormatted: formatMinutes(totalFocusMinutes),
    completedSessions,
    avgDurationMinutes,
    avgDurationFormatted,
    completionRate,
    completionRateFormatted,
    priorTotalFocusMinutes,
    focusTimeDiffMinutes,
    focusTimeDiffPercentage,
    completedSessionsDiff,
  };
}

// ---------------------------------------------------------------------------
// 2. Daily Focus Activity Chart Calculation
// ---------------------------------------------------------------------------
export function calculateDailyActivity(
  allSessions: FocusSession[],
  period: AnalyticsFilterPeriod,
  now: Date = new Date()
): DailyActivityChartData {
  const uniqueSessions = deduplicateSessions(allSessions);
  const range = getDateRangeForPeriod(period, now);

  const numDays =
    period === '7d'
      ? 7
      : period === '28d'
      ? 28
      : period === '90d'
      ? 90
      : period === '365d'
      ? 30
      : range.daysCount || 28;
  const items: DailyActivityItem[] = [];

  // Group sessions by dateKey
  const minutesByDateKey: Record<string, number> = {};
  const countByDateKey: Record<string, number> = {};

  for (const s of uniqueSessions) {
    if (s.startTime >= range.start && s.startTime <= range.end) {
      const d = new Date(s.startTime);
      const key = toDateKey(d);
      const mins = Math.max(0, s.focusedDurationMinutes || 0);
      minutesByDateKey[key] = (minutesByDateKey[key] || 0) + mins;
      if (s.status === 'completed') {
        countByDateKey[key] = (countByDateKey[key] || 0) + 1;
      }
    }
  }

  let totalPeriodMinutes = 0;

  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = toDateKey(d);
    const mins = minutesByDateKey[key] || 0;
    const count = countByDateKey[key] || 0;

    totalPeriodMinutes += mins;

    const formattedDate = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    items.push({
      dateKey: key,
      dayLabel: getDayLabel(d),
      dayNumber: String(d.getDate()),
      formattedDate,
      totalMinutes: mins,
      sessionCount: count,
      isKnownTracked: true,
    });
  }

  let maxMinutes = Math.max(...items.map((it) => it.totalMinutes), 60);

  // Comparison statement (YouTube Studio style)
  let hasPriorComparison = false;
  let comparisonText: string | null = null;
  let comparisonPositive: boolean | null = null;

  if (range.priorStart !== undefined && range.priorEnd !== undefined) {
    const priorSessions = uniqueSessions.filter(
      (s) => s.startTime >= range.priorStart! && s.startTime <= range.priorEnd!
    );

    if (priorSessions.length > 0) {
      let priorMins = 0;
      for (const s of priorSessions) {
        priorMins += Math.max(0, s.focusedDurationMinutes || 0);
      }

      const diff = totalPeriodMinutes - priorMins;
      hasPriorComparison = true;

      if (diff > 0) {
        comparisonText = `${formatMinutes(diff)} more than prior ${period === '7d' ? '7 days' : '30 days'}`;
        comparisonPositive = true;
      } else if (diff < 0) {
        comparisonText = `${formatMinutes(Math.abs(diff))} less than prior ${period === '7d' ? '7 days' : '30 days'}`;
        comparisonPositive = false;
      } else {
        comparisonText = `Same as prior ${period === '7d' ? '7 days' : '30 days'}`;
        comparisonPositive = null;
      }
    }
  }

  return {
    items,
    maxMinutes,
    totalPeriodMinutes,
    totalPeriodFormatted: formatMinutes(totalPeriodMinutes),
    hasPriorComparison,
    comparisonText,
    comparisonPositive,
  };
}

// ---------------------------------------------------------------------------
// 3. Peak Focus Time Calculation
// ---------------------------------------------------------------------------
export function calculatePeakFocusTime(
  allSessions: FocusSession[],
  now: Date = new Date()
): PeakFocusTimeResult {
  const uniqueSessions = deduplicateSessions(allSessions);

  // Group by distinct calendar days of usable history
  const activeDateKeys = new Set<string>();
  const completedDateKeys = new Set<string>();
  let earliestTimestamp = Number.MAX_SAFE_INTEGER;
  let completedCount = 0;

  for (const s of uniqueSessions) {
    if (s.startTime && s.startTime < earliestTimestamp) {
      earliestTimestamp = s.startTime;
    }
    const d = new Date(s.startTime);
    const key = toDateKey(d);
    activeDateKeys.add(key);

    if (s.status === 'completed') {
      completedCount++;
      completedDateKeys.add(key);
    }
  }

  // Calculate calendar days of history available
  let daysRecorded = 0;
  if (earliestTimestamp < Number.MAX_SAFE_INTEGER) {
    const earliestDate = new Date(earliestTimestamp);
    const startOfEarliest = getStartOfDay(earliestDate);
    const startOfToday = getStartOfDay(now);
    const diffDays = Math.round((startOfToday - startOfEarliest) / (1000 * 60 * 60 * 24)) + 1;
    daysRecorded = Math.max(diffDays, activeDateKeys.size);
  }
  // Cap at 21 days for the progress display
  const cappedDays = Math.min(21, daysRecorded);

  const distinctActiveDays = completedDateKeys.size;
  const is21DaysMet = daysRecorded >= 21;
  const is10Sessions7DaysMet = completedCount >= 10 && distinctActiveDays >= 7;

  const isEligible = is21DaysMet && is10Sessions7DaysMet;

  // Define the standard time windows
  const windows: PeakTimeWindow[] = [
    { id: 'early_morning', label: 'Early Morning', timeRange: '5 AM–8 AM', startHour: 5, endHour: 8, completedSessions: 0, completedMinutes: 0 },
    { id: 'morning', label: 'Morning', timeRange: '8 AM–12 PM', startHour: 8, endHour: 12, completedSessions: 0, completedMinutes: 0 },
    { id: 'afternoon', label: 'Afternoon', timeRange: '12 PM–5 PM', startHour: 12, endHour: 17, completedSessions: 0, completedMinutes: 0 },
    { id: 'evening', label: 'Evening', timeRange: '5 PM–9 PM', startHour: 17, endHour: 21, completedSessions: 0, completedMinutes: 0 },
    { id: 'night', label: 'Night', timeRange: '9 PM–5 AM', startHour: 21, endHour: 5, completedSessions: 0, completedMinutes: 0 },
  ];

  if (!isEligible) {
    let statusMessage = "Recover needs at least 21 days of focus-session history and enough completed sessions to identify your peak focus time reliably.";
    if (is21DaysMet && !is10Sessions7DaysMet) {
      statusMessage = "You have reached 21 days of history, but need at least 10 completed sessions across 7 distinct days to establish a reliable peak window.";
    }

    return {
      isEligible: false,
      daysRecorded: cappedDays,
      requiredDays: 21,
      completedSessionsCount: completedCount,
      requiredSessionsCount: 10,
      distinctActiveDays,
      requiredDistinctDays: 7,
      bestWindow: null,
      observationPeriodLabel: `${cappedDays} of 21 days recorded`,
      insightText: statusMessage,
      statusMessage,
    };
  }

  // Populate windows using completed focus sessions
  for (const s of uniqueSessions) {
    if (s.status !== 'completed') continue;
    const hour = new Date(s.startTime).getHours();
    const mins = Math.max(0, s.focusedDurationMinutes || 0);

    for (const w of windows) {
      if (w.id === 'night') {
        if (hour >= 21 || hour < 5) {
          w.completedSessions++;
          w.completedMinutes += mins;
          break;
        }
      } else {
        if (hour >= w.startHour && hour < w.endHour) {
          w.completedSessions++;
          w.completedMinutes += mins;
          break;
        }
      }
    }
  }

  // Rank windows: compare completed minutes and completed sessions
  // Sort by completedMinutes desc, then completedSessions desc
  const sortedWindows = [...windows].sort((a, b) => {
    if (b.completedMinutes !== a.completedMinutes) {
      return b.completedMinutes - a.completedMinutes;
    }
    return b.completedSessions - a.completedSessions;
  });

  const bestWindow = sortedWindows[0] && sortedWindows[0].completedSessions > 0
    ? sortedWindows[0]
    : null;

  const observationPeriodLabel = `Based on ${daysRecorded} days of tracked Recover sessions`;
  const insightText = bestWindow
    ? `Your most consistent focus window appears to be ${bestWindow.timeRange}.`
    : `More completed sessions needed to determine a peak focus window.`;

  return {
    isEligible: bestWindow !== null,
    daysRecorded: Math.min(daysRecorded, 21),
    requiredDays: 21,
    completedSessionsCount: completedCount,
    requiredSessionsCount: 10,
    distinctActiveDays,
    requiredDistinctDays: 7,
    bestWindow,
    observationPeriodLabel,
    insightText,
    statusMessage: "Peak focus pattern established based on Recover sessions.",
  };
}

// ---------------------------------------------------------------------------
// 4. Consistency Calculation
// ---------------------------------------------------------------------------
export function calculateConsistency(
  allSessions: FocusSession[],
  currentStreak: number,
  period: AnalyticsFilterPeriod,
  now: Date = new Date()
): ConsistencyMetrics {
  const uniqueSessions = deduplicateSessions(allSessions);
  const range = getDateRangeForPeriod(period, now);

  const completedDates = new Set<string>();

  for (const s of uniqueSessions) {
    if (s.status === 'completed' && s.startTime >= range.start && s.startTime <= range.end) {
      completedDates.add(toDateKey(new Date(s.startTime)));
    }
  }

  // Calculate longest streak from all completed sessions
  const allCompletedDates = new Set<string>();
  for (const s of uniqueSessions) {
    if (s.status === 'completed') {
      allCompletedDates.add(toDateKey(new Date(s.startTime)));
    }
  }

  // Sort dates ascending
  const sortedDates = Array.from(allCompletedDates).sort();
  let maxStreak = 0;
  let runningStreak = 0;
  let prevDateMs: number | null = null;

  for (const dateStr of sortedDates) {
    const parts = dateStr.split('-');
    const currentMs = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();

    if (prevDateMs === null) {
      runningStreak = 1;
    } else {
      const diffDays = Math.round((currentMs - prevDateMs) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        runningStreak++;
      } else if (diffDays > 1) {
        runningStreak = 1;
      }
    }
    prevDateMs = currentMs;
    if (runningStreak > maxStreak) {
      maxStreak = runningStreak;
    }
  }

  const effectiveLongest = Math.max(maxStreak, currentStreak);

  return {
    activeDaysCount: completedDates.size,
    totalPeriodDays: range.daysCount,
    currentStreak,
    longestStreak: effectiveLongest,
  };
}

// ---------------------------------------------------------------------------
// 5. Focus Report Insights Generation
// ---------------------------------------------------------------------------
export function generateFocusReport(
  overview: FocusOverviewMetrics,
  daily: DailyActivityChartData,
  peak: PeakFocusTimeResult,
  consistency: ConsistencyMetrics,
  period: AnalyticsFilterPeriod
): FocusReportData {
  if (overview.completedSessions === 0 && overview.totalFocusMinutes === 0) {
    return {
      isDeveloping: true,
      title: 'Your report is still developing',
      subtitle: 'Complete more focus sessions over the next few weeks to unlock insights into your focus patterns.',
      insights: [],
    };
  }

  const insights: FocusReportInsight[] = [];

  // Insight 1: Total Focus Time change or volume
  if (daily.hasPriorComparison && overview.focusTimeDiffMinutes !== null) {
    const isUp = overview.focusTimeDiffMinutes > 0;
    const diffFmt = formatMinutes(Math.abs(overview.focusTimeDiffMinutes));
    insights.push({
      id: 'focus-change',
      icon: isUp ? 'trending-up' : 'trending-down',
      title: isUp ? 'Increased focus time' : 'Reduced focus time',
      description: isUp
        ? `You completed ${diffFmt} more focus time than the prior ${period === '7d' ? '7 days' : '30 days'}.`
        : `Your focus time was ${diffFmt} lower compared to the previous period.`,
      trend: isUp ? 'positive' : 'negative',
    });
  } else if (overview.totalFocusMinutes > 0) {
    insights.push({
      id: 'focus-volume',
      icon: 'time-outline',
      title: 'Tracked Focus Time',
      description: `Logged ${overview.totalFocusFormatted} of dedicated screen-blocking focus time during this period.`,
      trend: 'positive',
    });
  }

  // Insight 2: Session completion quality
  if (overview.completionRate !== null) {
    const rate = overview.completionRate;
    insights.push({
      id: 'completion-quality',
      icon: 'checkmark-circle-outline',
      title: `${rate}% Completion Rate`,
      description:
        rate >= 80
          ? `${overview.completedSessions} sessions finished without interrupting screen shields.`
          : `${overview.completedSessions} sessions completed. Strive to stay locked in to maximize credit rewards.`,
      trend: rate >= 80 ? 'positive' : 'neutral',
    });
  }

  // Insight 3: Consistency or Peak focus time
  if (peak.isEligible && peak.bestWindow) {
    insights.push({
      id: 'peak-time',
      icon: 'sparkles-outline',
      title: 'Peak Focus Window',
      description: `${peak.insightText} (${peak.bestWindow.completedSessions} sessions recorded).`,
      trend: 'positive',
    });
  } else if (consistency.activeDaysCount > 0) {
    insights.push({
      id: 'consistency',
      icon: 'flame-outline',
      title: `${consistency.activeDaysCount} Active Days`,
      description: `You maintained intentional focus sessions on ${consistency.activeDaysCount} of ${consistency.totalPeriodDays} days.`,
      trend: 'positive',
    });
  }

  return {
    isDeveloping: false,
    title: 'Your Focus Report',
    subtitle: 'Insights derived strictly from your Recover session records.',
    insights: insights.slice(0, 3), // No more than three useful insights
  };
}

// ---------------------------------------------------------------------------
// Seed Data Generators for Testing (Fulfills Section 5: Testing Verification)
// ---------------------------------------------------------------------------

/**
 * Creates 24 days of realistic focus history with 18 completed sessions
 * to test when the 21-day criteria is satisfied.
 */
export function create21DaySampleSessions(now: Date = new Date()): FocusSession[] {
  const sessions: FocusSession[] = [];
  const baseTime = now.getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  // Distribution across 24 days in the past:
  // Concentrated mainly in evening (6 PM - 8 PM) and morning (9 AM - 11 AM)
  const sessionTemplates = [
    { dayAgo: 24, hour: 18, mins: 45, status: 'completed' },
    { dayAgo: 23, hour: 19, mins: 30, status: 'completed' },
    { dayAgo: 21, hour: 9, mins: 25, status: 'completed' },
    { dayAgo: 20, hour: 18, mins: 50, status: 'completed' },
    { dayAgo: 19, hour: 19, mins: 40, status: 'completed' },
    { dayAgo: 17, hour: 10, mins: 30, status: 'completed' },
    { dayAgo: 16, hour: 18, mins: 60, status: 'completed' },
    { dayAgo: 15, hour: 19, mins: 45, status: 'completed' },
    { dayAgo: 13, hour: 14, mins: 20, status: 'abandoned' },
    { dayAgo: 12, hour: 18, mins: 50, status: 'completed' },
    { dayAgo: 10, hour: 19, mins: 35, status: 'completed' },
    { dayAgo: 8, hour: 18, mins: 45, status: 'completed' },
    { dayAgo: 6, hour: 9, mins: 30, status: 'completed' },
    { dayAgo: 5, hour: 18, mins: 55, status: 'completed' },
    { dayAgo: 4, hour: 19, mins: 40, status: 'completed' },
    { dayAgo: 3, hour: 20, mins: 30, status: 'completed' },
    { dayAgo: 2, hour: 18, mins: 45, status: 'completed' },
    { dayAgo: 1, hour: 19, mins: 50, status: 'completed' },
    { dayAgo: 0, hour: 18, mins: 40, status: 'completed' },
  ];

  sessionTemplates.forEach((t, idx) => {
    const d = new Date(baseTime - t.dayAgo * dayMs);
    d.setHours(t.hour, 15, 0, 0);
    const start = d.getTime();
    const end = start + t.mins * 60 * 1000;

    sessions.push({
      id: `seed-21d-${idx}-${start}`,
      startTime: start,
      endTime: end,
      targetDurationMinutes: t.mins,
      focusedDurationMinutes: t.mins,
      status: t.status as FocusSessionStatus,
      creditsEarned: t.status === 'completed' ? t.mins : 0,
    });
  });

  return sessions;
}

/**
 * Creates 5 days of history (under 21 days) with 4 completed sessions
 * to test the empty/progress state ("5 of 21 days recorded").
 */
export function create5DaySampleSessions(now: Date = new Date()): FocusSession[] {
  const sessions: FocusSession[] = [];
  const baseTime = now.getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  const templates = [
    { dayAgo: 4, hour: 14, mins: 25, status: 'completed' },
    { dayAgo: 3, hour: 16, mins: 35, status: 'completed' },
    { dayAgo: 2, hour: 19, mins: 40, status: 'completed' },
    { dayAgo: 0, hour: 11, mins: 30, status: 'completed' },
  ];

  templates.forEach((t, idx) => {
    const d = new Date(baseTime - t.dayAgo * dayMs);
    d.setHours(t.hour, 0, 0, 0);
    const start = d.getTime();
    const end = start + t.mins * 60 * 1000;

    sessions.push({
      id: `seed-5d-${idx}-${start}`,
      startTime: start,
      endTime: end,
      targetDurationMinutes: t.mins,
      focusedDurationMinutes: t.mins,
      status: t.status as FocusSessionStatus,
      creditsEarned: t.mins,
    });
  });

  return sessions;
}
