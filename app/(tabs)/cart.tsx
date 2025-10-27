import { StyleSheet, View, ScrollView } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';

export default function CartScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <VStack space="lg" className="p-4">
          <Heading size="xl">Shopping Cart</Heading>
          <Text size="sm" className="text-typography-500">
            Review items and create an order
          </Text>

          {/* Placeholder for cart items */}
          <View className="mt-4 p-4 bg-gray-100 rounded-lg">
            <Text className="text-center text-typography-400">
              Your cart is empty
            </Text>
          </View>

          {/* Subtotal */}
          <View className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
            <Text className="text-lg font-semibold">Subtotal: $0.00</Text>
          </View>

          {/* Create Order Button */}
          <Button action="primary" className="mt-4" isDisabled={true}>
            <ButtonText>Create Order</ButtonText>
          </Button>
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
