import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { AuthNavigator } from './AuthNavigator';
import { AppNavigator }  from './AppNavigator';
import { PinScreen }     from '@/screens/pin/PinScreen';

import { useAuthStore }   from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';

import { onAuthChanged, fetchUser } from '@/services/authService';
import { fetchWallet }              from '@/services/walletService';

import { Colors }           from '@/utils/theme';
import type { RootStackParamList } from '@/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const {
    user,
    isInitialized,
    isPinVerified,
    setUser,
    setLoading,
    setInitialized,
  } = useAuthStore();

  const { setWallet } = useWalletStore();

  // ── Bootstrap: listen for Firebase auth state ──────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthChanged(async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          const profile = await fetchUser(firebaseUser.uid);
          if (profile) {
            setUser(profile);
            // Pre-load wallet
            const walletResult = await fetchWallet(profile.walletId);
            if (walletResult.success && walletResult.data) {
              setWallet(walletResult.data);
            }
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    });

    return unsubscribe;
  }, []);

  // ── Loading splash ─────────────────────────────────────────────────────────
  if (!isInitialized) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        // ── Unauthenticated ────────────────────────────────────────────────
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : !isPinVerified ? (
        // ── PIN gate ───────────────────────────────────────────────────────
        <Stack.Screen
          name="Pin"
          component={PinScreen}
          initialParams={{ mode: 'verify', onSuccess: () => {} }}
        />
      ) : (
        // ── Main app ───────────────────────────────────────────────────────
        <Stack.Screen name="App" component={AppNavigator} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: Colors.white,
  },
});