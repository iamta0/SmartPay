// ─────────────────────────────────────────────────────────────────────────────
// src/services/walletService.ts
// All money movement goes through transferFunds — fully atomic via Firestore
// runTransaction so partial states are impossible.
// ─────────────────────────────────────────────────────────────────────────────

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { fetchUser } from './authService';
import type { Wallet, Transaction, TransferPayload, ServiceResult } from '@/types';

const COL_WALLETS      = 'wallets';
const COL_TRANSACTIONS = 'transactions';
const COL_USERS        = 'users';

// ─── Fetch a wallet by its ID ─────────────────────────────────────────────────

export async function fetchWallet(walletId: string): Promise<ServiceResult<Wallet>> {
  try {
    const snap = await getDoc(doc(db, COL_WALLETS, walletId));
    if (!snap.exists()) return { success: false, error: 'Wallet not found.' };
    const d = snap.data();
    return {
      success: true,
      data: {
        id:        d.id,
        ownerId:   d.ownerId,
        balance:   d.balance as number,
        currency:  d.currency,
        updatedAt: d.updatedAt?.toDate() ?? new Date(),
      },
    };
  } catch {
    return { success: false, error: 'Failed to load wallet. Please try again.' };
  }
}

// ─── Transfer funds (atomic) ──────────────────────────────────────────────────
// Steps:
//   1. Resolve recipient by email
//   2. Guard: no self-transfer
//   3. Open Firestore runTransaction
//      a. Re-read both wallets inside the transaction (prevents race conditions)
//      b. Re-verify sender has sufficient balance
//      c. Debit sender wallet
//      d. Credit receiver wallet
//      e. Write debit tx record (sender's view)
//      f. Write credit tx record (receiver's view)
//   4. Return the debit transaction record

export async function transferFunds(
  senderId: string,
  senderWalletId: string,
  payload: TransferPayload,
): Promise<ServiceResult<Transaction>> {
  try {
    // 1. Resolve recipient
    const recipientQuery = query(
      collection(db, COL_USERS),
      where('email', '==', payload.recipientEmail),
    );
    const recipientSnap = await getDocs(recipientQuery);
    if (recipientSnap.empty) {
      return { success: false, error: 'Recipient not found. Double-check the email address.' };
    }

    const recipientData = recipientSnap.docs[0].data();

    // 2. Guard: no self-transfer
    if (recipientData.uid === senderId) {
      return { success: false, error: 'You cannot send money to yourself.' };
    }

    // Fetch sender profile for display name on record
    const sender = await fetchUser(senderId);
    if (!sender) return { success: false, error: 'Your account profile could not be found.' };

    const senderWalletRef   = doc(db, COL_WALLETS, senderWalletId);
    const receiverWalletRef = doc(db, COL_WALLETS, recipientData.walletId as string);
    const senderTxRef       = doc(collection(db, COL_TRANSACTIONS));
    const receiverTxRef     = doc(collection(db, COL_TRANSACTIONS));

    const now = new Date();
    let resultTx: Transaction | null = null;

    // 3. Atomic transaction
    await runTransaction(db, async (tx) => {
      const senderWalletSnap   = await tx.get(senderWalletRef);
      const receiverWalletSnap = await tx.get(receiverWalletRef);

      if (!senderWalletSnap.exists())   throw new Error('Your wallet could not be found.');
      if (!receiverWalletSnap.exists()) throw new Error("Recipient's wallet could not be found.");

      const senderBalance: number   = senderWalletSnap.data().balance;
      const receiverBalance: number = receiverWalletSnap.data().balance;

      // Re-verify balance inside transaction (prevents double-spend race)
      if (senderBalance < payload.amount) {
        throw new Error('Insufficient balance. Top up your wallet and try again.');
      }

      // Build base tx record
      const baseTx = {
        senderId:         senderId,
        receiverId:       recipientData.uid,
        senderUsername:   sender.username,
        receiverUsername: recipientData.username as string,
        amount:           payload.amount,
        currency:         payload.currency,
        status:           'completed' as const,
        note:             payload.note ?? null,
        createdAt:        serverTimestamp(),
      };

      // a. Debit sender
      tx.update(senderWalletRef, {
        balance:   senderBalance - payload.amount,
        updatedAt: serverTimestamp(),
      });

      // b. Credit receiver
      tx.update(receiverWalletRef, {
        balance:   receiverBalance + payload.amount,
        updatedAt: serverTimestamp(),
      });

      // c. Sender tx record (type: debit)
      tx.set(senderTxRef, { ...baseTx, id: senderTxRef.id, type: 'debit' });

      // d. Receiver tx record (type: credit)
      tx.set(receiverTxRef, { ...baseTx, id: receiverTxRef.id, type: 'credit' });

      resultTx = {
        id:               senderTxRef.id,
        senderId,
        receiverId:       recipientData.uid as string,
        senderUsername:   sender.username,
        receiverUsername: recipientData.username as string,
        amount:           payload.amount,
        currency:         payload.currency,
        type:             'debit',
        status:           'completed',
        note:             payload.note,
        createdAt:        now,
      };
    });

    if (!resultTx) throw new Error('Transaction completed but record is missing.');
    return { success: true, data: resultTx };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Transfer failed. Please try again.';
    return { success: false, error: msg };
  }
}
