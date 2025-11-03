import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PriceQuantitySection } from './PriceQuantitySection';

// Mock the translation hook
jest.mock('@/i18n/hooks', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock the QuantitySelector component
jest.mock('@/components/QuantitySelector', () => ({
  QuantitySelector: ({ onQuantityChange, testID, initialQuantity }: any) => {
    const { View, Text, Pressable } = require('react-native');
    return (
      <View testID={testID}>
        <Text>{initialQuantity}</Text>
        <Pressable
          testID={`${testID}-change`}
          onPress={() => onQuantityChange(initialQuantity + 1)}
        >
          <Text>Change</Text>
        </Pressable>
      </View>
    );
  },
}));

// Mock UI components
jest.mock('@/components/ui/vstack', () => ({
  VStack: ({ children, testID }: any) => {
    const { View } = require('react-native');
    return <View testID={testID}>{children}</View>;
  },
}));

jest.mock('@/components/ui/hstack', () => ({
  HStack: ({ children }: any) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));

jest.mock('@/components/ui/text', () => ({
  Text: ({ children, testID }: any) => {
    const { Text: RNText } = require('react-native');
    return <RNText testID={testID}>{children}</RNText>;
  },
}));

describe('PriceQuantitySection Component', () => {
  const defaultProps = {
    unitPrice: 2500,
    quantity: 1,
    maxQuantity: 100,
    onQuantityChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the price quantity section', () => {
      const { getByTestId } = render(<PriceQuantitySection {...defaultProps} />);

      expect(getByTestId('price-quantity-section')).toBeTruthy();
    });

    it('should render with custom testID', () => {
      const { getByTestId } = render(
        <PriceQuantitySection {...defaultProps} testID="custom-section" />
      );

      expect(getByTestId('custom-section')).toBeTruthy();
    });

    it('should render unit price label', () => {
      const { getByText } = render(<PriceQuantitySection {...defaultProps} />);

      expect(getByText('cart.unitPrice')).toBeTruthy();
    });

    it('should render formatted unit price', () => {
      const { getAllByText } = render(<PriceQuantitySection {...defaultProps} />);

      // formatCurrency formats 2500 as "$ 2.500" in Colombian pesos
      const priceElements = getAllByText(/2\.500/);
      expect(priceElements.length).toBeGreaterThan(0);
    });

    it('should render subtotal label when showAvailable is false', () => {
      const { getByText } = render(<PriceQuantitySection {...defaultProps} />);

      expect(getByText('cart.subtotal')).toBeTruthy();
    });

    it('should render calculated subtotal', () => {
      const { getByText } = render(
        <PriceQuantitySection {...defaultProps} quantity={3} />
      );

      // 2500 * 3 = 7500 formatted as "$ 7.500"
      expect(getByText(/7.500/)).toBeTruthy();
    });

    it('should render quantity label', () => {
      const { getByText } = render(<PriceQuantitySection {...defaultProps} />);

      expect(getByText('inventory.addToCartModal.quantity')).toBeTruthy();
    });

    it('should render QuantitySelector component', () => {
      const { getByTestId } = render(<PriceQuantitySection {...defaultProps} />);

      expect(getByTestId('price-quantity-section-quantity-selector')).toBeTruthy();
    });
  });

  describe('QuantitySelector integration', () => {
    it('should pass correct props to QuantitySelector', () => {
      const { getByTestId } = render(
        <PriceQuantitySection
          {...defaultProps}
          quantity={5}
          maxQuantity={50}
        />
      );

      const selector = getByTestId('price-quantity-section-quantity-selector');
      expect(selector).toBeTruthy();
      expect(getByTestId('price-quantity-section-quantity-selector-change')).toBeTruthy();
    });

    it('should call onQuantityChange when quantity is changed', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <PriceQuantitySection
          {...defaultProps}
          onQuantityChange={onQuantityChange}
        />
      );

      const changeButton = getByTestId('price-quantity-section-quantity-selector-change');
      fireEvent.press(changeButton);

      expect(onQuantityChange).toHaveBeenCalledWith(2);
    });

    it('should pass custom testID to QuantitySelector', () => {
      const { getByTestId } = render(
        <PriceQuantitySection {...defaultProps} testID="custom-section" />
      );

      expect(getByTestId('custom-section-quantity-selector')).toBeTruthy();
    });
  });

  describe('Price calculations', () => {
    it('should calculate subtotal correctly for quantity 1', () => {
      const { getAllByText } = render(
        <PriceQuantitySection {...defaultProps} unitPrice={1000} quantity={1} />
      );

      const priceElements = getAllByText(/1\.000/);
      expect(priceElements.length).toBeGreaterThan(0);
    });

    it('should calculate subtotal correctly for quantity 5', () => {
      const { getByText } = render(
        <PriceQuantitySection {...defaultProps} unitPrice={1000} quantity={5} />
      );

      // 1000 * 5 = 5000 formatted as "$ 5.000"
      expect(getByText(/5.000/)).toBeTruthy();
    });

    it('should calculate subtotal correctly for large quantities', () => {
      const { getByText } = render(
        <PriceQuantitySection {...defaultProps} unitPrice={2500} quantity={100} />
      );

      // 2500 * 100 = 250000 formatted as "$ 250.000"
      expect(getByText(/250.000/)).toBeTruthy();
    });

    it('should handle zero unit price', () => {
      const { getAllByText } = render(
        <PriceQuantitySection {...defaultProps} unitPrice={0} quantity={10} />
      );

      const zeroElements = getAllByText(/\$\s*0/);
      expect(zeroElements.length).toBeGreaterThan(0);
    });

    it('should handle large unit prices', () => {
      const { getAllByText } = render(
        <PriceQuantitySection {...defaultProps} unitPrice={999999} quantity={1} />
      );

      const largePrice = getAllByText(/999\.999/);
      expect(largePrice.length).toBeGreaterThan(0);
    });
  });

  describe('Available quantity display', () => {
    it('should show available quantity when showAvailable is true', () => {
      const { getByText, getAllByText } = render(
        <PriceQuantitySection
          {...defaultProps}
          showAvailable={true}
          availableQuantity={50}
        />
      );

      expect(getByText('inventory.addToCartModal.available')).toBeTruthy();
      const fiftyElements = getAllByText(/50/);
      expect(fiftyElements.length).toBeGreaterThan(0);
      // Units text is in the same Text component as the quantity
      expect(getByText(/inventory\.addToCartModal\.units/)).toBeTruthy();
    });

    it('should not show subtotal when showAvailable is true', () => {
      const { queryByText } = render(
        <PriceQuantitySection
          {...defaultProps}
          showAvailable={true}
          availableQuantity={50}
        />
      );

      expect(queryByText('cart.subtotal')).toBeNull();
    });

    it('should show subtotal when showAvailable is false', () => {
      const { getByText, queryByText } = render(
        <PriceQuantitySection {...defaultProps} showAvailable={false} />
      );

      expect(getByText('cart.subtotal')).toBeTruthy();
      expect(queryByText('inventory.addToCartModal.available')).toBeNull();
    });

    it('should show subtotal when showAvailable is undefined (default)', () => {
      const { getByText } = render(<PriceQuantitySection {...defaultProps} />);

      expect(getByText('cart.subtotal')).toBeTruthy();
    });

    it('should handle zero available quantity', () => {
      const { getByText } = render(
        <PriceQuantitySection
          {...defaultProps}
          showAvailable={true}
          availableQuantity={0}
        />
      );

      expect(getByText('inventory.addToCartModal.available')).toBeTruthy();
      expect(getByText(/inventory\.addToCartModal\.units/)).toBeTruthy();
    });

    it('should handle large available quantities', () => {
      const { getAllByText } = render(
        <PriceQuantitySection
          {...defaultProps}
          showAvailable={true}
          availableQuantity={99999}
        />
      );

      const largeQty = getAllByText(/99999/);
      expect(largeQty.length).toBeGreaterThan(0);
    });

    it('should show subtotal when showAvailable is true but availableQuantity is undefined', () => {
      const { getByText } = render(
        <PriceQuantitySection {...defaultProps} showAvailable={true} />
      );

      expect(getByText('cart.subtotal')).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('should handle minimum quantity of 1', () => {
      const { getByTestId } = render(
        <PriceQuantitySection
          {...defaultProps}
          quantity={1}
          maxQuantity={1}
        />
      );

      expect(getByTestId('price-quantity-section-quantity-selector')).toBeTruthy();
    });

    it('should handle maximum quantity', () => {
      const { getByText } = render(
        <PriceQuantitySection
          {...defaultProps}
          quantity={100}
          maxQuantity={100}
        />
      );

      // 2500 * 100 = 250000
      expect(getByText(/250.000/)).toBeTruthy();
    });

    it('should handle different quantity values', () => {
      const quantities = [1, 5, 10, 25, 50, 100];

      quantities.forEach((qty) => {
        const { getByTestId } = render(
          <PriceQuantitySection {...defaultProps} quantity={qty} />
        );

        // Just verify the component renders with the quantity
        expect(getByTestId('price-quantity-section')).toBeTruthy();
      });
    });
  });

  describe('Component updates', () => {
    it('should update subtotal when quantity changes', () => {
      const { getAllByText, rerender } = render(
        <PriceQuantitySection {...defaultProps} quantity={1} />
      );

      let prices = getAllByText(/2\.500/);
      expect(prices.length).toBeGreaterThan(0);

      rerender(<PriceQuantitySection {...defaultProps} quantity={2} />);

      prices = getAllByText(/5\.000/);
      expect(prices.length).toBeGreaterThan(0);
    });

    it('should update subtotal when unit price changes', () => {
      const { getAllByText, rerender } = render(
        <PriceQuantitySection {...defaultProps} unitPrice={1000} quantity={1} />
      );

      let prices = getAllByText(/1\.000/);
      expect(prices.length).toBeGreaterThan(0);

      rerender(<PriceQuantitySection {...defaultProps} unitPrice={2000} quantity={1} />);

      prices = getAllByText(/2\.000/);
      expect(prices.length).toBeGreaterThan(0);
    });

    it('should toggle between available quantity and subtotal display', () => {
      const { getByText, queryByText, rerender } = render(
        <PriceQuantitySection {...defaultProps} showAvailable={false} />
      );

      expect(getByText('cart.subtotal')).toBeTruthy();
      expect(queryByText('inventory.addToCartModal.available')).toBeNull();

      rerender(
        <PriceQuantitySection
          {...defaultProps}
          showAvailable={true}
          availableQuantity={50}
        />
      );

      expect(queryByText('cart.subtotal')).toBeNull();
      expect(getByText('inventory.addToCartModal.available')).toBeTruthy();
    });

    it('should update available quantity display when value changes', () => {
      const { getAllByText, rerender } = render(
        <PriceQuantitySection
          {...defaultProps}
          showAvailable={true}
          availableQuantity={50}
        />
      );

      let qty = getAllByText(/50/);
      expect(qty.length).toBeGreaterThan(0);

      rerender(
        <PriceQuantitySection
          {...defaultProps}
          showAvailable={true}
          availableQuantity={100}
        />
      );

      qty = getAllByText(/100/);
      expect(qty.length).toBeGreaterThan(0);
    });
  });

  describe('Multiple onQuantityChange calls', () => {
    it('should call onQuantityChange multiple times', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <PriceQuantitySection
          {...defaultProps}
          onQuantityChange={onQuantityChange}
        />
      );

      const changeButton = getByTestId('price-quantity-section-quantity-selector-change');

      fireEvent.press(changeButton);
      fireEvent.press(changeButton);
      fireEvent.press(changeButton);

      expect(onQuantityChange).toHaveBeenCalledTimes(3);
    });

    it('should handle rapid quantity changes', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <PriceQuantitySection
          {...defaultProps}
          onQuantityChange={onQuantityChange}
        />
      );

      const changeButton = getByTestId('price-quantity-section-quantity-selector-change');

      for (let i = 0; i < 10; i++) {
        fireEvent.press(changeButton);
      }

      expect(onQuantityChange).toHaveBeenCalledTimes(10);
    });
  });

  describe('Complex scenarios', () => {
    it('should handle switching from subtotal to available display mid-session', () => {
      const { getByText, queryByText, rerender } = render(
        <PriceQuantitySection
          {...defaultProps}
          unitPrice={3000}
          quantity={5}
          showAvailable={false}
        />
      );

      // Initially showing subtotal: 3000 * 5 = 15000
      expect(getByText('cart.subtotal')).toBeTruthy();
      expect(getByText(/15.000/)).toBeTruthy();

      // Switch to available quantity display
      rerender(
        <PriceQuantitySection
          {...defaultProps}
          unitPrice={3000}
          quantity={5}
          showAvailable={true}
          availableQuantity={200}
        />
      );

      expect(queryByText('cart.subtotal')).toBeNull();
      expect(getByText('inventory.addToCartModal.available')).toBeTruthy();
      expect(getByText(/200/)).toBeTruthy();
    });

    it('should maintain correct calculations after multiple prop changes', () => {
      const { getByText, rerender } = render(
        <PriceQuantitySection
          {...defaultProps}
          unitPrice={1000}
          quantity={2}
        />
      );

      expect(getByText(/2.000/)).toBeTruthy();

      rerender(
        <PriceQuantitySection
          {...defaultProps}
          unitPrice={1500}
          quantity={2}
        />
      );

      expect(getByText(/3.000/)).toBeTruthy();

      rerender(
        <PriceQuantitySection
          {...defaultProps}
          unitPrice={1500}
          quantity={4}
        />
      );

      expect(getByText(/6.000/)).toBeTruthy();
    });
  });

  describe('Available quantity edge cases', () => {
    it('should handle availableQuantity with showAvailable false', () => {
      const { getByText, queryByText } = render(
        <PriceQuantitySection
          {...defaultProps}
          showAvailable={false}
          availableQuantity={100}
        />
      );

      // Should show subtotal, not available quantity
      expect(getByText('cart.subtotal')).toBeTruthy();
      expect(queryByText('inventory.addToCartModal.available')).toBeNull();
    });

    it('should handle showAvailable true with null availableQuantity', () => {
      const { getByText, queryByText } = render(
        <PriceQuantitySection
          {...defaultProps}
          showAvailable={true}
          availableQuantity={null as any}
        />
      );

      // When null is passed, it's falsy but !== undefined, so it shows available with empty value
      expect(getByText('inventory.addToCartModal.available')).toBeTruthy();
      expect(getByText(/inventory\.addToCartModal\.units/)).toBeTruthy();
    });

    it('should display available quantity of exactly 1', () => {
      const { getByText } = render(
        <PriceQuantitySection
          {...defaultProps}
          showAvailable={true}
          availableQuantity={1}
        />
      );

      expect(getByText('inventory.addToCartModal.available')).toBeTruthy();
      expect(getByText(/inventory\.addToCartModal\.units/)).toBeTruthy();
    });
  });
});
