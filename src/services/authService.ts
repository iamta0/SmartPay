import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  FirebaseAuthTypes,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import type { User, SignupInput, ServiceResult } from '@/types';

// ─── Auth State Listener ──────────────────────────────────────────────────────
export function onAuthChanged(
  callback: (user: any | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

// ─── Fetch User from Firestore ────────────────────────────────────────────────
export async function fetchUser(uid: string): Promise<User | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      uid:         snap.id,
      email:       data.email,
      displayName: data.displayName,
      username:    data.username,
      walletId:    data.walletId,
      createdAt:   data.createdAt?.toDate?.() ?? new Date(),
    };
  } catch {
    return null;
  }
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────
export async function signUp(input: SignupInput): Promise<ServiceResult<User>> {
  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      input.email.trim(),
      input.password
    );

    const uid      = credential.user.uid;
    const walletId = `wallet_${uid}`;

    const newUser: Omit<User, 'uid'> & { createdAt: any } = {
      email:       input.email.trim(),
      displayName: input.displayName,
      username:    input.username.toLowerCase(),
      walletId,
      createdAt:   serverTimestamp(),
    };

    // Create user document
    await setDoc(doc(db, 'users', uid), newUser);

    // Create wallet document
    await setDoc(doc(db, 'wallets', walletId), {
      id:        walletId,
      ownerId:   uid,
      balance:   0,
      currency:  'NGN',
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      data: {
        uid,
        ...newUser,
        createdAt: new Date(),
      },
    };
  } catch (e: any) {
    return {
      success: false,
      error:   mapFirebaseError(e.code),
    };
  }
}

// ─── Sign In ──────────────────────────────────────────────────────────────────
export async function signIn(
  email: string,
  password: string
): Promise<ServiceResult<User>> {
  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );
    const user = await fetchUser(credential.user.uid);
    if (!user) return { success: false, error: 'User profile not found.' };
    return { success: true, data: user };
  } catch (e: any) {
    return {
      success: false,
      error:   mapFirebaseError(e.code),
    };
  }
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export async function signOut(): Promise<ServiceResult> {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── Error Mapper ─────────────────────────────────────────────────────────────
function mapFirebaseError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.';
    default:
      return 'Something went wrong. Please try again.';
  }
}