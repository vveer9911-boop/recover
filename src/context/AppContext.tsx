import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../screens/TransactionsScreen';
import { FocusSession } from '../data/focusSessionModel';
import { RecoverBlocker } from '../services/recoverBlocker';
import { auth } from '../config/firebase';
import { FirebaseAuthService } from '../services/firebaseAuthService';

const ACTIVE_CARD_STORAGE_KEY = '@recover_active_card_id';
const IS_PLUS_STORAGE_KEY = '@recover_is_plus';
const DISTRACTING_APPS_STORAGE_KEY = '@recover_distracting_apps';
const FOCUS_SESSIONS_STORAGE_KEY = '@recover_focus_sessions';

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
  emergencyAdsWatched: number;
  watchEmergencyAd: () => { success: boolean; message?: string };
  deleteAccount: () => Promise<void>;
  focusSessions: FocusSession[];
  saveFocusSession: (session: FocusSession) => Promise<void>;
  seedFocusSessions: (sessions: FocusSession[]) => Promise<void>;
  clearFocusSessions: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState('');
  const [userBio, setUserBio] = useState('Locking in with Recover. Daily focus builder.');
  const [userHandle, setUserHandle] = useState('focus_champ');
  const [userAvatarIndex, setUserAvatarIndex] = useState(0);
  const [streak, setStreak] = useState(5);
  const [credits, setCredits] = useState(15);
  const [claimedReward, setClaimedReward] = useState(true);
  const [isPlus, setIsPlus] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx-welcome-reward-init',
      title: 'Welcome Reward',
      subtitle: 'Sign-up focus bonus',
      amount: 15,
      type: 'credit',
      date: 'TODAY',
      time: 'Just now',
    },
  ]);
  const [withdrawnToday, setWithdrawnToday] = useState(0);
  const [calmDownHours, setCalmDownHours] = useState<number>(1); // default 1 hour calm down
  const [calmDownUntil, setCalmDownUntil] = useState<number | null>(null);
  const [activeCardId, setActiveCardIdState] = useState<string>('classic-titanium');
  const [distractingApps, setDistractingAppsState] = useState<string[]>(['YouTube', 'Instagram', 'TikTok']);
  const [emergencyAdsWatched, setEmergencyAdsWatched] = useState<number>(0);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);

  // Load persisted focus sessions on mount
  useEffect(() => {
    AsyncStorage.getItem(FOCUS_SESSIONS_STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              setFocusSessions(parsed);
            }
          } catch (e) {
            console.warn('Failed to parse focus sessions:', e);
          }
        }
      })
      .catch(() => {});
  }, []);

  const saveFocusSession = async (session: FocusSession) => {
    setFocusSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== session.id);
      const updated = [session, ...filtered];
      AsyncStorage.setItem(FOCUS_SESSIONS_STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });

    if (session.status === 'completed' && session.focusedDurationMinutes > 0) {
      setCredits((prev) => prev + session.focusedDurationMinutes);
      const tx: Transaction = {
        id: `tx-focus-${session.id}`,
        title: 'Focus Session Completed',
        subtitle: `${session.focusedDurationMinutes} min dedicated screen focus`,
        amount: session.focusedDurationMinutes,
        type: 'credit',
        date: 'TODAY',
        time: 'Just now',
      };
      setTransactions((prev) => [tx, ...prev]);
    }

    if (auth.currentUser) {
      FirebaseAuthService.saveCloudFocusSession(auth.currentUser.uid, session).catch((err) => {
        console.warn('Failed to sync cloud session:', err);
      });
    }
  };

  const seedFocusSessions = async (sessions: FocusSession[]) => {
    setFocusSessions(sessions);
    try {
      await AsyncStorage.setItem(FOCUS_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to seed focus sessions:', e);
    }
  };

  const clearFocusSessions = async () => {
    setFocusSessions([]);
    try {
      await AsyncStorage.removeItem(FOCUS_SESSIONS_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear focus sessions:', e);
    }
  };

  // Synchronize with Firebase Auth and Firestore user profile
  useEffect(() => {
    const unsub = FirebaseAuthService.onUserChange((user) => {
      if (user) {
        AsyncStorage.setItem('@recover_user_authenticated', 'true').catch(() => {});
        FirebaseAuthService.touchUserProfile(user)
          .then((profile) => {
            if (profile) {
              if (profile.displayName) setUserName(profile.displayName);
              if (profile.userHandle) setUserHandle(profile.userHandle);
              if (profile.userBio) setUserBio(profile.userBio);
              if (typeof profile.userAvatarIndex === 'number') setUserAvatarIndex(profile.userAvatarIndex);
              if (typeof profile.streak === 'number') setStreak(profile.streak);
              if (typeof profile.credits === 'number') setCredits(profile.credits);
              if (typeof profile.isPlus === 'boolean') setIsPlus(profile.isPlus);
              if (profile.activeCardId) setActiveCardIdState(profile.activeCardId);
              if (Array.isArray(profile.distractingApps) && profile.distractingApps.length > 0) {
                setDistractingAppsState(profile.distractingApps);
              }
              if (Array.isArray(profile.focusSessions) && profile.focusSessions.length > 0) {
                setFocusSessions(profile.focusSessions);
              }
              if (Array.isArray(profile.transactions) && profile.transactions.length > 0) {
                setTransactions(profile.transactions);
              }
            }
          })
          .catch((err) => {
            console.warn('[Firestore] Profile sync warning:', err);
          });
      }
    });
    return () => unsub();
  }, []);

  // Sync state changes to Firestore when logged in
  useEffect(() => {
    if (auth.currentUser) {
      FirebaseAuthService.syncFullUserProfile(auth.currentUser.uid, {
        displayName: userName,
        userHandle,
        userBio,
        userAvatarIndex,
        streak,
        credits,
        isPlus,
        activeCardId,
        distractingApps,
      }).catch((err) => {
        console.warn('[Firestore] Profile change sync warning:', err);
      });
    }
  }, [credits, isPlus, activeCardId, distractingApps, userName, userHandle, userBio, userAvatarIndex, streak]);

  const setDistractingApps = (apps: string[]) => {
    const finalApps = !isPlus && apps.length > 3 ? apps.slice(0, 3) : apps;
    setDistractingAppsState(finalApps);
    AsyncStorage.setItem(DISTRACTING_APPS_STORAGE_KEY, JSON.stringify(finalApps)).catch(() => {});
    RecoverBlocker.updateBlockedApps(finalApps);
  };

  const setIsPlusPersistent = (val: boolean) => {
    setIsPlus(val);
    AsyncStorage.setItem(IS_PLUS_STORAGE_KEY, val ? 'true' : 'false').catch(() => {});
    if (!val) {
      setActiveCardIdState('classic-titanium');
      AsyncStorage.setItem(ACTIVE_CARD_STORAGE_KEY, 'classic-titanium').catch(() => {});
      // When downgrading/cancelling Pro, clamp selected apps to max 3 for free users
      setDistractingAppsState((prev) => {
        if (prev.length > 3) {
          const clamped = prev.slice(0, 3);
          AsyncStorage.setItem(DISTRACTING_APPS_STORAGE_KEY, JSON.stringify(clamped)).catch(() => {});
          return clamped;
        }
        return prev;
      });
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

  const [isCalmDownActive, setIsCalmDownActive] = useState<boolean>(false);

  useEffect(() => {
    if (!calmDownUntil) return;
    const timer = setInterval(() => {
      setIsCalmDownActive(Date.now() < calmDownUntil);
    }, 1000);
    return () => clearInterval(timer);
  }, [calmDownUntil]);

  const triggerCalmDown = (hours?: number) => {
    const durationHours = hours || calmDownHours || 1;
    const until = Date.now() + durationHours * 60 * 60 * 1000;
    setCalmDownUntil(until);
    setIsCalmDownActive(true);
  };

  const endCalmDown = () => {
    setCalmDownUntil(null);
    setIsCalmDownActive(false);
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

    return {
      success: true,
      message: `Unlocked ${amount} minutes of app usage! ${amount} credits deducted.`,
      calmDownTriggered: false,
      calmDownHours,
    };
  };

  const watchEmergencyAd = () => {
    return {
      success: false,
      message: 'Rewarded ads are not configured yet (AdMob SDK pending developer setup).',
    };
  };

  const deleteAccount = async () => {
    try {
      await AsyncStorage.clear();
      await FirebaseAuthService.logout();
    } catch (e) {
      console.warn('Failed to clear AsyncStorage on deleteAccount:', e);
    }
    setUserName('');
    setUserBio('Locking in with Recover. Daily focus builder.');
    setUserHandle('focus_champ');
    setUserAvatarIndex(0);
    setStreak(0);
    setCredits(0);
    setClaimedReward(false);
    setIsPlus(false);
    setTransactions([]);
    setWithdrawnToday(0);
    setCalmDownHours(1);
    setCalmDownUntil(null);
    setActiveCardIdState('classic-titanium');
    setDistractingAppsState(['YouTube', 'Instagram', 'TikTok']);
    setEmergencyAdsWatched(0);
    setFocusSessions([]);
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
        emergencyAdsWatched,
        watchEmergencyAd,
        deleteAccount,
        focusSessions,
        saveFocusSession,
        seedFocusSessions,
        clearFocusSessions,
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
