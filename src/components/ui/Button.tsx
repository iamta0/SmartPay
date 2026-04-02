// src/components/ui/Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Radius, FontSize } from '@/utils/theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps {
  label:      string;
  onPress:    () => void;
  variant?:   Variant;
  isLoading?: boolean;
  disabled?:  boolean;
  style?:     ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant   = 'primary',
  isLoading = false,
  disabled  = false,
  style,
  textStyle,
  fullWidth = true,
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}>
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? Colors.white : Colors.primary}
          size="small"
        />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height:          52,
    borderRadius:    Radius.md,
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: 24,
  },
  fullWidth:     { width: '100%' },
  primary:       { backgroundColor: Colors.primary },
  secondary:     { backgroundColor: Colors.gray100, borderWidth: 1, borderColor: Colors.gray200 },
  danger:        { backgroundColor: Colors.dangerLight },
  ghost:         { backgroundColor: 'transparent' },
  disabled:      { opacity: 0.5 },

  text:          { fontSize: FontSize.base, fontWeight: '600' },
  primaryText:   { color: Colors.white },
  secondaryText: { color: Colors.black },
  dangerText:    { color: Colors.danger },
  ghostText:     { color: Colors.primary },
});
