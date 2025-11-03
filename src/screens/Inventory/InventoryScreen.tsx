import React, { useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { SearchBar } from '@/components/SearchBar';
import { ProductCard } from '@/components/ProductCard';
import { useTranslation } from '@/i18n/hooks';
import { useInventory } from '@/api/useInventory';
import { useCartStore } from '@/store/useCartStore';
import { AddToCartModal } from './AddToCartModal';
import type { MockInventory } from '@/api/mocks/inventory';

export const InventoryScreen = () => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<MockInventory | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { data, isLoading, error } = useInventory({
    search: debouncedSearch,
  });

  const addItem = useCartStore((state) => state.addItem);

  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

  const handleDebouncedChange = (text: string) => {
    setDebouncedSearch(text);
  };

  const handleProductPress = (item: MockInventory) => {
    if (item.available_quantity > 0) {
      setSelectedProduct(item);
      setModalVisible(true);
    }
  };

  const handleAddToCart = (quantity: number) => {
    if (!selectedProduct) {
      return;
    }

    addItem(
      {
        inventoryId: selectedProduct.id,
        productId: selectedProduct.product_id,
        productName: selectedProduct.product.name,
        productSku: selectedProduct.product.sku,
        productPrice: selectedProduct.price,
        warehouseName: selectedProduct.warehouse_name,
        availableQuantity: selectedProduct.available_quantity,
      },
      quantity
    );

    setModalVisible(false);
    setSelectedProduct(null);

    Alert.alert(
      t('inventory.addedToCart'),
      t('inventory.addedToCartMessage', {
        quantity,
        productName: selectedProduct.product.name,
      })
    );
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
  };

  const renderProduct = ({ item }: { item: MockInventory }) => {
    const productData = {
      id: item.id,
      name: item.product.name,
      sku: item.product.sku,
      description: item.product.description,
      category: item.product.category,
      manufacturer: item.product.manufacturer,
      warehouseName: item.warehouse_name,
      availableQuantity: item.available_quantity,
      price: item.price,
    };

    return (
      <ProductCard
        product={productData}
        onPress={() => handleProductPress(item)}
        testID={`product-card-${item.id}`}
      />
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <Box className="flex-1 justify-center items-center p-8">
          <Text className="text-typography-600 text-center">
            {t('inventory.loadingProducts')}
          </Text>
        </Box>
      );
    }

    if (error) {
      return (
        <Box className="flex-1 justify-center items-center p-8">
          <Text className="text-typography-600 text-center">{t('common.error')}</Text>
        </Box>
      );
    }

    return (
      <Box className="flex-1 justify-center items-center p-8">
        <Text className="text-typography-900 text-lg font-semibold mb-2">
          {t('inventory.emptyState')}
        </Text>
        <Text className="text-typography-600 text-center">
          {t('inventory.emptyStateDescription')}
        </Text>
      </Box>
    );
  };

  return (
    <SafeAreaView testID="inventory-screen" style={styles.container}>
      <VStack space="lg" className="flex-1 px-4 py-2">
        <Heading size="2xl" className="text-typography-900">
          {t('inventory.title')}
        </Heading>

        <SearchBar
          value={searchText}
          onChangeText={handleSearchChange}
          onDebouncedChange={handleDebouncedChange}
          placeholder={t('inventory.searchPlaceholder')}
          testID="inventory-search-bar"
        />

        <Box className="flex-1">
          <FlashList
            data={data || []}
            renderItem={renderProduct}
            ListEmptyComponent={renderEmpty}
            keyExtractor={(item) => item.id}
            testID="inventory-list"
          />
        </Box>
      </VStack>

      <AddToCartModal
        visible={modalVisible}
        product={
          selectedProduct
            ? {
                id: selectedProduct.id,
                name: selectedProduct.product.name,
                sku: selectedProduct.product.sku,
                price: selectedProduct.price,
                availableQuantity: selectedProduct.available_quantity,
                warehouseName: selectedProduct.warehouse_name,
              }
            : null
        }
        onClose={handleCloseModal}
        onAddToCart={handleAddToCart}
        testID="inventory-add-to-cart-modal"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
