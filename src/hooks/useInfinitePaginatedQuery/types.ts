/**
 * Types for useInfinitePaginatedQuery hook
 *
 * Provides type-safe infinite scrolling with React Query
 */

/**
 * Standard paginated API response format
 * Covers both offset-based and page-based pagination
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page?: number;
  size?: number;
  has_next?: boolean;
  has_previous?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Alternative response format for endpoints that use different property names
 * (e.g., 'clients' instead of 'items', 'count' instead of 'total')
 */
export interface AlternativePaginatedResponse<T> {
  [key: string]: T[] | number | boolean | undefined;
}

/**
 * Query function parameters
 * Supports both offset and page-based pagination
 */
export interface PaginationParams {
  offset: number;
  limit: number;
  page?: number;
  size?: number;
  [key: string]: any; // Allow additional filter params
}

/**
 * Configuration options for useInfinitePaginatedQuery
 */
export interface InfinitePaginatedQueryOptions<T, TData = T> {
  /**
   * Unique query key for caching
   * Should include filter parameters to invalidate cache when filters change
   */
  queryKey: readonly unknown[];

  /**
   * Function to fetch paginated data
   * Receives pagination params (offset, limit) and should return PaginatedResponse
   */
  queryFn: (params: PaginationParams) => Promise<PaginatedResponse<T>>;

  /**
   * Extract items array from API response
   * Default: (response) => response.items
   */
  extractItems?: (response: PaginatedResponse<T>) => T[];

  /**
   * Extract total count from API response
   * Default: (response) => response.total
   */
  extractTotal?: (response: PaginatedResponse<T>) => number;

  /**
   * Determine if there are more pages to load
   * Default: (response) => response.has_next ?? false
   */
  hasNextPage?: (response: PaginatedResponse<T>, allPages: PaginatedResponse<T>[]) => boolean;

  /**
   * Number of items per page
   * Default: 20
   */
  pageSize?: number;

  /**
   * Enable/disable the query
   * Default: true
   */
  enabled?: boolean;

  /**
   * Time in ms before data is considered stale
   * Default: 5 minutes (5 * 60 * 1000)
   */
  staleTime?: number;

  /**
   * Time in ms before inactive cache is garbage collected
   * Default: 10 minutes (10 * 60 * 1000)
   */
  cacheTime?: number;

  /**
   * Transform the flattened data before returning
   * Useful for filtering, sorting, or mapping items
   */
  select?: (data: T[]) => TData[];

  /**
   * Callback when data is successfully fetched
   */
  onSuccess?: (data: PaginatedResponse<T>[]) => void;

  /**
   * Callback when an error occurs
   */
  onError?: (error: Error) => void;
}

/**
 * Return type for useInfinitePaginatedQuery
 */
export interface UseInfinitePaginatedQueryResult<T> {
  /**
   * Flattened array of all items from all pages
   */
  data: T[];

  /**
   * Total number of items (from API, not just loaded items)
   */
  total: number;

  /**
   * True when loading the first page
   */
  isLoading: boolean;

  /**
   * True when any error occurred
   */
  isError: boolean;

  /**
   * Error object if isError is true
   */
  error: Error | null;

  /**
   * True when loading additional pages
   */
  isFetchingNextPage: boolean;

  /**
   * True when refreshing (pull-to-refresh)
   */
  isRefetching: boolean;

  /**
   * True if there are more pages to load
   */
  hasNextPage: boolean;

  /**
   * Function to load the next page
   */
  fetchNextPage: () => void;

  /**
   * Function to refetch all pages (pull-to-refresh)
   */
  refetch: () => void;

  /**
   * Same as data (for backwards compatibility)
   */
  flattenedData: T[];

  /**
   * Number of pages currently loaded
   */
  loadedPages: number;

  /**
   * Number of items currently loaded
   */
  loadedItems: number;
}

/**
 * Helper type for extracting item type from PaginatedResponse
 */
export type ExtractItemType<T> = T extends PaginatedResponse<infer U> ? U : never;
