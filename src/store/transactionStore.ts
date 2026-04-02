import { create } from 'zustand';
import type { Transaction } from '@/types';

interface TransactionStore {
  transactions:       Transaction[];
  lastDoc:            unknown | null;
  hasMore:            boolean;
  isLoading:          boolean;
  error:              string | null;
  setTransactions:    (txs: Transaction[]) => void;
  appendTransactions: (txs: Transaction[]) => void;
  setLastDoc:         (doc: unknown | null) => void;
  setHasMore:         (v: boolean) => void;
  setLoading:         (v: boolean) => void;
  setError:           (v: string | null) => void;
  reset:              () => void;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions:       [],
  lastDoc:            null,
  hasMore:            true,
  isLoading:          false,
  error:              null,
  setTransactions:    (transactions) => set({ transactions }),
  appendTransactions: (txs) =>
    set((state) => ({ transactions: [...state.transactions, ...txs] })),
  setLastDoc:         (lastDoc)   => set({ lastDoc }),
  setHasMore:         (hasMore)   => set({ hasMore }),
  setLoading:         (isLoading) => set({ isLoading }),
  setError:           (error)     => set({ error }),
  reset:              ()          => set({
    transactions: [],
    lastDoc:      null,
    hasMore:      true,
    isLoading:    false,
    error:        null,
  }),
}));