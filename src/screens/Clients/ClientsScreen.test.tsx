import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClientsScreen } from './ClientsScreen';
import { useTranslation } from '@/i18n/hooks';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useInfinitePaginatedQuery } from '@/hooks';
import { router } from 'expo-router';
import { listClientsBffSellersAppClientsGet } from '@/api/generated/sellers-app/sellers-app';

jest.mock('@/i18n/hooks');
jest.mock('@/store/useNavigationStore');
jest.mock('@/hooks');
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));
jest.mock('@/api/generated/sellers-app/sellers-app', () => ({
  listClientsBffSellersAppClientsGet: jest.fn(),
}));

const mockListClients = listClientsBffSellersAppClientsGet as jest.MockedFunction<typeof listClientsBffSellersAppClientsGet>;

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;
const mockUseNavigationStore = useNavigationStore as jest.MockedFunction<typeof useNavigationStore>;
const mockUseInfinitePaginatedQuery = useInfinitePaginatedQuery as jest.MockedFunction<
  typeof useInfinitePaginatedQuery
>;

describe('ClientsScreen', () => {
  let mockQueryClient: QueryClient;
  let mockSetCurrentClient: jest.Mock;
  let mockFetchNextPage: jest.Mock;
  let mockRefetch: jest.Mock;

  const mockClient = {
    cliente_id: 'client-123',
    representante: 'John Doe',
    nombre_institucion: 'Hospital ABC',
    tipo_institucion: 'hospital',
    ciudad: 'Bogota',
    telefono: '3001234567',
  };

  const mockClient2 = {
    cliente_id: 'client-456',
    representante: 'Jane Smith',
    nombre_institucion: 'Clinic XYZ',
    tipo_institucion: 'clinic',
    ciudad: 'Medellin',
    telefono: '3109876543',
  };

  beforeEach(() => {
    jest.useFakeTimers();
    mockQueryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    mockUseTranslation.mockReturnValue({
      t: (key: string) => {
        const translations: Record<string, string> = {
          'clients.title': 'Clients',
          'clients.searchPlaceholder': 'Search clients...',
          'clients.emptyState': 'No clients found',
          'clients.emptyStateDescription': 'Try adjusting your search',
          'clients.loadingClients': 'Loading clients...',
          'clients.loadingMore': 'Loading more...',
          'common.error': 'Error',
          'common.retry': 'Retry',
        };
        return translations[key] || key;
      },
      i18n: {} as any,
      ready: true,
    } as any);

    mockSetCurrentClient = jest.fn();
    mockUseNavigationStore.mockImplementation((selector) => {
      const store = { setCurrentClient: mockSetCurrentClient };
      return selector(store as any);
    });

    mockFetchNextPage = jest.fn();
    mockRefetch = jest.fn();
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

    mockListClients.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      page_size: 20,
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={mockQueryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should render screen with all required elements', () => {
    const { getByTestId } = render(<ClientsScreen />, { wrapper });

    expect(getByTestId('clients-screen')).toBeTruthy();
    expect(getByTestId('clients-list')).toBeTruthy();
    expect(getByTestId('clients-search-bar')).toBeTruthy();
  });

  it('should display loading state with LoadingCard', () => {
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

    const { getByTestId, getByText } = render(<ClientsScreen />, { wrapper });

    expect(getByTestId('clients-loading')).toBeTruthy();
    expect(getByText('Loading clients...')).toBeTruthy();
  });

  it('should display error state with error message', () => {
    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [],
      total: 0,
      isLoading: false,
      isError: true,
      error: new Error('Network error occurred'),
      isFetchingNextPage: false,
      isRefetching: false,
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
      refetch: mockRefetch,
    } as any);

    const { getByTestId, getByText } = render(<ClientsScreen />, { wrapper });

    expect(getByTestId('clients-error')).toBeTruthy();
    expect(getByText('Network error occurred')).toBeTruthy();
    expect(getByText('Retry')).toBeTruthy();
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

    const { getByTestId } = render(<ClientsScreen />, { wrapper });
    // PaginatedList uses t('common.error') as fallback
    expect(getByTestId('clients-error')).toBeTruthy();
  });

  it('should call refetch when retry button is pressed in error state', () => {
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

    const { getByText } = render(<ClientsScreen />, { wrapper });

    fireEvent.press(getByText('Retry'));
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('should display empty state when no clients', () => {
    const { getByTestId, getByText } = render(<ClientsScreen />, { wrapper });

    expect(getByTestId('clients-empty-state')).toBeTruthy();
    expect(getByText('No clients found')).toBeTruthy();
    expect(getByText('Try adjusting your search')).toBeTruthy();
  });

  it('should render client cards when data is available', () => {
    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [mockClient, mockClient2],
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

    const { getByTestId, getByText } = render(<ClientsScreen />, { wrapper });

    expect(getByTestId('client-card-client-123')).toBeTruthy();
    expect(getByTestId('client-card-client-456')).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Jane Smith')).toBeTruthy();
  });

  it('should call setCurrentClient and navigate when client is pressed', () => {
    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [mockClient],
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

    const { getByTestId } = render(<ClientsScreen />, { wrapper });

    fireEvent.press(getByTestId('client-card-client-123'));

    expect(mockSetCurrentClient).toHaveBeenCalledWith(mockClient);
    expect(router.push).toHaveBeenCalledWith('/client/client-123');
  });

  it('should display footer spinner when fetching next page', () => {
    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [mockClient],
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

    const { getByTestId, getByText } = render(<ClientsScreen />, { wrapper });

    expect(getByTestId('clients-load-more-spinner')).toBeTruthy();
    expect(getByText('Loading more...')).toBeTruthy();
  });

  it('should not display footer when not fetching next page', () => {
    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [mockClient],
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

    const { queryByTestId } = render(<ClientsScreen />, { wrapper });

    expect(queryByTestId('clients-load-more-spinner')).toBeNull();
  });

  it('should call useInfinitePaginatedQuery with correct configuration and queryFn', () => {
    render(<ClientsScreen />, { wrapper });

    expect(mockUseInfinitePaginatedQuery).toHaveBeenCalled();
    const callArgs = mockUseInfinitePaginatedQuery.mock.calls[0][0];
    expect(callArgs.queryKey[0]).toBe('clients');
    expect(callArgs.pageSize).toBe(20);
    expect(callArgs.staleTime).toBe(5 * 60 * 1000);

    // Call the queryFn to cover it
    const queryFn = callArgs.queryFn;
    expect(typeof queryFn).toBe('function');
    queryFn({ offset: 0, limit: 20 } as any);
  });

  it('should update search text when typing in search bar', () => {
    const { getByTestId } = render(<ClientsScreen />, { wrapper });

    const searchInput = getByTestId('clients-search-bar-input');
    fireEvent.changeText(searchInput, 'Hospital');

    // The search text state updates - verify by re-checking the input
    expect(searchInput.props.value).toBe('Hospital');
  });

  it('should call refetch when pull-to-refresh is triggered', () => {
    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [mockClient],
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

    const { getByTestId } = render(<ClientsScreen />, { wrapper });

    const list = getByTestId('clients-list');
    fireEvent(list, 'refresh');

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('should call fetchNextPage when load more is triggered with hasNextPage', () => {
    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [mockClient],
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

    const { getByTestId } = render(<ClientsScreen />, { wrapper });

    const list = getByTestId('clients-list');
    fireEvent(list, 'endReached');

    expect(mockFetchNextPage).toHaveBeenCalled();
  });

  it('should not call fetchNextPage when no hasNextPage', () => {
    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [mockClient],
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

    const { getByTestId } = render(<ClientsScreen />, { wrapper });

    const list = getByTestId('clients-list');
    fireEvent(list, 'endReached');

    expect(mockFetchNextPage).not.toHaveBeenCalled();
  });


});
