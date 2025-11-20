import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OrdersScreen } from './OrdersScreen';
import { useTranslation } from '@/i18n/hooks';
import { useInfinitePaginatedQuery } from '@/hooks';
import { listMyOrdersBffClientAppMyOrdersGet } from '@/api/generated/client-app/client-app';

jest.mock('@/i18n/hooks');
jest.mock('@/hooks');
jest.mock('@/api/generated/client-app/client-app');

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;
const mockUseInfinitePaginatedQuery = useInfinitePaginatedQuery as jest.MockedFunction<typeof useInfinitePaginatedQuery>;
const mockListOrders = listMyOrdersBffClientAppMyOrdersGet as jest.MockedFunction<typeof listMyOrdersBffClientAppMyOrdersGet>;

// Future date for upcoming orders
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 7);

// Past date for past orders
const pastDate = new Date();
pastDate.setDate(pastDate.getDate() - 7);

const mockUpcomingOrder = {
  id: 'order-123',
  client_id: 'client-1',
  status: 'pending',
  total_amount: 100,
  created_at: new Date().toISOString(),
  fecha_pedido: new Date().toISOString(),
  fecha_entrega_estimada: futureDate.toISOString(),
  items: [],
};

const mockPastOrder = {
  id: 'order-456',
  client_id: 'client-1',
  status: 'delivered',
  total_amount: 200,
  created_at: new Date().toISOString(),
  fecha_pedido: new Date().toISOString(),
  fecha_entrega_estimada: pastDate.toISOString(),
  items: [],
};

const mockOrderNoDate = {
  id: 'order-789',
  client_id: 'client-1',
  status: 'pending',
  total_amount: 150,
  created_at: new Date().toISOString(),
  fecha_pedido: new Date().toISOString(),
  fecha_entrega_estimada: null,
  items: [],
};

describe('OrdersScreen', () => {
  let mockRefetch: jest.Mock;
  let mockFetchNextPage: jest.Mock;
  let mockQueryClient: QueryClient;

  beforeEach(() => {
    jest.useFakeTimers();
    mockRefetch = jest.fn();
    mockFetchNextPage = jest.fn();
    mockQueryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    mockUseTranslation.mockReturnValue({
      t: (key: string, params?: any) => {
        const translations: Record<string, string> = {
          'orders.title': 'Orders',
          'orders.loadingOrders': 'Loading orders...',
          'orders.loadingMore': 'Loading more...',
          'orders.emptyState': 'No orders found',
          'orders.emptyStateUpcomingOrders': 'No upcoming orders',
          'orders.emptyStatePastOrders': 'No past orders',
          'orders.showPastOrders': 'Show Past Orders',
          'orders.showingPastOrders': 'Showing Past Orders',
          'orders.totalOrders': `${params?.count} orders`,
          'common.error': 'Error',
          'common.retry': 'Retry',
        };
        return translations[key] || key;
      },
    } as any);

    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [],
      total: 0,
      isLoading: false,
      isError: false,
      error: null,
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      refetch: mockRefetch,
    } as any);

    mockListOrders.mockResolvedValue({
      items: [],
      total: 0,
      has_next: false,
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={mockQueryClient}>{children}</QueryClientProvider>
  );

  it('should render screen with testID', () => {
    const { getByTestId } = render(<OrdersScreen />, { wrapper });
    expect(getByTestId('orders-screen')).toBeTruthy();
  });

  it('should display loading state', () => {
    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [],
      total: 0,
      isLoading: true,
      isError: false,
      error: null,
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      refetch: mockRefetch,
    } as any);

    const { getByTestId, getByText } = render(<OrdersScreen />, { wrapper });
    expect(getByTestId('orders-loading')).toBeTruthy();
    expect(getByText('Loading orders...')).toBeTruthy();
  });

  it('should display error state and retry', () => {
    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [],
      total: 0,
      isLoading: false,
      isError: true,
      error: new Error('Network error'),
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      refetch: mockRefetch,
    } as any);

    const { getByTestId, getByText } = render(<OrdersScreen />, { wrapper });
    expect(getByTestId('orders-error')).toBeTruthy();
    expect(getByText('Network error')).toBeTruthy();

    fireEvent.press(getByText('Retry'));
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('should display generic error message when error has no message', () => {
    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [],
      total: 0,
      isLoading: false,
      isError: true,
      error: {} as any,
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      refetch: mockRefetch,
    } as any);

    const { getByText } = render(<OrdersScreen />, { wrapper });
    expect(getByText('Failed to load orders')).toBeTruthy();
  });

  it('should display empty state for upcoming orders', () => {
    const { getByTestId, getByText } = render(<OrdersScreen />, { wrapper });
    expect(getByTestId('orders-empty-state')).toBeTruthy();
    expect(getByText('No upcoming orders')).toBeTruthy();
  });

  it('should display empty state for past orders when filter toggled', () => {
    const { getByTestId, getByText } = render(<OrdersScreen />, { wrapper });

    // Toggle to past orders
    fireEvent.press(getByTestId('orders-filter-button'));

    expect(getByText('No past orders')).toBeTruthy();
  });

  it('should show upcoming orders by default', () => {
    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [mockUpcomingOrder, mockPastOrder],
      total: 2,
      isLoading: false,
      isError: false,
      error: null,
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      refetch: mockRefetch,
    } as any);

    const { getByText } = render(<OrdersScreen />, { wrapper });
    // Should show total count for filtered orders (only upcoming)
    expect(getByText('1 orders')).toBeTruthy();
  });

  it('should toggle to past orders and back', () => {
    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [mockUpcomingOrder, mockPastOrder],
      total: 2,
      isLoading: false,
      isError: false,
      error: null,
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      refetch: mockRefetch,
    } as any);

    const { getByTestId, getByText } = render(<OrdersScreen />, { wrapper });

    // Toggle to past orders
    fireEvent.press(getByTestId('orders-filter-button'));
    expect(getByText('Showing Past Orders')).toBeTruthy();

    // Toggle back to upcoming
    fireEvent.press(getByTestId('orders-filter-button'));
    expect(getByText('Show Past Orders')).toBeTruthy();
  });

  it('should show orders without date in upcoming view only', () => {
    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [mockOrderNoDate],
      total: 1,
      isLoading: false,
      isError: false,
      error: null,
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      refetch: mockRefetch,
    } as any);

    const { getByTestId, getByText, queryByText } = render(<OrdersScreen />, { wrapper });

    // Should show in upcoming view
    expect(getByText('1 orders')).toBeTruthy();

    // Toggle to past orders - should be empty
    fireEvent.press(getByTestId('orders-filter-button'));
    expect(queryByText('1 orders')).toBeNull();
  });

  it('should call refetch on pull-to-refresh', async () => {
    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [mockUpcomingOrder],
      total: 1,
      isLoading: false,
      isError: false,
      error: null,
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      refetch: mockRefetch,
    } as any);

    const { getByTestId } = render(<OrdersScreen />, { wrapper });
    fireEvent(getByTestId('orders-list'), 'refresh');
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('should call fetchNextPage on load more when hasNextPage', () => {
    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [mockUpcomingOrder],
      total: 100,
      isLoading: false,
      isError: false,
      error: null,
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: true,
      fetchNextPage: mockFetchNextPage,
      refetch: mockRefetch,
    } as any);

    const { getByTestId } = render(<OrdersScreen />, { wrapper });
    fireEvent(getByTestId('orders-list'), 'endReached');
    expect(mockFetchNextPage).toHaveBeenCalled();
  });

  it('should NOT call fetchNextPage when no hasNextPage', () => {
    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [mockUpcomingOrder],
      total: 1,
      isLoading: false,
      isError: false,
      error: null,
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      refetch: mockRefetch,
    } as any);

    const { getByTestId } = render(<OrdersScreen />, { wrapper });
    fireEvent(getByTestId('orders-list'), 'endReached');
    expect(mockFetchNextPage).not.toHaveBeenCalled();
  });

  it('should display footer spinner when fetching next page', () => {
    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [mockUpcomingOrder],
      total: 100,
      isLoading: false,
      isError: false,
      error: null,
      isFetchingNextPage: true,
      isRefetching: false,
      hasNextPage: true,
      fetchNextPage: mockFetchNextPage,
      refetch: mockRefetch,
    } as any);

    const { getByTestId, getByText } = render(<OrdersScreen />, { wrapper });
    expect(getByTestId('orders-load-more-spinner')).toBeTruthy();
    expect(getByText('Loading more...')).toBeTruthy();
  });

  it('should call hook with correct configuration', () => {
    render(<OrdersScreen />, { wrapper });

    expect(mockUseInfinitePaginatedQuery).toHaveBeenCalled();
    const callArgs = mockUseInfinitePaginatedQuery.mock.calls[0][0];

    expect(callArgs.queryKey[0]).toBe('orders');
    expect(callArgs.pageSize).toBe(20);
    expect(callArgs.staleTime).toBe(30 * 1000);

    // Test the queryFn
    callArgs.queryFn({ offset: 0, limit: 20 });
    expect(mockListOrders).toHaveBeenCalledWith({
      offset: 0,
      limit: 20,
    });

    // Test extractors
    const mockResponse = { items: [mockUpcomingOrder], total: 1, has_next: true };
    expect(callArgs.extractItems?.(mockResponse)).toEqual([mockUpcomingOrder]);
    expect(callArgs.extractTotal?.(mockResponse)).toBe(1);
    expect(callArgs.hasNextPage?.(mockResponse, [])).toBe(true);

    // Test has_next undefined
    expect(callArgs.hasNextPage?.({ items: [], total: 0 }, [])).toBe(false);
  });

  it('should handle non-array data gracefully', () => {
    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: null,
      total: 0,
      isLoading: false,
      isError: false,
      error: null,
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      refetch: mockRefetch,
    } as any);

    const { getByTestId } = render(<OrdersScreen />, { wrapper });
    expect(getByTestId('orders-empty-state')).toBeTruthy();
  });

  it('should use fallback loading more message when translation missing', () => {
    mockUseTranslation.mockReturnValue({
      t: (key: string) => {
        const translations: Record<string, string> = {
          'orders.title': 'Orders',
          'orders.loadingOrders': 'Loading orders...',
          'orders.emptyState': 'No orders found',
          'orders.showPastOrders': 'Show Past Orders',
          'common.error': 'Error',
          'common.retry': 'Retry',
        };
        return translations[key] || '';
      },
    } as any);

    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [mockUpcomingOrder],
      total: 1,
      isLoading: false,
      isError: false,
      error: null,
      isFetchingNextPage: true,
      isRefetching: false,
      hasNextPage: true,
      fetchNextPage: mockFetchNextPage,
      refetch: mockRefetch,
    } as any);

    const { getByText } = render(<OrdersScreen />, { wrapper });
    expect(getByText('Loading more...')).toBeTruthy();
  });

  it('should use fallback retry message when translation missing', () => {
    mockUseTranslation.mockReturnValue({
      t: (key: string) => {
        const translations: Record<string, string> = {
          'orders.title': 'Orders',
          'orders.loadingOrders': 'Loading orders...',
          'common.error': 'Error',
        };
        return translations[key] || '';
      },
    } as any);

    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [],
      total: 0,
      isLoading: false,
      isError: true,
      error: new Error('Test error'),
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      refetch: mockRefetch,
    } as any);

    const { getByText } = render(<OrdersScreen />, { wrapper });
    expect(getByText('Retry')).toBeTruthy();
  });
});
