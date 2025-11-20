import { Pressable, StyleSheet, Alert } from 'react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Trash2 } from 'lucide-react-native';
import { ProductHeader } from '@/components/ProductHeader';
import { PriceQuantitySection } from '@/components/PriceQuantitySection';
import { useTranslation } from '@/i18n/hooks';
import type { CartItem } from '@/store/useCartStore';

export interface CartItemCardProps {
  item: CartItem;
  onQuantityChange: (inventoryId: string, quantity: number) => void;
  onRemove: (inventoryId: string) => void;
  testID?: string;
}

export const getRemoveButtonStyle = (pressed: boolean) => {
  const baseStyle: any[] = [styles.removeButton];
  if (pressed) {
    baseStyle.push(styles.pressed);
  }
  return baseStyle;
};

export const CartItemCard = ({
  item,
  onQuantityChange,
  onRemove,
  testID,
}: CartItemCardProps) => {
  const { t } = useTranslation();

  const handleRemove = () => {
    Alert.alert(
      t('cart.removeItem'),
      t('cart.removeItemConfirmation', { productName: item.productName }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => onRemove(item.inventoryId),
        },
      ]
    );
  };

  return (
    <Box className="bg-white rounded-lg my-2 mx-0" style={styles.card} testID={testID}>
      <Box className="p-4">
        <HStack space="md" className="items-start mb-4">
          <VStack space="xs" className="flex-1">
            <ProductHeader
              name={item.productName}
              sku={item.productSku}
              warehouseName={item.warehouseName}
              size="sm"
              showWarehouseLabel={true}
              testID={`${testID}-product-header`}
            />
          </VStack>

          <Pressable
            onPress={handleRemove}
            testID={`cart-item-remove-${item.inventoryId}`}
            style={({ pressed }) => getRemoveButtonStyle(pressed)}
          >
            <Box className="bg-error-50 rounded-lg p-2 items-center justify-center">
              <Trash2 size={20} color="#dc2626" />
            </Box>
          </Pressable>
        </HStack>

        <PriceQuantitySection
          unitPrice={item.productPrice}
          quantity={item.quantity}
          maxQuantity={item.availableQuantity}
          onQuantityChange={(quantity) => onQuantityChange(item.inventoryId, quantity)}
          showAvailable={false}
          testID={`${testID}-price-quantity`}
          quantitySelectorTestID={`${testID}-qty`}
        />
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  removeButton: {
    borderRadius: 8,
  },
  pressed: {
    opacity: 0.7,
  },
});
