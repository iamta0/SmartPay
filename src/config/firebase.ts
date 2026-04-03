import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth }                         from 'firebase/auth';
import { getFirestore }                    from 'firebase/firestore';
import { getStorage }                      from 'firebase/storage';
import Constants                           from 'expo-constants';

const {
  EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID,
} = Constants.expoConfig?.extra ?? {};

const firebaseConfig = {
  apiKey:            EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:        EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);