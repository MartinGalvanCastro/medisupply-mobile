import React from 'react';
import { ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  ButtonText,
  Card,
  Spinner,
  Center,
} from '@gluestack-ui/themed';

/**
 * Product detail screen
 * TODO: Connect to API after running: yarn generate:api
 */
export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Mock data - replace with actual API call
  const isLoading = false;
  const product = {
    id,
    name: 'Medical Mask',
    description: 'High-quality disposable surgical mask. Box contains 50 masks.',
    price: 25.99,
    stock: 150,
    sku: 'MED-MASK-001',
    provider: 'MediCorp Inc.',
  };

  if (isLoading) {
    return (
      <Center flex={1}>
        <Spinner size="large" />
      </Center>
    );
  }

  if (!product) {
    return (
      <Center flex={1}>
        <Text size="md">Product not found</Text>
      </Center>
    );
  }

  return (
    <ScrollView>
      <Box p="$6" bg="$backgroundLight50">
        <Card size="md" variant="elevated">
          <VStack space="lg">
            <VStack space="xs">
              <Heading size="xl">{product.name}</Heading>
              <Text size="sm" color="$textLight600">
                SKU: {product.sku}
              </Text>
            </VStack>

            <VStack space="sm">
              <Heading size="md">Description</Heading>
              <Text size="md">{product.description}</Text>
            </VStack>

            <VStack space="sm">
              <Heading size="md">Details</Heading>
              <HStack justifyContent="space-between">
                <Text size="md" color="$textLight600">
                  Price:
                </Text>
                <Text size="md" fontWeight="$bold" color="$primary500">
                  ${product.price.toFixed(2)}
                </Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text size="md" color="$textLight600">
                  Stock:
                </Text>
                <Text size="md">{product.stock} units</Text>
              </HStack>
              <HStack justifyContent="space-between">
                <Text size="md" color="$textLight600">
                  Provider:
                </Text>
                <Text size="md">{product.provider}</Text>
              </HStack>
            </VStack>

            <VStack space="md" mt="$2">
              <Button>
                <ButtonText>Add to Order</ButtonText>
              </Button>
              <Button variant="outline">
                <ButtonText>View Inventory</ButtonText>
              </Button>
            </VStack>
          </VStack>
        </Card>
      </Box>
    </ScrollView>
  );
}
