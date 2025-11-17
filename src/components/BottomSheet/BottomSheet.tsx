import { Modal, StyleSheet, Pressable, ScrollView, View } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Box } from '@/components/ui/box';
import { X, Check } from 'lucide-react-native';
import type { BottomSheetProps } from './types';

export const BottomSheet = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  testID = 'bottom-sheet',
}: BottomSheetProps) => {
  const handleSelect = (value: string) => {
    onSelect(value);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      testID={testID}
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
        testID={`${testID}-overlay`}
      >
        <Pressable
          style={styles.content}
          onPress={() => {}}
          testID={`${testID}-content`}
        >
          <VStack space="md" className="bg-white rounded-t-3xl pb-16">
            {/* Header */}
            <HStack className="justify-between items-center px-4 pt-4">
              <Text
                className="text-typography-900 text-lg font-semibold flex-1"
                testID={`${testID}-title`}
              >
                {title}
              </Text>
              <Pressable
                onPress={onClose}
                className="p-2"
                testID={`${testID}-close-button`}
              >
                <Icon
                  as={X}
                  size="lg"
                  className="text-typography-500"
                />
              </Pressable>
            </HStack>

            <View className="h-px w-full bg-outline-500" />

            {/* Options List */}
            <ScrollView
              style={styles.scrollView}
              testID={`${testID}-scroll-view`}
            >
              <VStack space="xs">
                {options.map((option, index) => {
                  const isSelected = selectedValue === option.value;
                  const isLast = index === options.length - 1;

                  return (
                    <Box key={option.value}>
                      <Pressable
                        onPress={() => handleSelect(option.value)}
                        testID={`${testID}-option-${option.value}`}
                        className="px-4 py-4"
                      >
                        <HStack className="justify-between items-center min-h-[24px]">
                          <Text
                            className={`text-base ${
                              isSelected
                                ? 'text-primary-600 font-semibold'
                                : 'text-typography-900'
                            }`}
                          >
                            {option.label}
                          </Text>
                          {isSelected && (
                            <Icon
                              as={Check}
                              size="md"
                              className="text-primary-600"
                            />
                          )}
                        </HStack>
                      </Pressable>
                      {!isLast && <View className="h-px w-full bg-outline-500" />}
                    </Box>
                  );
                })}
              </VStack>
            </ScrollView>
          </VStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    maxHeight: '70%',
  },
  scrollView: {
    maxHeight: 400,
  },
});
