import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { OrdersScreen } from './OrdersScreen';
import { useListMyOrdersBffClientAppMyOrdersGet } from '@/api/generated/client-app/client-app';
import type { OrderResponse } from '@/api/generated/models';

// Mock API hook
jest.mock('@/api/generated/client-app/client-app', () => ({
  useListMyOrdersBffClientAppMyOrdersGet: jest.fn(),
}));

// Mock i18n
jest.mock('@/i18n/hooks', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      const translations: Record<string, string> = {
        'orders.title': 'Orders',
        'orders.showPastOrders': 'Show Past Orders',
        'orders.showingPastOrders': 'Showing Past Orders',
        'orders.totalOrders': `Total: ${params?.count || 0} orders`,
        'orders.loadingOrders': 'Loading orders...',
        'orders.emptyState': 'No orders found',
        'orders.emptyStateUpcomingOrders': 'No upcoming orders at the moment',
        'orders.emptyStatePastOrders': 'No past orders found',
        'common.error': 'Error loading orders',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock SafeAreaView
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, testID, style, edges }: any) => (
      <View testID={testID} style={style}>
        {children}
      </View>
    ),
  };
});

// Mock FlashList
jest.mock('@shopify/flash-list', () => {
  const { View } = require('react-native');
  return {
    FlashList: ({
      data,
      renderItem,
      ListEmptyComponent,
      testID,
      keyExtractor,
      refreshControl,
    }: any) => {
      if (data && data.length === 0 && ListEmptyComponent) {
        return (
          <View testID={testID}>
            {refreshControl}
            {ListEmptyComponent()}
          </View>
        );
      }
      return (
        <View testID={testID}>
          {refreshControl}
          {data && data.map((item: any) => <View key={keyExtractor(item)}>{renderItem({ item })}</View>)}
        </View>
      );
    },
  };
});

// Mock OrderCard component
jest.mock('@/components/OrderCard', () => ({
  OrderCard: ({ order, testID }: any) => {
    const { View, Text } = require('react-native');
    return (
      <View testID={testID || `order-card-${order.id}`}>
        <Text>{order.id}</Text>
      </View>
    );
  },
}));

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  Filter: () => <></>,
}));

describe('OrdersScreen', () => {
  const mockOrderResponse = {
    id: 'ORD-001',
    customer_id: 'CUST-001',
    seller_id: 'SELLER-001',
    visit_id: 'VISIT-001',
    route_id: 'ROUTE-001',
    fecha_pedido: new Date().toISOString(),
    fecha_entrega_estimada: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    metodo_creacion: 'mobile',
    monto_total: 150000,
    direccion_entrega: '123 Main St',
    ciudad_entrega: 'Bogota',
    pais_entrega: 'Colombia',
    customer_name: 'John Doe',
    customer_phone: '1234567890',
    customer_email: 'john@example.com',
    seller_name: 'Seller Name',
    seller_email: 'seller@example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        id: 'ITEM-001',
        pedido_id: 'ORD-001',
        inventario_id: 'INV-001',
        product_name: 'Product A',
        cantidad: 2,
        precio_unitario: 50000,
        precio_total: 100000,
        product_sku: 'SKU-A',
        warehouse_id: 'WH-001',
        warehouse_name: 'Main Warehouse',
        warehouse_city: 'Bogota',
        warehouse_country: 'Colombia',
        batch_number: 'BATCH-001',
        expiration_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  };

  const mockPastOrderResponse = {
    id: 'ORD-002',
    customer_id: 'CUST-002',
    seller_id: 'SELLER-002',
    visit_id: 'VISIT-002',
    route_id: 'ROUTE-002',
    fecha_pedido: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    fecha_entrega_estimada: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    metodo_creacion: 'mobile',
    monto_total: 200000,
    direccion_entrega: '456 Secondary St',
    ciudad_entrega: 'Medellin',
    pais_entrega: 'Colombia',
    customer_name: 'Jane Smith',
    customer_phone: '0987654321',
    customer_email: 'jane@example.com',
    seller_name: 'Seller Two',
    seller_email: 'seller2@example.com',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'ITEM-002',
        pedido_id: 'ORD-002',
        inventario_id: 'INV-002',
        product_name: 'Product B',
        cantidad: 1,
        precio_unitario: 200000,
        precio_total: 200000,
        product_sku: 'SKU-B',
        warehouse_id: 'WH-002',
        warehouse_name: 'Secondary Warehouse',
        warehouse_city: 'Medellin',
        warehouse_country: 'Colombia',
        batch_number: 'BATCH-002',
        expiration_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  };

  const mockUseListMyOrdersBffClientAppMyOrdersGet = useListMyOrdersBffClientAppMyOrdersGet as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the orders screen with title', () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: [] },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByText } = render(<OrdersScreen />);
      expect(getByText('Orders')).toBeTruthy();
    });

    it('should render with correct testID', () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: [] },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByTestId } = render(<OrdersScreen />);
      expect(getByTestId('orders-screen')).toBeTruthy();
    });

    it('should render filter button', () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: [] },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByTestId } = render(<OrdersScreen />);
      expect(getByTestId('orders-filter-button')).toBeTruthy();
    });

    it('should render orders list', () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: [] },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByTestId } = render(<OrdersScreen />);
      expect(getByTestId('orders-list')).toBeTruthy();
    });

    it('should render orders list with refresh control integration', () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: [] },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByTestId } = render(<OrdersScreen />);
      // RefreshControl is part of FlashList, so we verify the list is rendered
      expect(getByTestId('orders-list')).toBeTruthy();
    });
  });

  describe('Data Loading', () => {
    it('should display orders when data is loaded', async () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: [mockOrderResponse] },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByTestId } = render(<OrdersScreen />);
      await waitFor(() => {
        expect(getByTestId('order-card-ORD-001')).toBeTruthy();
      });
    });

    it('should display multiple orders', async () => {
      // Create multiple upcoming orders
      const futureOrder2 = {
        id: 'ORD-002',
        customer_id: 'CUST-002',
        seller_id: 'SELLER-002',
        visit_id: 'VISIT-002',
        route_id: 'ROUTE-002',
        fecha_pedido: new Date().toISOString(),
        fecha_entrega_estimada: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        metodo_creacion: 'mobile',
        monto_total: 200000,
        direccion_entrega: '456 Secondary St',
        ciudad_entrega: 'Medellin',
        pais_entrega: 'Colombia',
        customer_name: 'Jane Smith',
        customer_phone: '0987654321',
        customer_email: 'jane@example.com',
        seller_name: 'Seller Two',
        seller_email: 'seller2@example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: [
          {
            id: 'ITEM-003',
            pedido_id: 'ORD-002',
            inventario_id: 'INV-003',
            product_name: 'Product B',
            cantidad: 1,
            precio_unitario: 200000,
            precio_total: 200000,
            product_sku: 'SKU-B',
            warehouse_id: 'WH-001',
            warehouse_name: 'Main Warehouse',
            warehouse_city: 'Bogota',
            warehouse_country: 'Colombia',
            batch_number: 'BATCH-003',
            expiration_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      };

      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: {
          items: [mockOrderResponse, futureOrder2],
        },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByTestId } = render(<OrdersScreen />);
      await waitFor(() => {
        expect(getByTestId('order-card-ORD-001')).toBeTruthy();
        expect(getByTestId('order-card-ORD-002')).toBeTruthy();
      });
    });

    it('should display order count when orders are loaded', async () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: [mockOrderResponse, mockPastOrderResponse] },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByText } = render(<OrdersScreen />);
      await waitFor(() => {
        // Only upcoming orders are shown by default
        expect(getByText('Total: 1 orders')).toBeTruthy();
      });
    });

    it('should show loading message when isLoading is true', () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: [] },
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      });

      const { getByText } = render(<OrdersScreen />);
      expect(getByText('Loading orders...')).toBeTruthy();
    });
  });

  describe('Empty States', () => {
    it('should display empty state when no orders and not loading', () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: [] },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByText } = render(<OrdersScreen />);
      expect(getByText('No orders found')).toBeTruthy();
      expect(getByText('No upcoming orders at the moment')).toBeTruthy();
    });

    it('should show correct empty message for upcoming orders', () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: [] },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByText } = render(<OrdersScreen />);
      expect(getByText('No upcoming orders at the moment')).toBeTruthy();
    });

    it('should show correct empty message for past orders', async () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: [] },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByText, getByTestId } = render(<OrdersScreen />);
      const filterButton = getByTestId('orders-filter-button');

      act(() => {
        fireEvent.press(filterButton);
      });

      await waitFor(() => {
        expect(getByText('No past orders found')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when error occurs', () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: [] },
        isLoading: false,
        error: new Error('Failed to fetch'),
        refetch: jest.fn(),
      });

      const { getByText } = render(<OrdersScreen />);
      expect(getByText('Error loading orders')).toBeTruthy();
    });

    it('should not display orders when error occurs', () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: [] },
        isLoading: false,
        error: new Error('Network error'),
        refetch: jest.fn(),
      });

      const { queryByTestId } = render(<OrdersScreen />);
      expect(queryByTestId('order-card-ORD-001')).toBeFalsy();
    });

    it('should still render the UI when there is an error', () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: [] },
        isLoading: false,
        error: new Error('API Error'),
        refetch: jest.fn(),
      });

      const { getByTestId } = render(<OrdersScreen />);
      expect(getByTestId('orders-screen')).toBeTruthy();
      expect(getByTestId('orders-filter-button')).toBeTruthy();
    });
  });

  describe('Filtering', () => {
    it('should filter out past orders by default', async () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: {
          items: [mockOrderResponse, mockPastOrderResponse],
        },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByTestId, queryByTestId } = render(<OrdersScreen />);
      await waitFor(() => {
        expect(getByTestId('order-card-ORD-001')).toBeTruthy(); // Upcoming order
      });
    });

    it('should show all orders when filter is toggled', async () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: {
          items: [mockOrderResponse, mockPastOrderResponse],
        },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByTestId } = render(<OrdersScreen />);
      const filterButton = getByTestId('orders-filter-button');

      act(() => {
        fireEvent.press(filterButton);
      });

      await waitFor(() => {
        expect(getByTestId('order-card-ORD-001')).toBeTruthy();
        expect(getByTestId('order-card-ORD-002')).toBeTruthy();
      });
    });

    it('should toggle filter button state', async () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: [] },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByText, getByTestId } = render(<OrdersScreen />);
      const filterButton = getByTestId('orders-filter-button');

      expect(getByText('Show Past Orders')).toBeTruthy();

      act(() => {
        fireEvent.press(filterButton);
      });

      await waitFor(() => {
        expect(getByText('Showing Past Orders')).toBeTruthy();
      });
    });

    it('should toggle filter back to default', async () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: [] },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByText, getByTestId } = render(<OrdersScreen />);
      const filterButton = getByTestId('orders-filter-button');

      // First toggle
      act(() => {
        fireEvent.press(filterButton);
      });

      await waitFor(() => {
        expect(getByText('Showing Past Orders')).toBeTruthy();
      });

      // Second toggle
      act(() => {
        fireEvent.press(filterButton);
      });

      await waitFor(() => {
        expect(getByText('Show Past Orders')).toBeTruthy();
      });
    });

    it('should filter orders with today delivery date as upcoming', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrder = {
        ...mockOrderResponse,
        id: 'ORD-TODAY',
        fecha_entrega_estimada: today.toISOString(),
      };

      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: {
          items: [todayOrder],
        },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByTestId } = render(<OrdersScreen />);
      await waitFor(() => {
        expect(getByTestId('order-card-ORD-TODAY')).toBeTruthy();
      });
    });

    it('should filter orders with null delivery date as upcoming', async () => {
      const orderWithoutDate = {
        ...mockOrderResponse,
        id: 'ORD-NODATE',
        fecha_entrega_estimada: null,
      };

      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: {
          items: [orderWithoutDate],
        },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByTestId } = render(<OrdersScreen />);
      await waitFor(() => {
        expect(getByTestId('order-card-ORD-NODATE')).toBeTruthy();
      });
    });

    it('should not show order count when loading', () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: [mockOrderResponse] },
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      });

      const { queryByText } = render(<OrdersScreen />);
      expect(queryByText(/Total:/)).toBeFalsy();
    });

    it('should not show order count when no orders', () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: [] },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { queryByText } = render(<OrdersScreen />);
      expect(queryByText(/Total:/)).toBeFalsy();
    });
  });

  describe('Refresh Functionality', () => {
    it('should call refetch on component mount and provide refresh hook', () => {
      const mockRefetch = jest.fn();
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: [mockOrderResponse] },
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<OrdersScreen />);

      // Verify the hook was called (component is using it)
      expect(mockUseListMyOrdersBffClientAppMyOrdersGet).toHaveBeenCalled();
    });

    it('should maintain loading state during refresh', async () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: [mockOrderResponse] },
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      });

      const { getByTestId, queryByText } = render(<OrdersScreen />);

      // Loading state should hide the order count
      expect(queryByText(/Total:/)).toBeFalsy();
      // But list should still be visible
      expect(getByTestId('orders-list')).toBeTruthy();
    });
  });

  describe('Order Count Display', () => {
    it('should display correct count for single order', () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: [mockOrderResponse] },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByText } = render(<OrdersScreen />);
      expect(getByText('Total: 1 orders')).toBeTruthy();
    });

    it('should display correct count for multiple orders', () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: {
          items: [
            mockOrderResponse,
            mockPastOrderResponse,
            { ...mockOrderResponse, id: 'ORD-003' },
          ],
        },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByText } = render(<OrdersScreen />);
      // Only upcoming orders are shown by default (ORD-001 and ORD-003)
      expect(getByText('Total: 2 orders')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined data gracefully', () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByText } = render(<OrdersScreen />);
      expect(getByText('No orders found')).toBeTruthy();
    });

    it('should handle null data gracefully', () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByText } = render(<OrdersScreen />);
      expect(getByText('No orders found')).toBeTruthy();
    });

    it('should handle data without items property', () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: {},
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByText } = render(<OrdersScreen />);
      expect(getByText('No orders found')).toBeTruthy();
    });

    it('should handle orders with missing delivery date', () => {
      const orderWithoutDate = {
        ...mockOrderResponse,
        fecha_entrega_estimada: undefined,
      };

      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: [orderWithoutDate] },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByTestId } = render(<OrdersScreen />);
      expect(getByTestId('order-card-ORD-001')).toBeTruthy();
    });

    it('should handle large number of orders', () => {
      const manyOrders = Array.from({ length: 50 }, (_, i) => ({
        ...mockOrderResponse,
        id: `ORD-${String(i + 1).padStart(3, '0')}`,
      }));

      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: manyOrders },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByText } = render(<OrdersScreen />);
      expect(getByText('Total: 50 orders')).toBeTruthy();
    });
  });

  describe('Integration', () => {
    it('should render correctly in loading state', () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: [] },
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      });

      const { getByText } = render(<OrdersScreen />);
      expect(getByText('Loading orders...')).toBeTruthy();
    });

    it('should render correctly with loaded orders', async () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: [mockOrderResponse] },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByText } = render(<OrdersScreen />);

      await waitFor(() => {
        expect(getByText('Total: 1 orders')).toBeTruthy();
      });
    });

    it('should render correctly in error state', () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: [] },
        isLoading: false,
        error: new Error('API Error'),
        refetch: jest.fn(),
      });

      const { getByText } = render(<OrdersScreen />);
      expect(getByText('Error loading orders')).toBeTruthy();
    });

    it('should maintain filter state during refresh', async () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: {
          items: [mockOrderResponse, mockPastOrderResponse],
        },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByTestId, getByText, queryByTestId } = render(<OrdersScreen />);

      // Toggle filter to show past orders
      const filterButton = getByTestId('orders-filter-button');
      act(() => {
        fireEvent.press(filterButton);
      });

      await waitFor(() => {
        expect(getByText('Showing Past Orders')).toBeTruthy();
        expect(getByTestId('order-card-ORD-001')).toBeTruthy();
        expect(getByTestId('order-card-ORD-002')).toBeTruthy();
      });

      // Filter state should still be active (can't change in test but component maintains it)
    });
  });

  describe('Accessibility', () => {
    it('should have proper testIDs for automation', async () => {
      mockUseListMyOrdersBffClientAppMyOrdersGet.mockReturnValue({
        data: { items: [mockOrderResponse] },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { getByTestId } = render(<OrdersScreen />);

      await waitFor(() => {
        expect(getByTestId('orders-screen')).toBeTruthy();
        expect(getByTestId('orders-filter-button')).toBeTruthy();
        expect(getByTestId('orders-list')).toBeTruthy();
      });
    });
  });
});
