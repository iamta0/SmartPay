import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useWalletStore } from '@/store/walletStore';
import { Colors, FontSize, Spacing, Radius } from '@/utils/theme';

export function BalanceCard() {
  const { wallet } = useWalletStore();
  const [hidden, setHidden] = useState(false);

  const formatted = wallet
    ? new Intl.NumberFormat('en-NG', {
        style:    'currency',
        currency: wallet.currency ?? 'NGN',
      }).format(wallet.balance)
    : '₦0.00';

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>Available Balance</Text>
        <TouchableOpacity onPress={() => setHidden((v) => !v)}>
          <Text style={styles.toggle}>{hidden ? 'Show' : 'Hide'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.amount}>
        {hidden ? '••••••' : formatted}
      </Text>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.walletLabel}>Wallet ID</Text>
        <Text style={styles.walletId}>
          {wallet?.id ?? '—'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primary,
    borderRadius:    Radius.xl,
    marginHorizontal: Spacing.lg,
    marginTop:       Spacing.lg,
    padding:         Spacing.lg,
    shadowColor:     Colors.cardShadow,
    shadowOpacity:   0.3,
    shadowRadius:    16,
    elevation:       6,
  },
  row: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  label:     { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)' },
  toggle:    { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  amount:    { fontSize: FontSize.xxxl, fontWeight: '800', color: Colors.white, marginVertical: Spacing.md },
  divider:   { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: Spacing.sm },
  walletLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)' },
  walletId:    { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
});