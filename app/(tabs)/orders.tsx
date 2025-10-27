import { StyleSheet, View, ScrollView } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';

export default function OrdersScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <VStack space="lg" className="p-4">
          <Heading size="xl">Pending Orders</Heading>
          <Text size="sm" className="text-typography-500">
            View and track your orders
          </Text>

          {/* Placeholder for orders list */}
          <View className="mt-4 p-4 bg-gray-100 rounded-lg">
            <Text className="text-center text-typography-400">
              No pending orders
            </Text>
          </View>
        </VStack>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
});
