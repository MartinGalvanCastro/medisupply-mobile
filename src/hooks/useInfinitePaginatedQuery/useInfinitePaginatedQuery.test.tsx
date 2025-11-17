/**
 * Tests for useInfinitePaginatedQuery hook
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInfinitePaginatedQuery } from './useInfinitePaginatedQuery';
import type { PaginatedResponse } from './types';

// Test data type
interface TestItem {
  id: number;
  name: string;
}

// Create a fresh QueryClient for each test
const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for tests
        gcTime: Infinity, // Prevent garbage collection during tests
      },
    },
  });
};

// Create wrapper with QueryClient
const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useInfinitePaginatedQuery', () => {
  describe('Initial Loading', () => {
    it('should fetch initial page successfully', async () => {
      const queryClient = createTestQueryClient();
      const mockQueryFn = jest.fn(
        async (): Promise<PaginatedResponse<TestItem>> => ({
          items: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
          ],
          total: 100,
          has_next: true,
        })
      );

      const { result } = renderHook(
        () =>
          useInfinitePaginatedQuery({
            queryKey: ['test-initial'],
            queryFn: mockQueryFn,
            pageSize: 2,
          }),
        { wrapper: createWrapper(queryClient) }
      );

      // Initially loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toEqual([]);

      // Wait for data to load
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Verify results
      expect(result.current.data).toHaveLength(2);
      expect(result.current.data[0]).toEqual({ id: 1, name: 'Item 1' });
      expect(result.current.total).toBe(100);
      expect(result.current.hasNextPage).toBe(true);
      expect(result.current.loadedPages).toBe(1);
      expect(result.current.loadedItems).toBe(2);
    });

    it('should handle empty results', async () => {
      const queryClient = createTestQueryClient();
      const mockQueryFn = jest.fn(
        async (): Promise<PaginatedResponse<TestItem>> => ({
          items: [],
          total: 0,
          has_next: false,
        })
      );

      const { result } = renderHook(
        () =>
          useInfinitePaginatedQuery({
            queryKey: ['test-empty'],
            queryFn: mockQueryFn,
          }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.hasNextPage).toBe(false);
    });
  });

  describe('Pagination', () => {
    it('should fetch next page and flatten data', async () => {
      const queryClient = createTestQueryClient();
      const mockQueryFn = jest.fn(async ({ offset }): Promise<PaginatedResponse<TestItem>> => {
        if (offset === 0) {
          return {
            items: [
              { id: 1, name: 'Item 1' },
              { id: 2, name: 'Item 2' },
            ],
            total: 4,
            has_next: true,
          };
        }
        return {
          items: [
            { id: 3, name: 'Item 3' },
            { id: 4, name: 'Item 4' },
          ],
          total: 4,
          has_next: false,
        };
      });

      const { result } = renderHook(
        () =>
          useInfinitePaginatedQuery({
            queryKey: ['test-pagination'],
            queryFn: mockQueryFn,
            pageSize: 2,
          }),
        { wrapper: createWrapper(queryClient) }
      );

      // Wait for initial load
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toHaveLength(2);
      expect(result.current.hasNextPage).toBe(true);

      // Fetch next page
      result.current.fetchNextPage();

      // Wait for next page
      await waitFor(() => expect(result.current.isFetchingNextPage).toBe(false));

      // Verify flattened data
      expect(result.current.data).toHaveLength(4);
      expect(result.current.data.map((item) => item.id)).toEqual([1, 2, 3, 4]);
      expect(result.current.hasNextPage).toBe(false);
      expect(result.current.loadedPages).toBe(2);
      expect(result.current.loadedItems).toBe(4);

      // Verify correct offset was passed
      expect(mockQueryFn).toHaveBeenCalledWith(
        expect.objectContaining({ offset: 0, limit: 2 })
      );
      expect(mockQueryFn).toHaveBeenCalledWith(
        expect.objectContaining({ offset: 2, limit: 2 })
      );
    });

    it('should not fetch next page if hasNextPage is false', async () => {
      const queryClient = createTestQueryClient();
      const mockQueryFn = jest.fn(
        async (): Promise<PaginatedResponse<TestItem>> => ({
          items: [{ id: 1, name: 'Item 1' }],
          total: 1,
          has_next: false,
        })
      );

      const { result } = renderHook(
        () =>
          useInfinitePaginatedQuery({
            queryKey: ['test-no-next'],
            queryFn: mockQueryFn,
          }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Try to fetch next page (should not call queryFn again)
      result.current.fetchNextPage();

      // Wait a bit to ensure no new fetch
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockQueryFn).toHaveBeenCalledTimes(1);
      expect(result.current.hasNextPage).toBe(false);
    });

    it('should calculate hasNextPage from total when has_next is not provided', async () => {
      const queryClient = createTestQueryClient();
      const mockQueryFn = jest.fn(async ({ offset }): Promise<PaginatedResponse<TestItem>> => {
        if (offset === 0) {
          return {
            items: [{ id: 1, name: 'Item 1' }],
            total: 2,
            // No has_next flag
          };
        }
        return {
          items: [{ id: 2, name: 'Item 2' }],
          total: 2,
        };
      });

      const { result } = renderHook(
        () =>
          useInfinitePaginatedQuery({
            queryKey: ['test-calculated-next'],
            queryFn: mockQueryFn,
            pageSize: 1,
          }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Should have next page based on total
      expect(result.current.hasNextPage).toBe(true);
      expect(result.current.loadedItems).toBe(1);
      expect(result.current.total).toBe(2);
    });
  });

  describe('Search and Filters', () => {
    it('should create new query when search changes', async () => {
      const queryClient = createTestQueryClient();
      const mockQueryFn = jest.fn(
        async (): Promise<PaginatedResponse<TestItem>> => ({
          items: [{ id: 1, name: 'Item 1' }],
          total: 1,
          has_next: false,
        })
      );

      const { result, rerender } = renderHook(
        ({ search }: { search: string }) =>
          useInfinitePaginatedQuery({
            queryKey: ['test-search', { search }],
            queryFn: mockQueryFn,
          }),
        {
          wrapper: createWrapper(queryClient),
          initialProps: { search: '' },
        }
      );

      await waitFor(() => expect(result.current?.isLoading).toBe(false));

      expect(mockQueryFn).toHaveBeenCalledTimes(1);

      // Change search
      rerender({ search: 'test' });

      await waitFor(() => expect(result.current?.isLoading).toBe(false));

      // Should have called queryFn again for new search
      expect(mockQueryFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors correctly', async () => {
      const queryClient = createTestQueryClient();
      const mockError = new Error('API Error');
      const mockQueryFn = jest.fn(async () => {
        throw mockError;
      });

      const { result } = renderHook(
        () =>
          useInfinitePaginatedQuery({
            queryKey: ['test-error'],
            queryFn: mockQueryFn,
          }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(mockError);
      expect(result.current.data).toEqual([]);
    });

    it('should call onError callback', async () => {
      const queryClient = createTestQueryClient();
      const mockError = new Error('API Error');
      const onError = jest.fn();
      const mockQueryFn = jest.fn(async () => {
        throw mockError;
      });

      const { result } = renderHook(
        () =>
          useInfinitePaginatedQuery({
            queryKey: ['test-error-callback'],
            queryFn: mockQueryFn,
            onError,
          }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(onError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('Refresh', () => {
    it('should refetch all pages on refresh', async () => {
      const queryClient = createTestQueryClient();
      const mockQueryFn = jest.fn(
        async (): Promise<PaginatedResponse<TestItem>> => ({
          items: [{ id: 1, name: 'Item 1' }],
          total: 1,
          has_next: false,
        })
      );

      const { result } = renderHook(
        () =>
          useInfinitePaginatedQuery({
            queryKey: ['test-refresh'],
            queryFn: mockQueryFn,
          }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockQueryFn).toHaveBeenCalledTimes(1);

      // Trigger refresh
      result.current.refetch();

      await waitFor(() => expect(result.current.isRefetching).toBe(false));

      // Should have called queryFn again
      expect(mockQueryFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Custom Extractors', () => {
    it('should use custom extractItems function', async () => {
      const queryClient = createTestQueryClient();
      const mockQueryFn = jest.fn(async (): Promise<any> => ({
        data: [{ id: 1, name: 'Item 1' }], // Different property name
        total: 1,
        has_next: false,
      }));

      const { result } = renderHook(
        () =>
          useInfinitePaginatedQuery({
            queryKey: ['test-custom-extract'],
            queryFn: mockQueryFn,
            extractItems: (response: any) => response.data,
          }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toEqual([{ id: 1, name: 'Item 1' }]);
    });

    it('should use select to transform data', async () => {
      const queryClient = createTestQueryClient();
      const mockQueryFn = jest.fn(
        async (): Promise<PaginatedResponse<TestItem>> => ({
          items: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
          ],
          total: 2,
          has_next: false,
        })
      );

      const { result } = renderHook(
        () =>
          useInfinitePaginatedQuery({
            queryKey: ['test-select'],
            queryFn: mockQueryFn,
            select: (items) => items.filter((item) => item.id === 1),
          }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0]).toEqual({ id: 1, name: 'Item 1' });
    });
  });

  describe('Configuration', () => {
    it('should respect enabled option', async () => {
      const queryClient = createTestQueryClient();
      const mockQueryFn = jest.fn(
        async (): Promise<PaginatedResponse<TestItem>> => ({
          items: [{ id: 1, name: 'Item 1' }],
          total: 1,
          has_next: false,
        })
      );

      const { result } = renderHook(
        () =>
          useInfinitePaginatedQuery({
            queryKey: ['test-disabled'],
            queryFn: mockQueryFn,
            enabled: false,
          }),
        { wrapper: createWrapper(queryClient) }
      );

      // Wait a bit to ensure no fetch
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockQueryFn).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual([]);
    });

    it('should use custom page size', async () => {
      const queryClient = createTestQueryClient();
      const mockQueryFn = jest.fn(
        async (): Promise<PaginatedResponse<TestItem>> => ({
          items: Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Item ${i}` })),
          total: 50,
          has_next: false,
        })
      );

      const { result } = renderHook(
        () =>
          useInfinitePaginatedQuery({
            queryKey: ['test-page-size'],
            queryFn: mockQueryFn,
            pageSize: 50,
          }),
        { wrapper: createWrapper(queryClient) }
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockQueryFn).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 50, offset: 0 })
      );
    });
  });
});
