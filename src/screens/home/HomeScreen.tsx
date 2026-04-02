import React, { useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, RefreshControl, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { BalanceCard }     from '@/components/wallet/BalanceCard';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuthStore }    from '@/store/authStore';
import { useWalletStore }  from '@/store/walletStore';
import { fetchWallet }     from '@/services/walletService';
import { Colors, FontSize, Spacing } from '@/utils/theme';
import type { AppTabParamList } from '@/types';

type Nav = BottomTabNavigationProp<AppTabParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user }   = useAuthStore();
  const { setWallet } = useWalletStore();
  const {
    transactions,
    isLoading,
    error,
    loadInitial,
  } = useTransactions();

  // Load wallet + transactions on mount
  useEffect(() => {
    if (user?.walletId) {
      fetchWallet(user.walletId).then((r) => {
        if (r.success && r.data) setWallet(r.data);
      });
    }
    loadInitial();
  }, []);

  const recent = transactions.slice(0, 5);

  const ListHeader = () => (
    <View>
      {/* Balance card */}
      <BalanceCard />

      {/* Quick actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Send')}>
          <Text style={styles.actionEmoji}>↑</Text>
          <Text style={styles.actionLabel}>Send</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Receive')}>
          <Text style={styles.actionEmoji}>↓</Text>
          <Text style={styles.actionLabel}>Receive</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('History')}>
          <Text style={styles.actionEmoji}>📋</Text>
          <Text style={styles.actionLabel}>History</Text>
        </TouchableOpacity>
      </View>

      {/* Section heading */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {transactions.length > 5 && (
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );

  const ListEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>💸</Text>
        <Text style={styles.emptyText}>No transactions yet</Text>
        <Text style={styles.emptySubtext}>Send or receive money to get started</Text>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Greeting header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>
            Good {getTimeOfDay()}, 👋
          </Text>
          <Text style={styles.name}>{user?.displayName}</Text>
        </View>
      </View>

      <FlatList
        data={recent}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            currentUserId={user?.uid ?? ''}
          />
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={
          isLoading
            ? () => <ActivityIndicator style={{ padding: Spacing.lg }} color={Colors.primary} />
            : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading && transactions.length === 0}
            onRefresh={() => {
              if (user?.walletId) {
                fetchWallet(user.walletId).then((r) => {
                  if (r.success && r.data) setWallet(r.data);
                });
              }
              loadInitial();
            }}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    paddingHorizontal: Spacing.lg,
    paddingTop:       Spacing.xl,
    paddingBottom:    Spacing.sm,
    backgroundColor:  Colors.white,
  },
  greeting: { fontSize: FontSize.sm,  color: Colors.gray500 },
  name:     { fontSize: FontSize.xl,  fontWeight: '800', color: Colors.black },

  actions: {
    flexDirection:    'row',
    justifyContent:   'space-around',
    marginHorizontal: Spacing.lg,
    marginTop:        Spacing.lg,
    marginBottom:     Spacing.sm,
  },
  actionBtn: {
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: Colors.white,
    borderRadius:    16,
    width:           90,
    height:          80,
    shadowColor:     '#000',
    shadowOpacity:   0.06,
    shadowRadius:    6,
    elevation:       2,
  },
  actionEmoji: { fontSize: 22, marginBottom: 4 },
  actionLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.gray700 },

  sectionRow: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    paddingHorizontal: Spacing.lg,
    marginTop:        Spacing.lg,
    marginBottom:     Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.black },
  seeAll:       { fontSize: FontSize.sm,   color: Colors.primary, fontWeight: '600' },

  errorBox: {
    backgroundColor: Colors.dangerLight,
    margin:          Spacing.md,
    padding:         Spacing.md,
    borderRadius:    8,
  },
  errorText: { color: Colors.danger, fontSize: FontSize.sm },

  empty: {
    alignItems:  'center',
    marginTop:   Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },
  emptyEmoji:    { fontSize: 48 },
  emptyText:     { fontSize: FontSize.base, fontWeight: '700', color: Colors.gray700, marginTop: Spacing.md },
  emptySubtext:  { fontSize: FontSize.sm,   color: Colors.gray400, marginTop: 4 },
});