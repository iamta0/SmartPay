// src/hooks/useTransfer.ts
import { useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { transferFunds, fetchWallet } from '@/services/walletService';
import { transferSchema } from '@/utils/validators';
import type { TransferPayload, Transaction } from '@/types';

interface TransferState {
  isLoading:       boolean;
  error:           string | null;
  success:         boolean;
  lastTransaction: Transaction | null;
}

const INITIAL: TransferState = {
  isLoading:       false,
  error:           null,
  success:         false,
  lastTransaction: null,
};

export function useTransfer() {
  const { user } = useAuthStore();
  const { wallet, setWallet } = useWalletStore();
  const [state, setState] = useState<TransferState>(INITIAL);

  const transfer = useCallback(async (payload: TransferPayload): Promise<void> => {
    if (!user || !wallet) {
      setState((s) => ({ ...s, error: 'Session expired. Please log in again.' }));
      return;
    }

    // Client-side Zod validation (amount here is in display units, e.g. ₦500)
    const validation = transferSchema.safeParse(payload);
    if (!validation.success) {
      setState((s) => ({
        ...s,
        error: validation.error.errors[0]?.message ?? 'Invalid input.',
      }));
      return;
    }

    setState({ isLoading: true, error: null, success: false, lastTransaction: null });

    const result = await transferFunds(user.uid, wallet.id, payload);

    if (!result.success || !result.data) {
      setState({
        isLoading:       false,
        error:           result.error ?? 'Transfer failed.',
        success:         false,
        lastTransaction: null,
      });
      return;
    }

    // Refresh wallet balance from source of truth
    const freshWallet = await fetchWallet(wallet.id);
    if (freshWallet.success && freshWallet.data) {
      setWallet(freshWallet.data);
    }

    setState({
      isLoading:       false,
      error:           null,
      success:         true,
      lastTransaction: result.data,
    });
  }, [user, wallet, setWallet]);

  const reset = useCallback(() => setState(INITIAL), []);

  return { ...state, transfer, reset };
}
