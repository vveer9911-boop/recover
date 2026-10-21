import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { FocusSession } from '../data/focusSessionModel';
import { Transaction } from '../screens/TransactionsScreen';

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string;
  userHandle: string;
  userBio: string;
  userAvatarIndex: number;
  streak: number;
  credits: number;
  isPlus: boolean;
  activeCardId: string;
  distractingApps: string[];
  focusSessions?: FocusSession[];
  transactions?: Transaction[];
  createdAt: number;
  lastLoginAt: number;
}

export const FirebaseAuthService = {
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  onUserChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  async loginWithEmail(email: string, pass: string): Promise<User> {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    await this.touchUserProfile(cred.user);
    return cred.user;
  },

  async signUpWithEmail(email: string, pass: string): Promise<User> {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    await this.createUserProfile(cred.user);
    return cred.user;
  },

  async loginWithGoogle(): Promise<User> {
    try {
      const cred = await signInAnonymously(auth);
      await this.touchUserProfile(cred.user, 'Google Student');
      return cred.user;
    } catch (e) {
      console.warn('Google/Guest sign in fallback:', e);
      throw e;
    }
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  async createUserProfile(user: User, defaultName?: string): Promise<UserProfileData> {
    const userRef = doc(db, 'users', user.uid);
    const initialName = user.displayName || defaultName || 'Focus Champ';
    const data: UserProfileData = {
      uid: user.uid,
      email: user.email,
      displayName: initialName,
      userHandle: initialName.toLowerCase().replace(/\s+/g, '_'),
      userBio: 'Locking in with Recover. Daily focus builder.',
      userAvatarIndex: 0,
      streak: 5,
      credits: 15,
      isPlus: false,
      activeCardId: 'classic-titanium',
      distractingApps: ['YouTube', 'Instagram', 'TikTok'],
      focusSessions: [],
      transactions: [
        {
          id: `tx-welcome-${Date.now()}`,
          title: 'Welcome Reward',
          subtitle: 'Sign-up focus bonus',
          amount: 15,
          type: 'credit',
          date: 'TODAY',
          time: 'Just now',
        },
      ],
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    };
    try {
      await setDoc(userRef, data, { merge: true });
    } catch (err) {
      console.warn('[Firestore] Could not write user doc:', err);
    }
    return data;
  },

  async fetchUserProfile(uid: string): Promise<UserProfileData | null> {
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as UserProfileData;
      }
      return null;
    } catch (err) {
      console.warn('[Firestore] Failed to fetch user profile:', err);
      return null;
    }
  },

  async touchUserProfile(user: User, defaultName?: string): Promise<UserProfileData | null> {
    const userRef = doc(db, 'users', user.uid);
    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        await updateDoc(userRef, { lastLoginAt: Date.now() });
        return snap.data() as UserProfileData;
      }
      return await this.createUserProfile(user, defaultName);
    } catch (err) {
      console.warn('[Firestore] Touch user profile failed:', err);
      return null;
    }
  },

  async syncFullUserProfile(
    uid: string,
    data: Partial<Omit<UserProfileData, 'uid' | 'createdAt'>>
  ) {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(
        userRef,
        {
          ...data,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('[Firestore] Full profile sync failed:', e);
    }
  },

  async saveCloudFocusSession(uid: string, session: FocusSession) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        focusSessions: arrayUnion(session),
        updatedAt: Date.now(),
      });
    } catch (e) {
      console.warn('[Firestore] Save session failed:', e);
    }
  },
};
