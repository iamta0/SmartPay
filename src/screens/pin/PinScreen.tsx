import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/store/authStore';
import { Colors, FontSize, Spacing, Radius } from '@/utils/theme';
import type { RootStackParamList } from '@/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Pin'>;

const PIN_LENGTH    = 4;
const PIN_STORE_KEY = 'smartpay_pin';

const PAD = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', '⌫'],
];

export function PinScreen({ route }: Props) {
  const { mode, onSuccess }   = route.params;
  const { setPinVerified }    = useAuthStore();

  const [pin,        setPin]        = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [stage,      setStage]      = useState<'enter' | 'confirm'>('enter');
  const [error,      setError]      = useState('');

  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ── Shake animation on error ──────────────────────────────────────────────
  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  // ── Handle digit press ────────────────────────────────────────────────────
  const handleKey = (key: string) => {
    setError('');
    const current = stage === 'enter' ? pin : confirmPin;
    const setter  = stage === 'enter' ? setPin : setConfirmPin;

    if (key === '⌫') {
      setter(current.slice(0, -1));
      return;
    }
    if (key === '') return;
    if (current.length >= PIN_LENGTH) return;

    const next = current + key;
    setter(next);

    if (next.length === PIN_LENGTH) {
      // Small delay so last dot renders before action
      setTimeout(() => handleComplete(next), 80);
    }
  };

  // ── When PIN is fully entered ──────────────────────────────────────────────
  const handleComplete = async (value: string) => {
    if (mode === 'set') {
      if (stage === 'enter') {
        setStage('confirm');
        return;
      }
      // Confirm stage
      if (value !== pin) {
        setError("PINs don't match. Try again.");
        shake();
        setConfirmPin('');
        setPin('');
        setStage('enter');
        return;
      }
      await AsyncStorage.setItem(PIN_STORE_KEY, pin);
      setPinVerified(true);
      onSuccess?.();
      return;
    }

    // mode === 'verify'
    const stored = await AsyncStorage.getItem(PIN_STORE_KEY);
    if (!stored) {
      // No PIN set yet — treat as first-time setup
      setStage('confirm');
      return;
    }
    if (value !== stored) {
      setError('Incorrect PIN. Try again.');
      shake();
      setPin('');
      return;
    }
    setPinVerified(true);
    onSuccess?.();
  };

  const currentPin = stage === 'enter' ? pin : confirmPin;

  const title = mode === 'set'
    ? stage === 'enter' ? 'Create your PIN' : 'Confirm your PIN'
    : 'Enter your PIN';

  const subtitle = mode === 'set'
    ? stage === 'enter'
      ? 'Choose a 4-digit PIN to secure your account'
      : 'Re-enter your PIN to confirm'
    : 'Enter your 4-digit PIN to continue';

  return (
    <View style={styles.screen}>

      <View style={styles.header}>
        <Text style={styles.emoji}>🔐</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {/* PIN dots */}
      <Animated.View
        style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < currentPin.length && styles.dotFilled,
            ]}
          />
        ))}
      </Animated.View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Keypad */}
      <View style={styles.pad}>
        {PAD.map((row, ri) => (
          <View key={ri} style={styles.padRow}>
            {row.map((key, ki) => (
              <TouchableOpacity
                key={ki}
                style={[styles.key, key === '' && styles.keyHidden]}
                onPress={() => handleKey(key)}
                disabled={key === ''}
                activeOpacity={0.7}>
                <Text style={[
                  styles.keyText,
                  key === '⌫' && styles.keyBackspace,
                ]}>
                  {key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex:            1,
    backgroundColor: Colors.white,
    alignItems:      'center',
    justifyContent:  'center',
    padding:         Spacing.lg,
  },
  header: {
    alignItems:    'center',
    marginBottom:  Spacing.xxl,
  },
  emoji:    { fontSize: 52, marginBottom: Spacing.md },
  title:    { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.black, textAlign: 'center' },
  subtitle: { fontSize: FontSize.sm,  color: Colors.gray500, marginTop: Spacing.sm, textAlign: 'center' },

  dotsRow: {
    flexDirection:  'row',
    gap:            Spacing.lg,
    marginBottom:   Spacing.md,
  },
  dot: {
    width:        18,
    height:       18,
    borderRadius: 9,
    borderWidth:  2,
    borderColor:  Colors.gray300,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: Colors.primary,
    borderColor:     Colors.primary,
  },

  error: {
    color:        Colors.danger,
    fontSize:     FontSize.sm,
    fontWeight:   '600',
    marginBottom: Spacing.md,
  },

  pad: { marginTop: Spacing.xl, width: '80%' },
  padRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginBottom:   Spacing.md,
  },
  key: {
    width:           72,
    height:          72,
    borderRadius:    36,
    backgroundColor: Colors.gray100,
    alignItems:      'center',
    justifyContent:  'center',
  },
  keyHidden:    { backgroundColor: 'transparent' },
  keyText:      { fontSize: FontSize.xl, fontWeight: '700', color: Colors.black },
  keyBackspace: { fontSize: FontSize.lg, color: Colors.gray600 },
});