import React, { useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, RefreshControl, TouchableOpacity,
  StatusBar, Dimensions, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Constants for controlled width
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_APP_WIDTH = 450; // Standard "Portable" mobile width
const ACTUAL_CONTENT_WIDTH = SCREEN_WIDTH > MAX_APP_WIDTH ? MAX_APP_WIDTH : SCREEN_WIDTH;

import { BalanceCard } from '@/components/wallet/BalanceCard';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { fetchWallet } from '@/services/walletService';
import { Colors, FontSize, Spacing, Radius, Shadow } from '@/utils/theme';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { setWallet } = useWalletStore();
  const { transactions, isLoading, error, loadInitial } = useTransactions();

  useEffect(() => {
    if (user?.walletId) {
      fetchWallet(user.walletId).then((r) => {
        if (r.success && r.data) setWallet(r.data);
      });
    }
    loadInitial();
  }, []);

  const ListHeader = () => (
    <View style={styles.listHeaderInner}>
      <BalanceCard />

      <View style={styles.actionsWrapper}>
        <Text style={styles.actionsTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          {[
            { label: 'Send', emoji: '↑', screen: 'Send' },
            { label: 'Receive', emoji: '↓', screen: 'Receive' },
            { label: 'History', emoji: '🕒', screen: 'History' },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionBtn}
              onPress={() => navigation.navigate(action.screen)}>
              <View style={styles.actionIconBox}>
                <Text style={styles.actionEmoji}>{action.emoji}</Text>
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <TouchableOpacity onPress={() => navigation.navigate('History')}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />
      
      {/* Centered App Container */}
      <View style={styles.appWidthRestricted}>
        
        {/* Floating Header (Not full width) */}
        <View style={styles.floatingHeader}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.name}>{user?.displayName ?? 'User'}</Text>
          </View>
          <TouchableOpacity style={styles.bellBtn}>
            <Text>🔔</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={transactions.slice(0, 5)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemWrapper}>
               <TransactionItem transaction={item} currentUserId={user?.uid ?? ''} />
            </View>
          )}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={loadInitial} />
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // This creates the "Background" seen on the edges of large screens
  outerContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA', // Soft gray/blue background
    alignItems: 'center', // Centers the app container
  },

  // This is the "App" box itself
  appWidthRestricted: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_APP_WIDTH, // Forces the width to stay mobile-sized
    backgroundColor: Colors.background || '#FFFFFF',
    overflow: 'hidden',
  },

  floatingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },

  greeting: { fontSize: 14, color: Colors.gray500 },
  name: { fontSize: 22, fontWeight: '800', color: Colors.black },

  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E1E8F0',
  },

  scrollContent: {
    paddingBottom: 100,
  },

  listHeaderInner: {
    paddingHorizontal: Spacing.md, // Keeps content from hitting the app edge
  },

  actionsWrapper: {
    marginTop: 25,
    marginBottom: 10,
  },

  actionsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray400,
    textTransform: 'uppercase',
    marginBottom: 15,
    paddingLeft: 5,
  },

  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  actionBtn: {
    alignItems: 'center',
  },

  actionIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...Shadow.card,
    borderWidth: 1,
    borderColor: '#F0F3F7',
  },

  actionEmoji: { fontSize: 22 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: Colors.gray700 },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 15,
    paddingHorizontal: 5,
  },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.black },
  seeAllText: { color: Colors.primary, fontWeight: '700' },

  itemWrapper: {
    paddingHorizontal: Spacing.md, // Ensures transaction items aren't full width
  }
});