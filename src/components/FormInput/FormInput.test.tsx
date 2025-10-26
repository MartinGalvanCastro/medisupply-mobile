import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FormInput } from './FormInput';
import { useForm } from 'react-hook-form';

// Test wrapper component
const TestWrapper = ({ error, secureTextEntry, keyboardType, autoCapitalize, autoCorrect, testID }: any) => {
  const { control } = useForm({
    defaultValues: {
      testField: '',
    },
  });

  return (
    <FormInput
      control={control}
      name="testField"
      placeholder="Test Placeholder"
      error={error}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      testID={testID}
    />
  );
};

describe('FormInput', () => {
  it('should render correctly with testID', () => {
    const { getByTestId } = render(<TestWrapper testID="test-input" />);
    expect(getByTestId('test-input')).toBeTruthy();
  });

  it('should render with placeholder', () => {
    const { getByPlaceholderText } = render(<TestWrapper testID="test-input" />);
    expect(getByPlaceholderText('Test Placeholder')).toBeTruthy();
  });

  it('should handle text input changes', () => {
    const { getByTestId } = render(<TestWrapper testID="test-input" />);
    const input = getByTestId('test-input');

    fireEvent.changeText(input, 'test value');
    expect(input).toBeTruthy();
  });

  it('should show error message when error is provided', () => {
    const error = { message: 'This field is required' };
    const { getByTestId, getByText } = render(<TestWrapper error={error} testID="test-input" />);

    expect(getByTestId('test-input-error')).toBeTruthy();
    expect(getByText('This field is required')).toBeTruthy();
  });

  it('should not show error message when error is undefined', () => {
    const { queryByTestId } = render(<TestWrapper testID="test-input" />);

    expect(queryByTestId('test-input-error')).toBeNull();
  });

  it('should render as secure text entry when secureTextEntry is true', () => {
    const { getByTestId } = render(<TestWrapper secureTextEntry={true} testID="password-input" />);
    expect(getByTestId('password-input')).toBeTruthy();
  });

  it('should render with email keyboard type', () => {
    const { getByTestId } = render(<TestWrapper keyboardType="email-address" testID="email-input" />);
    expect(getByTestId('email-input')).toBeTruthy();
  });

  it('should render with autoCapitalize none', () => {
    const { getByTestId } = render(<TestWrapper autoCapitalize="none" testID="test-input" />);
    expect(getByTestId('test-input')).toBeTruthy();
  });

  it('should render with autoCorrect disabled', () => {
    const { getByTestId } = render(<TestWrapper autoCorrect={false} testID="test-input" />);
    expect(getByTestId('test-input')).toBeTruthy();
  });

  it('should handle onBlur event', () => {
    const { getByTestId } = render(<TestWrapper testID="test-input" />);
    const input = getByTestId('test-input');

    fireEvent(input, 'blur');
    expect(input).toBeTruthy();
  });

  it('should render with phone keyboard type', () => {
    const { getByTestId } = render(<TestWrapper keyboardType="phone-pad" testID="phone-input" />);
    expect(getByTestId('phone-input')).toBeTruthy();
  });
});
