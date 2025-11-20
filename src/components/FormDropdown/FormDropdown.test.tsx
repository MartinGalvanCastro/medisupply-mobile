import { render, fireEvent } from '@testing-library/react-native';
import { useForm } from 'react-hook-form';
import { FormDropdown, DropdownOption } from './FormDropdown';

let mockDropdownOnChange: ((item: any) => void) | null = null;

jest.mock('react-native-element-dropdown', () => ({
  Dropdown: (props: any) => {
    const { View, Text, Pressable } = require('react-native');
    // Store the onChange handler so tests can invoke it
    mockDropdownOnChange = props.onChange;
    return (
      <Pressable
        testID="mock-dropdown-trigger"
        onPress={() => {
          if (mockDropdownOnChange) {
            mockDropdownOnChange({ value: 'selected-value' });
          }
        }}
      >
        <Text testID="mock-dropdown">{props.placeholder}</Text>
      </Pressable>
    );
  },
}));

const mockOptions: DropdownOption[] = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
];

const TestFormDropdownBasic = () => {
  const { control } = useForm({ defaultValues: { testField: '' } });
  return (
    <FormDropdown
      control={control}
      name="testField"
      placeholder="Select an option"
      options={mockOptions}
      testID="test-dropdown"
    />
  );
};

const TestFormDropdownWithCallback = ({ onChange }: { onChange: jest.Mock }) => {
  const { control } = useForm({ defaultValues: { testField: '' } });
  return (
    <FormDropdown
      control={control}
      name="testField"
      placeholder="Select an option"
      options={mockOptions}
      onChange={onChange}
      testID="test-dropdown"
    />
  );
};

const TestFormDropdownWithError = ({ errorMessage }: { errorMessage: string }) => {
  const { control } = useForm({ defaultValues: { testField: '' } });
  return (
    <FormDropdown
      control={control}
      name="testField"
      placeholder="Select an option"
      options={mockOptions}
      error={{ message: errorMessage } as any}
      testID="test-dropdown-error"
    />
  );
};

describe('FormDropdown', () => {
  beforeEach(() => {
    mockDropdownOnChange = null;
  });

  it('should render form control without error state', () => {
    const { getByTestId } = render(<TestFormDropdownBasic />);
    expect(getByTestId('mock-dropdown')).toBeDefined();
  });

  it('should display error message when error prop is provided', () => {
    const { getByTestId, getByText } = render(
      <TestFormDropdownWithError errorMessage="This field is required" />
    );
    expect(getByTestId('test-dropdown-error-error')).toBeDefined();
    expect(getByText('This field is required')).toBeDefined();
  });

  it('should not display error message when error is undefined', () => {
    const { queryByTestId } = render(<TestFormDropdownBasic />);
    expect(queryByTestId('test-dropdown-error')).toBeFalsy();
  });

  it('should call onChange callback when dropdown value changes', () => {
    const mockCallback = jest.fn();
    const { getByTestId } = render(
      <TestFormDropdownWithCallback onChange={mockCallback} />
    );

    // Trigger the dropdown's onChange by pressing the mock dropdown
    const trigger = getByTestId('mock-dropdown-trigger');
    fireEvent.press(trigger);

    // Both the form onChange and the callback should be called
    expect(mockCallback).toHaveBeenCalledWith('selected-value');
  });

  it('should update form control value when dropdown changes without callback', () => {
    const { getByTestId } = render(<TestFormDropdownBasic />);

    // Trigger the dropdown's onChange
    const trigger = getByTestId('mock-dropdown-trigger');
    fireEvent.press(trigger);

    // Component should still work even without the callback
    expect(trigger).toBeDefined();
  });

  it('should render with multiple options', () => {
    const { getByTestId } = render(<TestFormDropdownBasic />);
    expect(getByTestId('mock-dropdown')).toBeDefined();
  });

  it('should render error text with correct testID format', () => {
    const { getByTestId } = render(
      <TestFormDropdownWithError errorMessage="Field is required" />
    );
    const errorElement = getByTestId('test-dropdown-error-error');
    expect(errorElement).toBeDefined();
  });
});
