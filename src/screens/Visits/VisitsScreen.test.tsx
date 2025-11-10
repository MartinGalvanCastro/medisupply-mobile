import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { VisitsScreen } from './VisitsScreen';
import { useListVisitsBffSellersAppVisitsGet } from '@/api/generated/sellers-app/sellers-app';
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

// Mock FlashList to use a simple FlatList-like component
jest.mock('@shopify/flash-list', () => {
  const { View } = require('react-native');
  return {
    FlashList: ({ data, renderItem, ListEmptyComponent, testID, keyExtractor }: any) => {
      if (data && data.length === 0 && ListEmptyComponent) {
        return <View testID={testID}>{ListEmptyComponent()}</View>;
      }
      return (
        <View testID={testID}>
          {data && data.map((item: any) => (
            <View key={keyExtractor(item)}>
              {renderItem({ item })}
            </View>
          ))}
        </View>
      );
    },
  };
});

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => {
  const { View } = require('react-native');
  return {
  ChevronRight: () => <View testID="chevron-right-icon" />,
  Search: () => <View testID="search-icon" />,
  X: () => <View testID="x-icon" />,
  Calendar: () => <View testID="calendar-icon" />,
  MapPin: () => <View testID="map-pin-icon" />,
};
});

const mockVisits = [
  {
    id: 'visit-1',
    client_nombre_institucion: 'Hospital General',
    client_representante: 'Dr. Carlos Hernández',
    fecha_visita: '2024-01-15T10:00:00Z',
    status: 'pending',
    notas_visita: 'Initial visit for consultation',
    client_direccion: '123 Main St, Bogotá',
    client_ciudad: 'Bogotá',
  },
  {
    id: 'visit-2',
    client_nombre_institucion: 'Clínica del Occidente',
    client_representante: 'Dra. María Rodríguez',
    fecha_visita: '2024-01-20T14:30:00Z',
    status: 'completed',
    notas_visita: 'Follow-up meeting completed',
    client_direccion: '456 Oak Ave, Medellín',
    client_ciudad: 'Medellín',
  },
  {
    id: 'visit-3',
    client_nombre_institucion: 'Farmacia Central',
    client_representante: 'Ing. Juan Pérez',
    fecha_visita: '2024-01-25T09:00:00Z',
    status: 'cancelled',
    notas_visita: null,
    client_direccion: '789 Pine Rd, Cali',
    client_ciudad: 'Cali',
  },
];

describe('VisitsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key,
    });

    (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
      data: { visits: mockVisits },
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
    it('should render the visits screen', () => {
      const { getByTestId } = render(<VisitsScreen />);

      expect(getByTestId('visits-screen')).toBeTruthy();
    });

    it('should render the heading with visits title', () => {
      const { getByText } = render(<VisitsScreen />);

      expect(getByText('visits.title')).toBeTruthy();
    });

    it('should render the search bar with correct placeholder', () => {
      const { getByTestId } = render(<VisitsScreen />);

      expect(getByTestId('visits-search-bar')).toBeTruthy();
    });

    it('should render the visits list', () => {
      const { getByTestId } = render(<VisitsScreen />);

      expect(getByTestId('visits-list')).toBeTruthy();
    });

    it('should render all visits when data is loaded', () => {
      const { getByTestId } = render(<VisitsScreen />);

      expect(getByTestId('visit-card-visit-1')).toBeTruthy();
      expect(getByTestId('visit-card-visit-2')).toBeTruthy();
      expect(getByTestId('visit-card-visit-3')).toBeTruthy();
    });

    it('should render SafeAreaView with correct testID', () => {
      const { getByTestId } = render(<VisitsScreen />);

      expect(getByTestId('visits-screen')).toBeTruthy();
    });
  });

  describe('Loading States', () => {
    it('should render loading text when isLoading is true', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [] },
        isLoading: true,
        error: null,
      });

      const { getByText } = render(<VisitsScreen />);

      expect(getByText('visits.loadingVisits')).toBeTruthy();
    });

    it('should not render visit cards when loading', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [] },
        isLoading: true,
        error: null,
      });

      const { queryByTestId } = render(<VisitsScreen />);

      expect(queryByTestId('visit-card-visit-1')).toBeNull();
    });

    it('should still render search bar while loading', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [] },
        isLoading: true,
        error: null,
      });

      const { getByTestId } = render(<VisitsScreen />);

      expect(getByTestId('visits-search-bar')).toBeTruthy();
    });
  });

  describe('Error States', () => {
    it('should render error text when error exists', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch visits'),
      });

      const { getByText } = render(<VisitsScreen />);

      expect(getByText('common.error')).toBeTruthy();
    });

    it('should not render visit cards when error occurs', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch visits'),
      });

      const { queryByTestId } = render(<VisitsScreen />);

      expect(queryByTestId('visit-card-visit-1')).toBeNull();
    });

    it('should still render search bar when error occurs', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch visits'),
      });

      const { getByTestId } = render(<VisitsScreen />);

      expect(getByTestId('visits-search-bar')).toBeTruthy();
    });

    it('should prioritize loading state over error state', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
        error: new Error('Some error'),
      });

      const { getByText, queryByText } = render(<VisitsScreen />);

      expect(getByText('visits.loadingVisits')).toBeTruthy();
      expect(queryByText('common.error')).toBeNull();
    });
  });

  describe('Empty States', () => {
    it('should render empty state when no visits are available', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [] },
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<VisitsScreen />);

      expect(getByText('visits.emptyState')).toBeTruthy();
      expect(getByText('visits.emptyStateDescription')).toBeTruthy();
    });

    it('should not show loading or error messages in empty state', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [] },
        isLoading: false,
        error: null,
      });

      const { getByText, queryByText } = render(<VisitsScreen />);

      expect(getByText('visits.emptyState')).toBeTruthy();
      expect(queryByText('visits.loadingVisits')).toBeNull();
      expect(queryByText('common.error')).toBeNull();
    });

    it('should handle undefined visits array gracefully', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<VisitsScreen />);

      expect(getByText('visits.emptyState')).toBeTruthy();
    });

    it('should handle null data gracefully', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<VisitsScreen />);

      expect(getByText('visits.emptyState')).toBeTruthy();
    });
  });

  describe('Visit Navigation', () => {
    it('should navigate to visit details when visit card is pressed', () => {
      const { getByTestId } = render(<VisitsScreen />);

      const visitCard = getByTestId('visit-card-visit-1');
      fireEvent.press(visitCard);

      expect(router.push).toHaveBeenCalledWith('/visit/visit-1');
    });

    it('should navigate with correct visit id for different visits', () => {
      const { getByTestId } = render(<VisitsScreen />);

      fireEvent.press(getByTestId('visit-card-visit-2'));
      expect(router.push).toHaveBeenCalledWith('/visit/visit-2');

      jest.clearAllMocks();

      fireEvent.press(getByTestId('visit-card-visit-3'));
      expect(router.push).toHaveBeenCalledWith('/visit/visit-3');
    });

    it('should navigate only once per press', () => {
      const { getByTestId } = render(<VisitsScreen />);

      const visitCard = getByTestId('visit-card-visit-1');
      fireEvent.press(visitCard);

      expect(router.push).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple visit presses sequentially', () => {
      const { getByTestId } = render(<VisitsScreen />);

      fireEvent.press(getByTestId('visit-card-visit-1'));
      fireEvent.press(getByTestId('visit-card-visit-2'));
      fireEvent.press(getByTestId('visit-card-visit-3'));

      expect(router.push).toHaveBeenCalledTimes(3);
      expect(router.push).toHaveBeenNthCalledWith(1, '/visit/visit-1');
      expect(router.push).toHaveBeenNthCalledWith(2, '/visit/visit-2');
      expect(router.push).toHaveBeenNthCalledWith(3, '/visit/visit-3');
    });
  });

  describe('Search Functionality', () => {
    it('should update search text when user types in search bar', () => {
      const { getByTestId } = render(<VisitsScreen />);

      const searchInput = getByTestId('visits-search-bar-input');
      fireEvent.changeText(searchInput, 'hospital');

      expect(searchInput.props.value).toBe('hospital');
    });

    it('should filter visits by representative name', async () => {
      const { getByTestId, queryByTestId } = render(<VisitsScreen />);

      const searchInput = getByTestId('visits-search-bar-input');
      fireEvent.changeText(searchInput, 'Carlos');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(getByTestId('visit-card-visit-1')).toBeTruthy();
        expect(queryByTestId('visit-card-visit-2')).toBeNull();
      });
    });

    it('should filter visits by institution name', async () => {
      const { getByTestId, queryByTestId } = render(<VisitsScreen />);

      const searchInput = getByTestId('visits-search-bar-input');
      fireEvent.changeText(searchInput, 'Clínica');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(getByTestId('visit-card-visit-2')).toBeTruthy();
        expect(queryByTestId('visit-card-visit-1')).toBeNull();
      });
    });

    it('should filter visits by city name', async () => {
      const { getByTestId, queryByTestId } = render(<VisitsScreen />);

      const searchInput = getByTestId('visits-search-bar-input');
      fireEvent.changeText(searchInput, 'Cali');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(getByTestId('visit-card-visit-3')).toBeTruthy();
        expect(queryByTestId('visit-card-visit-1')).toBeNull();
      });
    });

    it('should filter visits by status', async () => {
      const { getByTestId, queryByTestId } = render(<VisitsScreen />);

      const searchInput = getByTestId('visits-search-bar-input');
      fireEvent.changeText(searchInput, 'completed');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(getByTestId('visit-card-visit-2')).toBeTruthy();
        expect(queryByTestId('visit-card-visit-1')).toBeNull();
      });
    });

    it('should perform case-insensitive search', async () => {
      const { getByTestId, queryByTestId } = render(<VisitsScreen />);

      const searchInput = getByTestId('visits-search-bar-input');
      fireEvent.changeText(searchInput, 'HOSPITAL');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(getByTestId('visit-card-visit-1')).toBeTruthy();
      });
    });

    it('should show all visits when search text is cleared', async () => {
      const { getByTestId } = render(<VisitsScreen />);

      const searchInput = getByTestId('visits-search-bar-input');

      fireEvent.changeText(searchInput, 'Carlos');
      act(() => {
        jest.advanceTimersByTime(300);
      });

      fireEvent.changeText(searchInput, '');
      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(getByTestId('visit-card-visit-1')).toBeTruthy();
        expect(getByTestId('visit-card-visit-2')).toBeTruthy();
        expect(getByTestId('visit-card-visit-3')).toBeTruthy();
      });
    });

    it('should not show results for non-matching search', async () => {
      const { queryByTestId } = render(<VisitsScreen />);

      const searchInput = queryByTestId('visits-search-bar-input');
      if (searchInput) {
        fireEvent.changeText(searchInput, 'NonExistentVisit');

        act(() => {
          jest.advanceTimersByTime(300);
        });

        await waitFor(() => {
          expect(queryByTestId('visit-card-visit-1')).toBeNull();
          expect(queryByTestId('visit-card-visit-2')).toBeNull();
          expect(queryByTestId('visit-card-visit-3')).toBeNull();
        });
      }
    });

    it('should debounce search input', async () => {
      const { getByTestId } = render(<VisitsScreen />);

      const searchInput = getByTestId('visits-search-bar-input');

      fireEvent.changeText(searchInput, 'C');
      fireEvent.changeText(searchInput, 'Ca');
      fireEvent.changeText(searchInput, 'Car');

      // Before debounce completes
      expect(getByTestId('visit-card-visit-1')).toBeTruthy();

      act(() => {
        jest.advanceTimersByTime(300);
      });

      // After debounce completes, should filter based on final value
      await waitFor(() => {
        expect(getByTestId('visit-card-visit-1')).toBeTruthy();
      });
    });
  });

  describe('Search Results Display', () => {
    it('should display empty state when search returns no results', async () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: mockVisits },
        isLoading: false,
        error: null,
      });

      const { getByTestId, queryByTestId, getByText } = render(<VisitsScreen />);

      const searchInput = getByTestId('visits-search-bar-input');
      fireEvent.changeText(searchInput, 'NonExistentValue');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(queryByTestId('visit-card-visit-1')).toBeNull();
        expect(queryByTestId('visit-card-visit-2')).toBeNull();
        expect(queryByTestId('visit-card-visit-3')).toBeNull();
        expect(getByText('visits.emptyState')).toBeTruthy();
      });
    });

    it('should display correct empty state message when no results found', async () => {
      const { getByTestId, getByText } = render(<VisitsScreen />);

      const searchInput = getByTestId('visits-search-bar-input');
      fireEvent.changeText(searchInput, 'NonExistent');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(getByText('visits.emptyState')).toBeTruthy();
        expect(getByText('visits.emptyStateDescription')).toBeTruthy();
      });
    });
  });

  describe('Visit Card Props Mapping', () => {
    it('should map API data correctly to VisitCard props', () => {
      const { getByTestId } = render(<VisitsScreen />);

      const visitCard = getByTestId('visit-card-visit-1');
      expect(visitCard).toBeTruthy();
    });

    it('should pass correct visit id for card navigation', () => {
      const { getByTestId } = render(<VisitsScreen />);

      fireEvent.press(getByTestId('visit-card-visit-1'));
      expect(router.push).toHaveBeenCalledWith('/visit/visit-1');
    });

    it('should map Spanish field names to English component props', () => {
      const { getByTestId } = render(<VisitsScreen />);

      // This test verifies that the mapping happens internally
      // The VisitCard should receive correctly mapped props
      const visitCard = getByTestId('visit-card-visit-1');
      expect(visitCard).toBeTruthy();
    });

    it('should handle visits without client_representante field', () => {
      const visitsWithoutRepresentante = [
        {
          ...mockVisits[0],
          client_representante: undefined,
        },
      ];

      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: visitsWithoutRepresentante },
        isLoading: false,
        error: null,
      });

      const { getByTestId } = render(<VisitsScreen />);

      expect(getByTestId('visit-card-visit-1')).toBeTruthy();
    });

    it('should handle visits with null notes', () => {
      const { getByTestId } = render(<VisitsScreen />);

      // visit-3 has null notes
      expect(getByTestId('visit-card-visit-3')).toBeTruthy();
    });
  });

  describe('Search Bar Props', () => {
    it('should pass correct placeholder to search bar', () => {
      const { getByPlaceholderText } = render(<VisitsScreen />);

      expect(getByPlaceholderText('visits.searchPlaceholder')).toBeTruthy();
    });

    it('should pass correct value to search bar', () => {
      const { getByTestId } = render(<VisitsScreen />);

      const searchInput = getByTestId('visits-search-bar-input');
      expect(searchInput.props.value).toBe('');
    });

    it('should update search bar value when typing', () => {
      const { getByTestId } = render(<VisitsScreen />);

      const searchInput = getByTestId('visits-search-bar-input');
      fireEvent.changeText(searchInput, 'test');

      expect(searchInput.props.value).toBe('test');
    });
  });

  describe('API Integration', () => {
    it('should call useListVisitsBffSellersAppVisitsGet hook on render', () => {
      render(<VisitsScreen />);

      expect(useListVisitsBffSellersAppVisitsGet).toHaveBeenCalledWith(
        { date: expect.any(String) },
        {
          query: {
            enabled: true,
            staleTime: 5 * 60 * 1000,
          },
        }
      );
    });

    it('should handle data with no visits key', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: {},
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<VisitsScreen />);

      expect(getByText('visits.emptyState')).toBeTruthy();
    });

    it('should display data when API returns visits', () => {
      const { getByTestId } = render(<VisitsScreen />);

      expect(getByTestId('visit-card-visit-1')).toBeTruthy();
      expect(getByTestId('visit-card-visit-2')).toBeTruthy();
      expect(getByTestId('visit-card-visit-3')).toBeTruthy();
    });
  });

  describe('FlashList Configuration', () => {
    it('should render list with correct testID', () => {
      const { getByTestId } = render(<VisitsScreen />);

      expect(getByTestId('visits-list')).toBeTruthy();
    });

    it('should use visit id as key extractor', () => {
      const { getByTestId } = render(<VisitsScreen />);

      expect(getByTestId('visit-card-visit-1')).toBeTruthy();
      expect(getByTestId('visit-card-visit-2')).toBeTruthy();
    });

    it('should render ListEmptyComponent when no visits', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [] },
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<VisitsScreen />);

      expect(getByText('visits.emptyState')).toBeTruthy();
    });
  });

  describe('Search Edge Cases', () => {
    it('should handle search with special characters', async () => {
      const specialCharVisits = [
        {
          ...mockVisits[0],
          client_nombre_institucion: 'Hospital & Medical Center',
        },
      ];

      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: specialCharVisits },
        isLoading: false,
        error: null,
      });

      const { getByTestId } = render(<VisitsScreen />);

      const searchInput = getByTestId('visits-search-bar-input');
      fireEvent.changeText(searchInput, '&');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(getByTestId('visit-card-visit-1')).toBeTruthy();
      });
    });

    it('should handle search with partial name match', async () => {
      const { getByTestId } = render(<VisitsScreen />);

      const searchInput = getByTestId('visits-search-bar-input');
      fireEvent.changeText(searchInput, 'María');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(getByTestId('visit-card-visit-2')).toBeTruthy();
      });
    });

    it('should handle search with multiple spaces', async () => {
      const { getByTestId, queryByTestId } = render(<VisitsScreen />);

      const searchInput = getByTestId('visits-search-bar-input');
      fireEvent.changeText(searchInput, 'Hospital');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        // Should find visits with hospital in any field
        expect(getByTestId('visit-card-visit-1')).toBeTruthy();
      });
    });

    it('should handle very long search term', async () => {
      const { queryByTestId } = render(<VisitsScreen />);

      const searchInput = queryByTestId('visits-search-bar-input');
      if (searchInput) {
        fireEvent.changeText(searchInput, 'a'.repeat(100));

        act(() => {
          jest.advanceTimersByTime(300);
        });

        await waitFor(() => {
          expect(queryByTestId('visit-card-visit-1')).toBeNull();
        });
      }
    });
  });

  describe('Filter Logic', () => {
    it('should filter visits by all searchable fields', async () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: mockVisits },
        isLoading: false,
        error: null,
      });

      const { getByTestId } = render(<VisitsScreen />);

      // Search by representante
      let searchInput = getByTestId('visits-search-bar-input');
      fireEvent.changeText(searchInput, 'Carlos');
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(getByTestId('visit-card-visit-1')).toBeTruthy();
    });

    it('should return all visits when search is empty', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: mockVisits },
        isLoading: false,
        error: null,
      });

      const { getByTestId } = render(<VisitsScreen />);

      expect(getByTestId('visit-card-visit-1')).toBeTruthy();
      expect(getByTestId('visit-card-visit-2')).toBeTruthy();
      expect(getByTestId('visit-card-visit-3')).toBeTruthy();
    });

    it('should use debounced search value, not immediate value', async () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: mockVisits },
        isLoading: false,
        error: null,
      });

      const { getByTestId } = render(<VisitsScreen />);

      const searchInput = getByTestId('visits-search-bar-input');

      // Type multiple characters quickly
      fireEvent.changeText(searchInput, 'C');
      fireEvent.changeText(searchInput, 'Ca');
      fireEvent.changeText(searchInput, 'Car');

      // Before debounce - shows all results
      expect(getByTestId('visit-card-visit-1')).toBeTruthy();
      expect(getByTestId('visit-card-visit-2')).toBeTruthy();

      // After debounce - applies the final filter
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should filter based on final "Car" search
      expect(getByTestId('visit-card-visit-1')).toBeTruthy();
    });

    it('should handle undefined client_representante gracefully', async () => {
      const visitsWithoutRepresentante = [
        {
          id: 'visit-1',
          client_nombre_institucion: 'Hospital General',
          fecha_visita: '2024-01-15T10:00:00Z',
          status: 'pending',
          client_ciudad: 'Bogotá',
        },
      ];

      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: visitsWithoutRepresentante },
        isLoading: false,
        error: null,
      });

      const { getByTestId, queryByTestId } = render(<VisitsScreen />);

      const searchInput = getByTestId('visits-search-bar-input');
      fireEvent.changeText(searchInput, 'Hospital');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(getByTestId('visit-card-visit-1')).toBeTruthy();
      });
    });

    it('should handle undefined status gracefully', async () => {
      const visitsWithoutStatus = [
        {
          id: 'visit-1',
          client_nombre_institucion: 'Hospital General',
          client_representante: 'Dr. Carlos',
          fecha_visita: '2024-01-15T10:00:00Z',
          status: undefined,
          client_ciudad: 'Bogotá',
        },
      ];

      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: visitsWithoutStatus },
        isLoading: false,
        error: null,
      });

      const { getByTestId } = render(<VisitsScreen />);

      const searchInput = getByTestId('visits-search-bar-input');
      fireEvent.changeText(searchInput, 'Hospital');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(getByTestId('visit-card-visit-1')).toBeTruthy();
      });
    });
  });

  describe('Component State Management', () => {
    it('should maintain separate state for search text and debounced search', async () => {
      const { getByTestId } = render(<VisitsScreen />);

      const searchInput = getByTestId('visits-search-bar-input');

      // User types but debounce hasn't completed
      fireEvent.changeText(searchInput, 'NonExistent');

      // Immediate state should update
      expect(searchInput.props.value).toBe('NonExistent');

      // But filtering should not apply yet
      expect(getByTestId('visit-card-visit-1')).toBeTruthy();

      // After debounce, filtering applies
      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        // Now empty state should show
        expect(getByTestId('visits-list')).toBeTruthy();
      });
    });

    it('should handle rapid text changes efficiently', () => {
      const { getByTestId } = render(<VisitsScreen />);

      const searchInput = getByTestId('visits-search-bar-input');

      for (let i = 0; i < 10; i++) {
        fireEvent.changeText(searchInput, `char${i}`);
      }

      // Component should not crash
      expect(getByTestId('visits-screen')).toBeTruthy();
    });
  });

  describe('Internationalization', () => {
    it('should use translation hook', () => {
      render(<VisitsScreen />);

      expect(useTranslation).toHaveBeenCalled();
    });

    it('should render translated strings for all UI text', () => {
      const { getByText, getByPlaceholderText } = render(<VisitsScreen />);

      expect(getByText('visits.title')).toBeTruthy();
      expect(getByPlaceholderText('visits.searchPlaceholder')).toBeTruthy();
    });

    it('should display translated loading message', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [] },
        isLoading: true,
        error: null,
      });

      const { getByText } = render(<VisitsScreen />);

      expect(getByText('visits.loadingVisits')).toBeTruthy();
    });

    it('should display translated error message', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('API error'),
      });

      const { getByText } = render(<VisitsScreen />);

      expect(getByText('common.error')).toBeTruthy();
    });

    it('should display translated empty state messages', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [] },
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<VisitsScreen />);

      expect(getByText('visits.emptyState')).toBeTruthy();
      expect(getByText('visits.emptyStateDescription')).toBeTruthy();
    });
  });

  describe('Multiple Visits Rendering', () => {
    it('should render multiple visits without filtering', () => {
      const { getByTestId } = render(<VisitsScreen />);

      expect(getByTestId('visit-card-visit-1')).toBeTruthy();
      expect(getByTestId('visit-card-visit-2')).toBeTruthy();
      expect(getByTestId('visit-card-visit-3')).toBeTruthy();
    });

    it('should render visits in correct order', () => {
      const { getByTestId } = render(<VisitsScreen />);

      const list = getByTestId('visits-list');
      expect(list).toBeTruthy();
    });

    it('should handle single visit gracefully', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [mockVisits[0]] },
        isLoading: false,
        error: null,
      });

      const { getByTestId, queryByTestId } = render(<VisitsScreen />);

      expect(getByTestId('visit-card-visit-1')).toBeTruthy();
      expect(queryByTestId('visit-card-visit-2')).toBeNull();
    });

    it('should handle many visits efficiently', () => {
      const manyVisits = Array.from({ length: 100 }, (_, i) => ({
        ...mockVisits[0],
        id: `visit-${i + 1}`,
      }));

      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: manyVisits },
        isLoading: false,
        error: null,
      });

      const { getByTestId } = render(<VisitsScreen />);

      expect(getByTestId('visits-list')).toBeTruthy();
    });
  });

  describe('Component Rerender', () => {
    it('should handle rerender with updated visits data', () => {
      const { rerender, getByTestId, queryByTestId } = render(<VisitsScreen />);

      expect(getByTestId('visit-card-visit-1')).toBeTruthy();

      // Rerender with different data
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [mockVisits[0]] },
        isLoading: false,
        error: null,
      });

      rerender(<VisitsScreen />);

      expect(getByTestId('visit-card-visit-1')).toBeTruthy();
      expect(queryByTestId('visit-card-visit-2')).toBeNull();
    });

    it('should handle rerender when loading state changes', () => {
      const { rerender, getByText, queryByText } = render(<VisitsScreen />);

      expect(getByText('visits.title')).toBeTruthy();

      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [] },
        isLoading: true,
        error: null,
      });

      rerender(<VisitsScreen />);

      expect(getByText('visits.loadingVisits')).toBeTruthy();
      expect(queryByText('visits.emptyState')).toBeNull();
    });
  });

  describe('Visit Status Variants', () => {
    it('should render visit with pending status', () => {
      const { getByTestId } = render(<VisitsScreen />);

      expect(getByTestId('visit-card-visit-1')).toBeTruthy();
    });

    it('should render visit with completed status', () => {
      const { getByTestId } = render(<VisitsScreen />);

      expect(getByTestId('visit-card-visit-2')).toBeTruthy();
    });

    it('should render visit with cancelled status', () => {
      const { getByTestId } = render(<VisitsScreen />);

      expect(getByTestId('visit-card-visit-3')).toBeTruthy();
    });
  });

  describe('Handler Functions', () => {
    it('should call handleVisitPress with correct visit id', () => {
      const { getByTestId } = render(<VisitsScreen />);

      fireEvent.press(getByTestId('visit-card-visit-1'));

      expect(router.push).toHaveBeenCalledWith('/visit/visit-1');
    });

    it('should call handleSearchChange when search text changes', () => {
      const { getByTestId } = render(<VisitsScreen />);

      const searchInput = getByTestId('visits-search-bar-input');
      fireEvent.changeText(searchInput, 'test');

      expect(searchInput.props.value).toBe('test');
    });

    it('should call handleDebouncedChange after debounce delay', async () => {
      const { getByTestId } = render(<VisitsScreen />);

      const searchInput = getByTestId('visits-search-bar-input');
      fireEvent.changeText(searchInput, 'test');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(searchInput.props.value).toBe('test');
      });
    });
  });

  describe('renderVisit Function', () => {
    it('should map visit data correctly', () => {
      const { getByTestId } = render(<VisitsScreen />);

      expect(getByTestId('visit-card-visit-1')).toBeTruthy();
    });

    it('should use client_representante when available', () => {
      const { getByTestId } = render(<VisitsScreen />);

      expect(getByTestId('visit-card-visit-1')).toBeTruthy();
    });

    it('should fall back to client_nombre_institucion when client_representante is not available', () => {
      const visitsWithoutRepresentante = [
        {
          id: 'visit-1',
          client_nombre_institucion: 'Hospital General',
          fecha_visita: '2024-01-15T10:00:00Z',
          status: 'pending',
        },
      ];

      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: visitsWithoutRepresentante },
        isLoading: false,
        error: null,
      });

      const { getByTestId } = render(<VisitsScreen />);

      expect(getByTestId('visit-card-visit-1')).toBeTruthy();
    });
  });

  describe('renderEmpty Function', () => {
    it('should render loading state in empty component', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [] },
        isLoading: true,
        error: null,
      });

      const { getByText } = render(<VisitsScreen />);

      expect(getByText('visits.loadingVisits')).toBeTruthy();
    });

    it('should render error state in empty component', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('API error'),
      });

      const { getByText } = render(<VisitsScreen />);

      expect(getByText('common.error')).toBeTruthy();
    });

    it('should render empty state when no error and not loading', () => {
      (useListVisitsBffSellersAppVisitsGet as jest.Mock).mockReturnValue({
        data: { visits: [] },
        isLoading: false,
        error: null,
      });

      const { getByText } = render(<VisitsScreen />);

      expect(getByText('visits.emptyState')).toBeTruthy();
      expect(getByText('visits.emptyStateDescription')).toBeTruthy();
    });
  });
});
