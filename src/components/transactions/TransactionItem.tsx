import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { Colors, FontSize, Spacing } from '@/utils/theme';
import type { Transaction } from '@/types';

interface Props {
  transaction:   Transaction;
  currentUserId: string;
}

export function TransactionItem({ transaction, currentUserId }: Props) {
  const isSender  = transaction.senderId === currentUserId;
  const isCredit  = transaction.type === 'credit';
  const isPositive = isCredit || !isSender;

  const sign   = isPositive ? '+' : '-';
  const color  = isPositive ? Colors.success : Colors.danger;
  const emoji  = isPositive ? '↓' : '↑';
  const bgColor = isPositive ? Colors.successLight : Colors.dangerLight;

  const counterparty = isSender
    ? transaction.receiverUsername
    : transaction.senderUsername;

  const formattedAmount = new Intl.NumberFormat('en-NG', {
    style:    'currency',
    currency: transaction.currency ?? 'NGN',
  }).format(transaction.amount);

  const formattedDate = (() => {
    try {
      return format(new Date(transaction.createdAt), 'MMM d, h:mm a');
    } catch {
      return '';
    }
  })();

  const statusColor = {
    completed: Colors.success,
    pending:   Colors.warning,
    failed:    Colors.danger,
  }[transaction.status];

  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
        <Text style={styles.iconText}>{emoji}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{counterparty}</Text>
        <View style={styles.metaRow}>
          <Text style={[styles.status, { color: statusColor }]}>
            {transaction.status}
          </Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
        {transaction.note ? (
          <Text style={styles.note} numberOfLines={1}>{transaction.note}</Text>
        ) : null}
      </View>

      <Text style={[styles.amount, { color }]}>
        {sign}{formattedAmount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingHorizontal: Spacing.md,
    paddingVertical:   Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  iconBox: {
    width:          44,
    height:         44,
    borderRadius:   22,
    alignItems:     'center',
    justifyContent: 'center',
    marginRight:    Spacing.md,
  },
  iconText:  { fontSize: 18 },
  info:      { flex: 1 },
  name:      { fontSize: FontSize.base, fontWeight: '600', color: Colors.black },
  metaRow:   { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  status:    { fontSize: FontSize.xs, fontWeight: '600', textTransform: 'capitalize' },
  dot:       { fontSize: FontSize.xs, color: Colors.gray400, marginHorizontal: 4 },
  date:      { fontSize: FontSize.xs, color: Colors.gray400 },
  note:      { fontSize: FontSize.xs, color: Colors.gray400, marginTop: 2 },
  amount:    { fontSize: FontSize.base, fontWeight: '700' },
});