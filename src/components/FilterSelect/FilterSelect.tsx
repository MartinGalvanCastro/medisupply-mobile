import React, { useState } from 'react';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Pressable, Modal, StyleSheet } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import type { FilterSelectProps } from './types';

export const FilterSelect = ({
  value,
  options,
  onChange,
  testID = 'filter-select',
}: FilterSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <Box>
      <Button
        size="sm"
        variant="outline"
        action="secondary"
        onPress={() => setIsOpen(true)}
        testID={`${testID}-trigger`}
      >
        <ButtonText className="mr-1">{selectedOption?.label}</ButtonText>
        <ChevronDown size={16} color="#6B7280" />
      </Button>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
        testID={`${testID}-modal`}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setIsOpen(false)}
          testID={`${testID}-backdrop`}
        >
          <Box className="flex-1 justify-start items-end pt-32 pr-4">
            <Pressable onPress={(e) => e.stopPropagation()}>
              <VStack
                space="xs"
                className="bg-background-0 rounded-lg shadow-lg p-2 min-w-[150px]"
                testID={`${testID}-options`}
              >
                {options.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => handleSelect(option.value)}
                    testID={`${testID}-option-${option.value}`}
                    style={({ pressed }) => [
                      styles.option,
                      pressed && styles.optionPressed,
                    ]}
                  >
                    <Text
                      className={`text-sm ${
                        option.value === value
                          ? 'text-primary-700 font-semibold'
                          : 'text-typography-700'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </VStack>
            </Pressable>
          </Box>
        </Pressable>
      </Modal>
    </Box>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  optionPressed: {
    backgroundColor: '#f3f4f6',
  },
});
