import { create } from 'zustand';
import type { User } from '@/types';

interface AuthStore {
  user:           User | null;
  isLoading:      boolean;
  isPinVerified:  boolean;
  isInitialized:  boolean;
  setUser:        (user: User | null) => void;
  setLoading:     (v: boolean) => void;
  setPinVerified: (v: boolean) => void;
  setInitialized: (v: boolean) => void;
  reset:          () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user:           null,
  isLoading:      false,
  isPinVerified:  false,
  isInitialized:  false,
  setUser:        (user)          => set({ user }),
  setLoading:     (isLoading)     => set({ isLoading }),
  setPinVerified: (isPinVerified) => set({ isPinVerified }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  reset:          ()              => set({
    user:          null,
    isLoading:     false,
    isPinVerified: false,
  }),
}));