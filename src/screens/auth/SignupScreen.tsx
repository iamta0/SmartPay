// src/screens/auth/SignupScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { signUp } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input }  from '@/components/ui/Input';
import { signupSchema, type SignupInput } from '@/utils/validators';
import { Colors, FontSize, Spacing, Radius } from '@/utils/theme';
import type { AuthStackParamList } from '@/types';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Signup'> };

type FieldErrors = Partial<Record<keyof SignupInput, string>>;

export function SignupScreen({ navigation }: Props) {
  const { setUser } = useAuthStore();
  const [form, setForm] = useState<SignupInput>({
    email: '', password: '', displayName: '', username: '',
  });
  const [errors,    setErrors]    = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const update = (field: keyof SignupInput) => (value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSignup = async () => {
    const result = signupSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const err of result.error.errors) {
        const field = err.path[0] as keyof SignupInput;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);
    const res = await signUp(form.email, form.password, form.displayName, form.username);
    setIsLoading(false);
    if (res.success && res.data) {
      setUser(res.data);
    } else {
      Alert.alert('Sign Up Failed', res.error ?? 'Please try again.');
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

        <View style={styles.header}>
          <Text style={styles.logo}>💸</Text>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join SmartPay — it's free</Text>
        </View>

        <View style={styles.card}>
          <Input
            label="Full name"
            value={form.displayName}
            onChangeText={update('displayName')}
            placeholder="Ada Okafor"
            autoCapitalize="words"
            error={errors.displayName}
          />
          <Input
            label="Username"
            value={form.username}
            onChangeText={(v) => update('username')(v.toLowerCase())}
            placeholder="ada_okafor"
            hint="Lowercase letters, numbers, underscores only"
            error={errors.username}
          />
          <Input
            label="Email address"
            value={form.email}
            onChangeText={update('email')}
            placeholder="you@example.com"
            keyboardType="email-address"
            error={errors.email}
          />
          <Input
            label="Password"
            value={form.password}
            onChangeText={update('password')}
            placeholder="At least 8 characters"
            secureTextEntry
            error={errors.password}
          />
          <Button
            label="Create Account"
            onPress={handleSignup}
            isLoading={isLoading}
            style={styles.btn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:      { flex: 1, backgroundColor: Colors.gray50 },
  container: { flexGrow: 1, padding: Spacing.lg, paddingTop: Spacing.xl },

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

  footer:     { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: Colors.gray500, fontSize: FontSize.sm },
  link:       { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '700' },
});
