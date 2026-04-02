// src/hooks/useAuth.ts
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { useTransactionStore } from '@/store/transactionStore';
import { onAuthChanged, fetchUser } from '@/services/authService';
import { fetchWallet } from '@/services/walletService';

/**
 * Boots the Firebase auth listener exactly once (call from RootNavigator).
 * On sign-in  → hydrates user + wallet stores.
 * On sign-out → resets all stores.
 */
export function useAuth(): void {
  const { setUser, setLoading, reset: resetAuth } = useAuthStore();
  const { setWallet, reset: resetWallet } = useWalletStore();
  const { reset: resetTx } = useTransactionStore();

  useEffect(() => {
    const unsubscribe = onAuthChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const appUser = await fetchUser(firebaseUser.uid);
        if (appUser) {
          setUser(appUser);
          const walletResult = await fetchWallet(appUser.walletId);
          if (walletResult.success && walletResult.data) {
            setWallet(walletResult.data);
          }
        }
      } else {
        resetAuth();
        resetWallet();
        resetTx();
      }
      setLoading(false);
    });

    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
