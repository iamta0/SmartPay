// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { signIn } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input }  from '@/components/ui/Input';
import { loginSchema } from '@/utils/validators';
import { Colors, FontSize, Spacing, Radius } from '@/utils/theme';
import type { AuthStackParamList } from '@/types';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'> };

export function LoginScreen({ navigation }: Props) {
  const { setUser } = useAuthStore();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [errors,   setErrors]   = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      for (const err of result.error.errors) {
        const field = err.path[0] as keyof typeof errors;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);
    const res = await signIn(email, password);
    setIsLoading(false);
    if (res.success && res.data) {
      setUser(res.data);
    } else {
      Alert.alert('Sign In Failed', res.error ?? 'Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>💸</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your SmartPay account</Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <Input
            label="Email address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
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
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.link}>Create one</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:      { flex: 1, backgroundColor: Colors.gray50 },
  container: { flexGrow: 1, padding: Spacing.lg, justifyContent: 'center' },

  header:   { alignItems: 'center', marginBottom: Spacing.xl },
  logo:     { fontSize: 56, marginBottom: Spacing.md },
  title:    { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.black, letterSpacing: -0.5 },
  subtitle: { fontSize: FontSize.md, color: Colors.gray500, marginTop: 6 },

  card: {
    backgroundColor: Colors.white,
    borderRadius:    Radius.xl,
    padding:         Spacing.lg,
    shadowColor:     '#000',
    shadowOpacity:   0.06,
    shadowRadius:    16,
    shadowOffset:    { width: 0, height: 4 },
    elevation:       3,
    marginBottom:    Spacing.lg,
  },
  btn: { marginTop: Spacing.sm },

  footer:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: Colors.gray500, fontSize: FontSize.sm },
  link:       { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '700' },
});
