// src/screens/profile/ProfileScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ScrollView, Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore }   from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { logOut }         from '@/services/authService';
import { formatAmount }   from '@/utils/currency';
import { Colors, FontSize, Spacing, Radius } from '@/utils/theme';
import type { RootStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, reset: resetAuth } = useAuthStore();
  const { wallet, reset: resetWallet } = useWalletStore();
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logOut();
            resetAuth();
            resetWallet();
          },
        },
      ],
    );
  };

  const handleSetPin = () => {
    navigation.navigate('Pin', {
      mode:      'set',
      onSuccess: () => Alert.alert('PIN Updated', 'Your PIN has been saved securely.'),
    });
  };

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}>

      {/* Profile header */}
      <View style={styles.headerBg}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.displayName?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.displayName}</Text>
        <Text style={styles.username}>@{user?.username}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Wallet summary */}
      {wallet && (
        <View style={styles.walletCard}>
          <View style={styles.walletRow}>
            <View>
              <Text style={styles.walletLabel}>Wallet Balance</Text>
              <Text style={styles.walletAmount}>
                {formatAmount(wallet.balance, wallet.currency)}
              </Text>
            </View>
            <View style={styles.currencyBadge}>
              <Text style={styles.currencyText}>{wallet.currency}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Account section */}
      <SectionHeader title="Account" />
      <View style={styles.menuGroup}>
        <MenuItem
          emoji="🔐"
          label="Change PIN"
          onPress={handleSetPin}
        />
        <MenuItem
          emoji="📋"
          label="Account ID"
          value={user?.uid.slice(0, 12) + '…'}
          onPress={() => Alert.alert('Account ID', user?.uid)}
        />
      </View>

      {/* Preferences section */}
      <SectionHeader title="Preferences" />
      <View style={styles.menuGroup}>
        <ToggleItem
          emoji="🔔"
          label="Push notifications"
          value={notifEnabled}
          onToggle={setNotifEnabled}
        />
        <ToggleItem
          emoji="👆"
          label="Biometric login"
          value={biometricEnabled}
          onToggle={setBiometricEnabled}
        />
      </View>

      {/* Support section */}
      <SectionHeader title="Support" />
      <View style={styles.menuGroup}>
        <MenuItem emoji="💬" label="Help & Support"   onPress={() => Alert.alert('Support', 'Coming soon.')} />
        <MenuItem emoji="📄" label="Privacy Policy"   onPress={() => Alert.alert('Privacy', 'Coming soon.')} />
        <MenuItem emoji="📝" label="Terms of Service" onPress={() => Alert.alert('Terms', 'Coming soon.')} last />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>SmartPay v1.0.0</Text>
      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={sectionStyles.title}>{title}</Text>
  );
}

function MenuItem({
  emoji, label, value, onPress, last = false,
}: {
  emoji: string; label: string; value?: string;
  onPress: () => void; last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[menuStyles.item, last && { borderBottomWidth: 0 }]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={menuStyles.left}>
        <View style={menuStyles.emojiBox}><Text style={menuStyles.emoji}>{emoji}</Text></View>
        <Text style={menuStyles.label}>{label}</Text>
      </View>
      <View style={menuStyles.right}>
        {value ? <Text style={menuStyles.value}>{value}</Text> : null}
        <Text style={menuStyles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

function ToggleItem({
  emoji, label, value, onToggle,
}: {
  emoji: string; label: string; value: boolean; onToggle: (v: boolean) => void;
}) {
  return (
    <View style={menuStyles.item}>
      <View style={menuStyles.left}>
        <View style={menuStyles.emojiBox}><Text style={menuStyles.emoji}>{emoji}</Text></View>
        <Text style={menuStyles.label}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.gray200, true: Colors.primaryLight }}
        thumbColor={value ? Colors.primary : Colors.gray400}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const sectionStyles = StyleSheet.create({
  title: {
    fontSize:        FontSize.xs,
    fontWeight:      '700',
    color:           Colors.gray400,
    letterSpacing:   1,
    textTransform:   'uppercase',
    marginTop:       Spacing.lg,
    marginBottom:    Spacing.sm,
    marginHorizontal: Spacing.lg,
  },
});

const menuStyles = StyleSheet.create({
  item: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    paddingVertical:  Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor:  Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  left:     { flexDirection: 'row', alignItems: 'center', flex: 1 },
  emojiBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.gray50, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  emoji:    { fontSize: 18 },
  label:    { fontSize: FontSize.md, color: Colors.black, fontWeight: '500' },
  right:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  value:    { fontSize: FontSize.sm, color: Colors.gray400 },
  arrow:    { fontSize: 22, color: Colors.gray400 },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.gray50 },

  headerBg: {
    backgroundColor: Colors.primary,
    paddingTop:      70,
    paddingBottom:   Spacing.xl,
    alignItems:      'center',
  },
  avatar: {
    width:          76,
    height:         76,
    borderRadius:   38,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   Spacing.md,
    borderWidth:    3,
    borderColor:    'rgba(255,255,255,0.4)',
  },
  avatarText: { color: Colors.white, fontSize: 32, fontWeight: '700' },
  name:       { color: Colors.white, fontSize: FontSize.xl, fontWeight: '700' },
  username:   { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.sm, marginTop: 2 },
  email:      { color: 'rgba(255,255,255,0.6)',  fontSize: FontSize.xs, marginTop: 2 },

  walletCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginTop:       -Spacing.lg,
    borderRadius:    Radius.xl,
    padding:         Spacing.lg,
    shadowColor:     '#000',
    shadowOpacity:   0.1,
    shadowRadius:    16,
    shadowOffset:    { width: 0, height: 4 },
    elevation:       5,
  },
  walletRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  walletLabel:  { fontSize: FontSize.xs, color: Colors.gray400, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  walletAmount: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.black, marginTop: 4 },
  currencyBadge: { backgroundColor: Colors.primaryLight, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 6 },
  currencyText:  { color: Colors.primary, fontWeight: '700', fontSize: FontSize.sm },

  logoutBtn: {
    marginHorizontal: Spacing.lg,
    marginTop:        Spacing.xl,
    backgroundColor:  Colors.dangerLight,
    borderRadius:     Radius.md,
    height:           52,
    alignItems:       'center',
    justifyContent:   'center',
  },
  logoutText: { color: Colors.danger, fontWeight: '700', fontSize: FontSize.base },
  version:    { textAlign: 'center', color: Colors.gray400, fontSize: FontSize.xs, marginTop: Spacing.lg },
});
