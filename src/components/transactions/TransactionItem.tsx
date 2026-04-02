// src/components/transactions/TransactionItem.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { formatAmount } from '@/utils/currency';
import { Colors, FontSize, Spacing, Radius } from '@/utils/theme';
import type { Transaction } from '@/types';

interface Props {
  transaction:   Transaction;
  currentUserId: string;
}

export function TransactionItem({ transaction, currentUserId }: Props) {
  const isCredit    = transaction.receiverId === currentUserId;
  const counterparty = isCredit ? transaction.senderUsername : transaction.receiverUsername;
  const label        = isCredit ? `From @${counterparty}` : `To @${counterparty}`;

  return (
    <View style={styles.row}>
      {/* Icon */}
      <View style={[styles.icon, isCredit ? styles.creditIcon : styles.debitIcon]}>
        <Text style={styles.iconText}>{isCredit ? '↓' : '↑'}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{label}</Text>
        <Text style={styles.date}>
          {format(transaction.createdAt, 'MMM d, yyyy · h:mm a')}
        </Text>
        {transaction.note ? (
          <Text style={styles.note} numberOfLines={1}>{transaction.note}</Text>
        ) : null}
      </View>

      {/* Amount */}
      <View style={styles.amountCol}>
        <Text style={[styles.amount, isCredit ? styles.creditAmt : styles.debitAmt]}>
          {isCredit ? '+' : '-'}{formatAmount(transaction.amount, transaction.currency)}
        </Text>
        <View style={[styles.statusBadge, styles[`status_${transaction.status}`]]}>
          <Text style={styles.statusText}>{transaction.status}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },

  icon: {
    width:          44,
    height:         44,
    borderRadius:   Radius.sm,
    alignItems:     'center',
    justifyContent: 'center',
    marginRight:    Spacing.md,
  },
  creditIcon: { backgroundColor: Colors.successLight },
  debitIcon:  { backgroundColor: Colors.dangerLight },
  iconText:   { fontSize: FontSize.lg },

  info:     { flex: 1, marginRight: Spacing.sm },
  name:     { fontSize: FontSize.md, fontWeight: '600', color: Colors.black },
  date:     { fontSize: FontSize.xs, color: Colors.gray400, marginTop: 2 },
  note:     { fontSize: FontSize.xs, color: Colors.gray500, marginTop: 2 },

  amountCol: { alignItems: 'flex-end' },
  amount:    { fontSize: FontSize.md, fontWeight: '700' },
  creditAmt: { color: Colors.success },
  debitAmt:  { color: Colors.danger },

  statusBadge: {
    borderRadius:    Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop:       4,
  },
  status_completed: { backgroundColor: Colors.successLight },
  status_pending:   { backgroundColor: Colors.warningLight },
  status_failed:    { backgroundColor: Colors.dangerLight },
  statusText:       { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', color: Colors.gray500 },
});
