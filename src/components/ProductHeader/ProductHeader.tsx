import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/i18n/hooks';

export interface ProductHeaderProps {
  name: string;
  sku: string;
  warehouseName: string;
  size?: 'sm' | 'md';
  showWarehouseLabel?: boolean;
  testID?: string;
}

export const ProductHeader = ({
  name,
  sku,
  warehouseName,
  size = 'md',
  showWarehouseLabel = false,
  testID = 'product-header',
}: ProductHeaderProps) => {
  const { t } = useTranslation();

  return (
    <VStack space="xs" testID={testID}>
      <Heading size={size} className="text-typography-900">
        {name}
      </Heading>
      <Text size="xs" className="text-typography-500">
        {t('cart.sku')}: {sku}
      </Text>
      <Text size="xs" className="text-typography-500">
        {showWarehouseLabel && `${t('cart.warehouse')}: `}
        {warehouseName}
      </Text>
    </VStack>
  );
};
