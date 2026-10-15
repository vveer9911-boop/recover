import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../screens/TransactionsScreen';

const ACTIVE_CARD_STORAGE_KEY = '@recover_active_card_id';
const IS_PLUS_STORAGE_KEY = '@recover_is_plus';
const DISTRACTING_APPS_STORAGE_KEY = '@recover_distracting_apps';

export interface SpendLimits {
  day: number;
  week: number;
  year: number;
}

interface AppContextType {
  userName: string;
  setUserName: (name: string) => void;
  userBio: string;
  setUserBio: (bio: string) => void;
  userHandle: string;
  setUserHandle: (handle: string) => void;
  userAvatarIndex: number;
  setUserAvatarIndex: (index: number) => void;
  streak: number;
  credits: number;
  setCredits: React.Dispatch<React.SetStateAction<number>>;
  transactions: Transaction[];
  claimedReward: boolean;
  isPlus: boolean;
  setIsPlus: (val: boolean) => void;
  spendLimits: SpendLimits;
  setSpendLimit: (period: 'day' | 'week' | 'year', amount: number) => void;
  calmDownHours: number;
  setCalmDownHours: (hours: number) => void;
  isCalmDownActive: boolean;
  calmDownUntil: number | null;
  triggerCalmDown: (hours?: number) => void;
  endCalmDown: () => void;
  withdrawnToday: number;
  claimWelcomeReward: () => void;
  withdrawCredits: (amount: number) => {
    success: boolean;
    message?: string;
    calmDownTriggered?: boolean;
    calmDownHours?: number;
  };
  activeCardId: string;
  setActiveCardId: (id: string) => Promise<void>;
  distractingApps: string[];
  setDistractingApps: (apps: string[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState('');
  const [userBio, setUserBio] = useState('Locking in with Recover. Daily focus builder.');
  const [userHandle, setUserHandle] = useState('focus_champ');
  const [userAvatarIndex, setUserAvatarIndex] = useState(0);
  const [streak, setStreak] = useState(5);
  const [credits, setCredits] = useState(0);
  const [claimedReward, setClaimedReward] = useState(false);
  const [isPlus, setIsPlus] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawnToday, setWithdrawnToday] = useState(0);
  const [spendLimits, setSpendLimitsState] = useState<SpendLimits>({
    day: 60, // 60 minutes
    week: 300, // 300 minutes
    year: 15000,
  });
  const [calmDownHours, setCalmDownHours] = useState<number>(1); // default 1 hour calm down
  const [calmDownUntil, setCalmDownUntil] = useState<number | null>(null);
  const [activeCardId, setActiveCardIdState] = useState<string>('classic-titanium');
  const [distractingApps, setDistractingAppsState] = useState<string[]>(['Instagram', 'TikTok']);

  // Enforce Titanium default for free users
  useEffect(() => {
    if (!isPlus && activeCardId !== 'classic-titanium') {
      setActiveCardIdState('classic-titanium');
      AsyncStorage.setItem(ACTIVE_CARD_STORAGE_KEY, 'classic-titanium').catch(() => {});
    }
  }, [isPlus, activeCardId]);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(ACTIVE_CARD_STORAGE_KEY),
      AsyncStorage.getItem(IS_PLUS_STORAGE_KEY),
      AsyncStorage.getItem(DISTRACTING_APPS_STORAGE_KEY),
    ])
      .then(([savedId, savedPlus, savedApps]) => {
        const isUserPlus = savedPlus === 'true';
        setIsPlus(isUserPlus);
        if (!isUserPlus) {
          setActiveCardIdState('classic-titanium');
          AsyncStorage.setItem(ACTIVE_CARD_STORAGE_KEY, 'classic-titanium').catch(() => {});
        } else if (savedId) {
          setActiveCardIdState(savedId);
        } else {
          setActiveCardIdState('classic-titanium');
        }

        if (savedApps) {
          try {
            setDistractingAppsState(JSON.parse(savedApps));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn('Failed to load storage state:', err);
      });
  }, []);

  const setDistractingApps = (apps: string[]) => {
    setDistractingAppsState(apps);
    AsyncStorage.setItem(DISTRACTING_APPS_STORAGE_KEY, JSON.stringify(apps)).catch(() => {});
  };

  const setIsPlusPersistent = (val: boolean) => {
    setIsPlus(val);
    AsyncStorage.setItem(IS_PLUS_STORAGE_KEY, val ? 'true' : 'false').catch(() => {});
    if (!val) {
      setActiveCardIdState('classic-titanium');
      AsyncStorage.setItem(ACTIVE_CARD_STORAGE_KEY, 'classic-titanium').catch(() => {});
    }
  };

  const setActiveCardId = async (id: string) => {
    if (!isPlus && id !== 'classic-titanium') {
      setActiveCardIdState('classic-titanium');
      return;
    }
    setActiveCardIdState(id);
    try {
      await AsyncStorage.setItem(ACTIVE_CARD_STORAGE_KEY, id);
    } catch (err) {
      console.warn('Failed to persist active card id:', err);
    }
  };

  const isCalmDownActive = calmDownUntil !== null && Date.now() < calmDownUntil;

  const triggerCalmDown = (hours?: number) => {
    const durationHours = hours || calmDownHours || 1;
    const until = Date.now() + durationHours * 60 * 60 * 1000;
    setCalmDownUntil(until);
  };

  const endCalmDown = () => {
    setCalmDownUntil(null);
  };

  const claimWelcomeReward = () => {
    if (claimedReward) return;
    setCredits((prev) => prev + 15);
    setClaimedReward(true);
    setTransactions((prev) => [
      {
        id: 'tx-welcome-reward-' + Date.now(),
        title: 'Welcome Reward',
        subtitle: 'Sign-up focus bonus',
        amount: 15,
        type: 'credit',
        date: 'TODAY',
        time: 'Just now',
      },
      ...prev,
    ]);
  };

  const withdrawCredits = (amount: number) => {
    if (isCalmDownActive) {
      const remainingMs = (calmDownUntil || 0) - Date.now();
      const remainingMinutes = Math.max(1, Math.round(remainingMs / (60 * 1000)));
      return {
        success: false,
        message: `Calm Down active (${calmDownHours}h cooldown). Take a break! ${remainingMinutes}m remaining.`,
      };
    }

    if (amount <= 0) {
      return { success: false, message: 'Please enter a valid amount to withdraw.' };
    }
    if (amount > credits) {
      return {
        success: false,
        message: `Insufficient credits. You have ${credits} credits, but tried to withdraw ${amount}m.`,
      };
    }

    const nextWithdrawnToday = withdrawnToday + amount;
    setWithdrawnToday(nextWithdrawnToday);
    setCredits((prev) => prev - amount);
    setTransactions((prev) => [
      {
        id: 'tx-unlock-' + Date.now(),
        title: 'App Unlock',
        subtitle: `${amount}m screen time unlocked`,
        amount: -amount,
        type: 'debit',
        date: 'TODAY',
        time: 'Just now',
      },
      ...prev,
    ]);

    // Check if spend limit reached
    let calmDownTriggered = false;
    if (nextWithdrawnToday >= spendLimits.day) {
      triggerCalmDown(calmDownHours);
      calmDownTriggered = true;
    }

    return {
      success: true,
      message: `Unlocked ${amount} minutes of app usage! ${amount} credits deducted.`,
      calmDownTriggered,
      calmDownHours,
    };
  };

  const setSpendLimit = (period: 'day' | 'week' | 'year', amount: number) => {
    setSpendLimitsState((prev) => ({
      ...prev,
      [period]: amount,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        userName,
        setUserName,
        userBio,
        setUserBio,
        userHandle,
        setUserHandle,
        userAvatarIndex,
        setUserAvatarIndex,
        streak,
        credits,
        setCredits,
        transactions,
        claimedReward,
        isPlus,
        setIsPlus: setIsPlusPersistent,
        spendLimits,
        setSpendLimit,
        calmDownHours,
        setCalmDownHours,
        isCalmDownActive,
        calmDownUntil,
        triggerCalmDown,
        endCalmDown,
        withdrawnToday,
        claimWelcomeReward,
        withdrawCredits,
        activeCardId,
        setActiveCardId,
        distractingApps,
        setDistractingApps,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
