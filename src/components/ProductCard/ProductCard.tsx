import React from 'react';
import {
  Box,
  Card,
  Heading,
  Text,
  Pressable,
  HStack,
  VStack,
} from '@gluestack-ui/themed';
import { ProductCardProps } from './types';

/**
 * Product card component for displaying product information
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  name,
  description,
  price,
  stock,
  onPress,
}) => {
  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Card size="md" variant="elevated" mb="$4">
        <VStack space="sm">
          <Heading size="md">{name}</Heading>
          {description && (
            <Text size="sm" color="$textLight700">
              {description}
            </Text>
          )}
          <HStack justifyContent="space-between" alignItems="center" mt="$2">
            {price !== undefined && (
              <Text size="lg" fontWeight="$bold" color="$primary500">
                ${price.toFixed(2)}
              </Text>
            )}
            {stock !== undefined && (
              <Text size="sm" color="$textLight600">
                Stock: {stock}
              </Text>
            )}
          </HStack>
        </VStack>
      </Card>
    </Pressable>
  );
};
