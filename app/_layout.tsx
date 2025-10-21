import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { queryClient } from '@/api';
import { GluestackProvider, I18nProvider } from '@/providers';

/**
 * Root layout component with providers
 */
export default function RootLayout() {
  return (
    <I18nProvider>
      <GluestackProvider>
        <QueryClientProvider client={queryClient}>
        <StatusBar style="auto" />
        <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'MediSupply',
          }}
        />
        <Stack.Screen
          name="products/index"
          options={{
            title: 'Products',
          }}
        />
        <Stack.Screen
          name="products/[id]"
          options={{
            title: 'Product Details',
          }}
        />
      </Stack>
    </QueryClientProvider>
      </GluestackProvider>
    </I18nProvider>
  );
}
