import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  projectId: 'recover-focus-study',
  appId: '1:597533774618:web:95d4debdc4bc38777a92a3',
  storageBucket: 'recover-focus-study.firebasestorage.app',
  apiKey: 'AIzaSyCGh0n7DbBSPoSLWmw1fqWtu37X9y21Ec0',
  authDomain: 'recover-focus-study.firebaseapp.com',
  messagingSenderId: '597533774618',
  projectNumber: '597533774618',
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
