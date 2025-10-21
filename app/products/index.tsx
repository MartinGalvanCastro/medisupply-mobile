import React, { useState } from 'react';
import { FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Box,
  VStack,
  Text,
  Input,
  InputField,
  Spinner,
  Center,
} from '@gluestack-ui/themed';
import { ProductCard } from '@/components';
import { useDebounce } from '@/hooks';
import { useTranslation } from '@/i18n';

/**
 * Products list screen
 * TODO: Connect to API after running: yarn generate:api
 */
export default function ProductsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Mock data - replace with actual API call
  const isLoading = false;
  const products = [
    {
      id: '1',
      name: 'Medical Mask',
      description: 'Disposable surgical mask - Box of 50',
      price: 25.99,
      stock: 150,
    },
    {
      id: '2',
      name: 'Hand Sanitizer',
      description: 'Antibacterial hand sanitizer - 500ml',
      price: 12.99,
      stock: 200,
    },
    {
      id: '3',
      name: 'Thermometer',
      description: 'Digital infrared thermometer',
      price: 45.00,
      stock: 75,
    },
  ];

  const filteredProducts = debouncedSearch
    ? products.filter((p) =>
        p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : products;

  const handleProductPress = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  if (isLoading) {
    return (
      <Center flex={1}>
        <Spinner size="large" />
      </Center>
    );
  }

  return (
    <Box flex={1} bg="$backgroundLight50">
      <VStack space="md" p="$4">
        <Input variant="outline" size="md">
          <InputField
            placeholder={t('products.searchPlaceholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Input>
      </VStack>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Box px="$4">
            <ProductCard
              {...item}
              onPress={() => handleProductPress(item.id)}
            />
          </Box>
        )}
        ListEmptyComponent={
          <Center p="$8">
            <Text size="md" color="$textLight600">
              {t('products.noProductsFound')}
            </Text>
          </Center>
        }
      />
    </Box>
  );
}
