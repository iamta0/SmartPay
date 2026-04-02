// src/screens/history/TransactionHistoryScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuthStore }    from '@/store/authStore';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import { Colors, FontSize, Spacing, Radius } from '@/utils/theme';
import type { Transaction, TransactionType } from '@/types';

type Filter = 'all' | TransactionType;

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All',      value: 'all' },
  { label: 'Money in', value: 'credit' },
  { label: 'Money out',value: 'debit' },
];

export function TransactionHistoryScreen() {
  const { user }   = useAuthStore();
  const { transactions, hasMore, isLoading, error, loadInitial, loadMore } = useTransactions();
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => { loadInitial(); }, []);

  const filtered: Transaction[] = filter === 'all'
    ? transactions
    : transactions.filter((tx) => {
        if (filter === 'credit') return tx.receiverId === user?.uid;
        return tx.senderId === user?.uid;
      });

  const renderItem = ({ item }: { item: Transaction }) => (
    <TransactionItem transaction={item} currentUserId={user?.uid ?? ''} />
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return <ActivityIndicator color={Colors.primary} style={{ padding: Spacing.lg }} />;
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>📭</Text>
        <Text style={styles.emptyTitle}>
          {filter === 'all' ? 'No transactions yet' : `No ${filter === 'credit' ? 'incoming' : 'outgoing'} transactions`}
        </Text>
        <Text style={styles.emptyText}>Your transaction history will appear here.</Text>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        {/* Filter pills */}
        <View style={styles.filters}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              onPress={() => setFilter(f.value)}
              style={[styles.pill, filter === f.value && styles.pillActive]}>
              <Text style={[styles.pillText, filter === f.value && styles.pillTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Error */}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadInitial}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onEndReached={hasMore ? loadMore : undefined}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.gray50 },

  header: {
    backgroundColor:  Colors.white,
    paddingTop:       60,
    paddingHorizontal: Spacing.lg,
    paddingBottom:    Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.black, marginBottom: Spacing.md },

  filters:      { flexDirection: 'row', gap: Spacing.sm },
  pill: {
    paddingHorizontal: 14,
    paddingVertical:   7,
    borderRadius:      Radius.full,
    backgroundColor:   Colors.gray100,
    borderWidth:       1,
    borderColor:       Colors.gray200,
  },
  pillActive:     { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  pillText:       { fontSize: FontSize.xs, fontWeight: '600', color: Colors.gray500 },
  pillTextActive: { color: Colors.primary },

  listContent:    { paddingBottom: Spacing.xxl },
  emptyContainer: { flexGrow: 1 },

  empty: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.black },
  emptyText:  { fontSize: FontSize.sm, color: Colors.gray400, marginTop: 6, textAlign: 'center' },

  errorBox: { margin: Spacing.lg, backgroundColor: Colors.dangerLight, borderRadius: Radius.md, padding: Spacing.lg, alignItems: 'center' },
  errorText: { color: Colors.danger, fontSize: FontSize.sm, marginBottom: Spacing.sm },
  retryText: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.sm },
});
