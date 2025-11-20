import React from 'react';
import { Alert } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { User } from 'lucide-react-native';
import { formatCurrency } from '@/utils/formatCurrency';
import { useTranslation } from '@/i18n/hooks';
import type { CartItem } from '@/store/useCartStore';
import type { ClientResponse } from '@/api/generated/models/clientResponse';

export interface CartFooterProps {
  items: CartItem[];
  total: number;
  isSeller: boolean;
  selectedClient: ClientResponse | null;
  isPending: boolean;
  onSelectClient: () => void;
  onCheckout: () => void;
  onClearCart: () => void;
  testID?: string;
}

export const CartFooter = ({
  items,
  total,
  isSeller,
  selectedClient,
  isPending,
  onSelectClient,
  onCheckout,
  onClearCart,
  testID,
}: CartFooterProps) => {
  const { t } = useTranslation();
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
          onPress: onClearCart,
        },
      ]
    );
  };

  return (
    <Box className="bg-white border-t border-background-200 p-4" testID={testID || 'cart-footer'}>
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
                      <Text size="sm" className="text-typography-900 font-medium" testID="cart-selected-client">
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
                    onPress={onSelectClient}
                    testID="cart-select-client-button"
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
                  onPress={onSelectClient}
                  testID="cart-select-client-button"
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
              <Text size="sm" className="text-typography-500" testID="cart-total-items">
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
              <Heading size="lg" className="text-typography-900" testID="cart-total-amount">
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
            onPress={onCheckout}
            isDisabled={isPending || (isSeller && !selectedClient)}
            testID="cart-place-order-button"
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
