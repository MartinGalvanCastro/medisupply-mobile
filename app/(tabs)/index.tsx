import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { useAuthStore } from '@/store';
import { useAuth } from '@/providers';

export default function TabOneScreen() {
  const { logout } = useAuth();
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <VStack space="lg" className="items-center">
        <Heading size="xl">Tab One</Heading>
        <Text size="md" className="text-typography-500">
          Welcome, {user?.name || 'User'}!
        </Text>
        <Button onPress={handleLogout} action="secondary" className="mt-4">
          <ButtonText>Logout</ButtonText>
        </Button>
      </VStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
