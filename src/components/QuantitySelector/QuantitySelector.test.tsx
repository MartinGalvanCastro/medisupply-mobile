import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QuantitySelector } from './QuantitySelector';

describe('QuantitySelector', () => {
  const mockOnQuantityChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with required props', () => {
    const { getByText, getByTestId } = render(
      <QuantitySelector maxQuantity={10} onQuantityChange={mockOnQuantityChange} />
    );

    expect(getByTestId('quantity-selector')).toBeDefined();
    expect(getByTestId('quantity-selector-input')).toBeDefined();
    expect(getByTestId('quantity-selector-increment')).toBeDefined();
    expect(getByTestId('quantity-selector-decrement')).toBeDefined();
    expect(getByText('Max: 10')).toBeDefined();
  });

  it('should render with custom testID', () => {
    const { getByTestId } = render(
      <QuantitySelector
        maxQuantity={5}
        onQuantityChange={mockOnQuantityChange}
        testID="custom-selector"
      />
    );

    expect(getByTestId('custom-selector')).toBeDefined();
    expect(getByTestId('custom-selector-input')).toBeDefined();
    expect(getByTestId('custom-selector-increment')).toBeDefined();
    expect(getByTestId('custom-selector-decrement')).toBeDefined();
  });

  it('should initialize with initial quantity value', () => {
    const { getByTestId } = render(
      <QuantitySelector
        initialQuantity={3}
        maxQuantity={10}
        onQuantityChange={mockOnQuantityChange}
      />
    );

    const input = getByTestId('quantity-selector-input') as any;
    expect(input.props.value).toBe('3');
  });

  it('should use default initial quantity of 1', () => {
    const { getByTestId } = render(
      <QuantitySelector maxQuantity={10} onQuantityChange={mockOnQuantityChange} />
    );

    const input = getByTestId('quantity-selector-input') as any;
    expect(input.props.value).toBe('1');
  });

  it('should increase quantity when increase button is pressed', async () => {
    const { getByTestId } = render(
      <QuantitySelector
        initialQuantity={1}
        maxQuantity={5}
        onQuantityChange={mockOnQuantityChange}
      />
    );

    const increaseButton = getByTestId('quantity-selector-increment');
    fireEvent.press(increaseButton);

    await waitFor(() => {
      expect(mockOnQuantityChange).toHaveBeenCalledWith(2);
    });
  });

  it('should decrease quantity when decrease button is pressed', async () => {
    const { getByTestId } = render(
      <QuantitySelector
        initialQuantity={3}
        minQuantity={1}
        maxQuantity={10}
        onQuantityChange={mockOnQuantityChange}
      />
    );

    const decreaseButton = getByTestId('quantity-selector-decrement');
    fireEvent.press(decreaseButton);

    await waitFor(() => {
      expect(mockOnQuantityChange).toHaveBeenCalledWith(2);
    });
  });

  it('should not increase beyond max quantity', () => {
    const { getByTestId } = render(
      <QuantitySelector
        initialQuantity={5}
        maxQuantity={5}
        onQuantityChange={mockOnQuantityChange}
      />
    );

    const increaseButton = getByTestId('quantity-selector-increment');
    fireEvent.press(increaseButton);

    expect(mockOnQuantityChange).not.toHaveBeenCalled();
  });

  it('should not decrease below min quantity', () => {
    const { getByTestId } = render(
      <QuantitySelector
        initialQuantity={1}
        minQuantity={1}
        maxQuantity={10}
        onQuantityChange={mockOnQuantityChange}
      />
    );

    const decreaseButton = getByTestId('quantity-selector-decrement');
    fireEvent.press(decreaseButton);

    expect(mockOnQuantityChange).not.toHaveBeenCalled();
  });

  it('should update quantity via text input within valid range', async () => {
    const { getByTestId } = render(
      <QuantitySelector
        initialQuantity={1}
        minQuantity={1}
        maxQuantity={10}
        onQuantityChange={mockOnQuantityChange}
      />
    );

    const input = getByTestId('quantity-selector-input');
    fireEvent.changeText(input, '5');

    await waitFor(() => {
      expect(mockOnQuantityChange).toHaveBeenCalledWith(5);
    });
  });

  it('should clamp input value to max quantity when exceeding', async () => {
    const { getByTestId } = render(
      <QuantitySelector
        initialQuantity={1}
        minQuantity={1}
        maxQuantity={10}
        onQuantityChange={mockOnQuantityChange}
      />
    );

    const input = getByTestId('quantity-selector-input');
    fireEvent.changeText(input, '15');

    await waitFor(() => {
      expect(mockOnQuantityChange).toHaveBeenCalledWith(10);
    });
  });

  it('should clamp input value to min quantity when below', async () => {
    const { getByTestId } = render(
      <QuantitySelector
        initialQuantity={5}
        minQuantity={2}
        maxQuantity={10}
        onQuantityChange={mockOnQuantityChange}
      />
    );

    const input = getByTestId('quantity-selector-input');
    fireEvent.changeText(input, '1');

    await waitFor(() => {
      expect(mockOnQuantityChange).toHaveBeenCalledWith(2);
    });
  });

  it('should ignore non-numeric input text', async () => {
    const { getByTestId } = render(
      <QuantitySelector
        initialQuantity={5}
        minQuantity={1}
        maxQuantity={10}
        onQuantityChange={mockOnQuantityChange}
      />
    );

    const input = getByTestId('quantity-selector-input');
    fireEvent.changeText(input, 'abc');

    expect(mockOnQuantityChange).not.toHaveBeenCalled();
  });

  it('should use custom min and max quantity values', () => {
    const { getByText } = render(
      <QuantitySelector
        initialQuantity={5}
        minQuantity={2}
        maxQuantity={20}
        onQuantityChange={mockOnQuantityChange}
      />
    );

    expect(getByText('Max: 20')).toBeDefined();
  });

  it('should reset input to current quantity when blur with invalid value', async () => {
    const { getByTestId } = render(
      <QuantitySelector
        initialQuantity={5}
        minQuantity={1}
        maxQuantity={10}
        onQuantityChange={mockOnQuantityChange}
      />
    );

    const input = getByTestId('quantity-selector-input') as any;

    // Change to non-numeric text
    fireEvent.changeText(input, 'invalid');

    await waitFor(() => {
      expect(input.props.value).toBe('invalid');
    });

    // Trigger blur event - should reset to current quantity (5)
    fireEvent(input, 'blur');

    await waitFor(() => {
      expect(input.props.value).toBe('5');
    });
  });

  it('should reset input to current quantity when blur with empty string', async () => {
    const { getByTestId } = render(
      <QuantitySelector
        initialQuantity={7}
        minQuantity={1}
        maxQuantity={10}
        onQuantityChange={mockOnQuantityChange}
      />
    );

    const input = getByTestId('quantity-selector-input') as any;

    // Change to empty string
    fireEvent.changeText(input, '');

    await waitFor(() => {
      expect(input.props.value).toBe('');
    });

    // Trigger blur event - should reset to current quantity (7)
    fireEvent(input, 'blur');

    await waitFor(() => {
      expect(input.props.value).toBe('7');
    });
  });

  it('should handle input change with value exactly at min quantity', async () => {
    const { getByTestId } = render(
      <QuantitySelector
        initialQuantity={5}
        minQuantity={2}
        maxQuantity={10}
        onQuantityChange={mockOnQuantityChange}
      />
    );

    const input = getByTestId('quantity-selector-input');
    fireEvent.changeText(input, '2');

    await waitFor(() => {
      expect(mockOnQuantityChange).toHaveBeenCalledWith(2);
    });
  });

  it('should not reset input on blur when value is valid numeric string', async () => {
    const { getByTestId } = render(
      <QuantitySelector
        initialQuantity={3}
        minQuantity={1}
        maxQuantity={10}
        onQuantityChange={mockOnQuantityChange}
      />
    );

    const input = getByTestId('quantity-selector-input') as any;

    // Change to valid number
    fireEvent.changeText(input, '6');

    await waitFor(() => {
      expect(input.props.value).toBe('6');
    });

    // Trigger blur event - should keep the value since it's valid
    fireEvent(input, 'blur');

    await waitFor(() => {
      expect(input.props.value).toBe('6');
    });
  });

  it('should handle edge case with maximum value at boundary', async () => {
    const { getByTestId } = render(
      <QuantitySelector
        initialQuantity={5}
        minQuantity={1}
        maxQuantity={5}
        onQuantityChange={mockOnQuantityChange}
      />
    );

    const input = getByTestId('quantity-selector-input');
    fireEvent.changeText(input, '5');

    await waitFor(() => {
      expect(mockOnQuantityChange).toHaveBeenCalledWith(5);
    });
  });
});
