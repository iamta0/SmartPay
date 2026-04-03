import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform, TouchableOpacity,
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

const QUICK_AMOUNTS = [2000, 5000, 10000];

export function SendMoneyScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { wallet, setWallet } = useWalletStore();

  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const parsed = parseFloat(amount);
    const result = transferSchema.safeParse({
      recipientEmail,
      amount: isNaN(parsed) ? 0 : parsed,
      currency: 'NGN',
      note: note || undefined,
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
        amount: parseFloat(amount),
        currency: 'NGN',
        note: note || undefined,
      });
      if (result.success) {
        setSuccess(true);
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
        <View style={styles.successIconCircle}>
            <Text style={{fontSize: 40}}>✅</Text>
        </View>
        <Text style={styles.successTitle}>Transfer Sent!</Text>
        <Text style={styles.successSub}>
          Your transfer of <Text style={{fontWeight: '700', color: Colors.black}}>₦{parseFloat(amount).toLocaleString()}</Text> is on its way.
        </Text>
        <TouchableOpacity 
            style={styles.doneAction}
            onPress={() => navigation.goBack()}
        >
            <Text style={styles.doneActionText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.outerWrapper}>
        <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        <ScrollView
            style={styles.screen}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            {/* Compact Header Balance */}
            <View style={styles.topHeader}>
                <Text style={styles.greeting}>Send Money</Text>
                <View style={styles.miniBalance}>
                    <Text style={styles.miniLabel}>Available:</Text>
                    <Text style={styles.miniValue}>₦{(wallet?.balance ?? 0).toLocaleString()}</Text>
                </View>
            </View>

            {/* Main Action Card */}
            <View style={styles.mainCard}>
                {apiError ? (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorBoxText}>{apiError}</Text>
                    </View>
                ) : null}

                <Text style={styles.inputHeading}>Who are you sending to?</Text>
                <Input
                    value={recipientEmail}
                    onChangeText={setRecipientEmail}
                    placeholder="Recipient's Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.recipientEmail}
                    containerStyle={styles.inputField}
                />

                <View style={styles.divider} />

                <Text style={styles.inputHeading}>How much?</Text>
                <View style={styles.amountInputRow}>
                    <Text style={styles.currencySymbol}>₦</Text>
                    <Input
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0.00"
                        keyboardType="numeric"
                        error={errors.amount}
                        containerStyle={{flex: 1}}
                        // Assuming your Input component supports custom text styles
                        style={styles.bigAmountText} 
                    />
                </View>

                <View style={styles.chipContainer}>
                    {QUICK_AMOUNTS.map((amt) => (
                        <TouchableOpacity 
                            key={amt} 
                            onPress={() => setAmount(amt.toString())}
                            style={styles.amountChip}
                        >
                            <Text style={styles.amountChipText}>₦{amt.toLocaleString()}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Input
                    label="Add a note"
                    value={note}
                    onChangeText={setNote}
                    placeholder="E.g. Dinner, Rent..."
                    error={errors.note}
                    containerStyle={{marginTop: Spacing.md}}
                />
            </View>

            <View style={styles.buttonWrapper}>
                <Button
                    label="Continue"
                    onPress={handleSend}
                    isLoading={isLoading}
                    style={styles.mainButton}
                />
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={styles.cancelLink}
                >
                    <Text style={styles.cancelText}>Cancel Transaction</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
        </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: { flex: 1, backgroundColor: '#F2F4F7' },
  screen: { flex: 1 },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },

  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: 4,
  },
  greeting: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.black },
  miniBalance: { alignItems: 'flex-end' },
  miniLabel: { fontSize: 10, color: Colors.gray500, fontWeight: '600', textTransform: 'uppercase' },
  miniValue: { fontSize: FontSize.md, fontWeight: '700', color: Colors.primary },

  mainCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    // Soft Shadow for Depth
    ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
        android: { elevation: 3 },
    }),
  },

  inputHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.gray600,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  inputField: { marginBottom: Spacing.sm },
  divider: { height: 1, backgroundColor: '#F2F4F7', marginVertical: Spacing.md },

  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.black,
    marginRight: 8,
    marginTop: 8,
  },
  bigAmountText: {
    fontSize: 24,
    fontWeight: '700',
  },

  chipContainer: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    gap: 10,
  },
  amountChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  amountChipText: { fontSize: 12, fontWeight: '600', color: Colors.gray700 },

  buttonWrapper: { marginTop: Spacing.xl, alignItems: 'center' },
  mainButton: { width: '100%', height: 56, borderRadius: Radius.lg },
  cancelLink: { marginTop: Spacing.lg },
  cancelText: { color: Colors.gray500, fontWeight: '600', fontSize: FontSize.sm },

  errorBox: {
    backgroundColor: '#FEF3F2',
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#FECDCA',
  },
  errorBoxText: { color: '#B42318', fontSize: 13, fontWeight: '500' },

  // Success State
  successContainer: {
    flex: 1, backgroundColor: Colors.white, 
    justifyContent: 'center', alignItems: 'center',
    padding: Spacing.xl
  },
  successIconCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#ECFDF3', justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.xl
  },
  successTitle: { fontSize: 24, fontWeight: '800', marginBottom: Spacing.sm },
  successSub: { textAlign: 'center', color: Colors.gray500, lineHeight: 22, paddingHorizontal: 20 },
  doneAction: { marginTop: 40, padding: 16 },
  doneActionText: { color: Colors.primary, fontWeight: '700', fontSize: 16 }
});