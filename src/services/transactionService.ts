import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  addDoc,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData,
  runTransaction,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type {
  Transaction,
  TransferPayload,
  PaginatedTransactions,
  ServiceResult,
} from '@/types';

// ─── Fetch Paginated Transactions ─────────────────────────────────────────────
export async function fetchTransactions(
  uid:     string,
  lastDoc: QueryDocumentSnapshot<DocumentData> | unknown | null,
  pageSize = 10
): Promise<ServiceResult<PaginatedTransactions>> {
  try {
    const ref = collection(db, 'transactions');

    let q = query(
      ref,
      where('participants', 'array-contains', uid),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(
        ref,
        where('participants', 'array-contains', uid),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      );
    }

    const snap = await getDocs(q);
    const transactions: Transaction[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id:               d.id,
        senderId:         data.senderId,
        receiverId:       data.receiverId,
        senderUsername:   data.senderUsername,
        receiverUsername: data.receiverUsername,
        amount:           data.amount,
        currency:         data.currency ?? 'NGN',
        type:             data.type,
        status:           data.status,
        note:             data.note ?? null,
        createdAt:        data.createdAt?.toDate?.() ?? new Date(),
      };
    });

    const newLastDoc = snap.docs[snap.docs.length - 1] ?? null;

    return {
      success: true,
      data: {
        transactions,
        lastDoc:  newLastDoc,
        hasMore:  snap.docs.length === pageSize,
      },
    };
  } catch (e: any) {
    return { success: false, error: e.message ?? 'Failed to fetch transactions.' };
  }
}

// ─── Send Money ───────────────────────────────────────────────────────────────
export async function sendMoney(
  senderUid: string,
  payload:   TransferPayload
): Promise<ServiceResult> {
  try {
    // Find receiver by email
    const usersSnap = await getDocs(
      query(
        collection(db, 'users'),
        where('email', '==', payload.recipientEmail.trim())
      )
    );

    if (usersSnap.empty) {
      return { success: false, error: 'Recipient not found.' };
    }

    const receiverDoc  = usersSnap.docs[0];
    const receiverData = receiverDoc.data();
    const receiverUid  = receiverDoc.id;

    if (receiverUid === senderUid) {
      return { success: false, error: 'You cannot send money to yourself.' };
    }

    const senderRef   = doc(db, 'wallets', `wallet_${senderUid}`);
    const receiverRef = doc(db, 'wallets', receiverData.walletId);

    await runTransaction(db, async (tx) => {
      const senderSnap   = await tx.get(senderRef);
      const receiverSnap = await tx.get(receiverRef);

      if (!senderSnap.exists())   throw new Error('Your wallet was not found.');
      if (!receiverSnap.exists()) throw new Error('Recipient wallet not found.');

      const senderBalance   = senderSnap.data().balance ?? 0;
      const receiverBalance = receiverSnap.data().balance ?? 0;

      if (senderBalance < payload.amount) {
        throw new Error('Insufficient balance.');
      }

      // Update balances
      tx.update(senderRef,   { balance: senderBalance - payload.amount,   updatedAt: serverTimestamp() });
      tx.update(receiverRef, { balance: receiverBalance + payload.amount,  updatedAt: serverTimestamp() });

      // Get sender info
      const senderUserSnap = await tx.get(doc(db, 'users', senderUid));
      const senderData     = senderUserSnap.data();

      // Write transaction record
      const txData = {
        senderId:         senderUid,
        receiverId:       receiverUid,
        senderUsername:   senderData?.username   ?? '',
        receiverUsername: receiverData.username  ?? '',
        amount:           payload.amount,
        currency:         payload.currency ?? 'NGN',
        type:             'debit',
        status:           'completed',
        note:             payload.note ?? null,
        participants:     [senderUid, receiverUid],
        createdAt:        serverTimestamp(),
      };

      const txRef = doc(collection(db, 'transactions'));
      tx.set(txRef, txData);
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message ?? 'Transfer failed.' };
  }
}