// src/store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@/types';

interface AuthState {
  user:           User | null;
  isLoading:      boolean;
  isPinVerified:  boolean;
  setUser:        (user: User | null) => void;
  setLoading:     (v: boolean) => void;
  setPinVerified: (v: boolean) => void;
  reset:          () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:          null,
      isLoading:     true,
      isPinVerified: false,

      setUser:        (user)          => set({ user }),
      setLoading:     (isLoading)     => set({ isLoading }),
      setPinVerified: (isPinVerified) => set({ isPinVerified }),
      reset:          ()              => set({ user: null, isPinVerified: false }),
    }),
    {
      name:       'smartpay-auth',
      storage:    createJSONStorage(() => AsyncStorage),
      // Only persist the user object; never persist loading/pin state
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
