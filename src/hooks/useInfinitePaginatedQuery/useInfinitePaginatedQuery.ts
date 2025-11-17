/**
 * useInfinitePaginatedQuery Hook
 *
 * A reusable hook for implementing infinite scroll pagination with React Query and FlashList.
 *
 * Features:
 * - Automatic page management
 * - Built-in loading states
 * - Type-safe with generics
 * - Configurable page size
 * - Search/filter integration
 * - Pull-to-refresh support
 * - Error handling
 * - Cache management
 *
 * @example
 * ```typescript
 * const { data, loadMore, hasNextPage } = useInfinitePaginatedQuery({
 *   queryKey: ['products', { search }],
 *   queryFn: ({ offset, limit }) => fetchProducts({ offset, limit, search }),
 *   pageSize: 20,
 * });
 * ```
 */

import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type {
  InfinitePaginatedQueryOptions,
  UseInfinitePaginatedQueryResult,
  PaginatedResponse,
  PaginationParams,
} from './types';

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const DEFAULT_CACHE_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Default extractor for items from paginated response
 */
const defaultExtractItems = <T,>(response: PaginatedResponse<T>): T[] => {
  return response.items || [];
};

/**
 * Default extractor for total count from paginated response
 */
const defaultExtractTotal = <T,>(response: PaginatedResponse<T>): number => {
  return response.total || 0;
};

/**
 * Default function to determine if there are more pages
 */
const defaultHasNextPage = <T,>(
  response: PaginatedResponse<T>,
  allPages: PaginatedResponse<T>[]
): boolean => {
  // Check has_next flag if available
  if (typeof response.has_next === 'boolean') {
    return response.has_next;
  }

  // Fallback: calculate based on total items
  const totalLoaded = allPages.reduce(
    (sum, page) => sum + (page.items?.length || 0),
    0
  );
  const total = response.total || 0;

  return totalLoaded < total;
};

/**
 * Hook for infinite scroll pagination with React Query
 *
 * @template T - Type of items in the list
 * @template TData - Type of transformed data (after select)
 *
 * @param options - Configuration options
 * @returns Paginated query result with loading states and controls
 */
export function useInfinitePaginatedQuery<T, TData = T>(
  options: InfinitePaginatedQueryOptions<T, TData>
): UseInfinitePaginatedQueryResult<TData> {
  const {
    queryKey,
    queryFn,
    extractItems = defaultExtractItems,
    extractTotal = defaultExtractTotal,
    hasNextPage: hasNextPageFn = defaultHasNextPage,
    pageSize = DEFAULT_PAGE_SIZE,
    enabled = true,
    staleTime = DEFAULT_STALE_TIME,
    cacheTime = DEFAULT_CACHE_TIME,
    select,
    onSuccess,
    onError,
  } = options;

  // Initialize infinite query
  const infiniteQuery = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const params: PaginationParams = {
          offset: pageParam,
          limit: pageSize,
          page: Math.floor(pageParam / pageSize) + 1, // For page-based APIs
          size: pageSize, // Alternative to limit
        };

        const response = await queryFn(params);
        return response;
      } catch (error) {
        if (onError && error instanceof Error) {
          onError(error);
        }
        throw error;
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      const hasNext = hasNextPageFn(lastPage, allPages);
      if (hasNext) {
        // Calculate next offset
        const nextOffset = allPages.length * pageSize;
        return nextOffset;
      }
      return undefined; // No more pages
    },
    initialPageParam: 0,
    enabled,
    staleTime,
    gcTime: cacheTime, // React Query v5 uses gcTime instead of cacheTime
  });

  // Flatten all pages into single array
  const flattenedData = useMemo(() => {
    if (!infiniteQuery.data) return [] as TData[];

    try {
      const items = infiniteQuery.data.pages.flatMap((page) =>
        extractItems(page)
      );

      // Apply select transformation if provided
      if (select) {
        return select(items as T[]);
      }

      return items as unknown as TData[];
    } catch (error) {
      console.error('[useInfinitePaginatedQuery] Error flattening data:', error);
      return [] as TData[];
    }
  }, [infiniteQuery.data, extractItems, select]);

  // Get total from first page (assuming it's consistent across pages)
  const total = useMemo(() => {
    if (!infiniteQuery.data || infiniteQuery.data.pages.length === 0) {
      return 0;
    }

    try {
      return extractTotal(infiniteQuery.data.pages[0]);
    } catch (error) {
      console.error('[useInfinitePaginatedQuery] Error extracting total:', error);
      return 0;
    }
  }, [infiniteQuery.data, extractTotal]);

  // Calculate loaded pages and items
  const loadedPages = infiniteQuery.data?.pages.length || 0;
  const loadedItems = flattenedData.length;

  // Success callback
  if (infiniteQuery.isSuccess && onSuccess && infiniteQuery.data) {
    onSuccess(infiniteQuery.data.pages);
  }

  return {
    data: flattenedData,
    total,
    isLoading: infiniteQuery.isLoading,
    isError: infiniteQuery.isError,
    error: infiniteQuery.error as Error | null,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    isRefetching: infiniteQuery.isRefetching,
    hasNextPage: infiniteQuery.hasNextPage ?? false,
    fetchNextPage: () => {
      // Only fetch if there are more pages and not already fetching
      if (infiniteQuery.hasNextPage && !infiniteQuery.isFetchingNextPage) {
        infiniteQuery.fetchNextPage();
      }
    },
    refetch: () => {
      // Refetch all pages (pull-to-refresh)
      infiniteQuery.refetch();
    },
    flattenedData, // Alias for data
    loadedPages,
    loadedItems,
  };
}

/**
 * Helper hook for debugging pagination state
 * Only use in development
 */
export function useInfinitePaginatedQueryDebug<T, TData = T>(
  result: UseInfinitePaginatedQueryResult<TData>
) {
  if (__DEV__) {
    console.log('[useInfinitePaginatedQuery Debug]', {
      loadedItems: result.loadedItems,
      loadedPages: result.loadedPages,
      total: result.total,
      hasNextPage: result.hasNextPage,
      isLoading: result.isLoading,
      isFetchingNextPage: result.isFetchingNextPage,
      isRefetching: result.isRefetching,
      isError: result.isError,
      error: result.error?.message,
    });
  }
}
