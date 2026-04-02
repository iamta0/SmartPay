import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Wallet, ServiceResult } from '@/types';

// ─── Fetch Wallet ─────────────────────────────────────────────────────────────
export async function fetchWallet(walletId: string): Promise<ServiceResult<Wallet>> {
  try {
    const snap = await getDoc(doc(db, 'wallets', walletId));
    if (!snap.exists()) {
      return { success: false, error: 'Wallet not found.' };
    }
    const data = snap.data();
    return {
      success: true,
      data: {
        id:        snap.id,
        ownerId:   data.ownerId,
        balance:   data.balance ?? 0,
        currency:  data.currency ?? 'NGN',
        updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
      },
    };
  } catch (e: any) {
    return { success: false, error: e.message ?? 'Failed to fetch wallet.' };
  }
}

// ─── Update Wallet Balance ────────────────────────────────────────────────────
export async function updateWalletBalance(
  walletId: string,
  newBalance: number
): Promise<ServiceResult> {
  try {
    await updateDoc(doc(db, 'wallets', walletId), {
      balance:   newBalance,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message ?? 'Failed to update balance.' };
  }
}