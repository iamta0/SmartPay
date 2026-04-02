// src/screens/send/SendMoneyScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { useTransfer }    from '@/hooks/useTransfer';
import { useWalletStore } from '@/store/walletStore';
import { Button }         from '@/components/ui/Button';
import { Input }          from '@/components/ui/Input';
import { formatAmount, toSmallestUnit } from '@/utils/currency';
import { Colors, FontSize, Spacing, Radius } from '@/utils/theme';

type Step = 'input' | 'confirm' | 'success' | 'error';

export function SendMoneyScreen() {
  const { wallet }                                         = useWalletStore();
  const { transfer, isLoading, error, lastTransaction, reset } = useTransfer();

  const [step,           setStep]           = useState<Step>('input');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amountStr,      setAmountStr]      = useState('');
  const [note,           setNote]           = useState('');
  const [inputError,     setInputError]     = useState('');

  const currency      = wallet?.currency ?? 'NGN';
  const displayAmount = parseFloat(amountStr) || 0;
  const amountInKobo  = toSmallestUnit(displayAmount);

  // ── Step: input ───────────────────────────────────────────────────────────

  const handleContinue = () => {
    setInputError('');
    if (!recipientEmail.trim()) { setInputError('Recipient email is required.'); return; }
    if (!amountStr.trim())      { setInputError('Amount is required.'); return; }
    if (displayAmount <= 0)     { setInputError('Enter a valid amount greater than zero.'); return; }
    if (wallet && amountInKobo > wallet.balance) {
      setInputError(`Insufficient balance. Your balance is ${formatAmount(wallet.balance, currency)}.`);
      return;
    }
    setStep('confirm');
  };

  // ── Step: confirm ─────────────────────────────────────────────────────────

  const handleConfirm = async () => {
    await transfer({ recipientEmail, amount: amountInKobo, note: note || undefined, currency });
    // Check state after — hook sets success/error
    setStep(error ? 'error' : 'success');
  };

  // After transfer resolves, error lives in hook state (checked in render)
  React.useEffect(() => {
    if (step === 'confirm' && !isLoading) {
      if (lastTransaction) setStep('success');
      else if (error)      setStep('error');
    }
  }, [isLoading, lastTransaction, error]);

  // ── Reset ─────────────────────────────────────────────────────────────────

  const handleReset = () => {
    setRecipientEmail('');
    setAmountStr('');
    setNote('');
    setInputError('');
    reset();
    setStep('input');
  };

  // ── Renders ───────────────────────────────────────────────────────────────

  if (step === 'success' && lastTransaction) {
    return (
      <View style={[styles.screen, styles.center]}>
        <View style={styles.successIcon}><Text style={styles.successEmoji}>✅</Text></View>
        <Text style={styles.successTitle}>Transfer Successful!</Text>
        <Text style={styles.successAmount}>
          {formatAmount(lastTransaction.amount, lastTransaction.currency)}
        </Text>
        <Text style={styles.successTo}>sent to {recipientEmail}</Text>
        {lastTransaction.note ? (
          <Text style={styles.successNote}>"{lastTransaction.note}"</Text>
        ) : null}
        <Button label="Make Another Transfer" onPress={handleReset} style={styles.successBtn} />
      </View>
    );
  }

  if (step === 'error') {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={{ fontSize: 56, marginBottom: Spacing.lg }}>❌</Text>
        <Text style={styles.successTitle}>Transfer Failed</Text>
        <Text style={styles.errorMsg}>{error}</Text>
        <Button label="Try Again" onPress={handleReset} style={{ marginTop: Spacing.xl, width: '80%' }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Text style={styles.title}>Send Money</Text>
        {wallet && (
          <View style={styles.balancePill}>
            <Text style={styles.balancePillText}>
              Balance: {formatAmount(wallet.balance, currency)}
            </Text>
          </View>
        )}

        {/* Step indicator */}
        <View style={styles.steps}>
          {(['input', 'confirm'] as Step[]).map((s, i) => (
            <React.Fragment key={s}>
              <View style={[styles.stepDot, step === s && styles.stepDotActive]}>
                <Text style={[styles.stepNum, step === s && styles.stepNumActive]}>
                  {i + 1}
                </Text>
              </View>
              {i < 1 && <View style={[styles.stepLine, step === 'confirm' && styles.stepLineActive]} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── STEP 1: Input ── */}
        {step === 'input' && (
          <View style={styles.card}>
            <Input
              label="Recipient Email"
              value={recipientEmail}
              onChangeText={setRecipientEmail}
              placeholder="recipient@example.com"
              keyboardType="email-address"
            />
            <Input
              label={`Amount (${currency})`}
              value={amountStr}
              onChangeText={setAmountStr}
              placeholder="0.00"
              keyboardType="decimal-pad"
              hint="Enter the amount to send"
            />
            <Input
              label="Note (optional)"
              value={note}
              onChangeText={setNote}
              placeholder="What's this for?"
              multiline
              maxLength={100}
            />
            {inputError ? <Text style={styles.formError}>{inputError}</Text> : null}
            <Button label="Continue →" onPress={handleContinue} style={{ marginTop: Spacing.sm }} />
          </View>
        )}

        {/* ── STEP 2: Confirm ── */}
        {step === 'confirm' && (
          <View style={styles.card}>
            <Text style={styles.confirmTitle}>Review Transfer</Text>

            <ConfirmRow label="To"     value={recipientEmail} />
            <ConfirmRow label="Amount" value={formatAmount(amountInKobo, currency)} highlight />
            {note ? <ConfirmRow label="Note" value={note} /> : null}
            {wallet && (
              <ConfirmRow
                label="Balance after"
                value={formatAmount(wallet.balance - amountInKobo, currency)}
              />
            )}

            <View style={styles.confirmBtns}>
              <Button
                label="Back"
                variant="secondary"
                onPress={() => setStep('input')}
                fullWidth={false}
                style={{ flex: 1 }}
              />
              <Button
                label="Send Money"
                onPress={handleConfirm}
                isLoading={isLoading}
                fullWidth={false}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ConfirmRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={[rowStyles.value, highlight && rowStyles.highlight]}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  label:     { color: Colors.gray500, fontSize: FontSize.sm },
  value:     { color: Colors.black,   fontSize: FontSize.sm, fontWeight: '600', flexShrink: 1, textAlign: 'right', marginLeft: Spacing.md },
  highlight: { color: Colors.primary, fontSize: FontSize.lg },
});

const styles = StyleSheet.create({
  flex:    { flex: 1, backgroundColor: Colors.gray50 },
  screen:  { flex: 1, backgroundColor: Colors.gray50, padding: Spacing.lg },
  center:  { alignItems: 'center', justifyContent: 'center' },
  container: { padding: Spacing.lg, paddingTop: 60 },

  title:       { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.black, marginBottom: Spacing.sm },
  balancePill: {
    alignSelf:       'flex-start',
    backgroundColor: Colors.primaryLight,
    borderRadius:    Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom:    Spacing.lg,
  },
  balancePillText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '700' },

  steps: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  stepDot: {
    width:          28,
    height:         28,
    borderRadius:   14,
    backgroundColor: Colors.gray200,
    alignItems:     'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: Colors.primary },
  stepNum:       { fontSize: FontSize.xs, fontWeight: '700', color: Colors.gray500 },
  stepNumActive: { color: Colors.white },
  stepLine:      { flex: 1, height: 2, backgroundColor: Colors.gray200, marginHorizontal: 4 },
  stepLineActive:{ backgroundColor: Colors.primary },

  card: {
    backgroundColor: Colors.white,
    borderRadius:    Radius.xl,
    padding:         Spacing.lg,
    shadowColor:     '#000',
    shadowOpacity:   0.05,
    shadowRadius:    12,
    elevation:       2,
  },
  formError:     { color: Colors.danger, fontSize: FontSize.sm, marginBottom: Spacing.sm, textAlign: 'center' },
  confirmTitle:  { fontSize: FontSize.lg, fontWeight: '700', color: Colors.black, marginBottom: Spacing.md },
  confirmBtns:   { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg },

  successIcon:   { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.successLight, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  successEmoji:  { fontSize: 48 },
  successTitle:  { fontSize: FontSize.xl, fontWeight: '800', color: Colors.black, marginBottom: Spacing.sm },
  successAmount: { fontSize: FontSize.xxxl, fontWeight: '800', color: Colors.primary, marginVertical: Spacing.sm },
  successTo:     { color: Colors.gray500, fontSize: FontSize.md },
  successNote:   { color: Colors.gray400, fontSize: FontSize.sm, marginTop: Spacing.sm, fontStyle: 'italic' },
  successBtn:    { marginTop: Spacing.xl, width: '80%' },

  errorMsg:      { color: Colors.danger, fontSize: FontSize.md, textAlign: 'center', marginTop: Spacing.sm, maxWidth: '80%' },
});
