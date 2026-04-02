// src/screens/receive/ReceiveMoneyScreen.tsx
import React from 'react';
import {
  View, Text, StyleSheet, Share,
  TouchableOpacity, ScrollView,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuthStore } from '@/store/authStore';
import { Colors, FontSize, Spacing, Radius } from '@/utils/theme';
import type { QRPaymentPayload } from '@/types';

export function ReceiveMoneyScreen() {
  const { user } = useAuthStore();

  const qrPayload: QRPaymentPayload = {
    type:     'smartpay_receive',
    email:    user?.email    ?? '',
    username: user?.username ?? '',
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          `💸 Send me money on SmartPay!\n\n` +
          `Email:    ${user?.email}\n` +
          `Username: @${user?.username}\n\n` +
          `Download SmartPay to send instantly.`,
        title: 'My SmartPay Payment Details',
      });
    } catch (_) {
      // user cancelled — ignore
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}>

      <Text style={styles.title}>Receive Money</Text>
      <Text style={styles.subtitle}>Share your QR code or details below</Text>

      {/* QR card */}
      <View style={styles.qrCard}>
        <View style={styles.qrInner}>
          <QRCode
            value={JSON.stringify(qrPayload)}
            size={190}
            color={Colors.black}
            backgroundColor={Colors.white}
          />
        </View>
        <Text style={styles.qrHint}>Scan to send money to me</Text>
      </View>

      {/* Details */}
      <View style={styles.detailCard}>
        <DetailRow label="Display name" value={user?.displayName ?? ''} />
        <DetailRow label="Username"     value={`@${user?.username}`}    />
        <DetailRow label="Email"        value={user?.email ?? ''}       last />
      </View>

      {/* Share button */}
      <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
        <Text style={styles.shareBtnText}>📤  Share Payment Details</Text>
      </TouchableOpacity>

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

function DetailRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[detailStyles.row, last && { borderBottomWidth: 0 }]}>
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={detailStyles.value} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  label: { color: Colors.gray500, fontSize: FontSize.sm, flex: 1 },
  value: { color: Colors.black,   fontSize: FontSize.sm, fontWeight: '600', flex: 2, textAlign: 'right' },
});

const styles = StyleSheet.create({
  screen:    { flex: 1, backgroundColor: Colors.gray50 },
  container: { padding: Spacing.lg, paddingTop: 60 },

  title:    { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.black },
  subtitle: { fontSize: FontSize.sm,  color: Colors.gray500, marginTop: 6, marginBottom: Spacing.xl },

  qrCard: {
    backgroundColor: Colors.white,
    borderRadius:    Radius.xl,
    padding:         Spacing.xl,
    alignItems:      'center',
    shadowColor:     '#000',
    shadowOpacity:   0.07,
    shadowRadius:    16,
    shadowOffset:    { width: 0, height: 4 },
    elevation:       4,
    marginBottom:    Spacing.lg,
  },
  qrInner: {
    padding:         Spacing.md,
    borderRadius:    Radius.lg,
    borderWidth:     1,
    borderColor:     Colors.gray100,
  },
  qrHint: { color: Colors.gray400, fontSize: FontSize.sm, marginTop: Spacing.md },

  detailCard: {
    backgroundColor: Colors.white,
    borderRadius:    Radius.lg,
    paddingHorizontal: Spacing.lg,
    shadowColor:     '#000',
    shadowOpacity:   0.04,
    shadowRadius:    8,
    elevation:       2,
    marginBottom:    Spacing.lg,
  },

  shareBtn: {
    backgroundColor: Colors.primary,
    borderRadius:    Radius.md,
    height:          52,
    alignItems:      'center',
    justifyContent:  'center',
  },
  shareBtnText: { color: Colors.white, fontSize: FontSize.base, fontWeight: '600' },
});
