// src/store/transactionStore.ts
import { create } from 'zustand';
import type { Transaction } from '@/types';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

interface TransactionState {
  transactions:      Transaction[];
  lastDoc:           QueryDocumentSnapshot<DocumentData> | null;
  hasMore:           boolean;
  isLoading:         boolean;
  error:             string | null;
  setTransactions:   (txs: Transaction[]) => void;
  appendTransactions:(txs: Transaction[]) => void;
  setLastDoc:        (doc: QueryDocumentSnapshot<DocumentData> | null) => void;
  setHasMore:        (v: boolean) => void;
  setLoading:        (v: boolean) => void;
  setError:          (e: string | null) => void;
  reset:             () => void;
}

export const useTransactionStore = create<TransactionState>()((set) => ({
  transactions: [],
  lastDoc:      null,
  hasMore:      false,
  isLoading:    false,
  error:        null,

  setTransactions:    (transactions) => set({ transactions }),
  appendTransactions: (txs)          =>
    set((state) => ({ transactions: [...state.transactions, ...txs] })),
  setLastDoc:  (lastDoc)   => set({ lastDoc }),
  setHasMore:  (hasMore)   => set({ hasMore }),
  setLoading:  (isLoading) => set({ isLoading }),
  setError:    (error)     => set({ error }),
  reset:       ()          => set({ transactions: [], lastDoc: null, hasMore: false }),
}));
