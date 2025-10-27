import { StyleSheet, View } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';

export default function InventoryScreen() {
  return (
    <View style={styles.container}>
      <VStack space="lg" className="p-4">
        <Heading size="xl">Inventory</Heading>
        <Text size="sm" className="text-typography-500">
          Search for products across warehouses
        </Text>

        {/* Search Bar */}
        <Input variant="outline" size="md">
          <InputField placeholder="Search products..." />
        </Input>

        {/* Placeholder for product list */}
        <View className="mt-4 p-4 bg-gray-100 rounded-lg">
          <Text className="text-center text-typography-400">
            Product search will be implemented here
          </Text>
        </View>
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
