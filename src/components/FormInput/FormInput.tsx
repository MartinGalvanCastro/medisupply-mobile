import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from '@/components/ui/form-control';
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { Controller } from 'react-hook-form';
import type { Control, FieldError } from 'react-hook-form';
import type { KeyboardTypeOptions } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';

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
  showPasswordToggle?: boolean;
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
  showPasswordToggle = false,
}: FormInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShow = (prev: boolean) => !prev;

  const handleTogglePassword = () => {
    setShowPassword(toggleShow);
  };

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
              secureTextEntry={showPasswordToggle ? !showPassword : secureTextEntry}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              autoCorrect={autoCorrect}
            />
            {showPasswordToggle && (
              <InputSlot onPress={handleTogglePassword} className="pr-3" testID={`${testID}-toggle`}>
                <InputIcon as={showPassword ? EyeOff : Eye} className="text-gray-400" />
              </InputSlot>
            )}
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
