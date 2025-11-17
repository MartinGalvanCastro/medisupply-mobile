import React, { useState } from 'react';
import { StyleSheet, Alert, FlatList, TouchableOpacity, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';
import { CartItemCard } from '@/components/CartItemCard';
import { EmptyState } from '@/components/EmptyState';
import { BottomSheet } from '@/components/BottomSheet';
import { formatCurrency } from '@/utils/formatCurrency';
import { useTranslation } from '@/i18n/hooks';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ShoppingCart, User } from 'lucide-react-native';
import type { CartItem } from '@/store/useCartStore';
import { useListClientsBffSellersAppClientsGet } from '@/api/generated/sellers-app/sellers-app';
import { useCreateOrder } from '@/hooks/useCreateOrder';
import { useQueryClient } from '@tanstack/react-query';
import type { ClientResponse } from '@/api/generated/models/clientResponse';

export const CartScreen = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const userRole = useAuthStore((state) => state.user?.role);
  const isSeller = userRole === 'seller';

  const [selectedClient, setSelectedClient] = useState<ClientResponse | null>(null);
  const [showClientSelector, setShowClientSelector] = useState(false);

  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotal = useCartStore((state) => state.getTotal);

  const total = getTotal();
  const isEmpty = items.length === 0;

  // Fetch clients only for sellers
  const { data: clientsData } = useListClientsBffSellersAppClientsGet(undefined, {
    query: {
      enabled: isSeller, // Only fetch clients if user is a seller
      staleTime: 5 * 60 * 1000,
    },
  });

  const clients = clientsData?.items || [];

  // Use role-based create order hook
  const { mutate: createOrder, isPending } = useCreateOrder();

  const handleOrderSuccess = () => {
    // Invalidate orders query cache to trigger refetch
    queryClient.invalidateQueries({
      queryKey: ['orders'],
    });

    // Clear cart after successful order
    clearCart();
    setSelectedClient(null);

    // Show success toast
    toast.show({
      placement: 'top',
      duration: 3000,
      render: ({ id }) => {
        return (
          <Toast nativeID={id} action="success" variant="solid">
            <VStack space="xs">
              <ToastTitle>{t('cart.orderSuccess')}</ToastTitle>
              <ToastDescription>
                {t('cart.orderSuccessMessage')}
              </ToastDescription>
            </VStack>
          </Toast>
        );
      },
    });
  };

  const handleOrderError = () => {
    // Show error toast
    toast.show({
      placement: 'top',
      duration: 3000,
      render: ({ id }) => {
        return (
          <Toast nativeID={id} action="error" variant="solid">
            <VStack space="xs">
              <ToastTitle>{t('common.error')}</ToastTitle>
              <ToastDescription>
                {t('cart.orderError')}
              </ToastDescription>
            </VStack>
          </Toast>
        );
      },
    });
  };

  const handleQuantityChange = (inventoryId: string, quantity: number) => {
    updateQuantity(inventoryId, quantity);
  };

  const handleRemoveItem = (inventoryId: string) => {
    removeItem(inventoryId);
  };

  const handleClearCart = () => {
    Alert.alert(
      t('cart.clearCart'),
      t('cart.clearCartConfirmation'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('cart.clearCart'),
          style: 'destructive',
          onPress: () => clearCart(),
        },
      ]
    );
  };

  const handleCheckout = () => {
    // Check if client is selected (only for sellers)
    if (isSeller && !selectedClient) {
      Alert.alert(
        t('cart.selectClient'),
        t('cart.selectClientMessage'),
        [
          {
            text: t('common.ok'),
            onPress: () => setShowClientSelector(true),
          },
        ]
      );
      return;
    }

    Alert.alert(t('cart.checkout'), t('cart.checkoutMessage'), [
      {
        text: t('common.cancel'),
        style: 'cancel',
      },
      {
        text: t('cart.placeOrder'),
        onPress: () => {
          // Map cart items to OrderItemInput format
          const orderItems = items.map((item) => ({
            inventario_id: item.inventoryId,
            cantidad: item.quantity,
          }));

          // Create order via useCreateOrder hook
          // Hook automatically handles role-based mutations:
          // - Seller: sends customer_id (required)
          // - Client: customer_id extracted from JWT by backend
          createOrder(
            {
              customer_id: isSeller && selectedClient ? selectedClient.cliente_id : undefined,
              items: orderItems,
            },
            {
              onSuccess: handleOrderSuccess,
              onError: handleOrderError,
            }
          );
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <CartItemCard
      item={item}
      onQuantityChange={handleQuantityChange}
      onRemove={handleRemoveItem}
      testID={`cart-item-${item.inventoryId}`}
    />
  );

  const renderEmpty = () => (
    <EmptyState
      icon={ShoppingCart}
      title={t('cart.emptyState')}
      description={t('cart.emptyStateDescription')}
      testID="cart-empty-state"
    />
  );

  const renderFooter = () => {
    if (isEmpty) {
      return null;
    }

    return (
      <Box className="bg-white border-t border-background-200 p-4" testID="cart-footer">
        <VStack space="md">
          {/* Client Selection - Only for Sellers */}
          {isSeller && (
            <Box className="bg-background-50 rounded-lg p-4 border border-outline-200">
              <VStack space="sm">
                <Text size="sm" className="text-typography-700 font-semibold">
                  {t('cart.selectClient')}
                </Text>
                {selectedClient ? (
                  <HStack space="md" className="items-center justify-between">
                    <HStack space="sm" className="items-center flex-1">
                      <Box className="bg-primary-100 rounded-full p-2">
                        <User size={16} color="#7c3aed" />
                      </Box>
                      <VStack space="xs" className="flex-1">
                        <Text size="sm" className="text-typography-900 font-medium">
                          {selectedClient.representante}
                        </Text>
                        <Text size="xs" className="text-typography-600">
                          {selectedClient.nombre_institucion}
                        </Text>
                      </VStack>
                    </HStack>
                    <Button
                      size="sm"
                      variant="link"
                      onPress={() => setShowClientSelector(true)}
                      testID="change-client-button"
                    >
                      <ButtonText className="text-primary-600">
                        {t('common.change')}
                      </ButtonText>
                    </Button>
                  </HStack>
                ) : (
                  <Button
                    size="md"
                    variant="outline"
                    action="secondary"
                    onPress={() => setShowClientSelector(true)}
                    testID="select-client-button"
                  >
                    <User size={18} />
                    <ButtonText className="ml-2">{t('cart.chooseClient')}</ButtonText>
                  </Button>
                )}
              </VStack>
            </Box>
          )}

          {/* Total Section */}
          <Box className="bg-background-50 rounded-lg p-4">
            <HStack space="md" className="items-center justify-between">
              <VStack space="xs">
                <Text size="sm" className="text-typography-500">
                  {t('cart.totalItems', { count: items.length })}
                </Text>
                <Text size="xs" className="text-typography-500">
                  {t('cart.totalUnits', {
                    count: items.reduce((sum, item) => sum + item.quantity, 0),
                  })}
                </Text>
              </VStack>
              <VStack space="xs" className="items-end">
                <Text size="xs" className="text-typography-500">
                  {t('cart.total')}
                </Text>
                <Heading size="lg" className="text-typography-900">
                  {formatCurrency(total)}
                </Heading>
              </VStack>
            </HStack>
          </Box>

          {/* Action Buttons */}
          <VStack space="sm">
            <Button
              action="primary"
              size="lg"
              onPress={handleCheckout}
              isDisabled={isPending || (isSeller && !selectedClient)}
              testID="cart-checkout-button"
            >
              <ButtonText>
                {isPending ? t('cart.placingOrder') : t('cart.placeOrder')}
              </ButtonText>
            </Button>

            <Button
              action="secondary"
              size="md"
              variant="outline"
              onPress={handleClearCart}
              testID="cart-clear-button"
            >
              <ButtonText>{t('cart.clearCart')}</ButtonText>
            </Button>
          </VStack>
        </VStack>
      </Box>
    );
  };

  return (
    <SafeAreaView testID="cart-screen" style={styles.container}>
      <VStack space="lg" className="flex-1 px-4 py-2">
        <HStack space="md" className="items-center justify-between">
          <Heading size="2xl" className="text-typography-900">
            {t('cart.title')}
          </Heading>
          {!isEmpty && (
            <Box className="bg-primary-500 rounded-full px-3 py-1">
              <Text size="sm" className="text-white font-semibold" testID="cart-item-count">
                {items.length}
              </Text>
            </Box>
          )}
        </HStack>

        <Box className="flex-1">
          <FlashList
            data={items}
            renderItem={renderItem}
            ListEmptyComponent={renderEmpty}
            keyExtractor={(item) => item.inventoryId}
            testID="cart-list"
          />
        </Box>
      </VStack>

      {renderFooter()}

      {/* Client Selector Modal */}
      <Modal
        visible={showClientSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowClientSelector(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowClientSelector(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <VStack space="md" style={{ height: '100%' }}>
              {/* Modal Header */}
              <HStack space="md" className="items-center justify-between pb-4 border-b border-outline-200">
                <Heading size="lg">{t('cart.selectClient')}</Heading>
                <TouchableOpacity
                  onPress={() => setShowClientSelector(false)}
                  testID="close-client-selector"
                >
                  <Text className="text-primary-600 font-semibold">
                    {t('common.close')}
                  </Text>
                </TouchableOpacity>
              </HStack>

              {/* Clients List */}
              <FlatList
                data={clients}
                keyExtractor={(item) => item.cliente_id}
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedClient(item);
                      setShowClientSelector(false);
                    }}
                    testID={`client-option-${item.cliente_id}`}
                    style={styles.clientItem}
                  >
                    <HStack space="sm" className="items-center">
                      <Box className="bg-primary-100 rounded-full p-3">
                        <User size={20} color="#7c3aed" />
                      </Box>
                      <VStack space="xs" className="flex-1">
                        <Text size="md" className="text-typography-900 font-medium">
                          {item.representante}
                        </Text>
                        <Text size="sm" className="text-typography-600">
                          {item.nombre_institucion}
                        </Text>
                        {item.ciudad && (
                          <Text size="xs" className="text-typography-500">
                            {item.ciudad}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Box className="p-8 items-center">
                    <Text className="text-typography-600 text-center">
                      {t('clients.emptyState')}
                    </Text>
                  </Box>
                }
              />
            </VStack>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    height: '80%',
  },
  clientItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
});
