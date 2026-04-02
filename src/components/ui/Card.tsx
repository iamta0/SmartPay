// src/components/ui/Card.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '@/utils/theme';

interface CardProps {
  children: React.ReactNode;
  style?:   ViewStyle;
  padding?: number;
}

export function Card({ children, style, padding = Spacing.lg }: CardProps) {
  return (
    <View style={[styles.card, { padding }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius:    Radius.lg,
    shadowColor:     '#000',
    shadowOpacity:   0.06,
    shadowRadius:    12,
    shadowOffset:    { width: 0, height: 4 },
    elevation:       3,
  },
});
