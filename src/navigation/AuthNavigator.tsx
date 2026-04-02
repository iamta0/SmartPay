import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen }  from '@/screens/auth/LoginScreen';
import { SignupScreen } from '@/screens/auth/SignupScreen';
import { Colors }       from '@/utils/theme';
import type { AuthStackParamList } from '@/types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown:       false,
        contentStyle:      { backgroundColor: Colors.white },
        animation:         'slide_from_right',
      }}>
      <Stack.Screen name="Login"  component={LoginScreen}  />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}