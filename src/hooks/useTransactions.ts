// src/hooks/useTransactions.ts
import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTransactionStore } from '@/store/transactionStore';
import { fetchTransactions } from '@/services/transactionService';

export function useTransactions() {
  const { user } = useAuthStore();
  const {
    transactions, lastDoc, hasMore, isLoading, error,
    setTransactions, appendTransactions,
    setLastDoc, setHasMore, setLoading, setError,
  } = useTransactionStore();

  const loadInitial = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const result = await fetchTransactions(user.uid, null);
    if (result.success && result.data) {
      setTransactions(result.data.transactions);
      setLastDoc(result.data.lastDoc);
      setHasMore(result.data.hasMore);
    } else {
      setError(result.error ?? 'Failed to load transactions.');
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const loadMore = useCallback(async () => {
    if (!user || !hasMore || isLoading || !lastDoc) return;
    setLoading(true);
    const result = await fetchTransactions(user.uid, lastDoc);
    if (result.success && result.data) {
      appendTransactions(result.data.transactions);
      setLastDoc(result.data.lastDoc);
      setHasMore(result.data.hasMore);
    } else {
      setError(result.error ?? 'Failed to load more.');
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, hasMore, isLoading, lastDoc]);

  return { transactions, hasMore, isLoading, error, loadInitial, loadMore };
}
