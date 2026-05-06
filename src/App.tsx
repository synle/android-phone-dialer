import React, { useEffect } from 'react';
import { StatusBar, Alert, Pressable, Text, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DialPadScreen } from './screens/DialPadScreen';
import { ContactsScreen } from './screens/ContactsScreen';
import { CallLogsScreen } from './screens/CallLogsScreen';
import { usePermissions } from './hooks/usePermissions';
import { useDialerRole } from './hooks/useDialerRole';
import { Colors, Typography } from './core/theme';
import type { RootTabParamList } from './core/types';

const Tab = createBottomTabNavigator<RootTabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    'Dial Pad': '\u260E',  // ☎
    Contacts: '\u{1F464}', // 👤
    Recents: '\u{1F4CB}',  // 📋
  };

  return (
    <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      {icons[label] || '\u2022'}
    </Text>
  );
}

function DefaultDialerBanner() {
  const { isDefault, requestRole } = useDialerRole();

  if (isDefault) return null;

  return (
    <Pressable style={styles.banner} onPress={requestRole}>
      <Text style={styles.bannerText}>
        Tap to set as default dialer for full functionality
      </Text>
    </Pressable>
  );
}

export default function App() {
  const { hasChecked, allGranted, requestAll } = usePermissions();

  // Request permissions on first launch
  useEffect(() => {
    if (hasChecked && !allGranted) {
      // Delay slightly so the UI is rendered before showing permission dialogs
      const timer = setTimeout(() => {
        requestAll();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasChecked, allGranted, requestAll]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <DefaultDialerBanner />
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarActiveTintColor: Colors.primary,
              tabBarInactiveTintColor: Colors.textTertiary,
              tabBarStyle: styles.tabBar,
              tabBarLabelStyle: styles.tabBarLabel,
              tabBarIcon: ({ focused }) => (
                <TabIcon label={route.name === 'CallLogs' ? 'Recents' : route.name} focused={focused} />
              ),
            })}
            initialRouteName="DialPad">
            <Tab.Screen
              name="DialPad"
              component={DialPadScreen}
              options={{ tabBarLabel: 'Dial Pad' }}
            />
            <Tab.Screen
              name="Contacts"
              component={ContactsScreen}
              options={{ tabBarLabel: 'Contacts' }}
            />
            <Tab.Screen
              name="CallLogs"
              component={CallLogsScreen}
              options={{ tabBarLabel: 'Recents' }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: Colors.background,
    borderTopColor: Colors.divider,
    elevation: 8,
    height: 56,
    paddingBottom: 4,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  tabIconFocused: {
    opacity: 1,
  },
  banner: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
});
