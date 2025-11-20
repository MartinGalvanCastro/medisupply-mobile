import React, { useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';
import { CartItemCard } from '@/components/CartItemCard';
import { CartFooter } from '@/components/CartFooter';
import { EmptyState } from '@/components/EmptyState';
import { ClientSelectorModal } from '@/components/ClientSelectorModal';
import { useTranslation } from '@/i18n/hooks';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ShoppingCart } from 'lucide-react-native';
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

  /* istanbul ignore next */
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

  const handleCheckout = () => {
    Alert.alert(t('cart.checkout'), t('cart.checkoutMessage'), [
      {
        text: t('common.cancel'),
        style: 'cancel',
      },
      {
        text: t('cart.confirmOrder'),
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
            testID="cart-item-list"
          />
        </Box>
      </VStack>

      {!isEmpty && (
        <CartFooter
          items={items}
          total={total}
          isSeller={isSeller}
          selectedClient={selectedClient}
          isPending={isPending}
          onSelectClient={() => setShowClientSelector(true)}
          onCheckout={handleCheckout}
          onClearCart={clearCart}
          testID="cart-footer"
        />
      )}

      <ClientSelectorModal
        visible={showClientSelector}
        onClose={() => setShowClientSelector(false)}
        clients={clients}
        onSelectClient={(client) => {
          setSelectedClient(client);
          setShowClientSelector(false);
        }}
        testID="client-selector-modal"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
