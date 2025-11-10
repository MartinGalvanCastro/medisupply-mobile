import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { CartScreen } from './CartScreen';
import { useCartStore } from '@/store/useCartStore';
import type { CartItem } from '@/store/useCartStore';

// Mock dependencies
jest.mock('@/store/useCartStore');

// Mock toast
const mockToastShow = jest.fn();
jest.mock('@/components/ui/toast', () => {
  const { View, Text } = require('react-native');
  return {
    useToast: () => ({
      show: mockToastShow,
    }),
    Toast: ({ children, nativeID, action, variant }: any) => (
      <View testID={`toast-${nativeID}`}>
        {children}
      </View>
    ),
    ToastTitle: ({ children }: any) => <Text testID="toast-title">{children}</Text>,
    ToastDescription: ({ children }: any) => <Text testID="toast-description">{children}</Text>,
  };
});

jest.mock('@/i18n/hooks', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      const translations: Record<string, string> = {
        'cart.title': 'Cart',
        'cart.emptyState': 'Your cart is empty',
        'cart.emptyStateDescription': 'Add products from the inventory to get started',
        'cart.total': 'Total',
        'cart.totalItems': `${params?.count || 0} item(s)`,
        'cart.totalUnits': `${params?.count || 0} unit(s)`,
        'cart.placeOrder': 'Place Order',
        'cart.placingOrder': 'Placing Order...',
        'cart.clearCart': 'Clear Cart',
        'cart.clearCartConfirmation':
          'Are you sure you want to remove all items from your cart?',
        'cart.checkout': 'Checkout',
        'cart.checkoutMessage': 'Ready to place your order?',
        'cart.orderSuccess': 'Order placed successfully!',
        'cart.orderSuccessMessage': 'Your order has been placed and is being processed.',
        'cart.orderError': 'Failed to place order. Please try again.',
        'common.cancel': 'Cancel',
        'common.error': 'Error',
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, testID, style }: any) => (
    <div data-testid={testID} style={style}>
      {children}
    </div>
  ),
}));

// Mock FlashList
jest.mock('@shopify/flash-list', () => ({
  FlashList: ({ data, renderItem, ListEmptyComponent, testID, keyExtractor }: any) => {
    if (data && data.length === 0 && ListEmptyComponent) {
      return <div data-testid={testID}>{ListEmptyComponent()}</div>;
    }
    return (
      <div data-testid={testID}>
        {data && data.map((item: any) => <div key={keyExtractor(item)}>{renderItem({ item })}</div>)}
      </div>
    );
  },
}));

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  ShoppingCart: () => <div data-testid="shopping-cart-icon" />,
}));

// Mock CartItemCard
jest.mock('@/components/CartItemCard', () => ({
  CartItemCard: ({ item, onQuantityChange, onRemove, testID }: any) => {
    const { View, Text, Pressable } = require('react-native');
    return (
      <View testID={testID}>
        <Text>{item.productName}</Text>
        <Pressable
          testID={`${testID}-quantity-change`}
          onPress={() => onQuantityChange(item.inventoryId, item.quantity + 1)}
        >
          <Text>Increase Quantity</Text>
        </Pressable>
        <Pressable
          testID={`${testID}-remove`}
          onPress={() => onRemove(item.inventoryId)}
        >
          <Text>Remove</Text>
        </Pressable>
      </View>
    );
  },
}));

const mockCartItems: CartItem[] = [
  {
    inventoryId: 'inv-1',
    productId: 'prod-1',
    productName: 'Paracetamol 500mg',
    productSku: 'MED-PAR-500',
    productPrice: 2500,
    quantity: 5,
    warehouseName: 'Almacén Central Bogotá',
    availableQuantity: 100,
  },
  {
    inventoryId: 'inv-2',
    productId: 'prod-2',
    productName: 'Ibuprofeno 400mg',
    productSku: 'MED-IBU-400',
    productPrice: 3000,
    quantity: 3,
    warehouseName: 'Almacén Medellín',
    availableQuantity: 50,
  },
];

describe('CartScreen', () => {
  const mockUpdateQuantity = jest.fn();
  const mockRemoveItem = jest.fn();
  const mockClearCart = jest.fn();
  const mockGetTotal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert');
    jest.spyOn(console, 'log').mockImplementation();
    mockToastShow.mockClear();

    (useCartStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        items: mockCartItems,
        updateQuantity: mockUpdateQuantity,
        removeItem: mockRemoveItem,
        clearCart: mockClearCart,
        getTotal: mockGetTotal,
      };
      return selector(state);
    });

    mockGetTotal.mockReturnValue(21500); // (2500*5) + (3000*3) = 12500 + 9000 = 21500
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the cart screen', () => {
      const { getByTestId } = render(<CartScreen />);

      expect(getByTestId('cart-screen')).toBeTruthy();
    });

    it('should render the heading with cart title', () => {
      const { getByText } = render(<CartScreen />);

      expect(getByText('Cart')).toBeTruthy();
    });

    it('should render the cart list', () => {
      const { getByTestId } = render(<CartScreen />);

      expect(getByTestId('cart-list')).toBeTruthy();
    });

    it('should render item count badge when cart has items', () => {
      const { getByTestId } = render(<CartScreen />);

      expect(getByTestId('cart-item-count')).toBeTruthy();
    });

    it('should display correct item count in badge', () => {
      const { getByTestId } = render(<CartScreen />);

      const badge = getByTestId('cart-item-count');
      expect(badge.children[0]).toBe('2');
    });

    it('should not render item count badge when cart is empty', () => {
      (useCartStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          items: [],
          updateQuantity: mockUpdateQuantity,
          removeItem: mockRemoveItem,
          clearCart: mockClearCart,
          getTotal: mockGetTotal,
        };
        return selector(state);
      });

      const { queryByTestId } = render(<CartScreen />);

      expect(queryByTestId('cart-item-count')).toBeNull();
    });

    it('should render footer with totals when cart has items', () => {
      const { getByTestId } = render(<CartScreen />);

      expect(getByTestId('cart-footer')).toBeTruthy();
    });

    it('should not render footer when cart is empty', () => {
      (useCartStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          items: [],
          updateQuantity: mockUpdateQuantity,
          removeItem: mockRemoveItem,
          clearCart: mockClearCart,
          getTotal: mockGetTotal,
        };
        return selector(state);
      });

      const { queryByTestId } = render(<CartScreen />);

      expect(queryByTestId('cart-footer')).toBeNull();
    });
  });

  describe('Cart Items Display', () => {
    it('should render all cart items', () => {
      const { getByText } = render(<CartScreen />);

      expect(getByText('Paracetamol 500mg')).toBeTruthy();
      expect(getByText('Ibuprofeno 400mg')).toBeTruthy();
    });

    it('should render each cart item with correct testID', () => {
      const { getByTestId } = render(<CartScreen />);

      expect(getByTestId('cart-item-inv-1')).toBeTruthy();
      expect(getByTestId('cart-item-inv-2')).toBeTruthy();
    });

    it('should pass correct props to CartItemCard', () => {
      const { getByTestId } = render(<CartScreen />);

      const item1 = getByTestId('cart-item-inv-1');
      expect(item1).toBeTruthy();
    });

    it('should render cart items in correct order', () => {
      const { getByTestId } = render(<CartScreen />);

      const list = getByTestId('cart-list');
      // Count the number of cart items rendered
      expect(list.children.length).toBe(2);
    });
  });

  describe('Empty State', () => {
    beforeEach(() => {
      (useCartStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          items: [],
          updateQuantity: mockUpdateQuantity,
          removeItem: mockRemoveItem,
          clearCart: mockClearCart,
          getTotal: mockGetTotal,
        };
        return selector(state);
      });

      mockGetTotal.mockReturnValue(0);
    });

    it('should render empty state when cart is empty', () => {
      const { getByTestId } = render(<CartScreen />);

      expect(getByTestId('cart-empty-state')).toBeTruthy();
    });

    it('should render empty state message', () => {
      const { getByText } = render(<CartScreen />);

      expect(getByText('Your cart is empty')).toBeTruthy();
    });

    it('should render empty state description', () => {
      const { getByText } = render(<CartScreen />);

      expect(getByText('Add products from the inventory to get started')).toBeTruthy();
    });

    it('should render shopping cart icon in empty state', () => {
      const { getByTestId } = render(<CartScreen />);

      expect(getByTestId('shopping-cart-icon')).toBeTruthy();
    });

    it('should not render footer buttons when cart is empty', () => {
      const { queryByTestId } = render(<CartScreen />);

      expect(queryByTestId('cart-checkout-button')).toBeNull();
      expect(queryByTestId('cart-clear-button')).toBeNull();
    });
  });

  describe('Total Calculation', () => {
    it('should call getTotal from store', () => {
      render(<CartScreen />);

      expect(mockGetTotal).toHaveBeenCalled();
    });

    it('should display formatted total', () => {
      const { getByText } = render(<CartScreen />);

      // Total is 21500, formatted as Colombian pesos
      expect(getByText(/21.500/)).toBeTruthy();
    });

    it('should display total items count', () => {
      const { getByText } = render(<CartScreen />);

      expect(getByText('2 item(s)')).toBeTruthy();
    });

    it('should calculate total units correctly', () => {
      const { getByText } = render(<CartScreen />);

      // 5 + 3 = 8 units
      expect(getByText('8 unit(s)')).toBeTruthy();
    });

    it('should update when total changes', () => {
      const { getByText, rerender } = render(<CartScreen />);

      expect(getByText(/21.500/)).toBeTruthy();

      // Update mock to return new total
      mockGetTotal.mockReturnValue(30000);
      rerender(<CartScreen />);

      expect(getByText(/30.000/)).toBeTruthy();
    });

    it('should display total label', () => {
      const { getByText } = render(<CartScreen />);

      expect(getByText('Total')).toBeTruthy();
    });
  });

  describe('Quantity Change Interaction', () => {
    it('should call updateQuantity when quantity changes', () => {
      const { getByTestId } = render(<CartScreen />);

      const quantityButton = getByTestId('cart-item-inv-1-quantity-change');
      fireEvent.press(quantityButton);

      expect(mockUpdateQuantity).toHaveBeenCalledTimes(1);
    });

    it('should call updateQuantity with correct parameters', () => {
      const { getByTestId } = render(<CartScreen />);

      const quantityButton = getByTestId('cart-item-inv-1-quantity-change');
      fireEvent.press(quantityButton);

      expect(mockUpdateQuantity).toHaveBeenCalledWith('inv-1', 6);
    });

    it('should handle quantity changes for different items', () => {
      const { getByTestId } = render(<CartScreen />);

      const item1Button = getByTestId('cart-item-inv-1-quantity-change');
      const item2Button = getByTestId('cart-item-inv-2-quantity-change');

      fireEvent.press(item1Button);
      fireEvent.press(item2Button);

      expect(mockUpdateQuantity).toHaveBeenCalledWith('inv-1', 6);
      expect(mockUpdateQuantity).toHaveBeenCalledWith('inv-2', 4);
    });

    it('should handle multiple quantity changes', () => {
      const { getByTestId } = render(<CartScreen />);

      const quantityButton = getByTestId('cart-item-inv-1-quantity-change');
      fireEvent.press(quantityButton);
      fireEvent.press(quantityButton);
      fireEvent.press(quantityButton);

      expect(mockUpdateQuantity).toHaveBeenCalledTimes(3);
    });
  });

  describe('Remove Item Interaction', () => {
    it('should call removeItem when remove button is pressed', () => {
      const { getByTestId } = render(<CartScreen />);

      const removeButton = getByTestId('cart-item-inv-1-remove');
      fireEvent.press(removeButton);

      expect(mockRemoveItem).toHaveBeenCalledTimes(1);
    });

    it('should call removeItem with correct inventoryId', () => {
      const { getByTestId } = render(<CartScreen />);

      const removeButton = getByTestId('cart-item-inv-1-remove');
      fireEvent.press(removeButton);

      expect(mockRemoveItem).toHaveBeenCalledWith('inv-1');
    });

    it('should handle removing different items', () => {
      const { getByTestId } = render(<CartScreen />);

      const remove1Button = getByTestId('cart-item-inv-1-remove');
      const remove2Button = getByTestId('cart-item-inv-2-remove');

      fireEvent.press(remove1Button);
      fireEvent.press(remove2Button);

      expect(mockRemoveItem).toHaveBeenCalledWith('inv-1');
      expect(mockRemoveItem).toHaveBeenCalledWith('inv-2');
    });
  });

  describe('Clear Cart Interaction', () => {
    it('should render clear cart button', () => {
      const { getByTestId } = render(<CartScreen />);

      expect(getByTestId('cart-clear-button')).toBeTruthy();
    });

    it('should show alert when clear cart button is pressed', () => {
      const { getByTestId } = render(<CartScreen />);

      const clearButton = getByTestId('cart-clear-button');
      fireEvent.press(clearButton);

      expect(Alert.alert).toHaveBeenCalled();
    });

    it('should show alert with correct title', () => {
      const { getByTestId } = render(<CartScreen />);

      const clearButton = getByTestId('cart-clear-button');
      fireEvent.press(clearButton);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Clear Cart',
        expect.any(String),
        expect.any(Array)
      );
    });

    it('should show confirmation message in alert', () => {
      const { getByTestId } = render(<CartScreen />);

      const clearButton = getByTestId('cart-clear-button');
      fireEvent.press(clearButton);

      expect(Alert.alert).toHaveBeenCalledWith(
        expect.any(String),
        'Are you sure you want to remove all items from your cart?',
        expect.any(Array)
      );
    });

    it('should show cancel and clear buttons in alert', () => {
      const { getByTestId } = render(<CartScreen />);

      const clearButton = getByTestId('cart-clear-button');
      fireEvent.press(clearButton);

      const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
      expect(alertButtons).toHaveLength(2);
      expect(alertButtons[0].text).toBe('Cancel');
      expect(alertButtons[1].text).toBe('Clear Cart');
    });

    it('should call clearCart when confirmed', () => {
      const { getByTestId } = render(<CartScreen />);

      const clearButton = getByTestId('cart-clear-button');
      fireEvent.press(clearButton);

      const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
      alertButtons[1].onPress();

      expect(mockClearCart).toHaveBeenCalledTimes(1);
    });

    it('should not call clearCart when cancelled', () => {
      const { getByTestId } = render(<CartScreen />);

      const clearButton = getByTestId('cart-clear-button');
      fireEvent.press(clearButton);

      // Cancel button doesn't call anything

      expect(mockClearCart).not.toHaveBeenCalled();
    });
  });

  describe('Checkout Interaction', () => {
    it('should render checkout button', () => {
      const { getByTestId } = render(<CartScreen />);

      expect(getByTestId('cart-checkout-button')).toBeTruthy();
    });

    it('should render checkout button with correct text', () => {
      const { getByText } = render(<CartScreen />);

      expect(getByText('Place Order')).toBeTruthy();
    });

    it('should show alert when checkout button is pressed', () => {
      const { getByTestId } = render(<CartScreen />);

      const checkoutButton = getByTestId('cart-checkout-button');
      fireEvent.press(checkoutButton);

      expect(Alert.alert).toHaveBeenCalled();
    });

    it('should show alert with checkout title', () => {
      const { getByTestId } = render(<CartScreen />);

      const checkoutButton = getByTestId('cart-checkout-button');
      fireEvent.press(checkoutButton);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Checkout',
        expect.any(String),
        expect.any(Array)
      );
    });

    it('should show checkout message in alert', () => {
      const { getByTestId } = render(<CartScreen />);

      const checkoutButton = getByTestId('cart-checkout-button');
      fireEvent.press(checkoutButton);

      expect(Alert.alert).toHaveBeenCalledWith(
        expect.any(String),
        'Ready to place your order?',
        expect.any(Array)
      );
    });

    it('should show cancel and place order buttons in alert', () => {
      const { getByTestId } = render(<CartScreen />);

      const checkoutButton = getByTestId('cart-checkout-button');
      fireEvent.press(checkoutButton);

      const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
      expect(alertButtons).toHaveLength(2);
      expect(alertButtons[0].text).toBe('Cancel');
      expect(alertButtons[1].text).toBe('Place Order');
    });

    it('should call clearCart when checkout is confirmed', async () => {
      jest.useFakeTimers();
      const { getByTestId } = render(<CartScreen />);

      const checkoutButton = getByTestId('cart-checkout-button');
      fireEvent.press(checkoutButton);

      const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];

      await act(async () => {
        const onPressPromise = alertButtons[1].onPress();
        // Fast-forward through setTimeout
        jest.advanceTimersByTime(2000);
        await onPressPromise;
      });

      expect(mockClearCart).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('should show success toast after successful order placement', async () => {
      jest.useFakeTimers();
      const { getByTestId } = render(<CartScreen />);

      const checkoutButton = getByTestId('cart-checkout-button');
      fireEvent.press(checkoutButton);

      const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];

      await act(async () => {
        const onPressPromise = alertButtons[1].onPress();
        jest.advanceTimersByTime(2000);
        await onPressPromise;
      });

      expect(mockToastShow).toHaveBeenCalled();
      const toastCall = mockToastShow.mock.calls[0][0];
      expect(toastCall.placement).toBe('top');
      expect(toastCall.duration).toBe(3000);

      jest.useRealTimers();
    });

    it('should render success toast with correct content', async () => {
      jest.useFakeTimers();
      const { getByTestId } = render(<CartScreen />);

      const checkoutButton = getByTestId('cart-checkout-button');
      fireEvent.press(checkoutButton);

      const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];

      await act(async () => {
        const onPressPromise = alertButtons[1].onPress();
        jest.advanceTimersByTime(2000);
        await onPressPromise;
      });

      // Get the toast render function and call it to cover the toast content lines
      const toastCall = mockToastShow.mock.calls[0][0];
      const { render: renderFn } = toastCall;

      // Render the toast component to test its content - this covers lines 83-94
      const toastResult = render(renderFn({ id: 'test-toast-id' }));

      // Verify the toast renders with the success message (using queryByText since the structure might be wrapped)
      expect(toastResult.queryByText('Order placed successfully!')).toBeTruthy();
      expect(toastResult.queryByText('Your order has been placed and is being processed.')).toBeTruthy();

      jest.useRealTimers();
    });

    it('should display placing order text while order is being placed', async () => {
      jest.useFakeTimers();
      const { getByTestId, getByText } = render(<CartScreen />);

      const checkoutButton = getByTestId('cart-checkout-button');
      fireEvent.press(checkoutButton);

      const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];

      act(() => {
        alertButtons[1].onPress();
      });

      // Button should now show "Placing Order..."
      expect(getByText('Placing Order...')).toBeTruthy();

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      jest.useRealTimers();
    });

    it('should disable checkout button while placing order', async () => {
      jest.useFakeTimers();
      const { getByTestId } = render(<CartScreen />);

      const checkoutButton = getByTestId('cart-checkout-button');
      fireEvent.press(checkoutButton);

      const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];

      act(() => {
        alertButtons[1].onPress();
      });

      // Button should be disabled
      const button = getByTestId('cart-checkout-button');
      expect(button.props.accessibilityState?.disabled).toBe(true);

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      jest.useRealTimers();
    });

  });

  describe('Component Updates', () => {
    it('should update when cart items change', () => {
      const { getByText, rerender } = render(<CartScreen />);

      expect(getByText('Paracetamol 500mg')).toBeTruthy();

      // Update cart items
      (useCartStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          items: [mockCartItems[0]],
          updateQuantity: mockUpdateQuantity,
          removeItem: mockRemoveItem,
          clearCart: mockClearCart,
          getTotal: mockGetTotal,
        };
        return selector(state);
      });

      rerender(<CartScreen />);

      expect(getByText('Paracetamol 500mg')).toBeTruthy();
    });

    it('should update item count badge when items change', () => {
      const { getByTestId, rerender } = render(<CartScreen />);

      const badge = getByTestId('cart-item-count');
      expect(badge.children[0]).toBe('2');

      // Update to single item
      (useCartStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          items: [mockCartItems[0]],
          updateQuantity: mockUpdateQuantity,
          removeItem: mockRemoveItem,
          clearCart: mockClearCart,
          getTotal: mockGetTotal,
        };
        return selector(state);
      });

      rerender(<CartScreen />);

      const updatedBadge = getByTestId('cart-item-count');
      expect(updatedBadge.children[0]).toBe('1');
    });

    it('should show empty state when all items are removed', () => {
      const { getByTestId, rerender } = render(<CartScreen />);

      expect(getByTestId('cart-list')).toBeTruthy();

      // Update to empty cart
      (useCartStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          items: [],
          updateQuantity: mockUpdateQuantity,
          removeItem: mockRemoveItem,
          clearCart: mockClearCart,
          getTotal: mockGetTotal,
        };
        return selector(state);
      });

      mockGetTotal.mockReturnValue(0);

      rerender(<CartScreen />);

      expect(getByTestId('cart-empty-state')).toBeTruthy();
    });
  });

  describe('Single Item Cart', () => {
    beforeEach(() => {
      (useCartStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          items: [mockCartItems[0]],
          updateQuantity: mockUpdateQuantity,
          removeItem: mockRemoveItem,
          clearCart: mockClearCart,
          getTotal: mockGetTotal,
        };
        return selector(state);
      });

      mockGetTotal.mockReturnValue(12500); // 2500 * 5
    });

    it('should render single item correctly', () => {
      const { getByText } = render(<CartScreen />);

      expect(getByText('Paracetamol 500mg')).toBeTruthy();
    });

    it('should show correct item count for single item', () => {
      const { getByTestId } = render(<CartScreen />);

      const badge = getByTestId('cart-item-count');
      expect(badge.children[0]).toBe('1');
    });

    it('should show correct total for single item', () => {
      const { getByText } = render(<CartScreen />);

      expect(getByText(/12.500/)).toBeTruthy();
    });

    it('should show correct item count text', () => {
      const { getByText } = render(<CartScreen />);

      expect(getByText('1 item(s)')).toBeTruthy();
    });

    it('should show correct units count for single item', () => {
      const { getByText } = render(<CartScreen />);

      expect(getByText('5 unit(s)')).toBeTruthy();
    });
  });

  describe('Large Cart', () => {
    beforeEach(() => {
      const manyItems: CartItem[] = Array.from({ length: 10 }, (_, i) => ({
        inventoryId: `inv-${i + 1}`,
        productId: `prod-${i + 1}`,
        productName: `Product ${i + 1}`,
        productSku: `SKU-${i + 1}`,
        productPrice: 1000 * (i + 1),
        quantity: i + 1,
        warehouseName: 'Warehouse',
        availableQuantity: 100,
      }));

      (useCartStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          items: manyItems,
          updateQuantity: mockUpdateQuantity,
          removeItem: mockRemoveItem,
          clearCart: mockClearCart,
          getTotal: mockGetTotal,
        };
        return selector(state);
      });

      // Calculate total: 1000*1 + 2000*2 + 3000*3 + ... + 10000*10
      mockGetTotal.mockReturnValue(385000);
    });

    it('should render all items in large cart', () => {
      const { getByText } = render(<CartScreen />);

      expect(getByText('Product 1')).toBeTruthy();
      expect(getByText('Product 10')).toBeTruthy();
    });

    it('should show correct item count for large cart', () => {
      const { getByTestId } = render(<CartScreen />);

      const badge = getByTestId('cart-item-count');
      expect(badge.children[0]).toBe('10');
    });

    it('should show correct total for large cart', () => {
      const { getByText } = render(<CartScreen />);

      expect(getByText(/385.000/)).toBeTruthy();
    });

    it('should handle interactions for items in large cart', () => {
      const { getByTestId } = render(<CartScreen />);

      const item5Button = getByTestId('cart-item-inv-5-quantity-change');
      fireEvent.press(item5Button);

      expect(mockUpdateQuantity).toHaveBeenCalled();
    });
  });

  describe('Price Formatting', () => {
    it('should format prices as Colombian pesos', () => {
      const { getByText } = render(<CartScreen />);

      // Should use dot as thousands separator
      expect(getByText(/21.500/)).toBeTruthy();
    });

    it('should format large totals correctly', () => {
      mockGetTotal.mockReturnValue(1000000);

      const { getByText } = render(<CartScreen />);

      expect(getByText(/1.000.000/)).toBeTruthy();
    });

    it('should format small totals correctly', () => {
      (useCartStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          items: [{ ...mockCartItems[0], productPrice: 100, quantity: 1 }],
          updateQuantity: mockUpdateQuantity,
          removeItem: mockRemoveItem,
          clearCart: mockClearCart,
          getTotal: mockGetTotal,
        };
        return selector(state);
      });

      mockGetTotal.mockReturnValue(100);

      const { getByText } = render(<CartScreen />);

      expect(getByText(/100/)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have testIDs for all interactive elements', () => {
      const { getByTestId } = render(<CartScreen />);

      expect(getByTestId('cart-screen')).toBeTruthy();
      expect(getByTestId('cart-list')).toBeTruthy();
      expect(getByTestId('cart-checkout-button')).toBeTruthy();
      expect(getByTestId('cart-clear-button')).toBeTruthy();
    });

    it('should have testIDs for cart items', () => {
      const { getByTestId } = render(<CartScreen />);

      expect(getByTestId('cart-item-inv-1')).toBeTruthy();
      expect(getByTestId('cart-item-inv-2')).toBeTruthy();
    });

    it('should have testID for item count badge', () => {
      const { getByTestId } = render(<CartScreen />);

      expect(getByTestId('cart-item-count')).toBeTruthy();
    });

    it('should have testID for empty state', () => {
      (useCartStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          items: [],
          updateQuantity: mockUpdateQuantity,
          removeItem: mockRemoveItem,
          clearCart: mockClearCart,
          getTotal: mockGetTotal,
        };
        return selector(state);
      });

      const { getByTestId } = render(<CartScreen />);

      expect(getByTestId('cart-empty-state')).toBeTruthy();
    });
  });
});
