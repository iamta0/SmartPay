import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Input }  from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { transferSchema } from '@/types';
import { sendMoney } from '@/services/transactionService';
import { useAuthStore }   from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { fetchWallet }    from '@/services/walletService';
import { Colors, FontSize, Spacing, Radius } from '@/utils/theme';

export function SendMoneyScreen() {
  const navigation        = useNavigation();
  const { user }          = useAuthStore();
  const { wallet, setWallet } = useWalletStore();

  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount,         setAmount]         = useState('');
  const [note,           setNote]           = useState('');
  const [errors,         setErrors]         = useState<Record<string, string>>({});
  const [isLoading,      setIsLoading]      = useState(false);
  const [apiError,       setApiError]       = useState('');
  const [success,        setSuccess]        = useState(false);

  const validate = () => {
    const parsed = parseFloat(amount);
    const result = transferSchema.safeParse({
      recipientEmail,
      amount:   isNaN(parsed) ? 0 : parsed,
      currency: 'NGN',
      note:     note || undefined,
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSend = async () => {
    if (!user || !validate()) return;
    setIsLoading(true);
    setApiError('');
    try {
      const result = await sendMoney(user.uid, {
        recipientEmail,
        amount:   parseFloat(amount),
        currency: 'NGN',
        note:     note || undefined,
      });
      if (result.success) {
        setSuccess(true);
        // Refresh wallet balance
        if (user.walletId) {
          const w = await fetchWallet(user.walletId);
          if (w.success && w.data) setWallet(w.data);
        }
      } else {
        setApiError(result.error ?? 'Transfer failed.');
      }
    } catch (e: any) {
      setApiError(e.message ?? 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successEmoji}>🎉</Text>
        <Text style={styles.successTitle}>Money Sent!</Text>
        <Text style={styles.successSub}>
          ₦{parseFloat(amount).toLocaleString()} sent to {recipientEmail}
        </Text>
        <Button
          label="Done"
          onPress={() => {
            setSuccess(false);
            setRecipientEmail('');
            setAmount('');
            setNote('');
            navigation.goBack();
          }}
          style={{ marginTop: Spacing.xl, width: 200 }}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">

        <View style={styles.balanceBox}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>
            ₦{(wallet?.balance ?? 0).toLocaleString()}
          </Text>
        </View>

        {apiError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxText}>{apiError}</Text>
          </View>
        ) : null}

        <Input
          label="Recipient Email"
          value={recipientEmail}
          onChangeText={setRecipientEmail}
          placeholder="recipient@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.recipientEmail}
        />

        <Input
          label="Amount (NGN)"
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="numeric"
          error={errors.amount}
        />

        <Input
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="What's this for?"
          error={errors.note}
        />

        <Button
          label="Send Money"
          onPress={handleSend}
          isLoading={isLoading}
          style={styles.btn}
        />

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: Colors.white },
  content: { padding: Spacing.lg },

  balanceBox: {
    backgroundColor: Colors.primary,
    borderRadius:    Radius.xl,
    padding:         Spacing.lg,
    alignItems:      'center',
    marginBottom:    Spacing.xl,
  },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm },
  balanceValue: { color: Colors.white, fontSize: FontSize.xxxl, fontWeight: '800', marginTop: 4 },

  errorBox: {
    backgroundColor: Colors.dangerLight,
    borderRadius:    8,
    padding:         Spacing.md,
    marginBottom:    Spacing.md,
  },
  errorBoxText: { color: Colors.danger, fontSize: FontSize.sm, fontWeight: '500' },

  btn: { marginTop: Spacing.md },

  successContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.white, padding: Spacing.lg,
  },
  successEmoji: { fontSize: 64 },
  successTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.black, marginTop: Spacing.md },
  successSub:   { fontSize: FontSize.sm,  color: Colors.gray500, marginTop: Spacing.sm, textAlign: 'center' },
});