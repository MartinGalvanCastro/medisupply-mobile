import { useAuthStore } from '@/store';
import { Redirect } from 'expo-router';

export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
