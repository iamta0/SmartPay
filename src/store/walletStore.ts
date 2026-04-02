// src/store/walletStore.ts
import { create } from 'zustand';
import type { Wallet } from '@/types';

interface WalletState {
  wallet:        Wallet | null;
  isLoading:     boolean;
  error:         string | null;
  setWallet:     (wallet: Wallet | null) => void;
  setLoading:    (v: boolean) => void;
  setError:      (e: string | null) => void;
  updateBalance: (newBalance: number) => void;
  reset:         () => void;
}

export const useWalletStore = create<WalletState>()((set) => ({
  wallet:    null,
  isLoading: false,
  error:     null,

  setWallet:  (wallet)  => set({ wallet, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError:   (error)   => set({ error }),

  updateBalance: (newBalance) =>
    set((state) => ({
      wallet: state.wallet ? { ...state.wallet, balance: newBalance } : null,
    })),

  reset: () => set({ wallet: null, error: null }),
}));
