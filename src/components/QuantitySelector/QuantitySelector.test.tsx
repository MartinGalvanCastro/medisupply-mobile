import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QuantitySelector } from './QuantitySelector';

describe('QuantitySelector Component', () => {
  const defaultProps = {
    maxQuantity: 100,
    onQuantityChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the quantity selector', () => {
      const { getByTestId } = render(<QuantitySelector {...defaultProps} />);

      expect(getByTestId('quantity-selector')).toBeTruthy();
      expect(getByTestId('quantity-selector-decrease')).toBeTruthy();
      expect(getByTestId('quantity-selector-increase')).toBeTruthy();
      expect(getByTestId('quantity-selector-input')).toBeTruthy();
    });

    it('should render with initial quantity of 1 by default', () => {
      const { getByTestId } = render(<QuantitySelector {...defaultProps} />);

      const input = getByTestId('quantity-selector-input');
      expect(input.props.value).toBe('1');
    });

    it('should render with custom initial quantity', () => {
      const { getByTestId } = render(
        <QuantitySelector {...defaultProps} initialQuantity={5} />
      );

      const input = getByTestId('quantity-selector-input');
      expect(input.props.value).toBe('5');
    });

    it('should display max quantity text', () => {
      const { getByText } = render(<QuantitySelector {...defaultProps} />);

      expect(getByText('Max: 100')).toBeTruthy();
    });

    it('should render with custom testID', () => {
      const { getByTestId } = render(
        <QuantitySelector {...defaultProps} testID="custom-selector" />
      );

      expect(getByTestId('custom-selector')).toBeTruthy();
    });
  });

  describe('Increase button', () => {
    it('should increase quantity when increase button is pressed', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <QuantitySelector {...defaultProps} onQuantityChange={onQuantityChange} />
      );

      const increaseButton = getByTestId('quantity-selector-increase');
      fireEvent.press(increaseButton);

      expect(onQuantityChange).toHaveBeenCalledWith(2);
    });

    it('should update input value when increased', () => {
      const { getByTestId } = render(<QuantitySelector {...defaultProps} />);

      const increaseButton = getByTestId('quantity-selector-increase');
      const input = getByTestId('quantity-selector-input');

      fireEvent.press(increaseButton);

      expect(input.props.value).toBe('2');
    });

    it('should not increase beyond max quantity', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <QuantitySelector
          {...defaultProps}
          initialQuantity={10}
          maxQuantity={10}
          onQuantityChange={onQuantityChange}
        />
      );

      const increaseButton = getByTestId('quantity-selector-increase');
      fireEvent.press(increaseButton);

      expect(onQuantityChange).not.toHaveBeenCalled();
    });

    it('should disable increase button at max quantity', () => {
      const { getByTestId } = render(
        <QuantitySelector {...defaultProps} initialQuantity={100} maxQuantity={100} />
      );

      const increaseButton = getByTestId('quantity-selector-increase');
      expect(increaseButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('should allow multiple increases', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <QuantitySelector {...defaultProps} onQuantityChange={onQuantityChange} />
      );

      const increaseButton = getByTestId('quantity-selector-increase');
      fireEvent.press(increaseButton);
      fireEvent.press(increaseButton);
      fireEvent.press(increaseButton);

      expect(onQuantityChange).toHaveBeenCalledTimes(3);
      expect(onQuantityChange).toHaveBeenLastCalledWith(4);
    });
  });

  describe('Decrease button', () => {
    it('should decrease quantity when decrease button is pressed', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <QuantitySelector
          {...defaultProps}
          initialQuantity={5}
          onQuantityChange={onQuantityChange}
        />
      );

      const decreaseButton = getByTestId('quantity-selector-decrease');
      fireEvent.press(decreaseButton);

      expect(onQuantityChange).toHaveBeenCalledWith(4);
    });

    it('should update input value when decreased', () => {
      const { getByTestId } = render(
        <QuantitySelector {...defaultProps} initialQuantity={5} />
      );

      const decreaseButton = getByTestId('quantity-selector-decrease');
      const input = getByTestId('quantity-selector-input');

      fireEvent.press(decreaseButton);

      expect(input.props.value).toBe('4');
    });

    it('should not decrease below min quantity', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <QuantitySelector
          {...defaultProps}
          initialQuantity={1}
          minQuantity={1}
          onQuantityChange={onQuantityChange}
        />
      );

      const decreaseButton = getByTestId('quantity-selector-decrease');
      fireEvent.press(decreaseButton);

      expect(onQuantityChange).not.toHaveBeenCalled();
    });

    it('should disable decrease button at min quantity', () => {
      const { getByTestId } = render(
        <QuantitySelector {...defaultProps} initialQuantity={1} minQuantity={1} />
      );

      const decreaseButton = getByTestId('quantity-selector-decrease');
      expect(decreaseButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('should respect custom min quantity', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <QuantitySelector
          {...defaultProps}
          initialQuantity={5}
          minQuantity={5}
          onQuantityChange={onQuantityChange}
        />
      );

      const decreaseButton = getByTestId('quantity-selector-decrease');
      fireEvent.press(decreaseButton);

      expect(onQuantityChange).not.toHaveBeenCalled();
    });

    it('should allow multiple decreases', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <QuantitySelector
          {...defaultProps}
          initialQuantity={10}
          onQuantityChange={onQuantityChange}
        />
      );

      const decreaseButton = getByTestId('quantity-selector-decrease');
      fireEvent.press(decreaseButton);
      fireEvent.press(decreaseButton);
      fireEvent.press(decreaseButton);

      expect(onQuantityChange).toHaveBeenCalledTimes(3);
      expect(onQuantityChange).toHaveBeenLastCalledWith(7);
    });
  });

  describe('Input field', () => {
    it('should allow typing a valid number', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <QuantitySelector {...defaultProps} onQuantityChange={onQuantityChange} />
      );

      const input = getByTestId('quantity-selector-input');
      fireEvent.changeText(input, '25');

      expect(onQuantityChange).toHaveBeenCalledWith(25);
    });

    it('should update displayed value when typing', () => {
      const { getByTestId } = render(<QuantitySelector {...defaultProps} />);

      const input = getByTestId('quantity-selector-input');
      fireEvent.changeText(input, '50');

      expect(input.props.value).toBe('50');
    });

    it('should not allow values greater than max quantity', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <QuantitySelector
          {...defaultProps}
          maxQuantity={100}
          onQuantityChange={onQuantityChange}
        />
      );

      const input = getByTestId('quantity-selector-input');
      fireEvent.changeText(input, '150');

      expect(onQuantityChange).toHaveBeenCalledWith(100);
      expect(input.props.value).toBe('100');
    });

    it('should not allow values less than min quantity', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <QuantitySelector
          {...defaultProps}
          minQuantity={5}
          onQuantityChange={onQuantityChange}
        />
      );

      const input = getByTestId('quantity-selector-input');
      fireEvent.changeText(input, '2');

      expect(onQuantityChange).toHaveBeenCalledWith(5);
      expect(input.props.value).toBe('5');
    });

    it('should handle empty input gracefully on blur', () => {
      const { getByTestId } = render(
        <QuantitySelector {...defaultProps} initialQuantity={5} />
      );

      const input = getByTestId('quantity-selector-input');
      fireEvent.changeText(input, '');
      fireEvent(input, 'blur');

      expect(input.props.value).toBe('5');
    });

    it('should handle invalid input gracefully on blur', () => {
      const { getByTestId } = render(
        <QuantitySelector {...defaultProps} initialQuantity={10} />
      );

      const input = getByTestId('quantity-selector-input');
      fireEvent.changeText(input, 'abc');
      fireEvent(input, 'blur');

      expect(input.props.value).toBe('10');
    });

    it('should use number-pad keyboard type', () => {
      const { getByTestId } = render(<QuantitySelector {...defaultProps} />);

      const input = getByTestId('quantity-selector-input');
      expect(input.props.keyboardType).toBe('number-pad');
    });

    it('should have correct max length based on max quantity', () => {
      const { getByTestId } = render(
        <QuantitySelector {...defaultProps} maxQuantity={99999} />
      );

      const input = getByTestId('quantity-selector-input');
      expect(input.props.maxLength).toBe(5);
    });
  });

  describe('Edge cases', () => {
    it('should handle max quantity of 1', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <QuantitySelector
          {...defaultProps}
          initialQuantity={1}
          maxQuantity={1}
          onQuantityChange={onQuantityChange}
        />
      );

      const increaseButton = getByTestId('quantity-selector-increase');
      fireEvent.press(increaseButton);

      expect(onQuantityChange).not.toHaveBeenCalled();
    });

    it('should handle min and max quantity being the same', () => {
      const { getByTestId } = render(
        <QuantitySelector
          {...defaultProps}
          initialQuantity={10}
          minQuantity={10}
          maxQuantity={10}
        />
      );

      const decreaseButton = getByTestId('quantity-selector-decrease');
      const increaseButton = getByTestId('quantity-selector-increase');

      expect(decreaseButton.props.accessibilityState?.disabled).toBe(true);
      expect(increaseButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('should handle large max quantities', () => {
      const { getByText } = render(
        <QuantitySelector {...defaultProps} maxQuantity={99999} />
      );

      expect(getByText('Max: 99999')).toBeTruthy();
    });

    it('should handle typing zero', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <QuantitySelector
          {...defaultProps}
          minQuantity={1}
          onQuantityChange={onQuantityChange}
        />
      );

      const input = getByTestId('quantity-selector-input');
      fireEvent.changeText(input, '0');

      expect(onQuantityChange).toHaveBeenCalledWith(1);
    });

    it('should handle negative numbers', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <QuantitySelector
          {...defaultProps}
          minQuantity={1}
          onQuantityChange={onQuantityChange}
        />
      );

      const input = getByTestId('quantity-selector-input');
      fireEvent.changeText(input, '-5');

      expect(onQuantityChange).toHaveBeenCalledWith(1);
    });
  });

  describe('Integration scenarios', () => {
    it('should maintain consistency between buttons and input', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <QuantitySelector {...defaultProps} onQuantityChange={onQuantityChange} />
      );

      const increaseButton = getByTestId('quantity-selector-increase');
      const decreaseButton = getByTestId('quantity-selector-decrease');
      const input = getByTestId('quantity-selector-input');

      fireEvent.press(increaseButton);
      fireEvent.press(increaseButton);
      expect(input.props.value).toBe('3');

      fireEvent.press(decreaseButton);
      expect(input.props.value).toBe('2');

      fireEvent.changeText(input, '50');
      expect(input.props.value).toBe('50');

      fireEvent.press(increaseButton);
      expect(input.props.value).toBe('51');
    });

    it('should handle rapid button presses', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <QuantitySelector {...defaultProps} onQuantityChange={onQuantityChange} />
      );

      const increaseButton = getByTestId('quantity-selector-increase');

      for (let i = 0; i < 10; i++) {
        fireEvent.press(increaseButton);
      }

      expect(onQuantityChange).toHaveBeenCalledTimes(10);
      expect(onQuantityChange).toHaveBeenLastCalledWith(11);
    });

    it('should handle alternating button presses', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <QuantitySelector
          {...defaultProps}
          initialQuantity={50}
          onQuantityChange={onQuantityChange}
        />
      );

      const increaseButton = getByTestId('quantity-selector-increase');
      const decreaseButton = getByTestId('quantity-selector-decrease');

      fireEvent.press(increaseButton);
      fireEvent.press(decreaseButton);
      fireEvent.press(increaseButton);
      fireEvent.press(decreaseButton);

      expect(onQuantityChange).toHaveBeenCalledTimes(4);
      expect(onQuantityChange).toHaveBeenLastCalledWith(50);
    });
  });

  describe('Pressable style states', () => {
    it('should apply pressed style to decrease button when active', () => {
      const { getByTestId } = render(
        <QuantitySelector {...defaultProps} initialQuantity={5} />
      );

      const decreaseButton = getByTestId('quantity-selector-decrease');
      const style = decreaseButton.props.style;

      // Verify style is an array (can contain conditional styles)
      expect(Array.isArray(style)).toBe(true);

      // Verify base button style exists
      expect(style).toContainEqual(
        expect.objectContaining({
          borderRadius: 8,
        })
      );
    });

    it('should apply pressed and disabled styles to decrease button at min', () => {
      const { getByTestId } = render(
        <QuantitySelector
          {...defaultProps}
          initialQuantity={1}
          minQuantity={1}
        />
      );

      const decreaseButton = getByTestId('quantity-selector-decrease');
      const style = decreaseButton.props.style;

      // Verify style array contains disabled style
      expect(style).toContainEqual(
        expect.objectContaining({
          opacity: 0.5,
        })
      );
    });

    it('should apply pressed style to increase button when active', () => {
      const { getByTestId } = render(
        <QuantitySelector {...defaultProps} initialQuantity={50} />
      );

      const increaseButton = getByTestId('quantity-selector-increase');
      const style = increaseButton.props.style;

      // Verify style is an array (can contain conditional styles)
      expect(Array.isArray(style)).toBe(true);

      // Verify base button style exists
      expect(style).toContainEqual(
        expect.objectContaining({
          borderRadius: 8,
        })
      );
    });

    it('should apply pressed and disabled styles to increase button at max', () => {
      const { getByTestId } = render(
        <QuantitySelector
          {...defaultProps}
          initialQuantity={100}
          maxQuantity={100}
        />
      );

      const increaseButton = getByTestId('quantity-selector-increase');
      const style = increaseButton.props.style;

      // Verify style array contains disabled style
      expect(style).toContainEqual(
        expect.objectContaining({
          opacity: 0.5,
        })
      );
    });
  });

  describe('Input validation edge cases', () => {
    it('should handle input between min and max correctly', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <QuantitySelector
          {...defaultProps}
          minQuantity={10}
          maxQuantity={100}
          onQuantityChange={onQuantityChange}
        />
      );

      const input = getByTestId('quantity-selector-input');
      fireEvent.changeText(input, '50');

      expect(onQuantityChange).toHaveBeenCalledWith(50);
      expect(input.props.value).toBe('50');
    });

    it('should enforce max quantity and update input display', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <QuantitySelector
          {...defaultProps}
          minQuantity={1}
          maxQuantity={50}
          onQuantityChange={onQuantityChange}
        />
      );

      const input = getByTestId('quantity-selector-input');
      fireEvent.changeText(input, '75');

      expect(onQuantityChange).toHaveBeenCalledWith(50);
      expect(input.props.value).toBe('50');
    });

    it('should enforce min quantity and update input display', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <QuantitySelector
          {...defaultProps}
          minQuantity={5}
          maxQuantity={100}
          onQuantityChange={onQuantityChange}
        />
      );

      const input = getByTestId('quantity-selector-input');
      fireEvent.changeText(input, '2');

      expect(onQuantityChange).toHaveBeenCalledWith(5);
      expect(input.props.value).toBe('5');
    });

    it('should not update quantity for non-numeric input', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <QuantitySelector
          {...defaultProps}
          initialQuantity={10}
          onQuantityChange={onQuantityChange}
        />
      );

      const input = getByTestId('quantity-selector-input');
      fireEvent.changeText(input, 'invalid');

      expect(onQuantityChange).not.toHaveBeenCalled();
      expect(input.props.value).toBe('invalid');
    });

    it('should handle whitespace-only input on blur', () => {
      const { getByTestId } = render(
        <QuantitySelector {...defaultProps} initialQuantity={20} />
      );

      const input = getByTestId('quantity-selector-input');
      fireEvent.changeText(input, '   ');
      fireEvent(input, 'blur');

      expect(input.props.value).toBe('20');
    });

    it('should reset invalid numeric input on blur', () => {
      const { getByTestId } = render(
        <QuantitySelector {...defaultProps} initialQuantity={15} />
      );

      const input = getByTestId('quantity-selector-input');
      fireEvent.changeText(input, 'notanumber');
      fireEvent(input, 'blur');

      expect(input.props.value).toBe('15');
    });
  });

  describe('Disabled state styling', () => {
    it('should show disabled styling for decrease button at minimum', () => {
      const { getByTestId } = render(
        <QuantitySelector
          {...defaultProps}
          initialQuantity={1}
          minQuantity={1}
        />
      );

      const decreaseButton = getByTestId('quantity-selector-decrease');
      // Verify the disabled style is applied in the style array
      const style = decreaseButton.props.style;
      expect(style).toContainEqual(
        expect.objectContaining({
          opacity: 0.5,
        })
      );
    });

    it('should show disabled styling for increase button at maximum', () => {
      const { getByTestId } = render(
        <QuantitySelector
          {...defaultProps}
          initialQuantity={100}
          maxQuantity={100}
        />
      );

      const increaseButton = getByTestId('quantity-selector-increase');
      // Verify the disabled style is applied in the style array
      const style = increaseButton.props.style;
      expect(style).toContainEqual(
        expect.objectContaining({
          opacity: 0.5,
        })
      );
    });

    it('should not apply disabled styles when buttons are enabled', () => {
      const { getByTestId } = render(
        <QuantitySelector
          {...defaultProps}
          initialQuantity={50}
          minQuantity={10}
          maxQuantity={100}
        />
      );

      const decreaseButton = getByTestId('quantity-selector-decrease');
      const increaseButton = getByTestId('quantity-selector-increase');

      // Verify disabled style (opacity: 0.5) is NOT in the style array
      const decreaseStyle = decreaseButton.props.style;
      expect(decreaseStyle).not.toContainEqual(
        expect.objectContaining({
          opacity: 0.5,
        })
      );

      const increaseStyle = increaseButton.props.style;
      expect(increaseStyle).not.toContainEqual(
        expect.objectContaining({
          opacity: 0.5,
        })
      );
    });
  });

  describe('Conditional styling logic', () => {
    it('should render with disabled styling for all disabled conditions', () => {
      const { getByTestId } = render(
        <QuantitySelector
          {...defaultProps}
          initialQuantity={1}
          minQuantity={1}
          maxQuantity={1}
        />
      );

      const decreaseButton = getByTestId('quantity-selector-decrease');
      const increaseButton = getByTestId('quantity-selector-increase');

      // Both buttons should have disabled styling
      const decreaseStyle = decreaseButton.props.style;
      const increaseStyle = increaseButton.props.style;

      expect(decreaseStyle).toContainEqual(expect.objectContaining({ opacity: 0.5 }));
      expect(increaseStyle).toContainEqual(expect.objectContaining({ opacity: 0.5 }));
    });

    it('should toggle disabled styles based on quantity position', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId, unmount } = render(
        <QuantitySelector
          {...defaultProps}
          initialQuantity={50}
          minQuantity={1}
          maxQuantity={100}
          onQuantityChange={onQuantityChange}
        />
      );

      // Both buttons should be enabled at position 50
      let decreaseButton = getByTestId('quantity-selector-decrease');
      let decreaseStyle = decreaseButton.props.style;
      // Style array: [buttonStyle, pressed, disabled] - disabled should be false
      expect(Array.isArray(decreaseStyle)).toBe(true);

      let increaseButton = getByTestId('quantity-selector-increase');
      let increaseStyle = increaseButton.props.style;
      expect(Array.isArray(increaseStyle)).toBe(true);

      // Clean up and render new instance at max
      unmount();

      const { getByTestId: getByTestIdMax } = render(
        <QuantitySelector
          {...defaultProps}
          initialQuantity={100}
          minQuantity={1}
          maxQuantity={100}
          onQuantityChange={onQuantityChange}
        />
      );

      increaseButton = getByTestIdMax('quantity-selector-increase');
      increaseStyle = increaseButton.props.style;
      // At max, should have disabled style (opacity: 0.5)
      expect(increaseStyle).toContainEqual(expect.objectContaining({ opacity: 0.5 }));
    });
  });
});
