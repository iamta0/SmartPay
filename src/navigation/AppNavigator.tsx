import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { HomeScreen }                from '@/screens/home/HomeScreen';
import { SendMoneyScreen }           from '@/screens/send/SendMoneyScreen';
import { ReceiveMoneyScreen }        from '@/screens/receive/ReceiveMoneyScreen';
import { TransactionHistoryScreen }  from '@/screens/history/TransactionHistoryScreen';
import { ProfileScreen }             from '@/screens/profile/ProfileScreen';
import { Colors, FontSize }          from '@/utils/theme';
import type { AppTabParamList }      from '@/types';

const Tab = createBottomTabNavigator<AppTabParamList>();

const TABS: {
  name:  keyof AppTabParamList;
  emoji: string;
  label: string;
}[] = [
  { name: 'Home',    emoji: '🏠', label: 'Home'    },
  { name: 'Send',    emoji: '↑',  label: 'Send'    },
  { name: 'Receive', emoji: '↓',  label: 'Receive' },
  { name: 'History', emoji: '📋', label: 'History' },
  { name: 'Profile', emoji: '👤', label: 'Profile' },
];

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Text style={styles.emoji}>{emoji}</Text>
    </View>
  );
}

export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown:     false,
        tabBarShowLabel: true,
        tabBarStyle:     styles.tabBar,
        tabBarActiveTintColor:   Colors.primary,
        tabBarInactiveTintColor: Colors.gray400,
        tabBarLabelStyle:        styles.tabLabel,
      }}>

      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="Send"
        component={SendMoneyScreen}
        options={{
          tabBarLabel: 'Send',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="↑" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="Receive"
        component={ReceiveMoneyScreen}
        options={{
          tabBarLabel: 'Receive',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="↓" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="History"
        component={TransactionHistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📋" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" focused={focused} />
          ),
        }}
      />

    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor:  Colors.white,
    borderTopWidth:   1,
    borderTopColor:   Colors.gray100,
    height:           64,
    paddingBottom:    8,
    paddingTop:       6,
    elevation:        8,
    shadowColor:      '#000',
    shadowOpacity:    0.06,
    shadowRadius:     8,
  },
  iconWrap: {
    width:          36,
    height:         36,
    alignItems:     'center',
    justifyContent: 'center',
    borderRadius:   18,
  },
  iconWrapActive: {
    backgroundColor: Colors.primaryLight,
  },
  emoji:    { fontSize: 18 },
  tabLabel: { fontSize: FontSize.xs, fontWeight: '600' },
});