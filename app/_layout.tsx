import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '@/../global.css';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { AuthProvider, GlobalLoadingProvider, I18nProvider, QueryClientProvider, ToastProvider } from '@/providers';
import { AblyProvider } from '@/providers/AblyProvider';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider>
        <I18nProvider>
          <GluestackUIProvider mode="light">
            <ToastProvider>
              <GlobalLoadingProvider>
                <AuthProvider>
                  <AblyProvider>
                    <ThemeProvider value={DefaultTheme}>
                      <Stack screenOptions={{ headerShown: false }}>
                       <Stack.Screen name="login" />
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="client/[clientId]" />
                        <Stack.Screen name="visit/[visitId]" />
                        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
                      </Stack>
                    </ThemeProvider>
                  </AblyProvider>
                </AuthProvider>
              </GlobalLoadingProvider>
            </ToastProvider>
          </GluestackUIProvider>
        </I18nProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
