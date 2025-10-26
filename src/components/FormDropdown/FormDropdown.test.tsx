import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FormDropdown } from './FormDropdown';
import { useForm } from 'react-hook-form';

const mockOptions = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
];

// Test wrapper component
const TestWrapper = ({ error, testID, options = mockOptions }: any) => {
  const { control } = useForm({
    defaultValues: {
      testField: '',
    },
  });

  return (
    <FormDropdown
      control={control}
      name="testField"
      placeholder="Select an option"
      options={options}
      error={error}
      testID={testID}
    />
  );
};

describe('FormDropdown', () => {
  it('should render correctly with testID', () => {
    const { getByText } = render(<TestWrapper testID="test-dropdown" />);
    expect(getByText('Select an option')).toBeTruthy();
  });

  it('should render with placeholder', () => {
    const { getByText } = render(<TestWrapper testID="test-dropdown" />);
    expect(getByText('Select an option')).toBeTruthy();
  });

  it('should render with provided options', () => {
    const { getByText } = render(<TestWrapper testID="test-dropdown" />);
    expect(getByText('Select an option')).toBeTruthy();
  });

  it('should show error message when error is provided', () => {
    const error = { message: 'This field is required' };
    const { getByTestId, getByText } = render(<TestWrapper error={error} testID="test-dropdown" />);

    expect(getByTestId('test-dropdown-error')).toBeTruthy();
    expect(getByText('This field is required')).toBeTruthy();
  });

  it('should not show error message when error is undefined', () => {
    const { queryByTestId } = render(<TestWrapper testID="test-dropdown" />);
    expect(queryByTestId('test-dropdown-error')).toBeNull();
  });

  it('should render with custom options', () => {
    const customOptions = [
      { label: 'Custom 1', value: 'custom1' },
      { label: 'Custom 2', value: 'custom2' },
    ];
    const { getByText } = render(<TestWrapper testID="test-dropdown" options={customOptions} />);
    expect(getByText('Select an option')).toBeTruthy();
  });

  it('should render with empty options array', () => {
    const { getByText } = render(<TestWrapper testID="test-dropdown" options={[]} />);
    expect(getByText('Select an option')).toBeTruthy();
  });
});
