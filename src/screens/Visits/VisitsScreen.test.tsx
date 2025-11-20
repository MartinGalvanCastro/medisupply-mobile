import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VisitsScreen } from './VisitsScreen';
import { useTranslation } from '@/i18n/hooks';
import { useNavigationStore } from '@/store/useNavigationStore';
import { useInfinitePaginatedQuery } from '@/hooks';
import { router } from 'expo-router';
import { listVisitsBffSellersAppVisitsGet } from '@/api/generated/sellers-app/sellers-app';

jest.mock('@/i18n/hooks');
jest.mock('@/store/useNavigationStore');
jest.mock('@/hooks');
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));
jest.mock('@/api/generated/sellers-app/sellers-app', () => ({
  listVisitsBffSellersAppVisitsGet: jest.fn(),
}));

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;
const mockUseNavigationStore = useNavigationStore as jest.MockedFunction<typeof useNavigationStore>;
const mockUseInfinitePaginatedQuery = useInfinitePaginatedQuery as jest.MockedFunction<typeof useInfinitePaginatedQuery>;
const mockListVisits = listVisitsBffSellersAppVisitsGet as jest.MockedFunction<typeof listVisitsBffSellersAppVisitsGet>;

const mockVisit = {
  id: 'visit-123',
  client_id: 'client-1',
  client_nombre_institucion: 'Hospital ABC',
  client_representante: 'John Doe',
  client_direccion: '123 Main St',
  fecha_visita: new Date().toISOString(),
  status: 'scheduled',
  notas_visita: 'Regular checkup',
};

const mockVisitWithoutRepresentante = {
  id: 'visit-789',
  client_id: 'client-3',
  client_nombre_institucion: 'Pharmacy ABC',
  client_direccion: '789 Pine Rd',
  fecha_visita: new Date().toISOString(),
  status: 'scheduled',
  notas_visita: 'Initial consultation',
};

describe('VisitsScreen', () => {
  let mockQueryClient: QueryClient;
  let mockSetCurrentVisit: jest.Mock;
  let mockFetchNextPage: jest.Mock;
  let mockRefetch: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    mockQueryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    mockUseTranslation.mockReturnValue({
      t: (key: string) => {
        const translations: Record<string, string> = {
          'visits.title': 'Visits',
          'visits.searchPlaceholder': 'Search visits...',
          'visits.emptyState': 'No visits found',
          'visits.emptyStateDescription': 'Try adjusting your search',
          'visits.loadingVisits': 'Loading visits...',
          'visits.loadingMore': 'Loading more...',
          'visits.filterBy': 'Filter By',
          'visits.filterToday': 'Today',
          'visits.filterPast': 'Past',
          'visits.filterFuture': 'Future',
          'common.error': 'Error',
          'common.retry': 'Retry',
        };
        return translations[key] || key;
      },
    } as any);

    mockSetCurrentVisit = jest.fn();
    mockUseNavigationStore.mockImplementation((selector) => {
      const store = { setCurrentVisit: mockSetCurrentVisit };
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

    mockListVisits.mockResolvedValue({
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

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={mockQueryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should render screen with all required elements', () => {
    const { getByTestId } = render(<VisitsScreen />, { wrapper });

    expect(getByTestId('visits-screen')).toBeTruthy();
    expect(getByTestId('visits-list')).toBeTruthy();
    expect(getByTestId('visits-search-bar')).toBeTruthy();
    expect(getByTestId('filter-status-button')).toBeTruthy();
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

    const { getByTestId, getByText } = render(<VisitsScreen />, { wrapper });

    expect(getByTestId('visits-loading')).toBeTruthy();
    expect(getByText('Loading visits...')).toBeTruthy();
  });

  it('should display error state with error message', () => {
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

    const { getByTestId, getByText } = render(<VisitsScreen />, { wrapper });

    expect(getByTestId('visits-error')).toBeTruthy();
    expect(getByText('Network error')).toBeTruthy();
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

    const { getByTestId } = render(<VisitsScreen />, { wrapper });
    // PaginatedList uses t('common.error') as fallback
    expect(getByTestId('visits-error')).toBeTruthy();
  });

  it('should call refetch when retry button is pressed', () => {
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

    const { getByText } = render(<VisitsScreen />, { wrapper });

    fireEvent.press(getByText('Retry'));
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('should display empty state when no visits', () => {
    const { getByTestId, getByText } = render(<VisitsScreen />, { wrapper });

    expect(getByTestId('visits-empty-state')).toBeTruthy();
    expect(getByText('No visits found')).toBeTruthy();
  });

  it('should render visit cards when data is available', () => {
    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [mockVisit, mockVisitWithoutRepresentante],
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

    const { getByTestId } = render(<VisitsScreen />, { wrapper });

    expect(getByTestId('visit-card-visit-123')).toBeTruthy();
    expect(getByTestId('visit-card-visit-789')).toBeTruthy();
  });

  it('should call setCurrentVisit and navigate when visit is pressed', () => {
    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [mockVisit],
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

    const { getByTestId } = render(<VisitsScreen />, { wrapper });

    fireEvent.press(getByTestId('visit-card-visit-123'));

    expect(mockSetCurrentVisit).toHaveBeenCalledWith(mockVisit);
    expect(router.push).toHaveBeenCalledWith('/visit/visit-123');
  });

  it('should open filter modal and select different filters', () => {
    const { getByTestId, getAllByText } = render(<VisitsScreen />, { wrapper });

    // Open filter modal
    fireEvent.press(getByTestId('filter-status-button'));
    expect(getByTestId('filter-status-modal')).toBeTruthy();

    // Select Past filter
    const pastOptions = getAllByText('Past');
    fireEvent.press(pastOptions[0]);

    // Verify Past is displayed
    expect(getAllByText('Past').length).toBeGreaterThanOrEqual(1);

    // Open again and select Future
    fireEvent.press(getByTestId('filter-status-button'));
    const futureOptions = getAllByText('Future');
    fireEvent.press(futureOptions[0]);

    // Verify Future is displayed
    expect(getAllByText('Future').length).toBeGreaterThanOrEqual(1);
  });

  it('should update search text when typing', () => {
    const { getByTestId } = render(<VisitsScreen />, { wrapper });

    const searchInput = getByTestId('visits-search-bar-input');
    fireEvent.changeText(searchInput, 'Hospital');

    expect(searchInput.props.value).toBe('Hospital');
  });

  it('should call refetch on pull-to-refresh', () => {
    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [mockVisit],
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

    const { getByTestId } = render(<VisitsScreen />, { wrapper });

    fireEvent(getByTestId('visits-list'), 'refresh');
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('should handle pagination correctly', () => {
    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [mockVisit],
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

    const { getByTestId, rerender } = render(<VisitsScreen />, { wrapper });

    // Should call fetchNextPage when hasNextPage
    fireEvent(getByTestId('visits-list'), 'endReached');
    expect(mockFetchNextPage).toHaveBeenCalled();

    // Reset and test when already fetching
    mockFetchNextPage.mockClear();
    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [mockVisit],
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

    rerender(<VisitsScreen />);
    fireEvent(getByTestId('visits-list'), 'endReached');
    expect(mockFetchNextPage).not.toHaveBeenCalled();
  });

  it('should display footer loading indicator when fetching next page', () => {
    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [mockVisit],
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

    const { getByTestId, getByText } = render(<VisitsScreen />, { wrapper });

    expect(getByTestId('visits-load-more-spinner')).toBeTruthy();
    expect(getByText('Loading more...')).toBeTruthy();
  });

  it('should call hook with correct configuration', () => {
    render(<VisitsScreen />, { wrapper });

    expect(mockUseInfinitePaginatedQuery).toHaveBeenCalled();
    const callArgs = mockUseInfinitePaginatedQuery.mock.calls[0][0];

    expect(callArgs.queryKey[0]).toBe('visits');
    expect(callArgs.pageSize).toBe(20);
    expect(callArgs.staleTime).toBe(5 * 60 * 1000);

    // Test the queryFn
    callArgs.queryFn({ offset: 0, limit: 20 });
    expect(mockListVisits).toHaveBeenCalled();
  });

  it('should display Today filter by default', () => {
    const { getByText } = render(<VisitsScreen />, { wrapper });

    expect(getByText('Today')).toBeTruthy();
  });

  it('should allow filter button interaction in loading state', () => {
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

    const { getByTestId } = render(<VisitsScreen />, { wrapper });

    const filterButton = getByTestId('filter-status-button');
    expect(filterButton).toBeTruthy();
    fireEvent.press(filterButton);
  });

  it('should allow filter button interaction in error state', () => {
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

    const { getByTestId } = render(<VisitsScreen />, { wrapper });

    const filterButton = getByTestId('filter-status-button');
    expect(filterButton).toBeTruthy();
    fireEvent.press(filterButton);
  });

  it('should render visit card when client_representante is missing', () => {
    mockUseInfinitePaginatedQuery.mockReturnValue({
      data: [mockVisitWithoutRepresentante],
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

    const { getByTestId } = render(<VisitsScreen />, { wrapper });

    expect(getByTestId('visit-card-visit-789')).toBeTruthy();
  });

  it('should display "Past" filter when past status is selected', () => {
    const { getByTestId, getAllByText } = render(<VisitsScreen />, { wrapper });

    // Open filter modal
    fireEvent.press(getByTestId('filter-status-button'));
    // Select Past filter option
    const pastOptions = getAllByText('Past');
    fireEvent.press(pastOptions[0]);

    // Verify Past is displayed in the filter button
    expect(getAllByText('Past').length).toBeGreaterThanOrEqual(1);
  });

  it('should display "Future" filter when future status is selected', () => {
    const { getByTestId, getAllByText } = render(<VisitsScreen />, { wrapper });

    // Open filter modal
    fireEvent.press(getByTestId('filter-status-button'));
    // Select Future filter option
    const futureOptions = getAllByText('Future');
    fireEvent.press(futureOptions[0]);

    // Verify Future is displayed in the filter button
    expect(getAllByText('Future').length).toBeGreaterThanOrEqual(1);
  });
});
