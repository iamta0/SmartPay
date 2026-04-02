// ─────────────────────────────────────────────────────────────────────────────
// src/services/transactionService.ts
// Paginated transaction fetching. Supports infinite-scroll via cursor.
// ─────────────────────────────────────────────────────────────────────────────

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Transaction, ServiceResult } from '@/types';

const COL_TRANSACTIONS = 'transactions';
const PAGE_SIZE = 20;

export interface PaginatedTransactions {
  transactions:  Transaction[];
  lastDoc:       QueryDocumentSnapshot<DocumentData> | null;
  hasMore:       boolean;
}

export async function fetchTransactions(
  userId: string,
  lastDoc: QueryDocumentSnapshot<DocumentData> | null = null,
): Promise<ServiceResult<PaginatedTransactions>> {
  try {
    // Fetch transactions where user is sender OR receiver
    // (two queries merged, since Firestore doesn't support OR on different fields natively)
    const sentQuery = buildQuery(userId, 'senderId', lastDoc);
    const recvQuery = buildQuery(userId, 'receiverId', lastDoc);

    const [sentSnap, recvSnap] = await Promise.all([
      getDocs(sentQuery),
      getDocs(recvQuery),
    ]);

    const allDocs = [...sentSnap.docs, ...recvSnap.docs];

    // De-duplicate by id (a user's own record appears once per transaction)
    const seen = new Set<string>();
    const uniqueDocs = allDocs.filter((d) => {
      if (seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    });

    // Sort merged results by date desc
    uniqueDocs.sort((a, b) => {
      const aTime = a.data().createdAt?.toMillis?.() ?? 0;
      const bTime = b.data().createdAt?.toMillis?.() ?? 0;
      return bTime - aTime;
    });

    const hasMore = uniqueDocs.length > PAGE_SIZE;
    const pageDocs = hasMore ? uniqueDocs.slice(0, PAGE_SIZE) : uniqueDocs;

    const transactions: Transaction[] = pageDocs.map((d) => {
      const data = d.data();
      return {
        id:               d.id,
        senderId:         data.senderId,
        receiverId:       data.receiverId,
        senderUsername:   data.senderUsername,
        receiverUsername: data.receiverUsername,
        amount:           data.amount,
        currency:         data.currency,
        type:             data.type,
        status:           data.status,
        note:             data.note ?? undefined,
        createdAt:        data.createdAt?.toDate() ?? new Date(),
      };
    });

    return {
      success: true,
      data: {
        transactions,
        lastDoc: pageDocs[pageDocs.length - 1] ?? null,
        hasMore,
      },
    };
  } catch (err) {
    console.error('fetchTransactions error:', err);
    return { success: false, error: 'Failed to load transactions. Please try again.' };
  }
}

function buildQuery(
  userId: string,
  field: 'senderId' | 'receiverId',
  lastDoc: QueryDocumentSnapshot<DocumentData> | null,
) {
  const base = [
    collection(db, COL_TRANSACTIONS),
    where(field, '==', userId),
    orderBy('createdAt', 'desc'),
    limit(PAGE_SIZE + 1),
  ] as const;

  if (lastDoc) {
    return query(...base, startAfter(lastDoc));
  }
  return query(...base);
}
