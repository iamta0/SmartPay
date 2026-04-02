import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Input }  from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { loginSchema } from '@/types';
import { signIn } from '@/services/authService';
import { Colors, FontSize, Spacing } from '@/utils/theme';
import type { AuthStackParamList } from '@/types';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();

  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError,  setApiError]  = useState('');

  const validate = () => {
    const result = loginSchema.safeParse({ email, password });
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

  const handleLogin = async () => {
    if (!validate()) return;
    setIsLoading(true);
    setApiError('');
    try {
      const result = await signIn(email.trim(), password);
      if (!result.success) {
        setApiError(result.error ?? 'Login failed. Please try again.');
      }
    } catch (e: any) {
      setApiError(e.message ?? 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <Text style={styles.emoji}>💸</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your SmartPay account</Text>
        </View>

        {apiError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxText}>{apiError}</Text>
          </View>
        ) : null}

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Min. 8 characters"
          secureTextEntry
          error={errors.password}
        />

        <Button
          label="Sign In"
          onPress={handleLogin}
          isLoading={isLoading}
          style={styles.btn}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.footerLink}>Sign up</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: Colors.white },
  content: { padding: Spacing.lg, paddingTop: 80 },

  header:   { alignItems: 'center', marginBottom: Spacing.xl },
  emoji:    { fontSize: 52, marginBottom: Spacing.sm },
  title:    { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.black },
  subtitle: { fontSize: FontSize.sm, color: Colors.gray500, marginTop: 4 },

  errorBox: {
    backgroundColor: Colors.dangerLight,
    borderRadius:    8,
    padding:         Spacing.md,
    marginBottom:    Spacing.md,
  },
  errorBoxText: { color: Colors.danger, fontSize: FontSize.sm, fontWeight: '500' },

  btn: { marginTop: Spacing.sm },

  footer:     { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  footerText: { fontSize: FontSize.sm, color: Colors.gray500 },
  footerLink: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700' },
});