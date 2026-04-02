// src/screens/home/HomeScreen.tsx
import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuthStore }    from '@/store/authStore';
import { useWalletStore }  from '@/store/walletStore';
import { useTransactions } from '@/hooks/useTransactions';
import { BalanceCard }     from '@/components/wallet/BalanceCard';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import { fetchWallet }     from '@/services/walletService';
import { Colors, FontSize, Spacing, Radius } from '@/utils/theme';
import type { AppTabParamList } from '@/types';

type Nav = BottomTabNavigationProp<AppTabParamList, 'Home'>;

const QUICK_ACTIONS: { label: string; emoji: string; tab: keyof AppTabParamList }[] = [
  { label: 'Send',    emoji: '↑', tab: 'Send' },
  { label: 'Receive', emoji: '↓', tab: 'Receive' },
  { label: 'History', emoji: '📋', tab: 'History' },
  { label: 'Profile', emoji: '👤', tab: 'Profile' },
];

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user }                 = useAuthStore();
  const { wallet, setWallet }    = useWalletStore();
  const { transactions, isLoading, loadInitial } = useTransactions();

  useEffect(() => { loadInitial(); }, []);

  const onRefresh = async () => {
    if (user && wallet) {
      const res = await fetchWallet(wallet.id);
      if (res.success && res.data) setWallet(res.data);
    }
    await loadInitial();
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
          colors={[Colors.primary]}
        />
      }>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.name}>{user?.displayName} 👋</Text>
        </View>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.avatarText}>
            {user?.displayName?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Balance card */}
      <BalanceCard />

      {/* Quick actions */}
      <View style={styles.actionsCard}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={styles.actionBtn}
            onPress={() => navigation.navigate(action.tab)}
            activeOpacity={0.7}>
            <View style={styles.actionIcon}>
              <Text style={styles.actionEmoji}>{action.emoji}</Text>
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent transactions */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Recent</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.sectionLink}>See all</Text>
          </TouchableOpacity>
        </View>

        {transactions.length === 0 && !isLoading ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💳</Text>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptyText}>Send money to get started</Text>
          </View>
        ) : (
          <View style={styles.txList}>
            {transactions.slice(0, 5).map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                currentUserId={user?.uid ?? ''}
              />
            ))}
          </View>
        )}
      </View>

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.gray50 },

  header: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    paddingHorizontal: Spacing.lg,
    paddingTop:      60,
    paddingBottom:   Spacing.lg,
  },
  greeting:   { fontSize: FontSize.sm, color: Colors.gray500 },
  name:       { fontSize: FontSize.xl, fontWeight: '700', color: Colors.black },
  avatar: {
    width:          44,
    height:         44,
    borderRadius:   22,
    backgroundColor: Colors.primary,
    alignItems:     'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },

  actionsCard: {
    flexDirection:   'row',
    justifyContent:  'space-around',
    marginHorizontal: Spacing.lg,
    marginTop:       Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius:    Radius.xl,
    padding:         Spacing.lg,
    shadowColor:     '#000',
    shadowOpacity:   0.05,
    shadowRadius:    12,
    elevation:       2,
  },
  actionBtn:   { alignItems: 'center', gap: 8 },
  actionIcon: {
    width:          52,
    height:         52,
    borderRadius:   Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems:     'center',
    justifyContent: 'center',
  },
  actionEmoji: { fontSize: 22 },
  actionLabel: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.gray700 },

  section: { marginTop: Spacing.xl },
  sectionRow: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    marginHorizontal: Spacing.lg,
    marginBottom:    Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.black },
  sectionLink:  { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },

  txList: {
    backgroundColor: Colors.white,
    borderRadius:    Radius.lg,
    marginHorizontal: Spacing.lg,
    overflow:        'hidden',
    shadowColor:     '#000',
    shadowOpacity:   0.04,
    shadowRadius:    8,
    elevation:       2,
  },
  empty: {
    alignItems:     'center',
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.white,
    borderRadius:   Radius.lg,
    marginHorizontal: Spacing.lg,
  },
  emptyEmoji: { fontSize: 40, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.base, fontWeight: '700', color: Colors.black },
  emptyText:  { fontSize: FontSize.sm, color: Colors.gray400, marginTop: 4 },
});
