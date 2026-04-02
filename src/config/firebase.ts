import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import {
  initializeAuth,
  getReactNativePersistence,
  Auth,
  getAuth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCn_Z6CNG_BipwscluSWmVqj94xV-TjXJ0",
  authDomain: "smartpay-2005.firebaseapp.com",
  projectId: "smartpay-2005",
  storageBucket: "smartpay-2005.firebasestorage.app",
  messagingSenderId: "674757887023",
  appId: "1:674757887023:web:1c3e1c3b49a6cee78532da",
  measurementId: "G-VCQEH2BG72"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error: any) {
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    throw error;
  }
}

db = getFirestore(app);

export { app, auth, db };