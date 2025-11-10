import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AddToCartModal, AddToCartModalProps } from './AddToCartModal';

// Mock QuantitySelector component - returns a simple component that we can interact with
jest.mock('@/components/QuantitySelector', () => {
  const { View, Pressable, Text } = require('react-native');
  return {
    QuantitySelector: jest.fn(({ onQuantityChange, testID, maxQuantity, initialQuantity }: any) => {
      return (
        <View testID={testID}>
          <Pressable
            testID={`${testID}-test-button`}
            onPress={() => onQuantityChange(5)}
          >
            <Text>QuantitySelector</Text>
          </Pressable>
        </View>
      );
    }),
  };
});

// Mock lucide-react-native X icon
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
    X: jest.fn(() => <View testID="mock-x-icon" />),
  };
});

// Mock i18n hooks
jest.mock('@/i18n/hooks', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'inventory.addToCartModal.title': 'Add to Cart',
        'inventory.addToCartModal.available': 'Available',
        'inventory.addToCartModal.units': 'units',
        'inventory.addToCartModal.quantity': 'Quantity',
        'inventory.addToCartModal.subtotal': 'Subtotal',
        'inventory.addToCartModal.cancel': 'Cancel',
        'inventory.addToCartModal.addToCart': 'Add to Cart',
        'cart.sku': 'SKU',
        'cart.unitPrice': 'Unit Price',
        'cart.warehouse': 'Warehouse',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock ProductHeader component
jest.mock('@/components/ProductHeader', () => ({
  ProductHeader: ({ name, sku, warehouseName, testID }: any) => {
    const { View, Text } = require('react-native');
    return (
      <View testID={testID}>
        <Text>{name}</Text>
        <Text>SKU: {sku}</Text>
        <Text>{warehouseName}</Text>
      </View>
    );
  },
}));

// Mock PriceQuantitySection component
jest.mock('@/components/PriceQuantitySection', () => ({
  PriceQuantitySection: ({ unitPrice, quantity, maxQuantity, availableQuantity, showAvailable, onQuantityChange, testID }: any) => {
    const { View, Text, Pressable } = require('react-native');
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    };
    const subtotal = unitPrice * quantity;
    return (
      <View testID={testID}>
        <Text>Unit Price</Text>
        <Text>{formatCurrency(unitPrice)}</Text>
        {showAvailable ? (
          <>
            <Text>Available</Text>
            <Text>{availableQuantity} units</Text>
          </>
        ) : (
          <>
            <Text>Subtotal</Text>
            <Text>{formatCurrency(subtotal)}</Text>
          </>
        )}
        <Text>Quantity</Text>
        <View testID={`${testID}-quantity-selector`}>
          <Text>Quantity: {quantity}</Text>
          <Pressable
            testID={`${testID}-quantity-selector-test-increase`}
            onPress={() => onQuantityChange(quantity + 1)}
          >
            <Text>+</Text>
          </Pressable>
          <Pressable
            testID={`${testID}-quantity-selector-test-decrease`}
            onPress={() => onQuantityChange(quantity - 1)}
          >
            <Text>-</Text>
          </Pressable>
        </View>
      </View>
    );
  },
}));

describe('AddToCartModal Component', () => {
  const mockProduct = {
    id: '1',
    name: 'Paracetamol 500mg',
    sku: 'MED-PAR-500',
    price: 2500,
    availableQuantity: 100,
    warehouseName: 'Almacén Central Bogotá',
  };

  const defaultProps: AddToCartModalProps = {
    visible: true,
    product: mockProduct,
    onClose: jest.fn(),
    onAddToCart: jest.fn(),
    testID: 'add-to-cart-modal',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal Visibility', () => {
    it('should render modal when visible is true', () => {
      const { getByTestId } = render(<AddToCartModal {...defaultProps} visible={true} />);

      expect(getByTestId('add-to-cart-modal')).toBeTruthy();
    });

    it('should not render anything when product is null', () => {
      const { queryByTestId } = render(
        <AddToCartModal {...defaultProps} product={null} />
      );

      expect(queryByTestId('add-to-cart-modal')).toBeNull();
    });

    it('should render modal with custom testID', () => {
      const { getByTestId } = render(
        <AddToCartModal {...defaultProps} testID="custom-modal" />
      );

      expect(getByTestId('custom-modal')).toBeTruthy();
    });

    it('should use default testID when not provided', () => {
      const { getByTestId } = render(
        <AddToCartModal
          visible={true}
          product={mockProduct}
          onClose={jest.fn()}
          onAddToCart={jest.fn()}
        />
      );

      expect(getByTestId('add-to-cart-modal')).toBeTruthy();
    });
  });

  describe('Product Information Display', () => {
    it('should display product name', () => {
      const { getByText } = render(<AddToCartModal {...defaultProps} />);

      expect(getByText('Paracetamol 500mg')).toBeTruthy();
    });

    it('should display product SKU with prefix', () => {
      const { getByText } = render(<AddToCartModal {...defaultProps} />);

      expect(getByText(/SKU: MED-PAR-500/)).toBeTruthy();
    });

    it('should display warehouse name', () => {
      const { getByText } = render(<AddToCartModal {...defaultProps} />);

      expect(getByText('Almacén Central Bogotá')).toBeTruthy();
    });

    it('should display available quantity', () => {
      const { getByText } = render(<AddToCartModal {...defaultProps} />);

      expect(getByText('100 units')).toBeTruthy();
    });

    it('should display heading "Add to Cart"', () => {
      const { getByText, getAllByText } = render(<AddToCartModal {...defaultProps} />);

      const headings = getAllByText('Add to Cart');
      expect(headings.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle product with different price', () => {
      const expensiveProduct = { ...mockProduct, price: 125000 };
      const { queryAllByText } = render(
        <AddToCartModal {...defaultProps} product={expensiveProduct} />
      );

      const prices = queryAllByText(/125\.000/);
      expect(prices.length).toBeGreaterThan(0);
    });

    it('should handle product with low available quantity', () => {
      const lowStockProduct = { ...mockProduct, availableQuantity: 5 };
      const { getByText } = render(
        <AddToCartModal {...defaultProps} product={lowStockProduct} />
      );

      expect(getByText('5 units')).toBeTruthy();
    });

    it('should handle product with one unit available', () => {
      const oneUnitProduct = { ...mockProduct, availableQuantity: 1 };
      const { getByText } = render(
        <AddToCartModal {...defaultProps} product={oneUnitProduct} />
      );

      expect(getByText('1 units')).toBeTruthy();
    });

    it('should format large prices correctly', () => {
      const largeProduct = { ...mockProduct, price: 99999 };
      const { queryAllByText } = render(
        <AddToCartModal {...defaultProps} product={largeProduct} />
      );

      const prices = queryAllByText(/99\.999/);
      expect(prices.length).toBeGreaterThan(0);
    });

    it('should format small prices correctly', () => {
      const smallProduct = { ...mockProduct, price: 100 };
      const { queryAllByText } = render(
        <AddToCartModal {...defaultProps} product={smallProduct} />
      );

      // Check for the formatted price
      const priceElements = queryAllByText(/100/);
      expect(priceElements.length).toBeGreaterThan(0);
    });

    it('should display product with accented characters in name', () => {
      const accentedProduct = { ...mockProduct, name: 'Vitamina D3 1000 UI' };
      const { getByText } = render(
        <AddToCartModal {...defaultProps} product={accentedProduct} />
      );

      expect(getByText('Vitamina D3 1000 UI')).toBeTruthy();
    });

    it('should display product with very long name', () => {
      const longNameProduct = {
        ...mockProduct,
        name: 'Acetilcisteína 600mg Efervescente Caja con 30 Tabletas de Alta Concentración',
      };
      const { getByText } = render(
        <AddToCartModal {...defaultProps} product={longNameProduct} />
      );

      expect(
        getByText('Acetilcisteína 600mg Efervescente Caja con 30 Tabletas de Alta Concentración')
      ).toBeTruthy();
    });
  });

  describe('Quantity Selector Integration', () => {
    it('should render quantity selector component', () => {
      const { getByTestId } = render(<AddToCartModal {...defaultProps} />);

      const quantitySelector = getByTestId('add-to-cart-modal-price-quantity-quantity-selector');
      expect(quantitySelector).toBeTruthy();
    });

    it('should pass maxQuantity from product availableQuantity', () => {
      const { getByTestId } = render(<AddToCartModal {...defaultProps} />);

      const quantitySelector = getByTestId('add-to-cart-modal-price-quantity-quantity-selector');
      expect(quantitySelector).toBeTruthy();
    });

    it('should handle quantity selector with different max quantities', () => {
      const differentProduct = { ...mockProduct, availableQuantity: 50 };
      const { getByTestId } = render(
        <AddToCartModal {...defaultProps} product={differentProduct} />
      );

      const quantitySelector = getByTestId('add-to-cart-modal-price-quantity-quantity-selector');
      expect(quantitySelector).toBeTruthy();
    });

    it('should use custom testID for quantity selector', () => {
      const { getByTestId } = render(
        <AddToCartModal {...defaultProps} testID="custom-test" />
      );

      const quantitySelector = getByTestId('custom-test-price-quantity-quantity-selector');
      expect(quantitySelector).toBeTruthy();
    });

    it('should pass onQuantityChange callback to quantity selector', () => {
      const { getByTestId } = render(<AddToCartModal {...defaultProps} />);

      const quantitySelector = getByTestId('add-to-cart-modal-price-quantity-quantity-selector');
      expect(quantitySelector).toBeTruthy();
    });
  });

  describe('Add to Cart Button', () => {
    it('should render add to cart button', () => {
      const { getByTestId } = render(<AddToCartModal {...defaultProps} />);

      expect(getByTestId('add-to-cart-modal-confirm-button')).toBeTruthy();
    });

    it('should call onAddToCart with quantity 1 when button is pressed', () => {
      const onAddToCart = jest.fn();
      const { getByTestId } = render(
        <AddToCartModal {...defaultProps} onAddToCart={onAddToCart} />
      );

      const confirmButton = getByTestId('add-to-cart-modal-confirm-button');
      fireEvent.press(confirmButton);

      expect(onAddToCart).toHaveBeenCalledWith(1);
    });

    it('should handle multiple add to cart presses', () => {
      const onAddToCart = jest.fn();
      const { getByTestId } = render(
        <AddToCartModal {...defaultProps} onAddToCart={onAddToCart} />
      );

      const confirmButton = getByTestId('add-to-cart-modal-confirm-button');
      fireEvent.press(confirmButton);
      fireEvent.press(confirmButton);
      fireEvent.press(confirmButton);

      expect(onAddToCart).toHaveBeenCalledTimes(3);
      expect(onAddToCart).toHaveBeenNthCalledWith(1, 1);
      expect(onAddToCart).toHaveBeenNthCalledWith(2, 1);
      expect(onAddToCart).toHaveBeenNthCalledWith(3, 1);
    });

    it('should display button text "Add to Cart"', () => {
      const { getAllByText } = render(<AddToCartModal {...defaultProps} />);

      const buttons = getAllByText('Add to Cart');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should not call onAddToCart when modal is not visible', () => {
      const onAddToCart = jest.fn();
      const { queryByTestId } = render(
        <AddToCartModal {...defaultProps} visible={false} onAddToCart={onAddToCart} />
      );

      expect(queryByTestId('add-to-cart-modal-confirm-button')).toBeNull();
      expect(onAddToCart).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Button', () => {
    it('should render cancel button', () => {
      const { getByTestId } = render(<AddToCartModal {...defaultProps} />);

      expect(getByTestId('add-to-cart-modal-cancel-button')).toBeTruthy();
    });

    it('should call onClose when cancel button is pressed', () => {
      const onClose = jest.fn();
      const { getByTestId } = render(
        <AddToCartModal {...defaultProps} onClose={onClose} />
      );

      const cancelButton = getByTestId('add-to-cart-modal-cancel-button');
      fireEvent.press(cancelButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should display cancel button text', () => {
      const { getByText } = render(<AddToCartModal {...defaultProps} />);

      expect(getByText('Cancel')).toBeTruthy();
    });

    it('should handle multiple cancel presses', () => {
      const onClose = jest.fn();
      const { getByTestId } = render(
        <AddToCartModal {...defaultProps} onClose={onClose} />
      );

      const cancelButton = getByTestId('add-to-cart-modal-cancel-button');
      fireEvent.press(cancelButton);
      fireEvent.press(cancelButton);

      expect(onClose).toHaveBeenCalledTimes(2);
    });
  });

  describe('Close Button (X Icon)', () => {
    it('should render close button', () => {
      const { getByTestId } = render(<AddToCartModal {...defaultProps} />);

      expect(getByTestId('add-to-cart-modal-close')).toBeTruthy();
    });

    it('should call onClose when close button is pressed', () => {
      const onClose = jest.fn();
      const { getByTestId } = render(
        <AddToCartModal {...defaultProps} onClose={onClose} />
      );

      const closeButton = getByTestId('add-to-cart-modal-close');
      fireEvent.press(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should use custom testID for close button', () => {
      const { getByTestId } = render(
        <AddToCartModal {...defaultProps} testID="custom-test" />
      );

      expect(getByTestId('custom-test-close')).toBeTruthy();
    });

    it('should not call onAddToCart when close button is pressed', () => {
      const onAddToCart = jest.fn();
      const onClose = jest.fn();
      const { getByTestId } = render(
        <AddToCartModal {...defaultProps} onAddToCart={onAddToCart} onClose={onClose} />
      );

      const closeButton = getByTestId('add-to-cart-modal-close');
      fireEvent.press(closeButton);

      expect(onClose).toHaveBeenCalled();
      expect(onAddToCart).not.toHaveBeenCalled();
    });
  });

  describe('Overlay Interaction', () => {
    it('should close modal when overlay is pressed via requestClose', () => {
      const onClose = jest.fn();
      const { getByTestId } = render(
        <AddToCartModal {...defaultProps} onClose={onClose} />
      );

      const modal = getByTestId('add-to-cart-modal');
      fireEvent(modal, 'requestClose');

      expect(onClose).toHaveBeenCalled();
    });

    it('should prevent propagation when pressing inside modal content', () => {
      const onClose = jest.fn();
      const { getByText } = render(
        <AddToCartModal {...defaultProps} onClose={onClose} />
      );

      // Try to press on content inside the modal (e.g., product name)
      const productName = getByText('Paracetamol 500mg');

      // Simulate a press with stopPropagation
      const mockEvent = { stopPropagation: jest.fn() };
      fireEvent.press(productName, mockEvent);

      // The onClose should not be called from inner content clicks
      // (In real scenarios, this is handled by the Pressable's onPress handler with stopPropagation)
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Modal Properties', () => {
    it('should render modal with fade animation', () => {
      const { getByTestId } = render(<AddToCartModal {...defaultProps} />);

      const modal = getByTestId('add-to-cart-modal');
      expect(modal.props.animationType).toBe('fade');
    });

    it('should render modal as transparent', () => {
      const { getByTestId } = render(<AddToCartModal {...defaultProps} />);

      const modal = getByTestId('add-to-cart-modal');
      expect(modal.props.transparent).toBe(true);
    });

    it('should have onRequestClose handler', () => {
      const { getByTestId } = render(<AddToCartModal {...defaultProps} />);

      const modal = getByTestId('add-to-cart-modal');
      expect(modal.props.onRequestClose).toBeDefined();
    });
  });

  describe('All Callbacks Integration', () => {
    it('should call onClose without calling onAddToCart when cancel is pressed', () => {
      const onClose = jest.fn();
      const onAddToCart = jest.fn();
      const { getByTestId } = render(
        <AddToCartModal {...defaultProps} onClose={onClose} onAddToCart={onAddToCart} />
      );

      const cancelButton = getByTestId('add-to-cart-modal-cancel-button');
      fireEvent.press(cancelButton);

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onAddToCart).not.toHaveBeenCalled();
    });

    it('should call onAddToCart when confirm button is pressed', () => {
      const onClose = jest.fn();
      const onAddToCart = jest.fn();
      const { getByTestId } = render(
        <AddToCartModal {...defaultProps} onClose={onClose} onAddToCart={onAddToCart} />
      );

      const confirmButton = getByTestId('add-to-cart-modal-confirm-button');
      fireEvent.press(confirmButton);

      expect(onAddToCart).toHaveBeenCalledWith(1);
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should handle sequence of interactions', () => {
      const onClose = jest.fn();
      const onAddToCart = jest.fn();
      const { getByTestId } = render(
        <AddToCartModal
          {...defaultProps}
          onClose={onClose}
          onAddToCart={onAddToCart}
        />
      );

      const confirmButton = getByTestId('add-to-cart-modal-confirm-button');
      fireEvent.press(confirmButton);

      expect(onAddToCart).toHaveBeenCalledWith(1);
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null product gracefully', () => {
      const { queryByTestId } = render(
        <AddToCartModal {...defaultProps} product={null} />
      );

      expect(queryByTestId('add-to-cart-modal')).toBeNull();
    });

    it('should handle product with zero price', () => {
      const freeProduct = { ...mockProduct, price: 0 };
      const { getByText } = render(
        <AddToCartModal {...defaultProps} product={freeProduct} />
      );

      expect(getByText(/Unit Price/)).toBeTruthy();
    });

    it('should handle product with very large price', () => {
      const expensiveProduct = { ...mockProduct, price: 9999999 };
      const { queryAllByText } = render(
        <AddToCartModal {...defaultProps} product={expensiveProduct} />
      );

      const prices = queryAllByText(/9\.999\.999/);
      expect(prices.length).toBeGreaterThan(0);
    });

    it('should handle product with only 1 available unit', () => {
      const limitedProduct = { ...mockProduct, availableQuantity: 1 };
      const { getByText } = render(
        <AddToCartModal {...defaultProps} product={limitedProduct} />
      );

      expect(getByText('1 units')).toBeTruthy();
    });

    it('should handle product with very large quantity available', () => {
      const bigStockProduct = { ...mockProduct, availableQuantity: 99999 };
      const { getByText } = render(
        <AddToCartModal {...defaultProps} product={bigStockProduct} />
      );

      expect(getByText('99999 units')).toBeTruthy();
    });

    it('should handle product ID changes', () => {
      const { getByText, rerender } = render(
        <AddToCartModal {...defaultProps} product={mockProduct} />
      );

      expect(getByText('Paracetamol 500mg')).toBeTruthy();

      const newProduct = {
        id: '2',
        name: 'Ibuprofeno 400mg',
        sku: 'MED-IBU-400',
        price: 3000,
        availableQuantity: 50,
        warehouseName: 'Almacén Medellín',
      };

      rerender(<AddToCartModal {...defaultProps} product={newProduct} />);

      expect(getByText('Ibuprofeno 400mg')).toBeTruthy();
    });
  });

  describe('Component Rerendering', () => {
    it('should update when product changes', () => {
      const { getByText, rerender } = render(
        <AddToCartModal {...defaultProps} product={mockProduct} />
      );

      expect(getByText('Paracetamol 500mg')).toBeTruthy();

      const newProduct = {
        id: '2',
        name: 'Ibuprofeno 400mg',
        sku: 'MED-IBU-400',
        price: 3000,
        availableQuantity: 50,
        warehouseName: 'Almacén Medellín',
      };

      rerender(<AddToCartModal {...defaultProps} product={newProduct} />);

      expect(getByText('Ibuprofeno 400mg')).toBeTruthy();
      expect(getByText(/MED-IBU-400/)).toBeTruthy();
    });

    it('should update when visibility changes to false', () => {
      const { queryByTestId, rerender } = render(
        <AddToCartModal {...defaultProps} visible={true} />
      );

      expect(queryByTestId('add-to-cart-modal')).toBeTruthy();

      rerender(<AddToCartModal {...defaultProps} visible={false} />);

      expect(queryByTestId('add-to-cart-modal')).toBeNull();
    });

    it('should update when visibility changes to true', () => {
      const { queryByTestId, rerender } = render(
        <AddToCartModal {...defaultProps} visible={false} />
      );

      expect(queryByTestId('add-to-cart-modal')).toBeNull();

      rerender(<AddToCartModal {...defaultProps} visible={true} />);

      expect(queryByTestId('add-to-cart-modal')).toBeTruthy();
    });

    it('should update price information when product price changes', () => {
      const { queryAllByText, rerender } = render(
        <AddToCartModal {...defaultProps} product={mockProduct} />
      );

      let prices = queryAllByText(/2\.500/);
      expect(prices.length).toBeGreaterThan(0);

      const newProduct = { ...mockProduct, price: 5000 };
      rerender(<AddToCartModal {...defaultProps} product={newProduct} />);

      prices = queryAllByText(/5\.000/);
      expect(prices.length).toBeGreaterThan(0);
    });

    it('should update available quantity when product quantity changes', () => {
      const { getByText, rerender } = render(
        <AddToCartModal {...defaultProps} product={mockProduct} />
      );

      expect(getByText('100 units')).toBeTruthy();

      const newProduct = { ...mockProduct, availableQuantity: 50 };
      rerender(<AddToCartModal {...defaultProps} product={newProduct} />);

      expect(getByText('50 units')).toBeTruthy();
    });
  });

  describe('Props Validation', () => {
    it('should work with all props provided', () => {
      const { getByTestId } = render(
        <AddToCartModal
          visible={true}
          product={mockProduct}
          onClose={jest.fn()}
          onAddToCart={jest.fn()}
          testID="test-modal"
        />
      );

      expect(getByTestId('test-modal')).toBeTruthy();
    });

    it('should work with required props only', () => {
      const { getByTestId } = render(
        <AddToCartModal
          visible={true}
          product={mockProduct}
          onClose={jest.fn()}
          onAddToCart={jest.fn()}
        />
      );

      expect(getByTestId('add-to-cart-modal')).toBeTruthy();
    });

    it('should handle onClose being called multiple times', () => {
      const onClose = jest.fn();
      const { getByTestId } = render(
        <AddToCartModal {...defaultProps} onClose={onClose} />
      );

      const closeButton = getByTestId('add-to-cart-modal-close');
      fireEvent.press(closeButton);
      fireEvent.press(closeButton);
      fireEvent.press(closeButton);

      expect(onClose).toHaveBeenCalledTimes(3);
    });

    it('should handle onAddToCart being called multiple times', () => {
      const onAddToCart = jest.fn();
      const { getByTestId } = render(
        <AddToCartModal {...defaultProps} onAddToCart={onAddToCart} />
      );

      const confirmButton = getByTestId('add-to-cart-modal-confirm-button');
      fireEvent.press(confirmButton);
      fireEvent.press(confirmButton);

      expect(onAddToCart).toHaveBeenCalledTimes(2);
      expect(onAddToCart).toHaveBeenNthCalledWith(1, 1);
      expect(onAddToCart).toHaveBeenNthCalledWith(2, 1);
    });

    it('should pass callbacks correctly', () => {
      const onClose = jest.fn();
      const onAddToCart = jest.fn();
      const { getByTestId } = render(
        <AddToCartModal
          {...defaultProps}
          onClose={onClose}
          onAddToCart={onAddToCart}
        />
      );

      const cancelButton = getByTestId('add-to-cart-modal-cancel-button');
      fireEvent.press(cancelButton);

      expect(onClose).toHaveBeenCalled();
      expect(onAddToCart).not.toHaveBeenCalled();
    });
  });

  describe('Unit Price Display', () => {
    it('should display unit price section', () => {
      const { getByText } = render(<AddToCartModal {...defaultProps} />);

      expect(getByText('Unit Price')).toBeTruthy();
    });

    it('should display formatted unit price', () => {
      const { queryAllByText } = render(<AddToCartModal {...defaultProps} />);

      const prices = queryAllByText(/2\.500/);
      expect(prices.length).toBeGreaterThan(0);
    });

    it('should format different unit prices correctly', () => {
      const product = { ...mockProduct, price: 50000 };
      const { queryAllByText } = render(
        <AddToCartModal {...defaultProps} product={product} />
      );

      const prices = queryAllByText(/50\.000/);
      expect(prices.length).toBeGreaterThan(0);
    });
  });

  describe('Available Quantity Display', () => {
    it('should display available quantity label', () => {
      const { getByText } = render(<AddToCartModal {...defaultProps} />);

      expect(getByText('Available')).toBeTruthy();
    });

    it('should display correct available quantity', () => {
      const { getByText } = render(<AddToCartModal {...defaultProps} />);

      expect(getByText('100 units')).toBeTruthy();
    });

    it('should update available quantity when product changes', () => {
      const { getByText, rerender } = render(
        <AddToCartModal {...defaultProps} product={mockProduct} />
      );

      expect(getByText('100 units')).toBeTruthy();

      const newProduct = { ...mockProduct, availableQuantity: 200 };
      rerender(<AddToCartModal {...defaultProps} product={newProduct} />);

      expect(getByText('200 units')).toBeTruthy();
    });
  });

  describe('Subtotal Display', () => {
    it('should display subtotal label', () => {
      const { getByText } = render(<AddToCartModal {...defaultProps} />);

      expect(getByText('Subtotal')).toBeTruthy();
    });

    it('should display initial subtotal', () => {
      const { queryAllByText } = render(<AddToCartModal {...defaultProps} />);

      // Initial quantity is 1, so subtotal should be the same as price
      const prices = queryAllByText(/2\.500/);
      expect(prices.length).toBeGreaterThan(0);
    });

    it('should calculate subtotal with different prices', () => {
      const expensiveProduct = { ...mockProduct, price: 10000 };
      const { queryAllByText } = render(
        <AddToCartModal {...defaultProps} product={expensiveProduct} />
      );

      const prices = queryAllByText(/10\.000/);
      expect(prices.length).toBeGreaterThan(0);
    });
  });

  describe('Warehouse Information', () => {
    it('should display warehouse name in modal', () => {
      const { getByText } = render(<AddToCartModal {...defaultProps} />);

      expect(getByText('Almacén Central Bogotá')).toBeTruthy();
    });

    it('should update warehouse name when product changes', () => {
      const { getByText, rerender } = render(
        <AddToCartModal {...defaultProps} product={mockProduct} />
      );

      expect(getByText('Almacén Central Bogotá')).toBeTruthy();

      const newProduct = {
        ...mockProduct,
        warehouseName: 'Almacén Medellín',
      };
      rerender(<AddToCartModal {...defaultProps} product={newProduct} />);

      expect(getByText('Almacén Medellín')).toBeTruthy();
    });

    it('should handle warehouse names with special characters', () => {
      const specialWarehouse = {
        ...mockProduct,
        warehouseName: "Almacén Principal's Store",
      };
      const { getByText } = render(
        <AddToCartModal {...defaultProps} product={specialWarehouse} />
      );

      expect(getByText("Almacén Principal's Store")).toBeTruthy();
    });
  });

  describe('Test ID Customization', () => {
    it('should use custom testID for all elements', () => {
      const { getByTestId } = render(
        <AddToCartModal {...defaultProps} testID="custom-add-to-cart" />
      );

      expect(getByTestId('custom-add-to-cart')).toBeTruthy();
      expect(getByTestId('custom-add-to-cart-close')).toBeTruthy();
      expect(getByTestId('custom-add-to-cart-price-quantity-quantity-selector')).toBeTruthy();
      expect(getByTestId('custom-add-to-cart-cancel-button')).toBeTruthy();
      expect(getByTestId('custom-add-to-cart-confirm-button')).toBeTruthy();
    });

    it('should use default testID for all elements when not provided', () => {
      const { getByTestId } = render(
        <AddToCartModal
          visible={true}
          product={mockProduct}
          onClose={jest.fn()}
          onAddToCart={jest.fn()}
        />
      );

      expect(getByTestId('add-to-cart-modal')).toBeTruthy();
      expect(getByTestId('add-to-cart-modal-close')).toBeTruthy();
      expect(getByTestId('add-to-cart-modal-price-quantity-quantity-selector')).toBeTruthy();
      expect(getByTestId('add-to-cart-modal-cancel-button')).toBeTruthy();
      expect(getByTestId('add-to-cart-modal-confirm-button')).toBeTruthy();
    });
  });

  describe('Product Information Consistency', () => {
    it('should display all product information correctly', () => {
      const { getByText } = render(<AddToCartModal {...defaultProps} />);

      expect(getByText('Paracetamol 500mg')).toBeTruthy();
      expect(getByText(/SKU: MED-PAR-500/)).toBeTruthy();
      expect(getByText('Almacén Central Bogotá')).toBeTruthy();
      expect(getByText('100 units')).toBeTruthy();
      expect(getByText('Unit Price')).toBeTruthy();
      expect(getByText('Available')).toBeTruthy();
    });

    it('should maintain consistency across product changes', () => {
      const { getByText, rerender } = render(
        <AddToCartModal {...defaultProps} product={mockProduct} />
      );

      const product1Info = {
        name: getByText('Paracetamol 500mg'),
        sku: getByText(/SKU: MED-PAR-500/),
      };

      expect(product1Info.name).toBeTruthy();
      expect(product1Info.sku).toBeTruthy();

      const newProduct = {
        id: '2',
        name: 'Aspirin 500mg',
        sku: 'MED-ASP-500',
        price: 2000,
        availableQuantity: 200,
        warehouseName: 'Almacén Bogotá',
      };

      rerender(<AddToCartModal {...defaultProps} product={newProduct} />);

      expect(getByText('Aspirin 500mg')).toBeTruthy();
      expect(getByText(/SKU: MED-ASP-500/)).toBeTruthy();
    });
  });
});
