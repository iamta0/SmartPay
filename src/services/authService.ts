// ─────────────────────────────────────────────────────────────────────────────
// src/services/authService.ts
// ─────────────────────────────────────────────────────────────────────────────

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import type { User, Wallet, ServiceResult } from '@/types';

// ─── Collection names ─────────────────────────────────────────────────────────

const COL_USERS     = 'users';
const COL_WALLETS   = 'wallets';
const COL_USERNAMES = 'usernames';

// ─── Sign Up ──────────────────────────────────────────────────────────────────

export async function signUp(
  email: string,
  password: string,
  displayName: string,
  username: string,
): Promise<ServiceResult<User>> {
  try {
    // 1. Check username availability first
    const usernameSnap = await getDoc(doc(db, COL_USERNAMES, username.toLowerCase()));
    if (usernameSnap.exists()) {
      return { success: false, error: 'Username is already taken. Choose another.' };
    }

    // 2. Create Firebase Auth user
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName });

    const walletId = `wallet_${credential.user.uid}`;

    // 3. Atomic write: user profile + wallet + username reservation
    await runTransaction(db, async (tx) => {
      const userRef     = doc(db, COL_USERS,     credential.user.uid);
      const walletRef   = doc(db, COL_WALLETS,   walletId);
      const usernameRef = doc(db, COL_USERNAMES, username.toLowerCase());

      tx.set(userRef, {
        uid: credential.user.uid,
        email,
        displayName,
        username: username.toLowerCase(),
        walletId,
        createdAt: serverTimestamp(),
      });

      tx.set(walletRef, {
        id:        walletId,
        ownerId:   credential.user.uid,
        balance:   0,
        currency:  'NGN',
        updatedAt: serverTimestamp(),
      } satisfies Omit<Wallet, 'updatedAt'> & { updatedAt: ReturnType<typeof serverTimestamp> });

      tx.set(usernameRef, { uid: credential.user.uid });
    });

    const user = await fetchUser(credential.user.uid);
    if (!user) throw new Error('Failed to fetch new user profile.');

    return { success: true, data: user };
  } catch (err) {
    return { success: false, error: parseFirebaseError(err) };
  }
}

// ─── Sign In ──────────────────────────────────────────────────────────────────

export async function signIn(
  email: string,
  password: string,
): Promise<ServiceResult<User>> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const user = await fetchUser(credential.user.uid);
    if (!user) throw new Error('User profile not found in database.');
    return { success: true, data: user };
  } catch (err) {
    return { success: false, error: parseFirebaseError(err) };
  }
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function logOut(): Promise<ServiceResult<void>> {
  try {
    await signOut(auth);
    return { success: true };
  } catch (err) {
    return { success: false, error: parseFirebaseError(err) };
  }
}

// ─── Auth state listener ──────────────────────────────────────────────────────

export function onAuthChanged(
  callback: (firebaseUser: FirebaseUser | null) => void,
): () => void {
  return onAuthStateChanged(auth, callback);
}

// ─── Fetch user profile from Firestore ───────────────────────────────────────

export async function fetchUser(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, COL_USERS, uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    uid:         d.uid,
    email:       d.email,
    displayName: d.displayName,
    username:    d.username,
    walletId:    d.walletId,
    createdAt:   d.createdAt?.toDate() ?? new Date(),
  };
}

// ─── Firebase error → human-readable message ─────────────────────────────────

function parseFirebaseError(err: unknown): string {
  if (!(err instanceof Error)) return 'An unexpected error occurred.';
  const msg = err.message;
  if (msg.includes('email-already-in-use'))    return 'An account with this email already exists.';
  if (msg.includes('user-not-found'))           return 'No account found with this email.';
  if (msg.includes('wrong-password'))           return 'Incorrect password. Try again.';
  if (msg.includes('invalid-credential'))       return 'Invalid email or password.';
  if (msg.includes('weak-password'))            return 'Password must be at least 6 characters.';
  if (msg.includes('invalid-email'))            return 'Please enter a valid email address.';
  if (msg.includes('network-request-failed'))   return 'No internet connection. Check your network.';
  if (msg.includes('too-many-requests'))        return 'Too many attempts. Please try again later.';
  return msg;
}
