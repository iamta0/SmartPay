import React, { useEffect, useCallback } from 'react';
import {
  View, FlatList, ActivityIndicator,
  Text, StyleSheet, RefreshControl,
} from 'react-native';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuthStore }    from '@/store/authStore';
import { Colors, FontSize, Spacing } from '@/utils/theme';

export function TransactionHistoryScreen() {
  const { user }                                        = useAuthStore();
  const { transactions, isLoading, error, loadInitial, loadMore } = useTransactions();

  useEffect(() => {
    loadInitial();
  }, []);

  const renderFooter = () => {
    if (!isLoading) return null;
    return <ActivityIndicator style={{ padding: Spacing.md }} color={Colors.primary} />;
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>📭</Text>
        <Text style={styles.emptyText}>No transactions yet</Text>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            currentUserId={user?.uid ?? ''}
          />
        )}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && transactions.length === 0}
            onRefresh={loadInitial}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.white },
  errorBox: {
    backgroundColor: Colors.dangerLight,
    padding: Spacing.md,
    margin: Spacing.md,
    borderRadius: 8,
  },
  errorText: { color: Colors.danger, fontSize: FontSize.sm },
  empty:     { alignItems: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 48 },
  emptyText:  { fontSize: FontSize.base, color: Colors.gray400, marginTop: Spacing.sm },
});