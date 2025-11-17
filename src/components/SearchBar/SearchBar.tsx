import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { useDebouncedValue } from '@/hooks';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onDebouncedChange: (text: string) => void;
  placeholder: string;
  debounceDelay?: number;
  testID?: string;
}

export const SearchBar = ({
  value,
  onChangeText,
  onDebouncedChange,
  placeholder,
  debounceDelay = 300,
  testID = 'search-bar',
}: SearchBarProps) => {
  const debouncedValue = useDebouncedValue(value, debounceDelay);

  useEffect(() => {
    onDebouncedChange(debouncedValue);
  }, [debouncedValue, onDebouncedChange]);

  const handleClear = () => {
    onChangeText('');
  };

  return (
    <Input variant="outline" size="md" className="rounded-lg border-outline-500" testID={testID}>
      <InputSlot className="pl-3">
        <InputIcon as={Search} />
      </InputSlot>
      <InputField
        testID={`${testID}-input`}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 && (
        <InputSlot className="pr-3">
          <Pressable
            onPress={handleClear}
            testID={`${testID}-clear-button`}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <InputIcon as={X} />
          </Pressable>
        </InputSlot>
      )}
    </Input>
  );
};
