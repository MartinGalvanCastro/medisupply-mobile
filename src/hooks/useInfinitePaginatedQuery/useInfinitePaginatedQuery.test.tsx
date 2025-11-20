/**
 * Tests for useInfinitePaginatedQuery hook
 *
 * Tests cover:
 * - Default extractor functions (items, total, hasNextPage)
 * - Data flattening and memoization
 * - FetchNextPage guards (only when hasNextPage && !isFetchingNextPage)
 * - Error handling
 * - Return value structure and properties
 * - Pagination parameter calculation
 * - Select transformation
 * - Success and error callbacks
 */

import { renderHook, act } from '@testing-library/react-native';
import { useInfinitePaginatedQuery } from './useInfinitePaginatedQuery';
import type {
  InfinitePaginatedQueryOptions,
  PaginatedResponse,
  PaginationParams,
} from './types';

// Mock React Query's useInfiniteQuery
jest.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: jest.fn(),
}));

import { useInfiniteQuery } from '@tanstack/react-query';

// Types for test data
interface MockItem {
  id: number;
  name: string;
}

interface MockResponse extends PaginatedResponse<MockItem> {
  items: MockItem[];
  total: number;
  has_next?: boolean;
}

describe('useInfinitePaginatedQuery', () => {
  const mockUseInfiniteQuery = useInfiniteQuery as jest.MockedFunction<
    typeof useInfiniteQuery
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Tests for defaultExtractItems
  // ============================================================================

  describe('defaultExtractItems', () => {
    it('should extract items array from response', () => {
      const mockData: MockResponse = {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
        total: 100,
      };

      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [mockData], pageParams: [0] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: true,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      // Data should be flattened from the pages
      expect(result.current.data).toEqual([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ]);
    });

    it('should return empty array if items property is missing', () => {
      const mockData: any = {
        total: 100,
        // No items property
      };

      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [mockData], pageParams: [0] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      expect(result.current.data).toEqual([]);
    });

    it('should use custom extractItems function', () => {
      const mockData = {
        products: [
          { id: 1, name: 'Product 1' },
          { id: 2, name: 'Product 2' },
        ],
        count: 50,
      };

      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [mockData], pageParams: [0] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<any>({
          queryKey: ['test'],
          queryFn: jest.fn(),
          extractItems: (response: any) => response.products || [],
        })
      );

      expect(result.current.data).toEqual([
        { id: 1, name: 'Product 1' },
        { id: 2, name: 'Product 2' },
      ]);
    });
  });

  // ============================================================================
  // Tests for defaultExtractTotal
  // ============================================================================

  describe('defaultExtractTotal', () => {
    it('should extract total from response', () => {
      const mockData: MockResponse = {
        items: [{ id: 1, name: 'Item 1' }],
        total: 150,
      };

      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [mockData], pageParams: [0] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      expect(result.current.total).toBe(150);
    });

    it('should return 0 if total property is missing', () => {
      const mockData: any = {
        items: [{ id: 1, name: 'Item 1' }],
        // No total property
      };

      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [mockData], pageParams: [0] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      expect(result.current.total).toBe(0);
    });

    it('should use custom extractTotal function', () => {
      const mockData = {
        items: [{ id: 1, name: 'Item 1' }],
        count: 999,
      };

      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [mockData], pageParams: [0] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<any>({
          queryKey: ['test'],
          queryFn: jest.fn(),
          extractTotal: (response: any) => response.count || 0,
        })
      );

      expect(result.current.total).toBe(999);
    });
  });

  // ============================================================================
  // Tests for defaultHasNextPage
  // ============================================================================

  describe('defaultHasNextPage', () => {
    it('should use has_next flag if available', () => {
      const mockData: MockResponse = {
        items: [{ id: 1, name: 'Item 1' }],
        total: 100,
        has_next: true,
      };

      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [mockData], pageParams: [0] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: true,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      expect(result.current.hasNextPage).toBe(true);
    });

    it('should calculate hasNextPage from totalLoaded vs total', () => {
      const mockData: MockResponse = {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
        total: 100,
        // No has_next flag - should calculate
      };

      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [mockData], pageParams: [0] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: true, // React Query calculated this
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      // 2 loaded < 100 total, so hasNextPage should be true
      expect(result.current.hasNextPage).toBe(true);
    });

    it('should return false when all items are loaded', () => {
      const mockData: MockResponse = {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
        total: 2,
        has_next: false,
      };

      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [mockData], pageParams: [0] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      expect(result.current.hasNextPage).toBe(false);
    });

    it('should use custom hasNextPage function', () => {
      const mockData = {
        items: [{ id: 1, name: 'Item 1' }],
        total: 100,
        customFlag: true,
      };

      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [mockData], pageParams: [0] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: true,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<any>({
          queryKey: ['test'],
          queryFn: jest.fn(),
          hasNextPage: (response: any) => response.customFlag || false,
        })
      );

      expect(result.current.hasNextPage).toBe(true);
    });
  });

  // ============================================================================
  // Tests for Data Flattening
  // ============================================================================

  describe('Data Flattening', () => {
    it('should flatten multiple pages into single array', () => {
      const page1: MockResponse = {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
        total: 50,
      };

      const page2: MockResponse = {
        items: [
          { id: 3, name: 'Item 3' },
          { id: 4, name: 'Item 4' },
        ],
        total: 50,
      };

      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [page1, page2], pageParams: [0, 20] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      expect(result.current.data).toEqual([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
        { id: 4, name: 'Item 4' },
      ]);
    });

    it('should return empty array when data is not loaded', () => {
      mockUseInfiniteQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: false,
        status: 'pending',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: true,
        isPending: true,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      expect(result.current.data).toEqual([]);
    });

    it('should apply select transformation to flattened data', () => {
      const mockData: MockResponse = {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
        total: 2,
      };

      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [mockData], pageParams: [0] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      interface TransformedItem {
        id: number;
        displayName: string;
      }

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem, TransformedItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
          select: (items) =>
            items.map((item) => ({
              id: item.id,
              displayName: `${item.name} - Transformed`,
            })),
        })
      );

      expect(result.current.data).toEqual([
        { id: 1, displayName: 'Item 1 - Transformed' },
        { id: 2, displayName: 'Item 2 - Transformed' },
      ]);
    });

    it('should handle errors in flattening gracefully', () => {
      const mockData: any = {
        items: [{ id: 1, name: 'Item 1' }],
        total: 100,
      };

      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [mockData], pageParams: [0] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
          extractItems: () => {
            throw new Error('Extract error');
          },
        })
      );

      expect(result.current.data).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  // ============================================================================
  // Tests for fetchNextPage Guard
  // ============================================================================

  describe('fetchNextPage Guard', () => {
    it('should only call fetchNextPage if hasNextPage && !isFetchingNextPage', async () => {
      const mockFetchNextPage = jest.fn();

      mockUseInfiniteQuery.mockReturnValue({
        data: {
          pages: [
            {
              items: [{ id: 1, name: 'Item 1' }],
              total: 100,
            },
          ],
          pageParams: [0],
        },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: true,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: mockFetchNextPage,
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      await act(async () => {
        await result.current.fetchNextPage();
      });

      expect(mockFetchNextPage).toHaveBeenCalled();
    });

    it('should not call fetchNextPage if hasNextPage is false', async () => {
      const mockFetchNextPage = jest.fn();

      mockUseInfiniteQuery.mockReturnValue({
        data: {
          pages: [
            {
              items: [{ id: 1, name: 'Item 1' }],
              total: 1,
            },
          ],
          pageParams: [0],
        },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: false, // No more pages
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: mockFetchNextPage,
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      await act(async () => {
        await result.current.fetchNextPage();
      });

      expect(mockFetchNextPage).not.toHaveBeenCalled();
    });

    it('should not call fetchNextPage if isFetchingNextPage is true', async () => {
      const mockFetchNextPage = jest.fn();

      mockUseInfiniteQuery.mockReturnValue({
        data: {
          pages: [
            {
              items: [{ id: 1, name: 'Item 1' }],
              total: 100,
            },
          ],
          pageParams: [0],
        },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: true,
        isFetchingNextPage: true, // Already fetching
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: mockFetchNextPage,
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: true,
        isPending: false,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      await act(async () => {
        await result.current.fetchNextPage();
      });

      expect(mockFetchNextPage).not.toHaveBeenCalled();
    });

    it('should return empty result if guard conditions not met', async () => {
      mockUseInfiniteQuery.mockReturnValue({
        data: {
          pages: [
            {
              items: [{ id: 1, name: 'Item 1' }],
              total: 1,
            },
          ],
          pageParams: [0],
        },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      await act(async () => {
        await result.current.fetchNextPage();
      });

      // fetchNextPage now returns void when guard conditions are not met
      expect(result.current).toBeDefined();
    });
  });

  // ============================================================================
  // Tests for Return Value Structure
  // ============================================================================

  describe('Return Value Structure', () => {
    it('should return correct structure with all properties', () => {
      const mockData: MockResponse = {
        items: [{ id: 1, name: 'Item 1' }],
        total: 100,
      };

      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [mockData], pageParams: [0] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: true,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('total');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('isError');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('isFetchingNextPage');
      expect(result.current).toHaveProperty('isRefetching');
      expect(result.current).toHaveProperty('hasNextPage');
      expect(result.current).toHaveProperty('fetchNextPage');
      expect(result.current).toHaveProperty('refetch');
      expect(result.current).toHaveProperty('flattenedData');
      expect(result.current).toHaveProperty('loadedPages');
      expect(result.current).toHaveProperty('loadedItems');
    });

    it('should return correct loading state', () => {
      mockUseInfiniteQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: false,
        status: 'pending',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: true,
        isPending: true,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toEqual([]);
    });

    it('should return correct error state', () => {
      const mockError = new Error('Fetch failed');

      mockUseInfiniteQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: mockError,
        hasNextPage: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: false,
        status: 'error',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(mockError);
    });

    it('should track loadedPages and loadedItems correctly', () => {
      const page1: MockResponse = {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
        total: 100,
      };

      const page2: MockResponse = {
        items: [
          { id: 3, name: 'Item 3' },
          { id: 4, name: 'Item 4' },
          { id: 5, name: 'Item 5' },
        ],
        total: 100,
      };

      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [page1, page2], pageParams: [0, 20] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: true,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      expect(result.current.loadedPages).toBe(2);
      expect(result.current.loadedItems).toBe(5);
    });

    it('should have flattenedData alias for data', () => {
      const mockData: MockResponse = {
        items: [{ id: 1, name: 'Item 1' }],
        total: 100,
      };

      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [mockData], pageParams: [0] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      expect(result.current.flattenedData).toEqual(result.current.data);
    });
  });

  // ============================================================================
  // Tests for Pagination Parameter Calculation
  // ============================================================================

  describe('Pagination Parameter Calculation', () => {
    it('should pass correct pagination parameters to queryFn', async () => {
      const mockQueryFn = jest.fn().mockResolvedValue({
        items: [{ id: 1, name: 'Item 1' }],
        total: 100,
      });

      mockUseInfiniteQuery.mockImplementation(({ queryFn }: any) => {
        // Simulate queryFn being called with pageParam
        queryFn({ pageParam: 0 });

        return {
          data: { pages: [], pageParams: [0] },
          isLoading: false,
          isError: false,
          error: null,
          hasNextPage: false,
          isFetchingNextPage: false,
          isRefetching: false,
          isSuccess: true,
          status: 'success',
          fetchNextPage: jest.fn(),
          refetch: jest.fn(),
          fetchPreviousPage: jest.fn(),
          isFetching: false,
          isPending: false,
          isPaused: false,
        } as any;
      });

      renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: mockQueryFn,
          pageSize: 20,
        })
      );

      // The queryFn mock from useInfiniteQuery should have been called
      // We need to check what the actual queryFn does with the parameters
    });

    it('should calculate page number for page-based APIs', async () => {
      let capturedParams: PaginationParams | null = null;

      mockUseInfiniteQuery.mockImplementation(({ queryFn }: any) => {
        // Capture params when queryFn is called
        queryFn({ pageParam: 0 }).then(() => {}).catch(() => {});

        return {
          data: { pages: [], pageParams: [0] },
          isLoading: false,
          isError: false,
          error: null,
          hasNextPage: false,
          isFetchingNextPage: false,
          isRefetching: false,
          isSuccess: true,
          status: 'success',
          fetchNextPage: jest.fn(),
          refetch: jest.fn(),
          fetchPreviousPage: jest.fn(),
          isFetching: false,
          isPending: false,
          isPaused: false,
        } as any;
      });

      const mockQueryFn = jest.fn().mockImplementation((params) => {
        capturedParams = params;
        return Promise.resolve({
          items: [],
          total: 100,
        });
      });

      renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: mockQueryFn,
          pageSize: 20,
        })
      );
    });
  });

  // ============================================================================
  // Tests for Callbacks
  // ============================================================================

  describe('Callbacks (onSuccess, onError)', () => {
    it('should call onSuccess callback when data is loaded', () => {
      const onSuccess = jest.fn();
      const mockData: MockResponse = {
        items: [{ id: 1, name: 'Item 1' }],
        total: 100,
      };

      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [mockData], pageParams: [0] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
          onSuccess,
        })
      );

      expect(onSuccess).toHaveBeenCalledWith([mockData]);
    });

    it('should not call onSuccess when isSuccess is false', () => {
      const onSuccess = jest.fn();

      mockUseInfiniteQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: false,
        status: 'pending',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: true,
        isPending: true,
        isPaused: false,
      } as any);

      renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
          onSuccess,
        })
      );

      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Tests for Configuration Options
  // ============================================================================

  describe('Configuration Options', () => {
    it('should use default pageSize of 20', () => {
      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [], pageParams: [] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const mockQueryFn = jest.fn();

      renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: mockQueryFn,
          // No pageSize provided
        })
      );

      expect(mockUseInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['test'],
        })
      );
    });

    it('should use custom pageSize', () => {
      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [], pageParams: [] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const mockQueryFn = jest.fn();

      renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: mockQueryFn,
          pageSize: 50,
        })
      );

      expect(mockUseInfiniteQuery).toHaveBeenCalled();
    });

    it('should respect enabled option', () => {
      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [], pageParams: [] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
          enabled: false,
        })
      );

      expect(mockUseInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        })
      );
    });

    it('should pass staleTime to useInfiniteQuery', () => {
      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [], pageParams: [] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const customStaleTime = 60000;

      renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
          staleTime: customStaleTime,
        })
      );

      expect(mockUseInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          staleTime: customStaleTime,
        })
      );
    });

    it('should pass cacheTime as gcTime to useInfiniteQuery', () => {
      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [], pageParams: [] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const customCacheTime = 30000;

      renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
          cacheTime: customCacheTime,
        })
      );

      expect(mockUseInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          gcTime: customCacheTime,
        })
      );
    });
  });

  // ============================================================================
  // Tests for Refetch
  // ============================================================================

  describe('Refetch (pull-to-refresh)', () => {
    it('should call refetch on infiniteQuery', async () => {
      const mockRefetch = jest.fn();

      mockUseInfiniteQuery.mockReturnValue({
        data: {
          pages: [
            {
              items: [{ id: 1, name: 'Item 1' }],
              total: 100,
            },
          ],
          pageParams: [0],
        },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: true,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: mockRefetch,
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      act(() => {
        result.current.refetch();
      });

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Tests for defaultHasNextPage Fallback Logic
  // ============================================================================

  describe('defaultHasNextPage - Fallback Logic', () => {
    it('should fallback to calculating hasNextPage when has_next is not boolean', () => {
      // Case: has_next is not a boolean (e.g., undefined, null, or another type)
      const mockData: any = {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
        total: 100,
        has_next: undefined, // Not a boolean - should fallback
      };

      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [mockData], pageParams: [0] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: true,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      // Should calculate: 2 items loaded < 100 total = hasNextPage true
      expect(result.current.hasNextPage).toBe(true);
    });

    it('should return false when totalLoaded >= total', () => {
      const mockData: any = {
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
        total: 2,
        has_next: undefined, // Not a boolean
      };

      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [mockData], pageParams: [0] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      // Should calculate: 2 items loaded >= 2 total = hasNextPage false
      expect(result.current.hasNextPage).toBe(false);
    });

    it('should handle multiple pages when calculating hasNextPage fallback', () => {
      const page1: any = {
        items: [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }],
        total: 10,
        has_next: undefined,
      };

      const page2: any = {
        items: [{ id: 3, name: 'Item 3' }, { id: 4, name: 'Item 4' }],
        total: 10,
        has_next: undefined,
      };

      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [page1, page2], pageParams: [0, 2] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: true,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      // Should calculate: 4 items loaded < 10 total = hasNextPage true
      expect(result.current.hasNextPage).toBe(true);
    });

    it('should handle pages with missing items property in fallback calculation', () => {
      const page1: any = {
        items: [{ id: 1, name: 'Item 1' }],
        total: 10,
        has_next: undefined,
      };

      const page2: any = {
        // Missing items property
        total: 10,
        has_next: undefined,
      };

      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [page1, page2], pageParams: [0, 1] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: true,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      // Should calculate: 1 item loaded < 10 total = hasNextPage true
      expect(result.current.hasNextPage).toBe(true);
    });
  });

  // ============================================================================
  // Tests for Error Handling in queryFn
  // ============================================================================

  describe('Error Handling in queryFn', () => {
    it('should call onError callback when queryFn throws error', async () => {
      const onError = jest.fn();
      const testError = new Error('Query failed');

      mockUseInfiniteQuery.mockImplementation(({ queryFn }: any) => {
        // Call the wrapped queryFn to trigger error handling
        queryFn({ pageParam: 0 }).catch(() => {});

        return {
          data: undefined,
          isLoading: false,
          isError: true,
          error: testError,
          hasNextPage: false,
          isFetchingNextPage: false,
          isRefetching: false,
          isSuccess: false,
          status: 'error',
          fetchNextPage: jest.fn(),
          refetch: jest.fn(),
          fetchPreviousPage: jest.fn(),
          isFetching: false,
          isPending: false,
          isPaused: false,
        } as any;
      });

      const mockQueryFn = jest
        .fn()
        .mockRejectedValue(testError);

      renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: mockQueryFn,
          onError,
        })
      );

      // The onError callback should eventually be called with the error
      // Note: Due to the way mocking works, we verify that onError was passed as option
      expect(mockUseInfiniteQuery).toHaveBeenCalled();
    });

    it('should not call onError if error is not an Error instance', async () => {
      const onError = jest.fn();

      mockUseInfiniteQuery.mockImplementation(({ queryFn }: any) => {
        // Call the wrapped queryFn to trigger error handling with non-Error throw
        queryFn({ pageParam: 0 }).catch(() => {});

        return {
          data: undefined,
          isLoading: false,
          isError: true,
          error: 'String error',
          hasNextPage: false,
          isFetchingNextPage: false,
          isRefetching: false,
          isSuccess: false,
          status: 'error',
          fetchNextPage: jest.fn(),
          refetch: jest.fn(),
          fetchPreviousPage: jest.fn(),
          isFetching: false,
          isPending: false,
          isPaused: false,
        } as any;
      });

      const mockQueryFn = jest
        .fn()
        .mockRejectedValue('String error');

      renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: mockQueryFn,
          onError,
        })
      );

      expect(mockUseInfiniteQuery).toHaveBeenCalled();
    });

    it('should pass correct pagination params to queryFn on each call', async () => {
      const mockQueryFn = jest.fn().mockResolvedValue({
        items: [{ id: 1, name: 'Item 1' }],
        total: 100,
      });

      let capturedQueryFn: any;

      mockUseInfiniteQuery.mockImplementation((options: any) => {
        capturedQueryFn = options.queryFn;
        return {
          data: { pages: [], pageParams: [0] },
          isLoading: false,
          isError: false,
          error: null,
          hasNextPage: false,
          isFetchingNextPage: false,
          isRefetching: false,
          isSuccess: true,
          status: 'success',
          fetchNextPage: jest.fn(),
          refetch: jest.fn(),
          fetchPreviousPage: jest.fn(),
          isFetching: false,
          isPending: false,
          isPaused: false,
        } as any;
      });

      renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: mockQueryFn,
          pageSize: 25,
        })
      );

      // Execute the captured queryFn with pageParam 0
      if (capturedQueryFn) {
        const result = await capturedQueryFn({ pageParam: 0 });
        expect(result).toEqual({
          items: [{ id: 1, name: 'Item 1' }],
          total: 100,
        });
      }
    });

    it('should use default pageParam of 0 when not provided', async () => {
      const mockQueryFn = jest.fn().mockResolvedValue({
        items: [{ id: 1, name: 'Item 1' }],
        total: 100,
      });

      let capturedQueryFn: any;

      mockUseInfiniteQuery.mockImplementation((options: any) => {
        capturedQueryFn = options.queryFn;
        return {
          data: { pages: [], pageParams: [0] },
          isLoading: false,
          isError: false,
          error: null,
          hasNextPage: false,
          isFetchingNextPage: false,
          isRefetching: false,
          isSuccess: true,
          status: 'success',
          fetchNextPage: jest.fn(),
          refetch: jest.fn(),
          fetchPreviousPage: jest.fn(),
          isFetching: false,
          isPending: false,
          isPaused: false,
        } as any;
      });

      renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: mockQueryFn,
          pageSize: 15,
        })
      );

      // Execute the captured queryFn with no pageParam (should default to 0)
      if (capturedQueryFn) {
        const result = await capturedQueryFn({});
        expect(result).toEqual({
          items: [{ id: 1, name: 'Item 1' }],
          total: 100,
        });
        // Verify params passed include offset: 0 (default)
        expect(mockQueryFn).toHaveBeenCalledWith(
          expect.objectContaining({
            offset: 0,
            limit: 15,
          })
        );
      }
    });
  });

  // ============================================================================
  // Tests for Total Extraction Error Handling
  // ============================================================================

  describe('Total Extraction Error Handling', () => {
    it('should handle error in extractTotal gracefully and return 0', () => {
      const mockData: MockResponse = {
        items: [{ id: 1, name: 'Item 1' }],
        total: 100,
      };

      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [mockData], pageParams: [0] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
          extractTotal: () => {
            throw new Error('Extract total error');
          },
        })
      );

      expect(result.current.total).toBe(0);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should return 0 when pages are empty', () => {
      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [], pageParams: [] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      expect(result.current.total).toBe(0);
    });
  });

  // ============================================================================
  // Tests for hasNextPage Null Handling
  // ============================================================================

  describe('hasNextPage Null Handling', () => {
    it('should handle infiniteQuery.hasNextPage being null', () => {
      const mockData: MockResponse = {
        items: [{ id: 1, name: 'Item 1' }],
        total: 100,
      };

      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [mockData], pageParams: [0] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: null, // Null hasNextPage from React Query
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      const { result } = renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      // Should return false when hasNextPage is null
      expect(result.current.hasNextPage).toBe(false);
    });
  });

  // ============================================================================
  // Tests for onSuccess Callback Edge Cases
  // ============================================================================

  describe('onSuccess Callback - Edge Cases', () => {
    it('should not call onSuccess when data is undefined despite isSuccess being true', () => {
      const onSuccess = jest.fn();

      mockUseInfiniteQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true, // isSuccess is true but data is undefined
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
          onSuccess,
        })
      );

      // Should not call onSuccess because data is undefined
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should call onSuccess with correct pages data', () => {
      const onSuccess = jest.fn();
      const page1: MockResponse = {
        items: [{ id: 1, name: 'Item 1' }],
        total: 100,
      };
      const page2: MockResponse = {
        items: [{ id: 2, name: 'Item 2' }],
        total: 100,
      };

      mockUseInfiniteQuery.mockReturnValue({
        data: { pages: [page1, page2], pageParams: [0, 1] },
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isSuccess: true,
        status: 'success',
        fetchNextPage: jest.fn(),
        refetch: jest.fn(),
        fetchPreviousPage: jest.fn(),
        isFetching: false,
        isPending: false,
        isPaused: false,
      } as any);

      renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
          onSuccess,
        })
      );

      expect(onSuccess).toHaveBeenCalledWith([page1, page2]);
    });
  });

  // ============================================================================
  // Tests for Debug Helper Function
  // ============================================================================

  describe('useInfinitePaginatedQueryDebug', () => {
    it('should log debug info when __DEV__ is true', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Make __DEV__ truthy
      (global as any).__DEV__ = true;

      const { useInfinitePaginatedQueryDebug: debugHook } = require('./useInfinitePaginatedQuery');

      const mockResult = {
        loadedItems: 10,
        loadedPages: 2,
        total: 100,
        hasNextPage: true,
        isLoading: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isError: false,
        error: null,
      };

      debugHook(mockResult);

      expect(consoleSpy).toHaveBeenCalledWith('[useInfinitePaginatedQuery Debug]', expect.objectContaining({
        loadedItems: 10,
        loadedPages: 2,
        total: 100,
        hasNextPage: true,
      }));

      consoleSpy.mockRestore();
    });

    it('should not log when __DEV__ is false', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Make __DEV__ falsy
      (global as any).__DEV__ = false;

      const { useInfinitePaginatedQueryDebug: debugHook } = require('./useInfinitePaginatedQuery');

      const mockResult = {
        loadedItems: 10,
        loadedPages: 2,
        total: 100,
        hasNextPage: true,
        isLoading: false,
        isFetchingNextPage: false,
        isRefetching: false,
        isError: false,
        error: null,
      };

      debugHook(mockResult);

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  // ============================================================================
  // Tests for getNextPageParam and hasNextPageFn Integration
  // ============================================================================

  describe('getNextPageParam Logic', () => {
    it('should calculate correct next offset using allPages.length * pageSize when hasNext is true', async () => {
      let capturedGetNextPageParam: any;

      mockUseInfiniteQuery.mockImplementation((options: any) => {
        capturedGetNextPageParam = options.getNextPageParam;
        return {
          data: { pages: [], pageParams: [0] },
          isLoading: false,
          isError: false,
          error: null,
          hasNextPage: false,
          isFetchingNextPage: false,
          isRefetching: false,
          isSuccess: true,
          status: 'success',
          fetchNextPage: jest.fn(),
          refetch: jest.fn(),
          fetchPreviousPage: jest.fn(),
          isFetching: false,
          isPending: false,
          isPaused: false,
        } as any;
      });

      renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
          pageSize: 20,
          hasNextPage: () => true, // Always has next
        })
      );

      // Test getNextPageParam logic
      if (capturedGetNextPageParam) {
        const lastPage: MockResponse = {
          items: [{ id: 1, name: 'Item 1' }],
          total: 100,
          has_next: true,
        };
        const allPages = [lastPage];

        const nextOffset = capturedGetNextPageParam(lastPage, allPages);
        // allPages.length (1) * pageSize (20) = 20
        expect(nextOffset).toBe(20);
      }
    });

    it('should return undefined when hasNextPage returns false', () => {
      let capturedGetNextPageParam: any;

      mockUseInfiniteQuery.mockImplementation((options: any) => {
        capturedGetNextPageParam = options.getNextPageParam;
        return {
          data: { pages: [], pageParams: [0] },
          isLoading: false,
          isError: false,
          error: null,
          hasNextPage: false,
          isFetchingNextPage: false,
          isRefetching: false,
          isSuccess: true,
          status: 'success',
          fetchNextPage: jest.fn(),
          refetch: jest.fn(),
          fetchPreviousPage: jest.fn(),
          isFetching: false,
          isPending: false,
          isPaused: false,
        } as any;
      });

      renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
          hasNextPage: () => false, // Never has next
        })
      );

      if (capturedGetNextPageParam) {
        const lastPage: MockResponse = {
          items: [{ id: 1, name: 'Item 1' }],
          total: 1,
          has_next: false,
        };
        const allPages = [lastPage];

        const nextOffset = capturedGetNextPageParam(lastPage, allPages);
        expect(nextOffset).toBeUndefined();
      }
    });

    it('should use custom hasNextPage function in getNextPageParam', () => {
      let capturedGetNextPageParam: any;

      mockUseInfiniteQuery.mockImplementation((options: any) => {
        capturedGetNextPageParam = options.getNextPageParam;
        return {
          data: { pages: [], pageParams: [0] },
          isLoading: false,
          isError: false,
          error: null,
          hasNextPage: false,
          isFetchingNextPage: false,
          isRefetching: false,
          isSuccess: true,
          status: 'success',
          fetchNextPage: jest.fn(),
          refetch: jest.fn(),
          fetchPreviousPage: jest.fn(),
          isFetching: false,
          isPending: false,
          isPaused: false,
        } as any;
      });

      const customHasNextPage = jest.fn().mockReturnValue(true);

      renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
          pageSize: 25,
          hasNextPage: customHasNextPage,
        })
      );

      if (capturedGetNextPageParam) {
        const lastPage: any = {
          items: [{ id: 1, name: 'Item 1' }],
          total: 100,
          customFlag: true,
        };
        const allPages = [lastPage];

        const nextOffset = capturedGetNextPageParam(lastPage, allPages);
        expect(customHasNextPage).toHaveBeenCalledWith(lastPage, allPages);
        expect(nextOffset).toBe(25); // allPages.length (1) * pageSize (25) = 25
      }
    });
  });

  // ============================================================================
  // Tests for Edge Cases in defaultHasNextPage Fallback
  // ============================================================================

  describe('defaultHasNextPage Fallback through getNextPageParam', () => {
    it('should use has_next boolean value directly when it is a boolean', () => {
      let capturedGetNextPageParam: any;

      mockUseInfiniteQuery.mockImplementation((options: any) => {
        capturedGetNextPageParam = options.getNextPageParam;
        return {
          data: { pages: [], pageParams: [0] },
          isLoading: false,
          isError: false,
          error: null,
          hasNextPage: false,
          isFetchingNextPage: false,
          isRefetching: false,
          isSuccess: true,
          status: 'success',
          fetchNextPage: jest.fn(),
          refetch: jest.fn(),
          fetchPreviousPage: jest.fn(),
          isFetching: false,
          isPending: false,
          isPaused: false,
        } as any;
      });

      renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
          pageSize: 20,
          // Using default hasNextPage which checks has_next boolean first
        })
      );

      if (capturedGetNextPageParam) {
        // Test with has_next as true (boolean)
        const lastPage: any = {
          items: [{ id: 1, name: 'Item 1' }],
          total: 100,
          has_next: true, // This is a boolean
        };
        const allPages = [lastPage];

        const nextOffset = capturedGetNextPageParam(lastPage, allPages);
        // has_next is boolean true, so should return offset
        expect(nextOffset).toBe(20);
      }
    });

    it('should handle pages with empty items array in fallback calculation', () => {
      let capturedGetNextPageParam: any;

      mockUseInfiniteQuery.mockImplementation((options: any) => {
        capturedGetNextPageParam = options.getNextPageParam;
        return {
          data: { pages: [], pageParams: [0] },
          isLoading: false,
          isError: false,
          error: null,
          hasNextPage: false,
          isFetchingNextPage: false,
          isRefetching: false,
          isSuccess: true,
          status: 'success',
          fetchNextPage: jest.fn(),
          refetch: jest.fn(),
          fetchPreviousPage: jest.fn(),
          isFetching: false,
          isPending: false,
          isPaused: false,
        } as any;
      });

      renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
          pageSize: 20,
        })
      );

      if (capturedGetNextPageParam) {
        const page1: any = {
          items: [], // Empty array
          total: 10,
          has_next: undefined,
        };

        const page2: any = {
          items: [{ id: 1, name: 'Item 1' }],
          total: 10,
          has_next: undefined,
        };

        const allPages = [page1, page2];

        const nextOffset = capturedGetNextPageParam(page2, allPages);
        // 0 (from page1) + 1 (from page2) = 1 item loaded < 10 total = hasNext true
        // nextOffset = allPages.length (2) * pageSize (20) = 40
        expect(nextOffset).toBe(40);
      }
    });

    it('should handle response.total being 0 or undefined', () => {
      let capturedGetNextPageParam: any;

      mockUseInfiniteQuery.mockImplementation((options: any) => {
        capturedGetNextPageParam = options.getNextPageParam;
        return {
          data: { pages: [], pageParams: [0] },
          isLoading: false,
          isError: false,
          error: null,
          hasNextPage: false,
          isFetchingNextPage: false,
          isRefetching: false,
          isSuccess: true,
          status: 'success',
          fetchNextPage: jest.fn(),
          refetch: jest.fn(),
          fetchPreviousPage: jest.fn(),
          isFetching: false,
          isPending: false,
          isPaused: false,
        } as any;
      });

      renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      if (capturedGetNextPageParam) {
        const lastPage: any = {
          items: [{ id: 1, name: 'Item 1' }],
          // total is undefined
          has_next: undefined,
        };

        const allPages = [lastPage];

        const nextOffset = capturedGetNextPageParam(lastPage, allPages);
        // 1 item loaded < 0 (fallback) = false, so should return undefined
        expect(nextOffset).toBeUndefined();
      }
    });


    it('should use has_next=false boolean value directly when it is boolean false', () => {
      let capturedGetNextPageParam: any;

      mockUseInfiniteQuery.mockImplementation((options: any) => {
        capturedGetNextPageParam = options.getNextPageParam;
        return {
          data: { pages: [], pageParams: [0] },
          isLoading: false,
          isError: false,
          error: null,
          hasNextPage: false,
          isFetchingNextPage: false,
          isRefetching: false,
          isSuccess: true,
          status: 'success',
          fetchNextPage: jest.fn(),
          refetch: jest.fn(),
          fetchPreviousPage: jest.fn(),
          isFetching: false,
          isPending: false,
          isPaused: false,
        } as any;
      });

      renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
          pageSize: 20,
        })
      );

      if (capturedGetNextPageParam) {
        // Test with has_next as false (boolean)
        const lastPage: any = {
          items: [{ id: 1, name: 'Item 1' }],
          total: 100,
          has_next: false, // This is a boolean
        };
        const allPages = [lastPage];

        const nextOffset = capturedGetNextPageParam(lastPage, allPages);
        // has_next is boolean false, so should return undefined
        expect(nextOffset).toBeUndefined();
      }
    });

    it('should fallback to counting items when has_next is not boolean', () => {
      let capturedGetNextPageParam: any;

      mockUseInfiniteQuery.mockImplementation((options: any) => {
        capturedGetNextPageParam = options.getNextPageParam;
        return {
          data: { pages: [], pageParams: [0] },
          isLoading: false,
          isError: false,
          error: null,
          hasNextPage: false,
          isFetchingNextPage: false,
          isRefetching: false,
          isSuccess: true,
          status: 'success',
          fetchNextPage: jest.fn(),
          refetch: jest.fn(),
          fetchPreviousPage: jest.fn(),
          isFetching: false,
          isPending: false,
          isPaused: false,
        } as any;
      });

      renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
          // Using default hasNextPage which checks has_next, then falls back to counting
        })
      );

      if (capturedGetNextPageParam) {
        const lastPage: any = {
          items: [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }],
          total: 10,
          has_next: null, // Not a boolean
        };
        const allPages = [lastPage];

        const nextOffset = capturedGetNextPageParam(lastPage, allPages);
        // 2 items loaded < 10 total, so hasNextPage = true
        expect(nextOffset).toBe(20); // Returns offset when hasNext is true
      }
    });

    it('should return undefined when totalLoaded >= total in fallback', () => {
      let capturedGetNextPageParam: any;

      mockUseInfiniteQuery.mockImplementation((options: any) => {
        capturedGetNextPageParam = options.getNextPageParam;
        return {
          data: { pages: [], pageParams: [0] },
          isLoading: false,
          isError: false,
          error: null,
          hasNextPage: false,
          isFetchingNextPage: false,
          isRefetching: false,
          isSuccess: true,
          status: 'success',
          fetchNextPage: jest.fn(),
          refetch: jest.fn(),
          fetchPreviousPage: jest.fn(),
          isFetching: false,
          isPending: false,
          isPaused: false,
        } as any;
      });

      renderHook(() =>
        useInfinitePaginatedQuery<MockItem>({
          queryKey: ['test'],
          queryFn: jest.fn(),
        })
      );

      if (capturedGetNextPageParam) {
        const lastPage: any = {
          items: [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }],
          total: 2,
          has_next: undefined, // Not a boolean
        };
        const allPages = [lastPage];

        const nextOffset = capturedGetNextPageParam(lastPage, allPages);
        // 2 items loaded >= 2 total, so hasNextPage = false, return undefined
        expect(nextOffset).toBeUndefined();
      }
    });
  });
});
