// src/components/ui/Input.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardTypeOptions,
} from 'react-native';
import { Colors, Radius, FontSize, Spacing } from '@/utils/theme';

interface InputProps {
  label:            string;
  value:            string;
  onChangeText:     (text: string) => void;
  placeholder?:     string;
  error?:           string;
  hint?:            string;
  secureTextEntry?: boolean;
  keyboardType?:    KeyboardTypeOptions;
  autoCapitalize?:  'none' | 'sentences' | 'words' | 'characters';
  multiline?:       boolean;
  maxLength?:       number;
  editable?:        boolean;
  leftIcon?:        React.ReactNode;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  hint,
  secureTextEntry = false,
  keyboardType    = 'default',
  autoCapitalize  = 'none',
  multiline       = false,
  maxLength,
  editable        = true,
  leftIcon,
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused,    setIsFocused]    = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={[
        styles.wrapper,
        isFocused && styles.focused,
        !!error   && styles.errorBorder,
        !editable && styles.disabled,
      ]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, multiline && styles.multiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.gray400}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          maxLength={maxLength}
          editable={editable}
          autoCorrect={false}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            style={styles.toggle}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.toggleText}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {error  && <Text style={styles.error}>{error}</Text>}
      {!error && hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { marginBottom: Spacing.md },
  label:       { fontSize: FontSize.sm, fontWeight: '500', color: Colors.gray700, marginBottom: 6 },

  wrapper: {
    flexDirection:   'row',
    alignItems:      'center',
    borderWidth:     1.5,
    borderColor:     Colors.gray200,
    borderRadius:    Radius.md,
    backgroundColor: Colors.gray50,
    paddingHorizontal: Spacing.md,
  },
  focused:     { borderColor: Colors.primary, backgroundColor: '#FAFAFF' },
  errorBorder: { borderColor: Colors.danger },
  disabled:    { opacity: 0.6, backgroundColor: Colors.gray100 },

  leftIcon:    { marginRight: Spacing.sm },
  input:       { flex: 1, height: 50, fontSize: FontSize.base, color: Colors.black },
  multiline:   { height: 100, paddingTop: Spacing.md, textAlignVertical: 'top' },

  toggle:      { paddingLeft: Spacing.sm },
  toggleText:  { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '600' },

  error: { color: Colors.danger,  fontSize: FontSize.xs, marginTop: 4 },
  hint:  { color: Colors.gray400, fontSize: FontSize.xs, marginTop: 4 },
});
