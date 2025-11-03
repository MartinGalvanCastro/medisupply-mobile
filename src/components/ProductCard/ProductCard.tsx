import { Pressable, StyleSheet } from 'react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Badge, BadgeText } from '@/components/ui/badge';
import { ChevronRight, Package } from 'lucide-react-native';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    sku: string;
    description: string;
    category: string;
    manufacturer: string;
    warehouseName: string;
    availableQuantity: number;
    price: number;
  };
  onPress: () => void;
  testID?: string;
}

const getCategoryBadgeAction = (
  category: string
): 'info' | 'success' | 'warning' | 'error' | 'muted' => {
  const categoryMap: Record<
    string,
    'info' | 'success' | 'warning' | 'error' | 'muted'
  > = {
    analgésicos: 'success',
    antiinflamatorios: 'warning',
    antibióticos: 'error',
    cardiovasculares: 'info',
    antidiabéticos: 'info',
    gastrointestinales: 'success',
    antihistamínicos: 'warning',
    respiratorios: 'info',
    neurológicos: 'error',
    hormonales: 'muted',
    suplementos: 'success',
    soluciones: 'info',
    urológicos: 'warning',
  };
  return categoryMap[category?.toLowerCase()] || 'muted';
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const ProductCard = ({ product, onPress, testID }: ProductCardProps) => {
  const isLowStock = product.availableQuantity < 100;
  const isOutOfStock = product.availableQuantity === 0;

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      disabled={isOutOfStock}
      style={({ pressed }) => [
        styles.pressable,
        /* istanbul ignore next */
        pressed && styles.pressed,
        isOutOfStock && styles.disabled,
      ]}
    >
      <Box className="bg-white rounded-lg my-2 mx-0" style={styles.card}>
        <HStack space="md" className="items-start p-4">
          <Box className="bg-background-50 rounded-lg p-3 items-center justify-center">
            <Package size={24} color="#6b7280" />
          </Box>

          <VStack space="xs" className="flex-1">
            <HStack space="sm" className="items-center justify-between">
              <Heading size="sm" className="text-typography-900 flex-1">
                {product.name}
              </Heading>
              {isOutOfStock ? (
                <Badge action="error" size="sm">
                  <BadgeText>Out of Stock</BadgeText>
                </Badge>
              ) : isLowStock ? (
                <Badge action="warning" size="sm">
                  <BadgeText>Low Stock</BadgeText>
                </Badge>
              ) : null}
            </HStack>

            <Text size="xs" className="text-typography-500">
              SKU: {product.sku}
            </Text>

            <Text size="sm" className="text-typography-600 mt-1" numberOfLines={2}>
              {product.description}
            </Text>

            <HStack space="sm" className="items-center mt-2">
              <Badge action={getCategoryBadgeAction(product.category)} size="sm">
                <BadgeText>{product.category}</BadgeText>
              </Badge>
            </HStack>

            <HStack space="md" className="items-center justify-between mt-2">
              <VStack space="xs" className="flex-1">
                <Text size="xs" className="text-typography-500">
                  {product.manufacturer}
                </Text>
                <Text size="xs" className="text-typography-500">
                  {product.warehouseName}
                </Text>
              </VStack>

              <VStack space="xs" className="items-end">
                <Text size="sm" className="text-typography-900 font-semibold">
                  {formatCurrency(product.price)}
                </Text>
                <Text
                  size="xs"
                  className={
                    isOutOfStock
                      ? 'text-error-500 font-medium'
                      : isLowStock
                      ? 'text-warning-600 font-medium'
                      : 'text-success-600'
                  }
                >
                  {product.availableQuantity} available
                </Text>
              </VStack>
            </HStack>
          </VStack>

          {!isOutOfStock && (
            <ChevronRight size={20} color="#9CA3AF" style={styles.chevron} />
          )}
        </HStack>
      </Box>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  chevron: {
    marginTop: 4,
  },
});
