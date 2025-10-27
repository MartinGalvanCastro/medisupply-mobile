import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { useAuthStore } from '@/store';
import { useAuth } from '@/providers';

export default function AccountScreen() {
  const { logout } = useAuth();
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <VStack space="lg" className="p-4">
        <Heading size="xl">Account</Heading>

        {/* User Info */}
        <View className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
          <Text className="text-lg font-semibold mb-2">{user?.name || 'User'}</Text>
          <Text className="text-sm text-typography-500 mb-1">{user?.email}</Text>
          <Text className="text-sm text-typography-500 capitalize">Role: {user?.role || 'N/A'}</Text>
        </View>

        {/* Logout Button */}
        <Button onPress={handleLogout} action="negative" className="mt-6">
          <ButtonText>Logout</ButtonText>
        </Button>
      </VStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
