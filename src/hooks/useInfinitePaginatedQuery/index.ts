/**
 * Infinite Pagination Hook Exports
 *
 * A reusable hook for implementing infinite scroll with React Query and FlashList
 */

export { useInfinitePaginatedQuery, useInfinitePaginatedQueryDebug } from './useInfinitePaginatedQuery';

export type {
  InfinitePaginatedQueryOptions,
  UseInfinitePaginatedQueryResult,
  PaginatedResponse,
  PaginationParams,
  AlternativePaginatedResponse,
  ExtractItemType,
} from './types';
