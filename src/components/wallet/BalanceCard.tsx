// src/components/wallet/BalanceCard.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useWalletStore } from '@/store/walletStore';
import { formatAmount } from '@/utils/currency';
import { Colors, FontSize, Spacing, Radius } from '@/utils/theme';

export function BalanceCard() {
  const { wallet }  = useWalletStore();
  const [hidden, setHidden] = useState(false);

  if (!wallet) return null;

  return (
    <View style={styles.card}>
      {/* Top row */}
      <View style={styles.row}>
        <Text style={styles.label}>Total Balance</Text>
        <TouchableOpacity
          onPress={() => setHidden((v) => !v)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.toggleText}>{hidden ? '👁 Show' : '🙈 Hide'}</Text>
        </TouchableOpacity>
      </View>

      {/* Amount */}
      <Text style={styles.balance}>
        {hidden ? '•••• ••••' : formatAmount(wallet.balance, wallet.currency)}
      </Text>

      {/* Currency badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{wallet.currency} Wallet</Text>
      </View>

      {/* Decorative circles */}
      <View style={[styles.circle, styles.circleTopRight]} />
      <View style={[styles.circle, styles.circleBottomLeft]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primary,
    borderRadius:    Radius.xl,
    padding:         Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginTop:       Spacing.sm,
    overflow:        'hidden',
    shadowColor:     Colors.cardShadow,
    shadowOpacity:   0.4,
    shadowRadius:    20,
    shadowOffset:    { width: 0, height: 10 },
    elevation:       8,
  },
  row: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
  },
  label:       { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.sm, fontWeight: '500' },
  toggleText:  { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.xs },
  balance:     { color: Colors.white, fontSize: FontSize.xxxl, fontWeight: '700', marginTop: 12, letterSpacing: -1 },
  badge: {
    alignSelf:       'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius:    Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop:       12,
  },
  badgeText: { color: 'rgba(255,255,255,0.9)', fontSize: FontSize.xs, fontWeight: '600' },

  // Decorative background circles
  circle: {
    position:        'absolute',
    width:           140,
    height:          140,
    borderRadius:    70,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  circleTopRight:  { top: -40, right: -30 },
  circleBottomLeft:{ bottom: -50, left: -20 },
});
