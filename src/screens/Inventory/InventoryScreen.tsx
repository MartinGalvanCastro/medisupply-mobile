import { getInventoriesBffInventoriesGet } from '@/api/generated/common/common';
import type { CommonSchemasInventoryResponse } from '@/api/generated/models';
import { BottomSheet } from '@/components/BottomSheet';
import { PaginatedList } from '@/components/PaginatedList';
import { ProductCard } from '@/components/ProductCard';
import { SearchBar } from '@/components/SearchBar';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { useInfinitePaginatedQuery } from '@/hooks';
import { useTranslation } from '@/i18n/hooks';
import { useCartStore } from '@/store/useCartStore';
import { Filter, PackageOpen } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { AddToCartModal } from './AddToCartModal';

type FilterType = 'name' | 'sku';

export const InventoryScreen = () => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('name');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<CommonSchemasInventoryResponse | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Use infinite pagination hook
  const query = useInfinitePaginatedQuery<CommonSchemasInventoryResponse>({
    queryKey: [
      'inventories',
      {
        name: filterType === 'name' ? debouncedSearch : undefined,
        sku: filterType === 'sku' ? debouncedSearch : undefined,
      },
    ],
    queryFn: ({ offset, limit }) =>
      getInventoriesBffInventoriesGet({
        offset,
        limit,
        name: filterType === 'name' ? debouncedSearch || undefined : undefined,
        sku: filterType === 'sku' ? debouncedSearch || undefined : undefined,
      }),
    extractItems: (response) => response.items,
    extractTotal: (response) => response.total,
    hasNextPage: (response) => response.has_next ?? false,
    pageSize: 20,
    staleTime: 5 * 60 * 1000,
  });

  const addItem = useCartStore((state) => state.addItem);

  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

  const handleDebouncedChange = (text: string) => {
    setDebouncedSearch(text);
  };

  const handleFilterSelect = (selected: string) => {
    setFilterType(selected as FilterType);
    setShowFilterModal(false);
  };

  const getFilterLabel = () => {
    switch (filterType) {
      case 'name':
        return t('inventory.filterByName');
      case 'sku':
        return t('inventory.filterBySKU');
    }
  };

  const getSearchPlaceholder = () => {
    switch (filterType) {
      case 'name':
        return t('inventory.searchByName');
      case 'sku':
        return t('inventory.searchBySKU');
    }
  };

  const handleProductPress = (item: CommonSchemasInventoryResponse) => {
    const availableQuantity = item.total_quantity - item.reserved_quantity;
    /* istanbul ignore next */
    if (availableQuantity <= 0) {
      return;
    }
    setSelectedProduct(item);
    setModalVisible(true);
  };

  const handleAddToCart = (quantity: number) => {
    const availableQuantity =
      selectedProduct!.total_quantity - selectedProduct!.reserved_quantity;

    addItem(
      {
        inventoryId: selectedProduct!.id,
        productId: selectedProduct!.product_id,
        productName: selectedProduct!.product_name,
        productSku: selectedProduct!.product_sku,
        productPrice: selectedProduct!.product_price,
        warehouseName: selectedProduct!.warehouse_name,
        availableQuantity: availableQuantity,
      },
      quantity
    );

    setModalVisible(false);
    setSelectedProduct(null);

    Alert.alert(
      t('inventory.addedToCart'),
      t('inventory.addedToCartMessage', {
        quantity,
        productName: selectedProduct!.product_name,
      })
    );
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
  };

  const renderProduct = ({ item }: { item: CommonSchemasInventoryResponse }) => {
    const availableQuantity = item.total_quantity - item.reserved_quantity;
    const productData = {
      id: item.id,
      name: item.product_name,
      sku: item.product_sku,
      category: item.product_category || '',
      warehouseName: item.warehouse_name,
      availableQuantity: availableQuantity,
      price: item.product_price,
    };

    return (
      <ProductCard
        product={productData}
        onPress={() => handleProductPress(item)}
        testID={`product-card-${item.id}`}
      />
    );
  };

  return (
    <>
      <PaginatedList.Container
        query={query}
        title={t('inventory.title')}
        testID="inventory-screen"
      >
        <PaginatedList.Header>
          <HStack space="sm" className="items-center">
            <Box className="flex-1">
              <SearchBar
                value={searchText}
                onChangeText={handleSearchChange}
                onDebouncedChange={handleDebouncedChange}
                placeholder={getSearchPlaceholder()}
                testID="inventory-search-bar"
              />
            </Box>
            <Button
              size="sm"
              variant="outline"
              action="secondary"
              onPress={() => setShowFilterModal(true)}
              testID="inventory-filter-button"
              className="border-outline-500"
            >
              <Filter size={16} color="#6B7280" />
              <ButtonText className="ml-2 text-typography-900">
                {getFilterLabel()}
              </ButtonText>
            </Button>
          </HStack>
        </PaginatedList.Header>

        <PaginatedList.Content
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          testID="inventory-product-list"
          loadingMessage={t('inventory.loadingProducts')}
          loadingTestID="inventory-loading"
          errorTestID="inventory-error"
          footerLoadingMessage={t('inventory.loadingMore')}
          footerLoadingTestID="inventory-loading-more"
          ListEmptyComponent={
            <PaginatedList.Empty
              icon={PackageOpen}
              title={t('inventory.emptyState')}
              description={t('inventory.emptyStateDescription')}
              testID="inventory-empty-state"
            />
          }
          estimatedItemSize={120}
        />
      </PaginatedList.Container>

      <AddToCartModal
        visible={modalVisible}
        product={
          selectedProduct
            ? {
                id: selectedProduct.id,
                name: selectedProduct.product_name,
                sku: selectedProduct.product_sku,
                price: selectedProduct.product_price,
                availableQuantity:
                  selectedProduct.total_quantity - selectedProduct.reserved_quantity,
                warehouseName: selectedProduct.warehouse_name,
              }
            : null
        }
        onClose={handleCloseModal}
        onAddToCart={handleAddToCart}
        testID="add-to-cart-modal"
      />

      <BottomSheet
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title={t('inventory.filterBy')}
        options={[
          {
            label: t('inventory.filterByName'),
            value: 'name',
          },
          {
            label: t('inventory.filterBySKU'),
            value: 'sku',
          },
        ]}
        selectedValue={filterType}
        onSelect={handleFilterSelect}
        testID="filter-type-modal"
      />
    </>
  );
};
