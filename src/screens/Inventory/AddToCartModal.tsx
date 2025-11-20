import React, { useState } from 'react';
import { Modal, StyleSheet, Pressable } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { ProductHeader } from '@/components/ProductHeader';
import { PriceQuantitySection } from '@/components/PriceQuantitySection';
import { formatCurrency } from '@/utils/formatCurrency';
import { useTranslation } from '@/i18n/hooks';
import { X } from 'lucide-react-native';

export interface AddToCartModalProps {
  visible: boolean;
  product: {
    id: string;
    name: string;
    sku: string;
    price: number;
    availableQuantity: number;
    warehouseName: string;
  } | null;
  onClose: () => void;
  onAddToCart: (quantity: number) => void;
  testID?: string;
}

export const AddToCartModal = ({
  visible,
  product,
  onClose,
  onAddToCart,
  testID = 'add-to-cart-modal',
}: AddToCartModalProps) => {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return null;
  }

  const handleAddToCart = () => {
    onAddToCart(quantity);
    setQuantity(1);
  };

  const handleClose = () => {
    setQuantity(1);
    onClose();
  };

  const handleModalContentPress = (e: any) => {
    /* istanbul ignore next */
    e.stopPropagation();
  };

  const subtotal = product.price * quantity;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      testID={testID}
    >
      <Pressable style={styles.overlay} onPress={handleClose} testID={`${testID}-overlay`}>
        <Pressable style={styles.modalContent} onPress={handleModalContentPress} testID={`${testID}-content`}>
          <Box className="bg-white rounded-xl p-6 w-full max-w-md">
            <HStack className="justify-between items-center mb-4">
              <Heading size="lg" className="text-typography-900">
                {t('inventory.addToCartModal.title')}
              </Heading>
              <Pressable onPress={handleClose} testID={`${testID}-close`}>
                <X size={24} color="#6b7280" />
              </Pressable>
            </HStack>

            <VStack space="lg">
              <ProductHeader
                name={product.name}
                sku={product.sku}
                warehouseName={product.warehouseName}
                testID="add-to-cart-product-name"
              />

              <PriceQuantitySection
                unitPrice={product.price}
                quantity={quantity}
                maxQuantity={product.availableQuantity}
                onQuantityChange={setQuantity}
                showAvailable={true}
                availableQuantity={product.availableQuantity}
                testID={`${testID}-price-quantity`}
                quantitySelectorTestID="add-to-cart"
              />

              <VStack space="xs" className="border-t border-background-200 pt-4">
                <HStack className="justify-between items-center">
                  <Text size="lg" className="text-typography-900 font-bold">
                    {t('inventory.addToCartModal.subtotal')}
                  </Text>
                  <Text size="xl" className="text-primary-600 font-bold" testID="add-to-cart-subtotal">
                    {formatCurrency(subtotal)}
                  </Text>
                </HStack>
              </VStack>

              <HStack space="md" className="mt-4">
                <Button
                  variant="outline"
                  onPress={handleClose}
                  className="flex-1"
                  testID="add-to-cart-cancel-button"
                >
                  <ButtonText>{t('inventory.addToCartModal.cancel')}</ButtonText>
                </Button>
                <Button
                  onPress={handleAddToCart}
                  className="flex-1"
                  testID="add-to-cart-confirm-button"
                >
                  <ButtonText>{t('inventory.addToCartModal.addToCart')}</ButtonText>
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
  },
});
