import React from 'react';
import { View, Text, StyleSheet, Share, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuthStore }   from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { Colors, FontSize, Spacing, Radius } from '@/utils/theme';
import type { QRPaymentPayload } from '@/types';

export function ReceiveMoneyScreen() {
  const { user }   = useAuthStore();
  const { wallet } = useWalletStore();

  const payload: QRPaymentPayload = {
    walletId:    wallet?.id      ?? '',
    userId:      user?.uid       ?? '',
    displayName: user?.displayName ?? '',
  };

  const qrValue = JSON.stringify(payload);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Send me money on SmartPay!\nUsername: @${user?.username}\nEmail: ${user?.email}`,
      });
    } catch {
      // ignore
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.name}>{user?.displayName}</Text>
        <Text style={styles.username}>@{user?.username}</Text>

        <View style={styles.qrWrapper}>
          <QRCode
            value={qrValue || 'smartpay'}
            size={200}
            color={Colors.black}
            backgroundColor={Colors.white}
          />
        </View>

        <Text style={styles.hint}>Scan this code to send money</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Email</Text>
        <Text style={styles.infoValue}>{user?.email}</Text>
      </View>

      <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
        <Text style={styles.shareBtnText}>📤  Share Payment Details</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', padding: Spacing.lg },

  card: {
    backgroundColor: Colors.white,
    borderRadius:    Radius.xl,
    padding:         Spacing.xl,
    alignItems:      'center',
    width:           '100%',
    marginTop:       Spacing.lg,
    shadowColor:     Colors.cardShadow,
    shadowOpacity:   0.1,
    shadowRadius:    12,
    elevation:       4,
  },
  name:      { fontSize: FontSize.xl,  fontWeight: '800', color: Colors.black },
  username:  { fontSize: FontSize.sm,  color: Colors.gray500, marginTop: 2, marginBottom: Spacing.lg },
  qrWrapper: { padding: Spacing.md, backgroundColor: Colors.white, borderRadius: Radius.md },
  hint:      { fontSize: FontSize.xs, color: Colors.gray400, marginTop: Spacing.md },

  infoBox: {
    flexDirection: 'row', justifyContent: 'space-between',
    width: '100%', backgroundColor: Colors.white,
    borderRadius: Radius.lg, padding: Spacing.md,
    marginTop: Spacing.md,
  },
  infoLabel: { fontSize: FontSize.sm, color: Colors.gray500 },
  infoValue: { fontSize: FontSize.sm, color: Colors.black, fontWeight: '600' },

  shareBtn: {
    marginTop:       Spacing.xl,
    backgroundColor: Colors.primary,
    borderRadius:    Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  shareBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.base },
});