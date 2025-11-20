import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Minus, Plus } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

export interface QuantitySelectorProps {
  initialQuantity?: number;
  minQuantity?: number;
  maxQuantity: number;
  onQuantityChange: (quantity: number) => void;
  testID?: string;
}

export const QuantitySelector = ({
  initialQuantity = 1,
  minQuantity = 1,
  maxQuantity,
  onQuantityChange,
  testID = 'quantity-selector',
}: QuantitySelectorProps) => {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [inputValue, setInputValue] = useState(String(initialQuantity));

  const handleIncrease = () => {
    /* istanbul ignore else - Button is disabled when at max quantity */
    if (quantity < maxQuantity) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      setInputValue(String(newQuantity));
      onQuantityChange(newQuantity);
    }
  };

  const handleDecrease = () => {
    /* istanbul ignore else - Button is disabled when at min quantity */
    if (quantity > minQuantity) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      setInputValue(String(newQuantity));
      onQuantityChange(newQuantity);
    }
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);

    // Only update quantity if it's a valid number
    const numValue = parseInt(text, 10);
    if (!isNaN(numValue)) {
      if (numValue >= minQuantity && numValue <= maxQuantity) {
        setQuantity(numValue);
        onQuantityChange(numValue);
      } else if (numValue > maxQuantity) {
        setQuantity(maxQuantity);
        onQuantityChange(maxQuantity);
        setInputValue(String(maxQuantity));
      } else {
        setQuantity(minQuantity);
        onQuantityChange(minQuantity);
        setInputValue(String(minQuantity));
      }
    }
  };

  const handleInputBlur = () => {
    // Reset to current quantity if input is invalid
    const numValue = parseInt(inputValue, 10);
    /* istanbul ignore else - Input is already valid, no action needed */
    if ( isNaN(numValue) || inputValue.trim() === '') {
      setInputValue(String(quantity));
    }
  };

  return (
    <Box testID={testID} className="items-center">
      <HStack space="sm" className="items-center">
        <Pressable
          onPress={handleDecrease}
          disabled={quantity <= minQuantity}
          testID={`${testID}-decrement`}
          style={({ pressed }) => [
            styles.button,
            // istanbul ignore next - Pressable pressed state cannot be triggered in React Native Testing Library
            pressed && styles.pressed,
            quantity <= minQuantity && styles.disabled,
          ]}
        >
          <Box
            className={`items-center justify-center ${
              quantity <= minQuantity ? 'bg-background-200' : 'bg-primary-500'
            }`}
            style={styles.buttonInner}
          >
            <Minus size={16} color={quantity <= minQuantity ? '#9ca3af' : '#ffffff'} />
          </Box>
        </Pressable>

        <TextInput
          testID={`${testID}-input`}
          value={inputValue}
          onChangeText={handleInputChange}
          onBlur={handleInputBlur}
          keyboardType="number-pad"
          maxLength={String(maxQuantity).length}
          style={styles.input}
          showSoftInputOnFocus={false}
        />

        <Pressable
          onPress={handleIncrease}
          disabled={quantity >= maxQuantity}
          testID={`${testID}-increment`}
          style={({ pressed }) => [
            styles.button,
            // istanbul ignore next - Pressable pressed state cannot be triggered in React Native Testing Library
            pressed && styles.pressed,
            quantity >= maxQuantity && styles.disabled,
          ]}
        >
          <Box
            className={`items-center justify-center ${
              quantity >= maxQuantity ? 'bg-background-200' : 'bg-primary-500'
            }`}
            style={styles.buttonInner}
          >
            <Plus size={16} color={quantity >= maxQuantity ? '#9ca3af' : '#ffffff'} />
          </Box>
        </Pressable>
      </HStack>

      <Text size="xs" className="text-typography-500 mt-2">
        Max: {maxQuantity}
      </Text>
    </Box>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
  },
  buttonInner: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  input: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    backgroundColor: '#ffffff',
  },
});
