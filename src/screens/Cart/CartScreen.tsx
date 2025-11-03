import React, { useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
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
import { formatCurrency } from '@/utils/formatCurrency';
import { useTranslation } from '@/i18n/hooks';
import { useCartStore } from '@/store/useCartStore';
import { ShoppingCart } from 'lucide-react-native';
import type { CartItem } from '@/store/useCartStore';

export const CartScreen = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotal = useCartStore((state) => state.getTotal);

  const total = getTotal();
  const isEmpty = items.length === 0;

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
    Alert.alert(t('cart.checkout'), t('cart.checkoutMessage'), [
      {
        text: t('common.cancel'),
        style: 'cancel',
      },
      {
        text: t('cart.placeOrder'),
        onPress: async () => {
          setIsPlacingOrder(true);

          try {
            // TODO: Implement actual order API call
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Clear cart after successful order
            clearCart();

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
          } catch (error) /* istanbul ignore next */ {
            // Show error toast
            // Note: This catch block is covered by istanbul ignore because the simulated
            // API call (setTimeout) doesn't throw errors in the current implementation.
            // In production, this would catch real API errors.
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
          } finally {
            setIsPlacingOrder(false);
          }
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
    <Box className="flex-1 justify-center items-center p-8" testID="cart-empty-state">
      <Box className="bg-background-50 rounded-full p-6 mb-4">
        <ShoppingCart size={48} color="#9ca3af" />
      </Box>
      <Heading size="lg" className="text-typography-900 mb-2">
        {t('cart.emptyState')}
      </Heading>
      <Text className="text-typography-600 text-center">
        {t('cart.emptyStateDescription')}
      </Text>
    </Box>
  );

  const renderFooter = () => {
    if (isEmpty) {
      return null;
    }

    return (
      <Box className="bg-white border-t border-background-200 p-4" testID="cart-footer">
        <VStack space="md">
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
              isDisabled={isPlacingOrder}
              testID="cart-checkout-button"
            >
              <ButtonText>
                {isPlacingOrder ? t('cart.placingOrder') : t('cart.placeOrder')}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
