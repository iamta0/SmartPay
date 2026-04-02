// src/screens/SplashScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Colors, FontSize } from '@/utils/theme';

export function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scale,   { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
    ]).start();
  }, []);

  return (
    <View style={styles.screen}>
      <Animated.View style={[styles.logoBox, { opacity, transform: [{ scale }] }]}>
        <Text style={styles.emoji}>💸</Text>
        <Text style={styles.wordmark}>SmartPay</Text>
        <Text style={styles.tagline}>Fast · Secure · Simple</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:    { flex: 1, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  logoBox:   { alignItems: 'center' },
  emoji:     { fontSize: 64, marginBottom: 12 },
  wordmark:  { fontSize: 38, fontWeight: '800', color: Colors.white, letterSpacing: -1 },
  tagline:   { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 8, letterSpacing: 1 },
});
