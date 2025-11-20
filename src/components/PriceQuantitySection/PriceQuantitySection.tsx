import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { QuantitySelector } from '@/components/QuantitySelector';
import { formatCurrency } from '@/utils/formatCurrency';
import { useTranslation } from '@/i18n/hooks';

export interface PriceQuantitySectionProps {
  unitPrice: number;
  quantity: number;
  maxQuantity: number;
  onQuantityChange: (quantity: number) => void;
  showAvailable?: boolean;
  availableQuantity?: number;
  testID?: string;
  quantitySelectorTestID?: string;
}

export const PriceQuantitySection = ({
  unitPrice,
  quantity,
  maxQuantity,
  onQuantityChange,
  showAvailable = false,
  availableQuantity,
  testID = 'price-quantity-section',
  quantitySelectorTestID,
}: PriceQuantitySectionProps) => {
  const { t } = useTranslation();
  const subtotal = unitPrice * quantity;

  return (
    <VStack space="lg" testID={testID}>
      {/* Price Info */}
      <VStack space="xs" className="border-t border-background-200 pt-4">
        <HStack className="justify-between items-center">
          <Text size="sm" className="text-typography-600">
            {t('cart.unitPrice')}
          </Text>
          <Text size="md" className="text-typography-900 font-semibold">
            {formatCurrency(unitPrice)}
          </Text>
        </HStack>

        {showAvailable && availableQuantity !== undefined ? (
          <HStack className="justify-between items-center">
            <Text size="sm" className="text-typography-600">
              {t('inventory.addToCartModal.available')}
            </Text>
            <Text size="sm" className="text-success-600 font-medium">
              {availableQuantity} {t('inventory.addToCartModal.units')}
            </Text>
          </HStack>
        ) : (
          <HStack className="justify-between items-center">
            <Text size="sm" className="text-typography-600">
              {t('cart.subtotal')}
            </Text>
            <Text size="md" className="text-typography-900 font-semibold">
              {formatCurrency(subtotal)}
            </Text>
          </HStack>
        )}
      </VStack>

      {/* Quantity Selector */}
      <VStack space="sm" className="items-center border-t border-background-200 pt-4">
        <Text size="sm" className="text-typography-600 font-medium">
          {t('inventory.addToCartModal.quantity')}
        </Text>
        <QuantitySelector
          initialQuantity={quantity}
          minQuantity={1}
          maxQuantity={maxQuantity}
          onQuantityChange={onQuantityChange}
          testID={quantitySelectorTestID || `${testID}-quantity-selector`}
        />
      </VStack>
    </VStack>
  );
};
