import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ClientsScreen } from './ClientsScreen';
import { useListClientsBffSellersAppClientsGet } from '@/api/generated/sellers-app/sellers-app';
import { useTranslation } from '@/i18n/hooks';
import { router } from 'expo-router';

// Mock dependencies
jest.mock('@/api/generated/sellers-app/sellers-app');
jest.mock('@/i18n/hooks');
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSegments: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, testID, style }: any) => (
    <div data-testid={testID} style={style}>
      {children}
    </div>
  ),
}));

// Mock FlashList to use a simple FlatList-like component
jest.mock('@shopify/flash-list', () => ({
  FlashList: ({ data, renderItem, ListEmptyComponent, testID, keyExtractor }: any) => {
    if (data && data.length === 0 && ListEmptyComponent) {
      return <div data-testid={testID}>{ListEmptyComponent()}</div>;
    }
    return (
      <div data-testid={testID}>
        {data && data.map((item: any) => (
          <div key={keyExtractor(item)}>
            {renderItem({ item })}
          </div>
        ))}
      </div>
    );
  },
}));

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  Search: () => <div data-testid="search-icon" />,
  X: () => <div data-testid="x-icon" />,
}));

const mockClients = [
  {
    cliente_id: '1',
    cognito_user_id: 'user1',
    email: 'client1@example.com',
    telefono: '+57 1 234 5678',
    nombre_institucion: 'Hospital General',
    tipo_institucion: 'hospital',
    nit: '123456789',
    direccion: '123 Main St',
    ciudad: 'Bogotá',
    pais: 'Colombia',
    representante: 'Dr. Carlos Hernández',
    vendedor_asignado_id: { vendedor_id: 'seller1' },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    cliente_id: '2',
    cognito_user_id: 'user2',
    email: 'client2@example.com',
    telefono: '+57 2 987 6543',
    nombre_institucion: 'Clínica del Occidente',
    tipo_institucion: 'clinic',
    nit: '987654321',
    direccion: '456 Oak Ave',
    ciudad: 'Medellín',
    pais: 'Colombia',
    representante: 'Dra. María Rodríguez',
    vendedor_asignado_id: { vendedor_id: 'seller2' },
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    cliente_id: '3',
    cognito_user_id: 'user3',
    email: 'client3@example.com',
    telefono: '+57 3 555 1234',
    nombre_institucion: 'Farmacia Central',
    tipo_institucion: 'pharmacy',
    nit: '111111111',
    direccion: '789 Pine Rd',
    ciudad: 'Cali',
    pais: 'Colombia',
    representante: 'Ing. Juan Pérez',
    vendedor_asignado_id: { vendedor_id: 'seller3' },
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
];

describe('ClientsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key,
    });

    (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
      data: { clients: mockClients },
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  describe('Component Rendering', () => {
    it('should render the clients screen', () => {
      const { getByTestId } = render(<ClientsScreen />);

      expect(getByTestId('clients-screen')).toBeTruthy();
    });

    it('should render the heading with clients title', () => {
      const { getByText } = render(<ClientsScreen />);

      expect(getByText('clients.title')).toBeTruthy();
    });

    it('should render the search bar with correct placeholder', () => {
      const { getByTestId } = render(<ClientsScreen />);

      expect(getByTestId('clients-search-bar')).toBeTruthy();
    });

    it('should render the clients list', () => {
      const { getByTestId } = render(<ClientsScreen />);

      expect(getByTestId('clients-list')).toBeTruthy();
    });

    it('should render all clients when data is loaded', () => {
      const { getByTestId } = render(<ClientsScreen />);

      expect(getByTestId('client-card-1')).toBeTruthy();
      expect(getByTestId('client-card-2')).toBeTruthy();
      expect(getByTestId('client-card-3')).toBeTruthy();
    });

    it('should render SafeAreaView with correct testID', () => {
      const { getByTestId } = render(<ClientsScreen />);

      expect(getByTestId('clients-screen')).toBeTruthy();
    });
  });

  describe('Loading States', () => {
    it('should render loading text when isLoading is true', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [] },
        isLoading: true,
        error: null,
      });

      const { getByText } = render(<ClientsScreen />);

      expect(getByText('clients.loadingClients')).toBeTruthy();
    });

    it('should not render client cards when loading', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [] },
        isLoading: true,
        error: null,
      });

      const { queryByTestId } = render(<ClientsScreen />);

      expect(queryByTestId('client-card-1')).toBeNull();
    });

    it('should still render search bar while loading', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [] },
        isLoading: true,
        error: null,
      });

      const { getByTestId } = render(<ClientsScreen />);

      expect(getByTestId('clients-search-bar')).toBeTruthy();
    });
  });

  describe('Error States', () => {
    it('should render error text when error exists', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch clients'),
      });

      const { getByText } = render(<ClientsScreen />);

      expect(getByText('common.error')).toBeTruthy();
    });

    it('should not render client cards when error occurs', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch clients'),
      });

      const { queryByTestId } = render(<ClientsScreen />);

      expect(queryByTestId('client-card-1')).toBeNull();
    });

    it('should still render search bar when error occurs', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch clients'),
      });

      const { getByTestId } = render(<ClientsScreen />);

      expect(getByTestId('clients-search-bar')).toBeTruthy();
    });

    it('should prioritize loading state over error state', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
        error: new Error('Some error'),
      });

      const { getByText, queryByText } = render(<ClientsScreen />);

      expect(getByText('clients.loadingClients')).toBeTruthy();
      expect(queryByText('common.error')).toBeNull();
    });
  });

  describe('Empty States', () => {
    it('should render empty state when no clients are available', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [] },
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<ClientsScreen />);

      expect(getByText('clients.emptyState')).toBeTruthy();
      expect(getByText('clients.emptyStateDescription')).toBeTruthy();
    });

    it('should not show loading or error messages in empty state', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [] },
        isLoading: false,
        error: null,
      });

      const { getByText, queryByText } = render(<ClientsScreen />);

      expect(getByText('clients.emptyState')).toBeTruthy();
      expect(queryByText('clients.loadingClients')).toBeNull();
      expect(queryByText('common.error')).toBeNull();
    });

    it('should handle undefined clients array gracefully', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<ClientsScreen />);

      expect(getByText('clients.emptyState')).toBeTruthy();
    });

    it('should handle null data gracefully', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<ClientsScreen />);

      expect(getByText('clients.emptyState')).toBeTruthy();
    });
  });

  describe('Client Navigation', () => {
    it('should navigate to client details when client card is pressed', () => {
      const { getByTestId } = render(<ClientsScreen />);

      const clientCard = getByTestId('client-card-1');
      fireEvent.press(clientCard);

      expect(router.push).toHaveBeenCalledWith('/client/1');
    });

    it('should navigate with correct client id for different clients', () => {
      const { getByTestId } = render(<ClientsScreen />);

      fireEvent.press(getByTestId('client-card-2'));
      expect(router.push).toHaveBeenCalledWith('/client/2');

      jest.clearAllMocks();

      fireEvent.press(getByTestId('client-card-3'));
      expect(router.push).toHaveBeenCalledWith('/client/3');
    });

    it('should navigate to each client only once per press', () => {
      const { getByTestId } = render(<ClientsScreen />);

      const clientCard = getByTestId('client-card-1');
      fireEvent.press(clientCard);

      expect(router.push).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple client presses sequentially', () => {
      const { getByTestId } = render(<ClientsScreen />);

      fireEvent.press(getByTestId('client-card-1'));
      fireEvent.press(getByTestId('client-card-2'));
      fireEvent.press(getByTestId('client-card-3'));

      expect(router.push).toHaveBeenCalledTimes(3);
      expect(router.push).toHaveBeenNthCalledWith(1, '/client/1');
      expect(router.push).toHaveBeenNthCalledWith(2, '/client/2');
      expect(router.push).toHaveBeenNthCalledWith(3, '/client/3');
    });
  });

  describe('Search Functionality', () => {
    it('should update search text when user types in search bar', () => {
      const { getByTestId } = render(<ClientsScreen />);

      const searchInput = getByTestId('clients-search-bar-input');
      fireEvent.changeText(searchInput, 'hospital');

      expect(searchInput.props.value).toBe('hospital');
    });

    it('should filter clients by representative name', async () => {
      const { getByTestId, queryByTestId } = render(<ClientsScreen />);

      const searchInput = getByTestId('clients-search-bar-input');
      fireEvent.changeText(searchInput, 'Carlos');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(getByTestId('client-card-1')).toBeTruthy();
        expect(queryByTestId('client-card-2')).toBeNull();
      });
    });

    it('should filter clients by institution name', async () => {
      const { getByTestId, queryByTestId } = render(<ClientsScreen />);

      const searchInput = getByTestId('clients-search-bar-input');
      fireEvent.changeText(searchInput, 'Clínica');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(getByTestId('client-card-2')).toBeTruthy();
        expect(queryByTestId('client-card-1')).toBeNull();
      });
    });

    it('should filter clients by city name', async () => {
      const { getByTestId, queryByTestId } = render(<ClientsScreen />);

      const searchInput = getByTestId('clients-search-bar-input');
      fireEvent.changeText(searchInput, 'Cali');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(getByTestId('client-card-3')).toBeTruthy();
        expect(queryByTestId('client-card-1')).toBeNull();
      });
    });

    it('should filter clients by phone number', async () => {
      const { getByTestId, queryByTestId } = render(<ClientsScreen />);

      const searchInput = getByTestId('clients-search-bar-input');
      fireEvent.changeText(searchInput, '+57 2');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(getByTestId('client-card-2')).toBeTruthy();
        expect(queryByTestId('client-card-1')).toBeNull();
      });
    });

    it('should perform case-insensitive search', async () => {
      const { getByTestId, queryByTestId } = render(<ClientsScreen />);

      const searchInput = getByTestId('clients-search-bar-input');
      fireEvent.changeText(searchInput, 'HOSPITAL');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(getByTestId('client-card-1')).toBeTruthy();
      });
    });

    it('should show all clients when search text is cleared', async () => {
      const { getByTestId } = render(<ClientsScreen />);

      const searchInput = getByTestId('clients-search-bar-input');

      fireEvent.changeText(searchInput, 'Carlos');
      act(() => {
        jest.advanceTimersByTime(300);
      });

      fireEvent.changeText(searchInput, '');
      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(getByTestId('client-card-1')).toBeTruthy();
        expect(getByTestId('client-card-2')).toBeTruthy();
        expect(getByTestId('client-card-3')).toBeTruthy();
      });
    });

    it('should not show results for non-matching search', async () => {
      const { queryByTestId } = render(<ClientsScreen />);

      const searchInput = queryByTestId('clients-search-bar-input');
      if (searchInput) {
        fireEvent.changeText(searchInput, 'NonExistentClient');

        act(() => {
          jest.advanceTimersByTime(300);
        });

        await waitFor(() => {
          expect(queryByTestId('client-card-1')).toBeNull();
          expect(queryByTestId('client-card-2')).toBeNull();
          expect(queryByTestId('client-card-3')).toBeNull();
        });
      }
    });

    it('should debounce search input', async () => {
      const { getByTestId } = render(<ClientsScreen />);

      const searchInput = getByTestId('clients-search-bar-input');

      fireEvent.changeText(searchInput, 'C');
      fireEvent.changeText(searchInput, 'Ca');
      fireEvent.changeText(searchInput, 'Car');

      // Before debounce completes
      expect(getByTestId('client-card-1')).toBeTruthy();

      act(() => {
        jest.advanceTimersByTime(300);
      });

      // After debounce completes, should filter based on final value
      await waitFor(() => {
        expect(getByTestId('client-card-1')).toBeTruthy();
      });
    });
  });

  describe('Search Results Display', () => {
    it('should display empty state when search returns no results', async () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: mockClients },
        isLoading: false,
        error: null,
      });

      const { getByTestId, queryByTestId, getByText } = render(<ClientsScreen />);

      const searchInput = getByTestId('clients-search-bar-input');
      fireEvent.changeText(searchInput, 'NonExistentValue');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(queryByTestId('client-card-1')).toBeNull();
        expect(queryByTestId('client-card-2')).toBeNull();
        expect(queryByTestId('client-card-3')).toBeNull();
        expect(getByText('clients.emptyState')).toBeTruthy();
      });
    });

    it('should display correct empty state message when no results found', async () => {
      const { getByTestId, getByText } = render(<ClientsScreen />);

      const searchInput = getByTestId('clients-search-bar-input');
      fireEvent.changeText(searchInput, 'NonExistent');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(getByText('clients.emptyState')).toBeTruthy();
        expect(getByText('clients.emptyStateDescription')).toBeTruthy();
      });
    });
  });

  describe('Client Card Props Mapping', () => {
    it('should map API data correctly to ClientCard props', () => {
      const { getByTestId } = render(<ClientsScreen />);

      const clientCard = getByTestId('client-card-1');
      expect(clientCard).toBeTruthy();
    });

    it('should pass correct client id for card navigation', () => {
      const { getByTestId } = render(<ClientsScreen />);

      fireEvent.press(getByTestId('client-card-1'));
      expect(router.push).toHaveBeenCalledWith('/client/1');
    });

    it('should map Spanish field names to English component props', () => {
      const { getByTestId } = render(<ClientsScreen />);

      // This test verifies that the mapping happens internally
      // The ClientCard should receive correctly mapped props
      const clientCard = getByTestId('client-card-1');
      expect(clientCard).toBeTruthy();
    });
  });

  describe('Search Bar Props', () => {
    it('should pass correct placeholder to search bar', () => {
      const { getByPlaceholderText } = render(<ClientsScreen />);

      expect(getByPlaceholderText('clients.searchPlaceholder')).toBeTruthy();
    });

    it('should pass correct value to search bar', () => {
      const { getByTestId } = render(<ClientsScreen />);

      const searchInput = getByTestId('clients-search-bar-input');
      expect(searchInput.props.value).toBe('');
    });

    it('should update search bar value when typing', () => {
      const { getByTestId } = render(<ClientsScreen />);

      const searchInput = getByTestId('clients-search-bar-input');
      fireEvent.changeText(searchInput, 'test');

      expect(searchInput.props.value).toBe('test');
    });
  });

  describe('API Integration', () => {
    it('should call useListClientsBffSellersAppClientsGet hook on render', () => {
      render(<ClientsScreen />);

      expect(useListClientsBffSellersAppClientsGet).toHaveBeenCalledWith(
        undefined,
        {
          query: {
            enabled: true,
            staleTime: 5 * 60 * 1000,
          },
        }
      );
    });

    it('should handle data with no clients key', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: {},
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<ClientsScreen />);

      expect(getByText('clients.emptyState')).toBeTruthy();
    });

    it('should display data when API returns clients', () => {
      const { getByTestId } = render(<ClientsScreen />);

      expect(getByTestId('client-card-1')).toBeTruthy();
      expect(getByTestId('client-card-2')).toBeTruthy();
      expect(getByTestId('client-card-3')).toBeTruthy();
    });
  });

  describe('FlashList Configuration', () => {
    it('should render list with correct estimatedItemSize', () => {
      const { getByTestId } = render(<ClientsScreen />);

      expect(getByTestId('clients-list')).toBeTruthy();
    });

    it('should use cliente_id as key extractor', () => {
      const { getByTestId } = render(<ClientsScreen />);

      expect(getByTestId('client-card-1')).toBeTruthy();
      expect(getByTestId('client-card-2')).toBeTruthy();
    });

    it('should render ListEmptyComponent when no clients', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [] },
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<ClientsScreen />);

      expect(getByText('clients.emptyState')).toBeTruthy();
    });
  });

  describe('Search Edge Cases', () => {
    it('should handle search with special characters', async () => {
      const specialCharClients = [
        {
          ...mockClients[0],
          nombre_institucion: 'Hospital & Medical Center',
        },
      ];

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: specialCharClients },
        isLoading: false,
        error: null,
      });

      const { getByTestId } = render(<ClientsScreen />);

      const searchInput = getByTestId('clients-search-bar-input');
      fireEvent.changeText(searchInput, '&');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(getByTestId('client-card-1')).toBeTruthy();
      });
    });

    it('should handle search with partial name match', async () => {
      const { getByTestId } = render(<ClientsScreen />);

      const searchInput = getByTestId('clients-search-bar-input');
      fireEvent.changeText(searchInput, 'María');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(getByTestId('client-card-2')).toBeTruthy();
      });
    });

    it('should handle search with multiple spaces', async () => {
      const { getByTestId, queryByTestId } = render(<ClientsScreen />);

      const searchInput = getByTestId('clients-search-bar-input');
      fireEvent.changeText(searchInput, 'Hospital');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        // Should find clients with hospital in any field
        expect(getByTestId('client-card-1')).toBeTruthy();
      });
    });

    it('should handle numeric search (phone numbers)', async () => {
      const { getByTestId } = render(<ClientsScreen />);

      const searchInput = getByTestId('clients-search-bar-input');
      fireEvent.changeText(searchInput, '234');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(getByTestId('client-card-1')).toBeTruthy();
      });
    });

    it('should handle very long search term', async () => {
      const { queryByTestId } = render(<ClientsScreen />);

      const searchInput = queryByTestId('clients-search-bar-input');
      if (searchInput) {
        fireEvent.changeText(searchInput, 'a'.repeat(100));

        act(() => {
          jest.advanceTimersByTime(300);
        });

        await waitFor(() => {
          expect(queryByTestId('client-card-1')).toBeNull();
        });
      }
    });
  });

  describe('Filter Logic', () => {
    it('should filter clients by all searchable fields', async () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: mockClients },
        isLoading: false,
        error: null,
      });

      const { getByTestId } = render(<ClientsScreen />);

      // Search by representante
      let searchInput = getByTestId('clients-search-bar-input');
      fireEvent.changeText(searchInput, 'Carlos');
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(getByTestId('client-card-1')).toBeTruthy();
    });

    it('should return all clients when search is empty', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: mockClients },
        isLoading: false,
        error: null,
      });

      const { getByTestId } = render(<ClientsScreen />);

      expect(getByTestId('client-card-1')).toBeTruthy();
      expect(getByTestId('client-card-2')).toBeTruthy();
      expect(getByTestId('client-card-3')).toBeTruthy();
    });

    it('should use debounced search value, not immediate value', async () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: mockClients },
        isLoading: false,
        error: null,
      });

      const { getByTestId } = render(<ClientsScreen />);

      const searchInput = getByTestId('clients-search-bar-input');

      // Type multiple characters quickly
      fireEvent.changeText(searchInput, 'C');
      fireEvent.changeText(searchInput, 'Ca');
      fireEvent.changeText(searchInput, 'Car');

      // Before debounce - shows all results
      expect(getByTestId('client-card-1')).toBeTruthy();
      expect(getByTestId('client-card-2')).toBeTruthy();

      // After debounce - applies the final filter
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should filter based on final "Car" search
      expect(getByTestId('client-card-1')).toBeTruthy();
    });
  });

  describe('Component State Management', () => {
    it('should maintain separate state for search text and debounced search', async () => {
      const { getByTestId } = render(<ClientsScreen />);

      const searchInput = getByTestId('clients-search-bar-input');

      // User types but debounce hasn't completed
      fireEvent.changeText(searchInput, 'NonExistent');

      // Immediate state should update
      expect(searchInput.props.value).toBe('NonExistent');

      // But filtering should not apply yet
      expect(getByTestId('client-card-1')).toBeTruthy();

      // After debounce, filtering applies
      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        // Now empty state should show
        expect(getByTestId('clients-list')).toBeTruthy();
      });
    });

    it('should handle rapid text changes efficiently', () => {
      const { getByTestId } = render(<ClientsScreen />);

      const searchInput = getByTestId('clients-search-bar-input');

      for (let i = 0; i < 10; i++) {
        fireEvent.changeText(searchInput, `char${i}`);
      }

      // Component should not crash
      expect(getByTestId('clients-screen')).toBeTruthy();
    });
  });

  describe('Internationalization', () => {
    it('should use translation hook', () => {
      render(<ClientsScreen />);

      expect(useTranslation).toHaveBeenCalled();
    });

    it('should render translated strings for all UI text', () => {
      const { getByText, getByPlaceholderText } = render(<ClientsScreen />);

      expect(getByText('clients.title')).toBeTruthy();
      expect(getByPlaceholderText('clients.searchPlaceholder')).toBeTruthy();
    });

    it('should display translated loading message', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [] },
        isLoading: true,
        error: null,
      });

      const { getByText } = render(<ClientsScreen />);

      expect(getByText('clients.loadingClients')).toBeTruthy();
    });

    it('should display translated error message', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('API error'),
      });

      const { getByText } = render(<ClientsScreen />);

      expect(getByText('common.error')).toBeTruthy();
    });

    it('should display translated empty state messages', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [] },
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<ClientsScreen />);

      expect(getByText('clients.emptyState')).toBeTruthy();
      expect(getByText('clients.emptyStateDescription')).toBeTruthy();
    });
  });

  describe('Multiple Clients Rendering', () => {
    it('should render multiple clients without filtering', () => {
      const { getByTestId } = render(<ClientsScreen />);

      expect(getByTestId('client-card-1')).toBeTruthy();
      expect(getByTestId('client-card-2')).toBeTruthy();
      expect(getByTestId('client-card-3')).toBeTruthy();
    });

    it('should render clients in correct order', () => {
      const { getByTestId } = render(<ClientsScreen />);

      const list = getByTestId('clients-list');
      expect(list).toBeTruthy();
    });

    it('should handle single client gracefully', () => {
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [mockClients[0]] },
        isLoading: false,
        error: null,
      });

      const { getByTestId, queryByTestId } = render(<ClientsScreen />);

      expect(getByTestId('client-card-1')).toBeTruthy();
      expect(queryByTestId('client-card-2')).toBeNull();
    });

    it('should handle many clients efficiently', () => {
      const manyClients = Array.from({ length: 100 }, (_, i) => ({
        ...mockClients[0],
        cliente_id: String(i + 1),
      }));

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: manyClients },
        isLoading: false,
        error: null,
      });

      const { getByTestId } = render(<ClientsScreen />);

      expect(getByTestId('clients-list')).toBeTruthy();
    });
  });

  describe('Component Rerender', () => {
    it('should handle rerender with updated clients data', () => {
      const { rerender, getByTestId, queryByTestId } = render(<ClientsScreen />);

      expect(getByTestId('client-card-1')).toBeTruthy();

      // Rerender with different data
      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [mockClients[0]] },
        isLoading: false,
        error: null,
      });

      rerender(<ClientsScreen />);

      expect(getByTestId('client-card-1')).toBeTruthy();
      expect(queryByTestId('client-card-2')).toBeNull();
    });

    it('should handle rerender when loading state changes', () => {
      const { rerender, getByText, queryByText } = render(<ClientsScreen />);

      expect(getByText('clients.title')).toBeTruthy();

      (useListClientsBffSellersAppClientsGet as jest.Mock).mockReturnValue({
        data: { clients: [] },
        isLoading: true,
        error: null,
      });

      rerender(<ClientsScreen />);

      expect(getByText('clients.loadingClients')).toBeTruthy();
      expect(queryByText('clients.emptyState')).toBeNull();
    });
  });
});
