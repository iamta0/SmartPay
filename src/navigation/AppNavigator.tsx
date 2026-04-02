// src/navigation/AppNavigator.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen }               from '@/screens/home/HomeScreen';
import { SendMoneyScreen }          from '@/screens/send/SendMoneyScreen';
import { ReceiveMoneyScreen }       from '@/screens/receive/ReceiveMoneyScreen';
import { TransactionHistoryScreen } from '@/screens/history/TransactionHistoryScreen';
import { ProfileScreen }            from '@/screens/profile/ProfileScreen';
import { Colors, FontSize }         from '@/utils/theme';
import type { AppTabParamList }     from '@/types';

const Tab = createBottomTabNavigator<AppTabParamList>();

// Tab icon map — swap emoji for expo/vector-icons when ready
const ICONS: Record<keyof AppTabParamList, string> = {
  Home:    '🏠',
  Send:    '↑',
  Receive: '↓',
  History: '📋',
  Profile: '👤',
};

function TabIcon({ name, focused }: { name: keyof AppTabParamList; focused: boolean }) {
  const isSend    = name === 'Send';
  const isReceive = name === 'Receive';
  const isAction  = isSend || isReceive;

  if (isAction) {
    return (
      <View style={[styles.actionIcon, focused && styles.actionIconFocused]}>
        <Text style={[styles.actionIconText, focused && styles.actionIconTextFocused]}>
          {ICONS[name]}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.normalIcon}>
      <Text style={[styles.normalIconText, focused && styles.normalIconFocused]}>
        {ICONS[name]}
      </Text>
    </View>
  );
}

export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor:   Colors.primary,
        tabBarInactiveTintColor: Colors.gray400,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name as keyof AppTabParamList} focused={focused} />
        ),
      })}>
      <Tab.Screen name="Home"    component={HomeScreen}               options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Send"    component={SendMoneyScreen}          options={{ tabBarLabel: 'Send' }} />
      <Tab.Screen name="Receive" component={ReceiveMoneyScreen}       options={{ tabBarLabel: 'Receive' }} />
      <Tab.Screen name="History" component={TransactionHistoryScreen} options={{ tabBarLabel: 'History' }} />
      <Tab.Screen name="Profile" component={ProfileScreen}            options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopColor:  Colors.gray100,
    borderTopWidth:  1,
    height:          80,
    paddingBottom:   20,
    paddingTop:      8,
  },
  tabLabel: { fontSize: FontSize.xs, fontWeight: '500' },

  normalIcon:       { alignItems: 'center', justifyContent: 'center' },
  normalIconText:   { fontSize: 20, color: Colors.gray400 },
  normalIconFocused:{ color: Colors.primary },

  actionIcon: {
    width:          40,
    height:         40,
    borderRadius:   12,
    backgroundColor: Colors.gray100,
    alignItems:     'center',
    justifyContent: 'center',
  },
  actionIconFocused:    { backgroundColor: Colors.primaryLight },
  actionIconText:       { fontSize: 18, color: Colors.gray400 },
  actionIconTextFocused:{ color: Colors.primary },
});
