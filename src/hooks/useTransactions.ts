import { useState, useCallback } from 'react';
import { useAuthStore }       from '@/store/authStore';
import { useTransactionStore } from '@/store/transactionStore';
import { fetchTransactions }  from '@/services/transactionService';

export function useTransactions() {
  const { user }                              = useAuthStore();
  const { transactions, setTransactions, appendTransactions, setLastDoc, lastDoc, setHasMore, hasMore } =
    useTransactionStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const loadInitial = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchTransactions(user.uid, null, 10);
      if (result.success && result.data) {
        setTransactions(result.data.transactions);
        setLastDoc(result.data.lastDoc);
        setHasMore(result.data.hasMore);
      } else {
        setError(result.error ?? 'Failed to load transactions');
      }
    } catch (e: any) {
      setError(e.message ?? 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const loadMore = useCallback(async () => {
    if (!user || !hasMore || isLoading) return;
    setIsLoading(true);
    try {
      const result = await fetchTransactions(user.uid, lastDoc, 10);
      if (result.success && result.data) {
        appendTransactions(result.data.transactions);
        setLastDoc(result.data.lastDoc);
        setHasMore(result.data.hasMore);
      }
    } catch (e: any) {
      setError(e.message ?? 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [user, hasMore, isLoading, lastDoc]);

  return { transactions, isLoading, error, loadInitial, loadMore };
}