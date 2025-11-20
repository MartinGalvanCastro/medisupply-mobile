import type { ReactNode } from 'react';
import type { FlashListProps } from '@shopify/flash-list';
import type { LucideIcon } from 'lucide-react-native';
import type { UseInfinitePaginatedQueryResult } from '@/hooks/useInfinitePaginatedQuery/types';

/**
 * Props for the main PaginatedList container
 */
export interface PaginatedListContainerProps<T> {
  /** Query result from useInfinitePaginatedQuery */
  query: UseInfinitePaginatedQueryResult<T>;

  /** Screen title (optional for custom layouts) */
  title?: string;

  /** Test ID for the screen */
  testID: string;

  /** Children components (Header, Content, etc.) */
  children: ReactNode;

  /** Custom layout component (defaults to ListScreenLayout) */
  layoutComponent?: React.ComponentType<{
    title?: string;
    testID?: string;
    children: ReactNode;
  }>;
}

/**
 * Props for the header section that stays visible in all states
 */
export interface PaginatedListHeaderProps {
  /** Header content (SearchBar, filters, etc.) */
  children: ReactNode;
}

/**
 * Props for the FlashList content area
 */
export interface PaginatedListContentProps<T>
  extends Omit<
    FlashListProps<T>,
    'data' | 'onRefresh' | 'refreshing' | 'onEndReached' | 'ListFooterComponent'
  > {
  /** Custom loading message */
  loadingMessage?: string;

  /** Custom loading testID */
  loadingTestID?: string;

  /** Custom error testID */
  errorTestID?: string;

  /** Custom footer loading message */
  footerLoadingMessage?: string;

  /** Custom footer loading testID */
  footerLoadingTestID?: string;

  /** Custom retry label */
  retryLabel?: string;

  /** Estimated item size for FlashList performance */
  estimatedItemSize?: number;
}

/**
 * Props for empty state configuration
 */
export interface PaginatedListEmptyStateProps {
  /** Icon component */
  icon: LucideIcon;

  /** Empty state title */
  title: string;

  /** Empty state description */
  description: string;

  /** Test ID */
  testID: string;
}

/**
 * Context value shared between compound components
 */
export interface PaginatedListContextValue<T> {
  query: UseInfinitePaginatedQueryResult<T>;
  title?: string;
  testID: string;
}
