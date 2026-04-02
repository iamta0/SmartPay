import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ScrollView,
} from 'react-native';
import { useAuthStore }   from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { useTransactionStore } from '@/store/transactionStore';
import { signOut } from '@/services/authService';
import { Colors, FontSize, Spacing, Radius } from '@/utils/theme';

export function ProfileScreen() {
  const { user, reset: resetAuth }             = useAuthStore();
  const { reset: resetWallet }                 = useWalletStore();
  const { reset: resetTransactions }           = useTransactionStore();
  const [isLoading, setIsLoading]              = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            await signOut();
            resetAuth();
            resetWallet();
            resetTransactions();
            setIsLoading(false);
          },
        },
      ]
    );
  };

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.displayName?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.displayName}>{user?.displayName}</Text>
        <Text style={styles.username}>@{user?.username}</Text>
      </View>

      {/* Info Card */}
      <View style={styles.card}>
        <InfoRow label="Email"     value={user?.email     ?? '—'} />
        <InfoRow label="Username"  value={`@${user?.username ?? '—'}`} />
        <InfoRow label="Wallet ID" value={user?.walletId  ?? '—'} />
        <InfoRow
          label="Member Since"
          value={
            user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString('en-NG', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })
              : '—'
          }
        />
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        style={[styles.signOutBtn, isLoading && { opacity: 0.6 }]}
        onPress={handleSignOut}
        disabled={isLoading}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 60 },

  avatarContainer: { alignItems: 'center', marginVertical: Spacing.xl },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText:  { color: Colors.white, fontSize: 32, fontWeight: '800' },
  displayName: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.black },
  username:    { fontSize: FontSize.sm, color: Colors.gray500, marginTop: 2 },

  card: {
    backgroundColor: Colors.white,
    borderRadius:    Radius.xl,
    padding:         Spacing.md,
    shadowColor:     Colors.cardShadow,
    shadowOpacity:   0.08,
    shadowRadius:    8,
    elevation:       3,
  },
  infoRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  infoLabel: { fontSize: FontSize.sm, color: Colors.gray500 },
  infoValue: { fontSize: FontSize.sm, color: Colors.black, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },

  signOutBtn: {
    marginTop:       Spacing.xl,
    backgroundColor: Colors.dangerLight,
    borderRadius:    Radius.lg,
    padding:         Spacing.md,
    alignItems:      'center',
  },
  signOutText: { color: Colors.danger, fontWeight: '700', fontSize: FontSize.base },
});