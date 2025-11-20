import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from '@/components/ui/form-control';
import { Controller } from 'react-hook-form';
import type { Control, FieldError } from 'react-hook-form';
import { Dropdown } from 'react-native-element-dropdown';
import { StyleSheet } from 'react-native';

export interface DropdownOption {
  label: string;
  value: string;
}

interface FormDropdownProps {
  control: Control<any>;
  name: string;
  placeholder: string;
  options: DropdownOption[];
  error?: FieldError;
  testID?: string;
  onChange?: (value: string) => void;
}

export const FormDropdown = ({
  control,
  name,
  placeholder,
  options,
  error,
  testID,
  onChange: onChangeCallback,
}: FormDropdownProps) => {
  return (
    <FormControl isInvalid={!!error} className="mb-4">
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <Dropdown
            testID={testID}
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={options}
            labelField="label"
            valueField="value"
            placeholder={placeholder}
            value={value}
            onChange={(item) => {
              onChange(item.value);
              onChangeCallback?.(item.value);
            }}
          />
        )}
      />
      {error && (
        <FormControlError>
          <FormControlErrorText testID={`${testID}-error`}>
            {error.message}
          </FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    height: 40,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#737373',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#171717',
  },
});
