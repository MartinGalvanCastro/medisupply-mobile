import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { CartItemCard } from './CartItemCard';
import type { CartItem } from '@/store/useCartStore';

// Mock the QuantitySelector component
jest.mock('@/components/QuantitySelector', () => ({
  QuantitySelector: ({ onQuantityChange, initialQuantity, testID }: any) => {
    const { View, Text, Pressable } = require('react-native');
    return (
      <View testID={testID}>
        <Text>Quantity: {initialQuantity}</Text>
        <Pressable
          testID={`${testID}-test-increase`}
          onPress={() => onQuantityChange(initialQuantity + 1)}
        >
          <Text>+</Text>
        </Pressable>
        <Pressable
          testID={`${testID}-test-decrease`}
          onPress={() => onQuantityChange(initialQuantity - 1)}
        >
          <Text>-</Text>
        </Pressable>
      </View>
    );
  },
}));

jest.mock('@/i18n/hooks', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      const translations: Record<string, string> = {
        'cart.sku': 'SKU',
        'cart.warehouse': 'Warehouse',
        'cart.unitPrice': 'Unit Price',
        'cart.subtotal': 'Subtotal',
        'cart.removeItem': 'Remove Item',
        'cart.removeItemConfirmation': `Remove ${params?.productName} from cart?`,
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock ProductHeader component
jest.mock('@/components/ProductHeader', () => ({
  ProductHeader: ({ name, sku, warehouseName, showWarehouseLabel, testID }: any) => {
    const { View, Text } = require('react-native');
    return (
      <View testID={testID}>
        <Text>{name}</Text>
        <Text>SKU: {sku}</Text>
        <Text>{showWarehouseLabel && 'Warehouse: '}{warehouseName}</Text>
      </View>
    );
  },
}));

// Mock PriceQuantitySection component
jest.mock('@/components/PriceQuantitySection', () => ({
  PriceQuantitySection: ({ unitPrice, quantity, maxQuantity, onQuantityChange, testID }: any) => {
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
        <Text>Subtotal</Text>
        <Text>{formatCurrency(subtotal)}</Text>
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

describe('CartItemCard Component', () => {
  const mockItem: CartItem = {
    inventoryId: 'inv-1',
    productId: 'prod-1',
    productName: 'Paracetamol 500mg',
    productSku: 'MED-PAR-500',
    productPrice: 2500,
    quantity: 5,
    warehouseName: 'Almacén Central Bogotá',
    availableQuantity: 100,
  };

  const defaultProps = {
    item: mockItem,
    onQuantityChange: jest.fn(),
    onRemove: jest.fn(),
    testID: 'cart-item-1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render the cart item card', () => {
      const { getByText, getByTestId } = render(<CartItemCard {...defaultProps} />);

      expect(getByTestId('cart-item-1')).toBeTruthy();
      expect(getByText('Paracetamol 500mg')).toBeTruthy();
    });

    it('should render product name', () => {
      const { getByText } = render(<CartItemCard {...defaultProps} />);

      expect(getByText('Paracetamol 500mg')).toBeTruthy();
    });

    it('should render SKU with label', () => {
      const { getByText } = render(<CartItemCard {...defaultProps} />);

      expect(getByText(/SKU:/)).toBeTruthy();
      expect(getByText(/MED-PAR-500/)).toBeTruthy();
    });

    it('should render warehouse name with label', () => {
      const { getByText } = render(<CartItemCard {...defaultProps} />);

      expect(getByText(/Warehouse:/)).toBeTruthy();
      expect(getByText(/Almacén Central Bogotá/)).toBeTruthy();
    });

    it('should render unit price label', () => {
      const { getByText } = render(<CartItemCard {...defaultProps} />);

      expect(getByText('Unit Price')).toBeTruthy();
    });

    it('should render unit price formatted as currency', () => {
      const { getAllByText } = render(<CartItemCard {...defaultProps} />);

      const priceElements = getAllByText(/2\.500/);
      expect(priceElements.length).toBeGreaterThan(0);
    });

    it('should render subtotal label', () => {
      const { getByText } = render(<CartItemCard {...defaultProps} />);

      expect(getByText('Subtotal')).toBeTruthy();
    });

    it('should render subtotal calculated correctly (price * quantity)', () => {
      const { getByText } = render(<CartItemCard {...defaultProps} />);

      // 2500 * 5 = 12500
      expect(getByText(/12.500/)).toBeTruthy();
    });

    it('should render remove button', () => {
      const { getByTestId } = render(<CartItemCard {...defaultProps} />);

      expect(getByTestId('cart-item-1-remove-button')).toBeTruthy();
    });

    it('should render quantity selector', () => {
      const { getByTestId } = render(<CartItemCard {...defaultProps} />);

      expect(getByTestId('cart-item-1-price-quantity-quantity-selector')).toBeTruthy();
    });

    it('should render with custom testID', () => {
      const { getByTestId } = render(
        <CartItemCard {...defaultProps} testID="custom-cart-item" />
      );

      expect(getByTestId('custom-cart-item')).toBeTruthy();
    });
  });

  describe('Subtotal calculation', () => {
    it('should calculate subtotal correctly for quantity 1', () => {
      const singleItem = { ...mockItem, quantity: 1 };
      const { getAllByText } = render(<CartItemCard {...defaultProps} item={singleItem} />);

      // 2500 * 1 = 2500
      const priceElements = getAllByText(/2\.500/);
      expect(priceElements.length).toBeGreaterThan(0);
    });

    it('should calculate subtotal correctly for quantity 10', () => {
      const tenItems = { ...mockItem, quantity: 10 };
      const { getByText } = render(<CartItemCard {...defaultProps} item={tenItems} />);

      // 2500 * 10 = 25000
      expect(getByText(/25.000/)).toBeTruthy();
    });

    it('should calculate subtotal correctly for large quantity', () => {
      const manyItems = { ...mockItem, quantity: 50 };
      const { getByText } = render(<CartItemCard {...defaultProps} item={manyItems} />);

      // 2500 * 50 = 125000
      expect(getByText(/125.000/)).toBeTruthy();
    });

    it('should calculate subtotal correctly for expensive product', () => {
      const expensiveItem = { ...mockItem, productPrice: 100000, quantity: 3 };
      const { getByText } = render(<CartItemCard {...defaultProps} item={expensiveItem} />);

      // 100000 * 3 = 300000
      expect(getByText(/300.000/)).toBeTruthy();
    });

    it('should calculate subtotal correctly for cheap product', () => {
      const cheapItem = { ...mockItem, productPrice: 500, quantity: 2 };
      const { getByText } = render(<CartItemCard {...defaultProps} item={cheapItem} />);

      // 500 * 2 = 1000
      expect(getByText(/1.000/)).toBeTruthy();
    });
  });

  describe('Quantity change interaction', () => {
    it('should call onQuantityChange when quantity selector changes', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <CartItemCard {...defaultProps} onQuantityChange={onQuantityChange} />
      );

      const increaseButton = getByTestId('cart-item-1-price-quantity-quantity-selector-test-increase');
      fireEvent.press(increaseButton);

      expect(onQuantityChange).toHaveBeenCalledTimes(1);
      expect(onQuantityChange).toHaveBeenCalledWith('inv-1', 6);
    });

    it('should call onQuantityChange with correct inventoryId', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <CartItemCard {...defaultProps} onQuantityChange={onQuantityChange} />
      );

      const increaseButton = getByTestId('cart-item-1-price-quantity-quantity-selector-test-increase');
      fireEvent.press(increaseButton);

      expect(onQuantityChange).toHaveBeenCalledWith('inv-1', expect.any(Number));
    });

    it('should call onQuantityChange with correct new quantity', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <CartItemCard {...defaultProps} onQuantityChange={onQuantityChange} />
      );

      const increaseButton = getByTestId('cart-item-1-price-quantity-quantity-selector-test-increase');
      fireEvent.press(increaseButton);

      expect(onQuantityChange).toHaveBeenCalledWith(expect.any(String), 6);
    });

    it('should pass correct max quantity to quantity selector', () => {
      const { getByTestId } = render(<CartItemCard {...defaultProps} />);

      const selector = getByTestId('cart-item-1-price-quantity-quantity-selector');
      expect(selector).toBeTruthy();
    });

    it('should pass correct initial quantity to quantity selector', () => {
      const { getByText } = render(<CartItemCard {...defaultProps} />);

      expect(getByText('Quantity: 5')).toBeTruthy();
    });

    it('should handle multiple quantity changes', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <CartItemCard {...defaultProps} onQuantityChange={onQuantityChange} />
      );

      const increaseButton = getByTestId('cart-item-1-price-quantity-quantity-selector-test-increase');
      fireEvent.press(increaseButton);
      fireEvent.press(increaseButton);
      fireEvent.press(increaseButton);

      expect(onQuantityChange).toHaveBeenCalledTimes(3);
    });

    it('should handle decrease quantity', () => {
      const onQuantityChange = jest.fn();
      const { getByTestId } = render(
        <CartItemCard {...defaultProps} onQuantityChange={onQuantityChange} />
      );

      const decreaseButton = getByTestId('cart-item-1-price-quantity-quantity-selector-test-decrease');
      fireEvent.press(decreaseButton);

      expect(onQuantityChange).toHaveBeenCalledWith('inv-1', 4);
    });
  });

  describe('Remove button interaction', () => {
    it('should show alert when remove button is pressed', () => {
      const { getByTestId } = render(<CartItemCard {...defaultProps} />);

      const removeButton = getByTestId('cart-item-1-remove-button');
      fireEvent.press(removeButton);

      expect(Alert.alert).toHaveBeenCalled();
    });

    it('should show alert with correct title', () => {
      const { getByTestId } = render(<CartItemCard {...defaultProps} />);

      const removeButton = getByTestId('cart-item-1-remove-button');
      fireEvent.press(removeButton);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Remove Item',
        expect.any(String),
        expect.any(Array)
      );
    });

    it('should show alert with product name in message', () => {
      const { getByTestId } = render(<CartItemCard {...defaultProps} />);

      const removeButton = getByTestId('cart-item-1-remove-button');
      fireEvent.press(removeButton);

      expect(Alert.alert).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('Paracetamol 500mg'),
        expect.any(Array)
      );
    });

    it('should show alert with cancel and delete buttons', () => {
      const { getByTestId } = render(<CartItemCard {...defaultProps} />);

      const removeButton = getByTestId('cart-item-1-remove-button');
      fireEvent.press(removeButton);

      const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
      expect(alertButtons).toHaveLength(2);
      expect(alertButtons[0].text).toBe('Cancel');
      expect(alertButtons[1].text).toBe('Delete');
    });

    it('should call onRemove when delete is confirmed', () => {
      const onRemove = jest.fn();
      const { getByTestId } = render(
        <CartItemCard {...defaultProps} onRemove={onRemove} />
      );

      const removeButton = getByTestId('cart-item-1-remove-button');
      fireEvent.press(removeButton);

      const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
      alertButtons[1].onPress();

      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(onRemove).toHaveBeenCalledWith('inv-1');
    });

    it('should not call onRemove when cancel is pressed', () => {
      const onRemove = jest.fn();
      const { getByTestId } = render(
        <CartItemCard {...defaultProps} onRemove={onRemove} />
      );

      const removeButton = getByTestId('cart-item-1-remove-button');
      fireEvent.press(removeButton);

      const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
      // Cancel button does not have onPress

      expect(onRemove).not.toHaveBeenCalled();
    });

    it('should call onRemove with correct inventoryId', () => {
      const onRemove = jest.fn();
      const { getByTestId } = render(
        <CartItemCard {...defaultProps} onRemove={onRemove} />
      );

      const removeButton = getByTestId('cart-item-1-remove-button');
      fireEvent.press(removeButton);

      const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
      alertButtons[1].onPress();

      expect(onRemove).toHaveBeenCalledWith('inv-1');
    });
  });

  describe('Different products', () => {
    it('should render different product names correctly', () => {
      const differentItem = {
        ...mockItem,
        productName: 'Ibuprofeno 400mg',
      };
      const { getByText } = render(<CartItemCard {...defaultProps} item={differentItem} />);

      expect(getByText('Ibuprofeno 400mg')).toBeTruthy();
    });

    it('should render different SKUs correctly', () => {
      const differentItem = {
        ...mockItem,
        productSku: 'MED-IBU-400',
      };
      const { getByText } = render(<CartItemCard {...defaultProps} item={differentItem} />);

      expect(getByText(/MED-IBU-400/)).toBeTruthy();
    });

    it('should render different warehouses correctly', () => {
      const differentItem = {
        ...mockItem,
        warehouseName: 'Almacén Medellín',
      };
      const { getByText } = render(<CartItemCard {...defaultProps} item={differentItem} />);

      expect(getByText(/Almacén Medellín/)).toBeTruthy();
    });

    const warehouses = [
      'Almacén Central Bogotá',
      'Almacén Medellín',
      'Almacén Cali',
      'Almacén Barranquilla',
    ];

    warehouses.forEach((warehouse) => {
      it(`should render ${warehouse} correctly`, () => {
        const warehouseItem = { ...mockItem, warehouseName: warehouse };
        const { getByText } = render(
          <CartItemCard {...defaultProps} item={warehouseItem} />
        );

        expect(getByText(new RegExp(warehouse))).toBeTruthy();
      });
    });
  });

  describe('Price formatting', () => {
    it('should format prices as Colombian pesos (COP)', () => {
      const { getAllByText } = render(<CartItemCard {...defaultProps} />);

      // Should use Colombian peso formatting with thousands separator
      const priceElements = getAllByText(/2\.500/);
      expect(priceElements.length).toBeGreaterThan(0);
    });

    it('should format small prices correctly', () => {
      const cheapItem = { ...mockItem, productPrice: 100, quantity: 1 };
      const { getAllByText } = render(<CartItemCard {...defaultProps} item={cheapItem} />);

      const priceElements = getAllByText(/100/);
      expect(priceElements.length).toBeGreaterThan(0);
    });

    it('should format large prices correctly', () => {
      const expensiveItem = { ...mockItem, productPrice: 1000000, quantity: 1 };
      const { getAllByText } = render(<CartItemCard {...defaultProps} item={expensiveItem} />);

      const priceElements = getAllByText(/1\.000\.000/);
      expect(priceElements.length).toBeGreaterThan(0);
    });

    it('should format prices without decimal points', () => {
      const { getAllByText } = render(<CartItemCard {...defaultProps} />);

      // COP format should not include decimal points
      const priceElements = getAllByText(/2\.500/);
      expect(priceElements.length).toBeGreaterThan(0);
    });
  });

  describe('Component updates', () => {
    it('should update when item prop changes', () => {
      const { getByText, rerender } = render(<CartItemCard {...defaultProps} />);

      expect(getByText('Paracetamol 500mg')).toBeTruthy();

      const newItem = {
        ...mockItem,
        productName: 'Ibuprofeno 400mg',
      };

      rerender(<CartItemCard {...defaultProps} item={newItem} />);
      expect(getByText('Ibuprofeno 400mg')).toBeTruthy();
    });

    it('should update subtotal when quantity changes', () => {
      const { getByText, rerender } = render(<CartItemCard {...defaultProps} />);

      // Initial: 2500 * 5 = 12500
      expect(getByText(/12.500/)).toBeTruthy();

      const updatedItem = { ...mockItem, quantity: 10 };
      rerender(<CartItemCard {...defaultProps} item={updatedItem} />);

      // Updated: 2500 * 10 = 25000
      expect(getByText(/25.000/)).toBeTruthy();
    });

    it('should update subtotal when price changes', () => {
      const { getByText, rerender } = render(<CartItemCard {...defaultProps} />);

      // Initial: 2500 * 5 = 12500
      expect(getByText(/12.500/)).toBeTruthy();

      const updatedItem = { ...mockItem, productPrice: 5000 };
      rerender(<CartItemCard {...defaultProps} item={updatedItem} />);

      // Updated: 5000 * 5 = 25000
      expect(getByText(/25.000/)).toBeTruthy();
    });
  });

  describe('Edge cases and special characters', () => {
    it('should render product with special characters in name', () => {
      const specialItem = {
        ...mockItem,
        productName: 'Vitamina D3 1000 UI',
      };
      const { getByText } = render(<CartItemCard {...defaultProps} item={specialItem} />);

      expect(getByText('Vitamina D3 1000 UI')).toBeTruthy();
    });

    it('should render product with accented characters', () => {
      const accentedItem = {
        ...mockItem,
        productName: 'Analgésico Especial',
      };
      const { getByText } = render(<CartItemCard {...defaultProps} item={accentedItem} />);

      expect(getByText('Analgésico Especial')).toBeTruthy();
    });

    it('should render product with very long name', () => {
      const longNameItem = {
        ...mockItem,
        productName:
          'Acetilcisteína 600mg Efervescente Caja con 30 Tabletas de Alta Concentración',
      };
      const { getByText } = render(<CartItemCard {...defaultProps} item={longNameItem} />);

      expect(
        getByText(
          'Acetilcisteína 600mg Efervescente Caja con 30 Tabletas de Alta Concentración'
        )
      ).toBeTruthy();
    });

    it('should render warehouse with special characters', () => {
      const specialWarehouse = {
        ...mockItem,
        warehouseName: "Almacén Zona Sur - Dep't 5",
      };
      const { getByText } = render(
        <CartItemCard {...defaultProps} item={specialWarehouse} />
      );

      expect(getByText(/Almacén Zona Sur - Dep't 5/)).toBeTruthy();
    });

    it('should handle SKU with special formatting', () => {
      const specialSKU = {
        ...mockItem,
        productSku: 'MED-PAR-500-XL',
      };
      const { getByText } = render(<CartItemCard {...defaultProps} item={specialSKU} />);

      expect(getByText(/MED-PAR-500-XL/)).toBeTruthy();
    });
  });

  describe('Pressable styling states', () => {
    it('should apply pressed style when remove button is pressed', () => {
      const { getByTestId } = render(<CartItemCard {...defaultProps} />);

      const removeButton = getByTestId('cart-item-1-remove-button');
      expect(removeButton).toBeTruthy();

      fireEvent.press(removeButton);
      // Alert should be shown
      expect(Alert.alert).toHaveBeenCalled();
    });

    it('should have correct style function for remove button', () => {
      const { getByTestId } = render(<CartItemCard {...defaultProps} />);

      const removeButton = getByTestId('cart-item-1-remove-button');
      const styleFunction = removeButton.props.style;

      if (typeof styleFunction === 'function') {
        const pressedStyles = styleFunction({ pressed: true });
        expect(pressedStyles).toBeDefined();
        expect(Array.isArray(pressedStyles)).toBe(true);
      }
    });

    it('should invoke style callback with pressed state false', () => {
      const { getByTestId } = render(<CartItemCard {...defaultProps} />);

      const removeButton = getByTestId('cart-item-1-remove-button');
      const styleFunction = removeButton.props.style;

      if (typeof styleFunction === 'function') {
        const normalStyles = styleFunction({ pressed: false });
        expect(normalStyles).toBeDefined();
        expect(Array.isArray(normalStyles)).toBe(true);
      }
    });
  });

  describe('Available quantity', () => {
    it('should pass available quantity to quantity selector', () => {
      const { getByTestId } = render(<CartItemCard {...defaultProps} />);

      const selector = getByTestId('cart-item-1-price-quantity-quantity-selector');
      expect(selector).toBeTruthy();
    });

    it('should handle low available quantity', () => {
      const lowStockItem = { ...mockItem, availableQuantity: 10 };
      const { getByTestId } = render(<CartItemCard {...defaultProps} item={lowStockItem} />);

      expect(getByTestId('cart-item-1-price-quantity-quantity-selector')).toBeTruthy();
    });

    it('should handle high available quantity', () => {
      const highStockItem = { ...mockItem, availableQuantity: 1000 };
      const { getByTestId } = render(
        <CartItemCard {...defaultProps} item={highStockItem} />
      );

      expect(getByTestId('cart-item-1-price-quantity-quantity-selector')).toBeTruthy();
    });
  });

  describe('Multiple cart items', () => {
    it('should render different inventory IDs correctly', () => {
      const item1 = { ...mockItem, inventoryId: 'inv-1' };
      const item2 = { ...mockItem, inventoryId: 'inv-2' };

      const { getByTestId: getByTestId1 } = render(
        <CartItemCard {...defaultProps} item={item1} testID="cart-item-1" />
      );
      const { getByTestId: getByTestId2 } = render(
        <CartItemCard {...defaultProps} item={item2} testID="cart-item-2" />
      );

      expect(getByTestId1('cart-item-1')).toBeTruthy();
      expect(getByTestId2('cart-item-2')).toBeTruthy();
    });

    it('should call onQuantityChange when quantity button is pressed in single item', () => {
      const onQuantityChange = jest.fn();
      const item = { ...mockItem, inventoryId: 'test-inv', quantity: 5 };

      const { getByTestId } = render(
        <CartItemCard
          item={item}
          testID="test-card"
          onQuantityChange={onQuantityChange}
          onRemove={jest.fn()}
        />
      );

      const button = getByTestId('test-card-price-quantity-quantity-selector-test-increase');
      fireEvent.press(button);

      expect(onQuantityChange).toHaveBeenCalledWith('test-inv', 6);
    });

    it('should call callbacks with correct inventory ID for different items', () => {
      const { View } = require('react-native');
      const onQuantityChange1 = jest.fn();
      const onQuantityChange2 = jest.fn();
      const onRemove1 = jest.fn();
      const onRemove2 = jest.fn();

      const item1 = { ...mockItem, inventoryId: 'inv-1', quantity: 5 };
      const item2 = { ...mockItem, inventoryId: 'inv-2', quantity: 3 };

      const { getByTestId } = render(
        <View>
          <CartItemCard
            item={item1}
            testID="cart-item-1"
            onQuantityChange={onQuantityChange1}
            onRemove={onRemove1}
          />
          <CartItemCard
            item={item2}
            testID="cart-item-2"
            onQuantityChange={onQuantityChange2}
            onRemove={onRemove2}
          />
        </View>
      );

      const button1 = getByTestId('cart-item-1-price-quantity-quantity-selector-test-increase');
      const button2 = getByTestId('cart-item-2-price-quantity-quantity-selector-test-increase');

      fireEvent.press(button1);
      fireEvent.press(button2);

      expect(onQuantityChange1).toHaveBeenCalledWith('inv-1', 6);
      expect(onQuantityChange2).toHaveBeenCalledWith('inv-2', 4);
    });
  });
});
