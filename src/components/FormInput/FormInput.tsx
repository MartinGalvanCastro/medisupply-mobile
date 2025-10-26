import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';
import { Controller } from 'react-hook-form';
import type { Control, FieldError } from 'react-hook-form';
import type { KeyboardTypeOptions } from 'react-native';

interface FormInputProps {
  control: Control<any>;
  name: string;
  placeholder: string;
  error?: FieldError;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  testID?: string;
}

export const FormInput = ({
  control,
  name,
  placeholder,
  error,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  testID,
}: FormInputProps) => {
  return (
    <FormControl isInvalid={!!error} className="mb-4">
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input variant="outline" size="md" className="rounded-lg border-gray-300">
            <InputField
              testID={testID}
              placeholder={placeholder}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry={secureTextEntry}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              autoCorrect={autoCorrect}
            />
          </Input>
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
