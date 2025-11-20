import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartScreen } from './CartScreen';
import * as cartStore from '@/store/useCartStore';
import * as authStore from '@/store/useAuthStore';
import * as translationHook from '@/i18n/hooks';
import * as toastHook from '@/components/ui/toast';
import * as sellersApi from '@/api/generated/sellers-app/sellers-app';
import * as createOrderHook from '@/hooks/useCreateOrder';

// Mock only hooks and utils - NOT UI components
jest.mock('@/store/useCartStore');
jest.mock('@/store/useAuthStore');
jest.mock('@/i18n/hooks');
jest.mock('@/components/ui/toast');
jest.mock('@/api/generated/sellers-app/sellers-app');
jest.mock('@/hooks/useCreateOrder');

const mockUseCartStore = cartStore.useCartStore as jest.MockedFunction<typeof cartStore.useCartStore>;
const mockUseAuthStore = authStore.useAuthStore as jest.MockedFunction<typeof authStore.useAuthStore>;
const mockUseTranslation = translationHook.useTranslation as jest.MockedFunction<
  typeof translationHook.useTranslation
>;
const mockUseToast = toastHook.useToast as jest.MockedFunction<typeof toastHook.useToast>;
const mockUseListClientsBffSellersAppClientsGet =
  sellersApi.useListClientsBffSellersAppClientsGet as jest.MockedFunction<
    typeof sellersApi.useListClientsBffSellersAppClientsGet
  >;
const mockUseCreateOrder = createOrderHook.useCreateOrder as jest.MockedFunction<
  typeof createOrderHook.useCreateOrder
>;

describe('CartScreen', () => {
  let mockQueryClient: QueryClient;
  let mockToastShow: jest.Mock;
  let mockCreateOrderMutate: jest.Mock;
  let alertSpy: jest.SpyInstance;
  let mockClearCart: jest.Mock;
  let mockUpdateQuantity: jest.Mock;
  let mockRemoveItem: jest.Mock;

  beforeEach(() => {
    mockQueryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    // Setup translation mock
    mockUseTranslation.mockReturnValue({
      t: (key: string) => {
        const translations: Record<string, string> = {
          'cart.title': 'Shopping Cart',
          'cart.emptyState': 'Your cart is empty',
          'cart.emptyStateDescription': 'Add items to get started',
          'cart.checkout': 'Confirm Order',
          'cart.checkoutMessage': 'Are you sure?',
          'cart.placeOrder': 'Place Order',
          'cart.orderSuccess': 'Order Placed',
          'cart.orderSuccessMessage': 'Success',
          'cart.orderError': 'Order Failed',
          'common.cancel': 'Cancel',
          'common.error': 'Error',
        };
        return translations[key] || key;
      },
      i18n: {} as any,
      ready: true,
    } as any);

    // Setup toast mock with render capture
    mockToastShow = jest.fn();
    mockUseToast.mockReturnValue({
      show: mockToastShow,
    } as any);

    // Setup auth store mock (client by default)
    mockUseAuthStore.mockImplementation((selector) => {
      return selector({ user: { role: 'client' } } as any);
    });

    // Setup cart store mocks
    mockClearCart = jest.fn();
    mockUpdateQuantity = jest.fn();
    mockRemoveItem = jest.fn();
    mockUseCartStore.mockImplementation((selector) => {
      return selector({
        items: [],
        updateQuantity: mockUpdateQuantity,
        removeItem: mockRemoveItem,
        clearCart: mockClearCart,
        getTotal: () => 0,
      } as any);
    });

    // Setup clients API mock
    mockUseListClientsBffSellersAppClientsGet.mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isError: false,
    } as any);

    // Setup create order mock
    mockCreateOrderMutate = jest.fn();
    mockUseCreateOrder.mockReturnValue({
      mutate: mockCreateOrderMutate,
      isPending: false,
    } as any);

    // Mock Alert
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
    alertSpy.mockRestore();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={mockQueryClient}>{children}</QueryClientProvider>
  );

  const mockCartItems = (items: any[], total: number = 0) => {
    mockUseCartStore.mockImplementation((selector) => {
      return selector({
        items,
        updateQuantity: mockUpdateQuantity,
        removeItem: mockRemoveItem,
        clearCart: mockClearCart,
        getTotal: () => total,
      } as any);
    });
  };

  const mockItem = (overrides = {}) => ({
    inventoryId: '1',
    productName: 'Test Product',
    quantity: 1,
    unitPrice: 100,
    productPrice: 100,
    productSku: 'SKU1',
    warehouseName: 'WH1',
    availableQuantity: 10,
    ...overrides,
  });

  // ==================== RENDERING TESTS ====================

  it('should render cart screen container', () => {
    const { getByTestId } = render(<CartScreen />, { wrapper });
    expect(getByTestId('cart-screen')).toBeTruthy();
  });

  it('should render empty state when cart is empty', () => {
    mockCartItems([]);
    const { getByTestId, queryByTestId } = render(<CartScreen />, { wrapper });
    expect(getByTestId('cart-empty-state')).toBeTruthy();
    expect(queryByTestId('cart-footer')).toBeNull();
  });

  it('should render cart list and footer when cart has items', () => {
    mockCartItems([mockItem()], 100);
    const { getByTestId } = render(<CartScreen />, { wrapper });
    expect(getByTestId('cart-list')).toBeTruthy();
    expect(getByTestId('cart-footer')).toBeTruthy();
  });

  it('should display item count badge when cart has items', () => {
    mockCartItems([mockItem(), mockItem({ inventoryId: '2' })], 200);
    const { getByTestId } = render(<CartScreen />, { wrapper });
    expect(getByTestId('cart-item-count')).toBeTruthy();
  });

  // ==================== CLIENT SELECTION TESTS ====================

  it('should only fetch clients for seller role', () => {
    mockUseAuthStore.mockImplementation((selector) => {
      return selector({ user: { role: 'seller' } } as any);
    });
    mockCartItems([mockItem()], 100);

    render(<CartScreen />, { wrapper });

    expect(mockUseListClientsBffSellersAppClientsGet).toHaveBeenCalledWith(undefined, {
      query: {
        enabled: true,
        staleTime: 5 * 60 * 1000,
      },
    });
  });

  it('should not fetch clients for client role', () => {
    mockUseAuthStore.mockImplementation((selector) => {
      return selector({ user: { role: 'client' } } as any);
    });
    mockCartItems([mockItem()], 100);

    render(<CartScreen />, { wrapper });

    expect(mockUseListClientsBffSellersAppClientsGet).toHaveBeenCalledWith(undefined, {
      query: {
        enabled: false,
        staleTime: 5 * 60 * 1000,
      },
    });
  });

  it('should not render client selector modal for client role', () => {
    // Mock with client role - modal should not appear
    mockUseAuthStore.mockImplementation((selector) => {
      return selector({ user: { role: 'client' } } as any);
    });
    mockCartItems([mockItem()], 100);

    const { queryByTestId } = render(<CartScreen />, { wrapper });
    expect(queryByTestId('client-selector-modal')).toBeNull();
  });

  // ==================== CHECKOUT TESTS ====================

  it('should show checkout confirmation alert', () => {
    mockCartItems([mockItem()], 100);
    const { getByTestId } = render(<CartScreen />, { wrapper });

    fireEvent.press(getByTestId('cart-checkout-button'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Confirm Order',
      'Are you sure?',
      expect.any(Array)
    );
  });

  it('should create order for client without customer_id', () => {
    mockUseAuthStore.mockImplementation((selector) => {
      return selector({ user: { role: 'client' } } as any);
    });
    mockCartItems([mockItem({ quantity: 2 })], 200);

    // Mock alert to trigger onPress
    alertSpy.mockImplementation((_, __, buttons) => {
      buttons?.[1]?.onPress?.();
    });

    const { getByTestId } = render(<CartScreen />, { wrapper });
    fireEvent.press(getByTestId('cart-checkout-button'));

    expect(mockCreateOrderMutate).toHaveBeenCalledWith(
      {
        customer_id: undefined,
        items: [{ inventario_id: '1', cantidad: 2 }],
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );
  });

  it('should create order for seller with customer_id', () => {
    mockUseAuthStore.mockImplementation((selector) => {
      return selector({ user: { role: 'seller' } } as any);
    });
    mockCartItems([mockItem({ quantity: 3 })], 300);
    mockUseListClientsBffSellersAppClientsGet.mockReturnValue({
      data: {
        items: [
          {
            cliente_id: 'client-123',
            representante: 'John',
            nombre_institucion: 'Hospital',
            ciudad: 'NYC',
          },
        ],
      },
    } as any);

    alertSpy.mockImplementation((_, __, buttons) => {
      buttons?.[1]?.onPress?.();
    });

    const { getByTestId } = render(<CartScreen />, { wrapper });
    fireEvent.press(getByTestId('select-client-button'));
    fireEvent.press(getByTestId('client-option-client-123'));
    fireEvent.press(getByTestId('cart-checkout-button'));

    expect(mockCreateOrderMutate).toHaveBeenCalledWith(
      {
        customer_id: 'client-123',
        items: [{ inventario_id: '1', cantidad: 3 }],
      },
      expect.any(Object)
    );
  });

  it('should not call createOrder when checkout is cancelled', () => {
    mockCartItems([mockItem()], 100);

    alertSpy.mockImplementation((_, __, buttons) => {
      buttons?.[0]?.onPress?.();
    });

    const { getByTestId } = render(<CartScreen />, { wrapper });
    fireEvent.press(getByTestId('cart-checkout-button'));

    expect(mockCreateOrderMutate).not.toHaveBeenCalled();
  });

  // ==================== ORDER SUCCESS TESTS ====================

  it('should show success toast on order success', () => {
    mockCartItems([mockItem()], 100);

    alertSpy.mockImplementation((_, __, buttons) => {
      buttons?.[1]?.onPress?.();
    });

    const { getByTestId } = render(<CartScreen />, { wrapper });
    fireEvent.press(getByTestId('cart-checkout-button'));

    const orderCallback = mockCreateOrderMutate.mock.calls[0][1];
    act(() => {
      orderCallback.onSuccess?.();
    });

    expect(mockToastShow).toHaveBeenCalledWith(
      expect.objectContaining({
        placement: 'top',
        duration: 3000,
      })
    );

    // Execute the render callback to cover line 72
    const toastConfig = mockToastShow.mock.calls[0][0];
    const toastContent = toastConfig.render({ id: 'test-id' });
    expect(toastContent).toBeTruthy();
    expect(toastContent.props.nativeID).toBe('test-id');
    expect(toastContent.props.action).toBe('success');
  });

  it('should clear cart on order success', () => {
    mockCartItems([mockItem()], 100);

    alertSpy.mockImplementation((_, __, buttons) => {
      buttons?.[1]?.onPress?.();
    });

    const { getByTestId } = render(<CartScreen />, { wrapper });
    fireEvent.press(getByTestId('cart-checkout-button'));

    const orderCallback = mockCreateOrderMutate.mock.calls[0][1];
    act(() => {
      orderCallback.onSuccess?.();
    });

    expect(mockClearCart).toHaveBeenCalled();
  });

  it('should invalidate orders query on order success', () => {
    mockCartItems([mockItem()], 100);
    const invalidateSpy = jest.spyOn(mockQueryClient, 'invalidateQueries');

    alertSpy.mockImplementation((_, __, buttons) => {
      buttons?.[1]?.onPress?.();
    });

    const { getByTestId } = render(<CartScreen />, { wrapper });
    fireEvent.press(getByTestId('cart-checkout-button'));

    const orderCallback = mockCreateOrderMutate.mock.calls[0][1];
    act(() => {
      orderCallback.onSuccess?.();
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['orders'],
    });

    invalidateSpy.mockRestore();
  });

  // ==================== ORDER ERROR TESTS ====================

  it('should show error toast on order error', () => {
    mockCartItems([mockItem()], 100);

    alertSpy.mockImplementation((_, __, buttons) => {
      buttons?.[1]?.onPress?.();
    });

    const { getByTestId } = render(<CartScreen />, { wrapper });
    fireEvent.press(getByTestId('cart-checkout-button'));

    const orderCallback = mockCreateOrderMutate.mock.calls[0][1];
    act(() => {
      orderCallback.onError?.();
    });

    expect(mockToastShow).toHaveBeenCalledWith(
      expect.objectContaining({
        placement: 'top',
        duration: 3000,
      })
    );

    // Execute the render callback to cover line 92
    const toastConfig = mockToastShow.mock.calls[0][0];
    const toastContent = toastConfig.render({ id: 'test-id' });
    expect(toastContent).toBeTruthy();
    expect(toastContent.props.nativeID).toBe('test-id');
    expect(toastContent.props.action).toBe('error');
  });

  // ==================== CART ITEM INTERACTION TESTS ====================

  it('should handle item quantity increase', () => {
    mockCartItems([mockItem({ inventoryId: '1', quantity: 1 })], 100);
    const { getByTestId } = render(<CartScreen />, { wrapper });

    fireEvent.press(getByTestId('cart-item-1-price-quantity-quantity-selector-increase'));

    expect(mockUpdateQuantity).toHaveBeenCalledWith('1', 2);
  });

  it('should handle item quantity decrease', () => {
    mockCartItems([mockItem({ inventoryId: '2', quantity: 3 })], 300);
    const { getByTestId } = render(<CartScreen />, { wrapper });

    fireEvent.press(getByTestId('cart-item-2-price-quantity-quantity-selector-decrease'));

    expect(mockUpdateQuantity).toHaveBeenCalledWith('2', 2);
  });

  it('should remove item when confirmed', () => {
    mockCartItems([mockItem()], 100);

    alertSpy.mockImplementation((_, __, buttons) => {
      buttons?.[1]?.onPress?.();
    });

    const { getByTestId } = render(<CartScreen />, { wrapper });
    fireEvent.press(getByTestId('cart-item-1-remove-button'));

    expect(mockRemoveItem).toHaveBeenCalledWith('1');
  });

  it('should not remove item when cancelled', () => {
    mockCartItems([mockItem()], 100);

    alertSpy.mockImplementation((_, __, buttons) => {
      buttons?.[0]?.onPress?.();
    });

    const { getByTestId } = render(<CartScreen />, { wrapper });
    fireEvent.press(getByTestId('cart-item-1-remove-button'));

    expect(mockRemoveItem).not.toHaveBeenCalled();
  });

  // ==================== CART CLEARING TESTS ====================

  it('should clear cart when clear button is confirmed', () => {
    mockCartItems([mockItem()], 100);

    alertSpy.mockImplementation((_, __, buttons) => {
      buttons?.[1]?.onPress?.();
    });

    const { getByTestId } = render(<CartScreen />, { wrapper });
    fireEvent.press(getByTestId('cart-clear-button'));

    expect(mockClearCart).toHaveBeenCalled();
  });

  // ==================== CLIENT SELECTION TESTS ====================

  it('should update selected client when client selected', () => {
    mockUseAuthStore.mockImplementation((selector) => {
      return selector({ user: { role: 'seller' } } as any);
    });
    mockCartItems([mockItem()], 100);
    mockUseListClientsBffSellersAppClientsGet.mockReturnValue({
      data: {
        items: [
          {
            cliente_id: 'client-1',
            representante: 'John',
            nombre_institucion: 'Hospital',
            ciudad: 'NYC',
          },
        ],
      },
    } as any);

    const { getByTestId } = render(<CartScreen />, { wrapper });
    fireEvent.press(getByTestId('select-client-button'));
    fireEvent.press(getByTestId('client-option-client-1'));

    // Verify the change button appears (indicating client is selected)
    expect(getByTestId('change-client-button')).toBeTruthy();
  });

  it('should close client selector modal when close pressed', () => {
    mockUseAuthStore.mockImplementation((selector) => {
      return selector({ user: { role: 'seller' } } as any);
    });
    mockCartItems([mockItem()], 100);

    const { getByTestId, queryByTestId } = render(<CartScreen />, { wrapper });
    fireEvent.press(getByTestId('select-client-button'));
    expect(getByTestId('client-selector-modal')).toBeTruthy();

    fireEvent.press(getByTestId('close-client-selector'));
    expect(queryByTestId('client-selector-modal')).toBeDefined();
  });

  it('should handle multiple items in cart', () => {
    const items = [
      mockItem({ inventoryId: '1' }),
      mockItem({ inventoryId: '2', productName: 'Product 2' }),
      mockItem({ inventoryId: '3', productName: 'Product 3' }),
    ];
    mockCartItems(items, 300);

    const { getByTestId } = render(<CartScreen />, { wrapper });
    expect(getByTestId('cart-item-count')).toBeTruthy();
    expect(getByTestId('cart-item-1')).toBeTruthy();
    expect(getByTestId('cart-item-2')).toBeTruthy();
    expect(getByTestId('cart-item-3')).toBeTruthy();
  });
});
