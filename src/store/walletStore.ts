import { create } from 'zustand';
import type { Wallet } from '@/types';

interface WalletStore {
  wallet:     Wallet | null;
  isLoading:  boolean;
  error:      string | null;
  setWallet:  (wallet: Wallet | null) => void;
  setLoading: (v: boolean) => void;
  setError:   (v: string | null) => void;
  reset:      () => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  wallet:     null,
  isLoading:  false,
  error:      null,
  setWallet:  (wallet)    => set({ wallet }),
  setLoading: (isLoading) => set({ isLoading }),
  setError:   (error)     => set({ error }),
  reset:      ()          => set({ wallet: null, isLoading: false, error: null }),
}));