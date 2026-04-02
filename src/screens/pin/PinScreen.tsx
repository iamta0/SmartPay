// src/screens/pin/PinScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, Animated,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Colors, FontSize, Spacing, Radius } from '@/utils/theme';
import type { RootStackParamList } from '@/types';

export const PIN_STORE_KEY = 'smartpay_pin_v1';
const PIN_LENGTH = 4;

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Pin'>;
  route:      RouteProp<RootStackParamList, 'Pin'>;
};

type SubStep = 'enter' | 'confirm';

export function PinScreen({ navigation, route }: Props) {
  const { mode, onSuccess } = route.params;
  const [pin,      setPin]      = useState('');
  const [subStep,  setSubStep]  = useState<SubStep>('enter');
  const [firstPin, setFirstPin] = useState('');
  const [attempts, setAttempts] = useState(0);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  // Process a complete pin when all digits entered
  useEffect(() => {
    if (pin.length < PIN_LENGTH) return;
    const timeout = setTimeout(() => handlePinComplete(pin), 100);
    return () => clearTimeout(timeout);
  }, [pin]);

  const handlePinComplete = async (completedPin: string) => {
    if (mode === 'verify') {
      const stored = await SecureStore.getItemAsync(PIN_STORE_KEY);
      if (stored === completedPin) {
        onSuccess();
        navigation.goBack();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        shake();
        setPin('');
        if (newAttempts >= 5) {
          Alert.alert('Too many attempts', 'Please log out and try again.');
        }
      }
      return;
    }

    // mode === 'set'
    if (subStep === 'enter') {
      setFirstPin(completedPin);
      setSubStep('confirm');
      setPin('');
    } else {
      if (completedPin === firstPin) {
        await SecureStore.setItemAsync(PIN_STORE_KEY, completedPin);
        onSuccess();
        navigation.goBack();
      } else {
        shake();
        setPin('');
        setFirstPin('');
        setSubStep('enter');
        Alert.alert('Mismatch', 'PINs did not match. Please try again.');
      }
    }
  };

  const handleDigit = (digit: string) => {
    if (pin.length < PIN_LENGTH) setPin((p) => p + digit);
  };

  const handleDelete = () => setPin((p) => p.slice(0, -1));

  const headingText = () => {
    if (mode === 'verify') return 'Enter your PIN';
    return subStep === 'enter' ? 'Set a PIN' : 'Confirm your PIN';
  };

  const subText = () => {
    if (mode === 'verify') return attempts > 0 ? `Incorrect PIN. ${5 - attempts} attempts remaining.` : 'Enter your 4-digit security PIN';
    return subStep === 'enter' ? 'Choose a 4-digit PIN to protect your account' : 'Re-enter your PIN to confirm';
  };

  const KEYPAD = [
    ['1','2','3'],
    ['4','5','6'],
    ['7','8','9'],
    ['', '0','⌫'],
  ];

  return (
    <View style={styles.screen}>
      {/* Close button */}
      <TouchableOpacity style={styles.close} onPress={() => navigation.goBack()}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{headingText()}</Text>
      <Text style={[styles.sub, attempts > 0 && { color: Colors.danger }]}>
        {subText()}
      </Text>

      {/* PIN dots */}
      <Animated.View
        style={[styles.dots, { transform: [{ translateX: shakeAnim }] }]}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i < pin.length && styles.dotFilled]}
          />
        ))}
      </Animated.View>

      {/* Keypad */}
      <View style={styles.keypad}>
        {KEYPAD.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((key, ki) => {
              if (!key) return <View key={ki} style={styles.keyEmpty} />;
              return (
                <TouchableOpacity
                  key={ki}
                  style={styles.key}
                  onPress={() => key === '⌫' ? handleDelete() : handleDigit(key)}
                  activeOpacity={0.6}>
                  <Text style={key === '⌫' ? styles.deleteText : styles.keyText}>
                    {key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Progress indicator for set mode */}
      {mode === 'set' && (
        <View style={styles.progress}>
          <View style={[styles.progressDot, subStep === 'enter'   && styles.progressDotActive]} />
          <View style={[styles.progressDot, subStep === 'confirm' && styles.progressDotActive]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex:            1,
    backgroundColor: Colors.white,
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: Spacing.xl,
  },
  close:     { position: 'absolute', top: 60, right: Spacing.lg },
  closeText: { fontSize: FontSize.lg, color: Colors.gray400 },

  title: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.black, textAlign: 'center' },
  sub:   { fontSize: FontSize.sm,  color: Colors.gray400, textAlign: 'center', marginTop: 8, marginBottom: Spacing.xl },

  dots: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.xxl },
  dot: {
    width:        20,
    height:       20,
    borderRadius: 10,
    borderWidth:  2,
    borderColor:  Colors.primary,
    backgroundColor: 'transparent',
  },
  dotFilled: { backgroundColor: Colors.primary },

  keypad: { width: '100%', maxWidth: 320, gap: Spacing.md },
  row:    { flexDirection: 'row', justifyContent: 'center', gap: Spacing.md },

  key: {
    width:          80,
    height:         80,
    borderRadius:   40,
    backgroundColor: Colors.gray100,
    alignItems:     'center',
    justifyContent: 'center',
  },
  keyEmpty:   { width: 80, height: 80 },
  keyText:    { fontSize: FontSize.xl, fontWeight: '500', color: Colors.black },
  deleteText: { fontSize: FontSize.xl, color: Colors.gray500 },

  progress:        { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xl },
  progressDot:     { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.gray200 },
  progressDotActive:{ backgroundColor: Colors.primary },
});
