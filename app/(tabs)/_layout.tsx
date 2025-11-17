import { useAuthStore } from '@/store';
import { getUserRole } from '@/utils/auth';
import { useAuth } from '@/providers/AuthProvider';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const user = useAuthStore((state) => state.user);
  const { isLoadingUser } = useAuth();
  const userRole = getUserRole(user);

  // Debug: Log user and role information
  console.log('[TabLayout] User:', user);
  console.log('[TabLayout] Role detected:', userRole);
  console.log('[TabLayout] Raw role from user:', user?.role);
  console.log('[TabLayout] Groups:', user?.groups);
  console.log('[TabLayout] isLoadingUser:', isLoadingUser);

  // Show loading screen while fetching user data
  if (isLoadingUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0284c7',
        headerShown: false,
      }}>
      {/* COMMON TABS */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color }) => <TabBarIcon name="shopping-basket" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color }) => <TabBarIcon name="shopping-cart" color={color} />,
        }}
      />

      {/* CLIENT-SPECIFIC TABS */}
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
          href: userRole === 'client' ? '/orders' : null,
        }}
      />

      {/* SELLER-SPECIFIC TABS */}
      <Tabs.Screen
        name="visits"
        options={{
          title: 'Visits',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
          href: userRole === 'seller' ? '/visits' : null,
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color }) => <TabBarIcon name="users" color={color} />,
          href: userRole === 'seller' ? '/clients' : null,
      
        }}
      />

      {/* ACCOUNT TAB - COMMON FOR ALL */}
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
