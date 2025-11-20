import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { PaginatedList } from './PaginatedList';
import type { UseInfinitePaginatedQueryResult } from '@/hooks/useInfinitePaginatedQuery/types';
import { Package } from 'lucide-react-native';

// Mock dependencies
jest.mock('@/i18n/hooks', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.loading': 'Loading...',
        'common.error': 'An error occurred',
        'common.retry': 'Retry',
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock('@/components/ListScreenLayout', () => {
  const { View, Text } = require('react-native');
  return {
    ListScreenLayout: ({ children, title, testID }: any) => (
      <View testID={testID}>
        <Text>{title}</Text>
        {children}
      </View>
    ),
  };
});

jest.mock('@/components/LoadingCard', () => {
  const { View, Text } = require('react-native');
  return {
    LoadingCard: ({ message, testID }: any) => (
      <View testID={testID}>
        <Text>{message}</Text>
      </View>
    ),
  };
});

jest.mock('@/components/ErrorStateCard', () => {
  const { View, Text } = require('react-native');
  return {
    ErrorStateCard: ({ title, message, onRetry, retryLabel, testID }: any) => (
      <View testID={testID}>
        <Text testID={`${testID}-title`}>{title}</Text>
        <Text testID={`${testID}-message`}>{message}</Text>
        <Text testID={`${testID}-retry-button`} onPress={onRetry}>
          {retryLabel}
        </Text>
      </View>
    ),
  };
});

jest.mock('@/components/EmptyState', () => {
  const { View, Text } = require('react-native');
  return {
    EmptyState: ({ title, description, testID }: any) => (
      <View testID={testID}>
        <Text>{title}</Text>
        <Text>{description}</Text>
      </View>
    ),
  };
});

jest.mock('@shopify/flash-list', () => {
  const { View, Text } = require('react-native');
  return {
    FlashList: ({ data, renderItem, ListEmptyComponent, ListFooterComponent, onRefresh, onEndReached, testID }: any) => (
      <View testID={testID}>
        {data && data.length > 0 ? (
          data.map((item: any, index: number) => (
            <View key={index}>{renderItem({ item })}</View>
          ))
        ) : (
          ListEmptyComponent
        )}
        {ListFooterComponent && ListFooterComponent()}
        {onRefresh && <Text testID={`${testID}-refresh`} onPress={onRefresh}>Refresh</Text>}
        {onEndReached && <Text testID={`${testID}-load-more`} onPress={onEndReached}>Load More</Text>}
      </View>
    ),
  };
});

// Helper to create mock query result
const createMockQuery = <T,>(
  overrides: Partial<UseInfinitePaginatedQueryResult<T>> = {}
): UseInfinitePaginatedQueryResult<T> => ({
  data: [] as T[],
  total: 0,
  isLoading: false,
  isError: false,
  error: null,
  isFetchingNextPage: false,
  isRefetching: false,
  hasNextPage: false,
  fetchNextPage: jest.fn(),
  refetch: jest.fn(),
  flattenedData: [] as T[],
  loadedPages: 0,
  loadedItems: 0,
  ...overrides,
});

interface TestItem {
  id: string;
  name: string;
}

describe('PaginatedList', () => {
  describe('Container', () => {
    it('should render with default ListScreenLayout', () => {
      const query = createMockQuery<TestItem>();

      const { getByTestId, getByText } = render(
        <PaginatedList.Container
          query={query}
          title="Test Title"
          testID="test-screen"
        >
          <Text>Content</Text>
        </PaginatedList.Container>
      );

      expect(getByTestId('test-screen')).toBeTruthy();
      expect(getByText('Test Title')).toBeTruthy();
      expect(getByText('Content')).toBeTruthy();
    });

    it('should render with custom layout component', () => {
      const query = createMockQuery<TestItem>();
      const CustomLayout = ({ children, testID }: any) => (
        <View testID={testID}>
          <Text>Custom Layout</Text>
          {children}
        </View>
      );

      const { getByText } = render(
        <PaginatedList.Container
          query={query}
          testID="test-screen"
          layoutComponent={CustomLayout}
        >
          <Text>Content</Text>
        </PaginatedList.Container>
      );

      expect(getByText('Custom Layout')).toBeTruthy();
      expect(getByText('Content')).toBeTruthy();
    });
  });

  describe('Header', () => {
    it('should render header content', () => {
      const query = createMockQuery<TestItem>();

      const { getByText } = render(
        <PaginatedList.Container
          query={query}
          title="Test"
          testID="test-screen"
        >
          <PaginatedList.Header>
            <Text>Header Content</Text>
          </PaginatedList.Header>
        </PaginatedList.Container>
      );

      expect(getByText('Header Content')).toBeTruthy();
    });

    it('should keep header visible during loading state', () => {
      const query = createMockQuery<TestItem>({ isLoading: true });

      const { getByText, getByTestId } = render(
        <PaginatedList.Container
          query={query}
          title="Test"
          testID="test-screen"
        >
          <PaginatedList.Header>
            <Text>Header Content</Text>
          </PaginatedList.Header>
          <PaginatedList.Content
            renderItem={() => null}
            keyExtractor={(item: TestItem) => item.id}
            testID="test-list"
          />
        </PaginatedList.Container>
      );

      expect(getByText('Header Content')).toBeTruthy();
      expect(getByTestId('test-screen-loading')).toBeTruthy();
    });

    it('should keep header visible during error state', () => {
      const query = createMockQuery<TestItem>({
        isError: true,
        error: new Error('Test error'),
      });

      const { getByText, getByTestId } = render(
        <PaginatedList.Container
          query={query}
          title="Test"
          testID="test-screen"
        >
          <PaginatedList.Header>
            <Text>Header Content</Text>
          </PaginatedList.Header>
          <PaginatedList.Content
            renderItem={() => null}
            keyExtractor={(item: TestItem) => item.id}
            testID="test-list"
          />
        </PaginatedList.Container>
      );

      expect(getByText('Header Content')).toBeTruthy();
      expect(getByTestId('test-screen-error')).toBeTruthy();
    });
  });

  describe('Content - Loading State', () => {
    it('should show loading state with default message', () => {
      const query = createMockQuery<TestItem>({ isLoading: true });

      const { getByTestId, getByText } = render(
        <PaginatedList.Container
          query={query}
          title="Test"
          testID="test-screen"
        >
          <PaginatedList.Content
            renderItem={() => null}
            keyExtractor={(item: TestItem) => item.id}
            testID="test-list"
          />
        </PaginatedList.Container>
      );

      expect(getByTestId('test-screen-loading')).toBeTruthy();
      expect(getByText('Loading...')).toBeTruthy();
    });

    it('should show loading state with custom message', () => {
      const query = createMockQuery<TestItem>({ isLoading: true });

      const { getByText } = render(
        <PaginatedList.Container
          query={query}
          title="Test"
          testID="test-screen"
        >
          <PaginatedList.Content
            renderItem={() => null}
            keyExtractor={(item: TestItem) => item.id}
            testID="test-list"
            loadingMessage="Loading items..."
          />
        </PaginatedList.Container>
      );

      expect(getByText('Loading items...')).toBeTruthy();
    });

    it('should use custom loading testID', () => {
      const query = createMockQuery<TestItem>({ isLoading: true });

      const { getByTestId } = render(
        <PaginatedList.Container
          query={query}
          title="Test"
          testID="test-screen"
        >
          <PaginatedList.Content
            renderItem={() => null}
            keyExtractor={(item: TestItem) => item.id}
            testID="test-list"
            loadingTestID="custom-loading"
          />
        </PaginatedList.Container>
      );

      expect(getByTestId('custom-loading')).toBeTruthy();
    });
  });

  describe('Content - Error State', () => {
    it('should show error state with error message', () => {
      const query = createMockQuery<TestItem>({
        isError: true,
        error: new Error('Network error'),
      });

      const { getByTestId, getByText } = render(
        <PaginatedList.Container
          query={query}
          title="Test"
          testID="test-screen"
        >
          <PaginatedList.Content
            renderItem={() => null}
            keyExtractor={(item: TestItem) => item.id}
            testID="test-list"
          />
        </PaginatedList.Container>
      );

      expect(getByTestId('test-screen-error')).toBeTruthy();
      expect(getByText('Network error')).toBeTruthy();
    });

    it('should show fallback error message when error has no message', () => {
      const query = createMockQuery<TestItem>({
        isError: true,
        error: {} as Error,
      });

      const { getByTestId } = render(
        <PaginatedList.Container
          query={query}
          title="Test"
          testID="test-screen"
        >
          <PaginatedList.Content
            renderItem={() => null}
            keyExtractor={(item: TestItem) => item.id}
            testID="test-list"
          />
        </PaginatedList.Container>
      );

      expect(getByTestId('test-screen-error-message')).toBeTruthy();
    });

    it('should call refetch when retry button is pressed', () => {
      const mockRefetch = jest.fn();
      const query = createMockQuery<TestItem>({
        isError: true,
        error: new Error('Test error'),
        refetch: mockRefetch,
      });

      const { getByTestId } = render(
        <PaginatedList.Container
          query={query}
          title="Test"
          testID="test-screen"
        >
          <PaginatedList.Content
            renderItem={() => null}
            keyExtractor={(item: TestItem) => item.id}
            testID="test-list"
          />
        </PaginatedList.Container>
      );

      fireEvent.press(getByTestId('test-screen-error-retry-button'));
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should use custom error testID', () => {
      const query = createMockQuery<TestItem>({
        isError: true,
        error: new Error('Test error'),
      });

      const { getByTestId } = render(
        <PaginatedList.Container
          query={query}
          title="Test"
          testID="test-screen"
        >
          <PaginatedList.Content
            renderItem={() => null}
            keyExtractor={(item: TestItem) => item.id}
            testID="test-list"
            errorTestID="custom-error"
          />
        </PaginatedList.Container>
      );

      expect(getByTestId('custom-error')).toBeTruthy();
    });
  });

  describe('Content - Success State', () => {
    it('should render data items', () => {
      const testData: TestItem[] = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' },
      ];
      const query = createMockQuery<TestItem>({ data: testData });

      const { getByText } = render(
        <PaginatedList.Container
          query={query}
          title="Test"
          testID="test-screen"
        >
          <PaginatedList.Content
            renderItem={({ item }: { item: TestItem }) => <Text>{item.name}</Text>}
            keyExtractor={(item: TestItem) => item.id}
            testID="test-list"
          />
        </PaginatedList.Container>
      );

      expect(getByText('Item 1')).toBeTruthy();
      expect(getByText('Item 2')).toBeTruthy();
      expect(getByText('Item 3')).toBeTruthy();
    });

    it('should show empty state when no data', () => {
      const query = createMockQuery<TestItem>({ data: [] });

      const { getByTestId, getByText } = render(
        <PaginatedList.Container
          query={query}
          title="Test"
          testID="test-screen"
        >
          <PaginatedList.Content
            renderItem={({ item }: { item: TestItem }) => <Text>{item.name}</Text>}
            keyExtractor={(item: TestItem) => item.id}
            testID="test-list"
            ListEmptyComponent={
              <PaginatedList.Empty
                icon={Package}
                title="No items"
                description="No items found"
                testID="empty-state"
              />
            }
          />
        </PaginatedList.Container>
      );

      expect(getByTestId('empty-state')).toBeTruthy();
      expect(getByText('No items')).toBeTruthy();
    });

    it('should call refetch on pull-to-refresh', () => {
      const mockRefetch = jest.fn();
      const query = createMockQuery<TestItem>({
        data: [{ id: '1', name: 'Item 1' }],
        refetch: mockRefetch,
      });

      const { getByTestId } = render(
        <PaginatedList.Container
          query={query}
          title="Test"
          testID="test-screen"
        >
          <PaginatedList.Content
            renderItem={({ item }: { item: TestItem }) => <Text>{item.name}</Text>}
            keyExtractor={(item: TestItem) => item.id}
            testID="test-list"
          />
        </PaginatedList.Container>
      );

      fireEvent.press(getByTestId('test-list-refresh'));
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should call fetchNextPage when reaching end of list', () => {
      const mockFetchNextPage = jest.fn();
      const query = createMockQuery<TestItem>({
        data: [{ id: '1', name: 'Item 1' }],
        hasNextPage: true,
        fetchNextPage: mockFetchNextPage,
      });

      const { getByTestId } = render(
        <PaginatedList.Container
          query={query}
          title="Test"
          testID="test-screen"
        >
          <PaginatedList.Content
            renderItem={({ item }: { item: TestItem }) => <Text>{item.name}</Text>}
            keyExtractor={(item: TestItem) => item.id}
            testID="test-list"
          />
        </PaginatedList.Container>
      );

      fireEvent.press(getByTestId('test-list-load-more'));
      expect(mockFetchNextPage).toHaveBeenCalled();
    });

    it('should not call fetchNextPage when no more pages', () => {
      const mockFetchNextPage = jest.fn();
      const query = createMockQuery<TestItem>({
        data: [{ id: '1', name: 'Item 1' }],
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
      });

      const { getByTestId } = render(
        <PaginatedList.Container
          query={query}
          title="Test"
          testID="test-screen"
        >
          <PaginatedList.Content
            renderItem={({ item }: { item: TestItem }) => <Text>{item.name}</Text>}
            keyExtractor={(item: TestItem) => item.id}
            testID="test-list"
          />
        </PaginatedList.Container>
      );

      fireEvent.press(getByTestId('test-list-load-more'));
      expect(mockFetchNextPage).not.toHaveBeenCalled();
    });

    it('should not call fetchNextPage when already fetching', () => {
      const mockFetchNextPage = jest.fn();
      const query = createMockQuery<TestItem>({
        data: [{ id: '1', name: 'Item 1' }],
        hasNextPage: true,
        isFetchingNextPage: true,
        fetchNextPage: mockFetchNextPage,
      });

      const { getByTestId } = render(
        <PaginatedList.Container
          query={query}
          title="Test"
          testID="test-screen"
        >
          <PaginatedList.Content
            renderItem={({ item }: { item: TestItem }) => <Text>{item.name}</Text>}
            keyExtractor={(item: TestItem) => item.id}
            testID="test-list"
          />
        </PaginatedList.Container>
      );

      fireEvent.press(getByTestId('test-list-load-more'));
      expect(mockFetchNextPage).not.toHaveBeenCalled();
    });
  });

  describe('Content - Footer Loading', () => {
    it('should show footer loading indicator when fetching next page', () => {
      const query = createMockQuery<TestItem>({
        data: [{ id: '1', name: 'Item 1' }],
        isFetchingNextPage: true,
      });

      const { getByTestId, getByText } = render(
        <PaginatedList.Container
          query={query}
          title="Test"
          testID="test-screen"
        >
          <PaginatedList.Content
            renderItem={({ item }: { item: TestItem }) => <Text>{item.name}</Text>}
            keyExtractor={(item: TestItem) => item.id}
            testID="test-list"
          />
        </PaginatedList.Container>
      );

      expect(getByTestId('test-screen-load-more-spinner')).toBeTruthy();
      expect(getByText('Loading...')).toBeTruthy();
    });

    it('should show custom footer loading message', () => {
      const query = createMockQuery<TestItem>({
        data: [{ id: '1', name: 'Item 1' }],
        isFetchingNextPage: true,
      });

      const { getByText } = render(
        <PaginatedList.Container
          query={query}
          title="Test"
          testID="test-screen"
        >
          <PaginatedList.Content
            renderItem={({ item }: { item: TestItem }) => <Text>{item.name}</Text>}
            keyExtractor={(item: TestItem) => item.id}
            testID="test-list"
            footerLoadingMessage="Loading more items..."
          />
        </PaginatedList.Container>
      );

      expect(getByText('Loading more items...')).toBeTruthy();
    });

    it('should use custom footer loading testID', () => {
      const query = createMockQuery<TestItem>({
        data: [{ id: '1', name: 'Item 1' }],
        isFetchingNextPage: true,
      });

      const { getByTestId } = render(
        <PaginatedList.Container
          query={query}
          title="Test"
          testID="test-screen"
        >
          <PaginatedList.Content
            renderItem={({ item }: { item: TestItem }) => <Text>{item.name}</Text>}
            keyExtractor={(item: TestItem) => item.id}
            testID="test-list"
            footerLoadingTestID="custom-spinner"
          />
        </PaginatedList.Container>
      );

      expect(getByTestId('custom-spinner')).toBeTruthy();
    });

    it('should not show footer when not fetching next page', () => {
      const query = createMockQuery<TestItem>({
        data: [{ id: '1', name: 'Item 1' }],
        isFetchingNextPage: false,
      });

      const { queryByTestId } = render(
        <PaginatedList.Container
          query={query}
          title="Test"
          testID="test-screen"
        >
          <PaginatedList.Content
            renderItem={({ item }: { item: TestItem }) => <Text>{item.name}</Text>}
            keyExtractor={(item: TestItem) => item.id}
            testID="test-list"
          />
        </PaginatedList.Container>
      );

      expect(queryByTestId('test-screen-load-more-spinner')).toBeNull();
    });
  });

  describe('Empty', () => {
    it('should render empty state with all props', () => {
      const { getByTestId, getByText } = render(
        <PaginatedList.Empty
          icon={Package}
          title="No items found"
          description="Try adjusting your search"
          testID="empty-state"
        />
      );

      expect(getByTestId('empty-state')).toBeTruthy();
      expect(getByText('No items found')).toBeTruthy();
      expect(getByText('Try adjusting your search')).toBeTruthy();
    });
  });

  describe('Context Error', () => {
    it('should throw error when Content is used outside Container', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(
          <PaginatedList.Content
            renderItem={() => null}
            keyExtractor={(item: any) => item.id}
            testID="test-list"
          />
        );
      }).toThrow('PaginatedList compound components must be used within PaginatedList.Container');

      consoleSpy.mockRestore();
    });
  });
});
