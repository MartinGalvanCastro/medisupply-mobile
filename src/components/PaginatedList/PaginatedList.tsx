import { EmptyState } from '@/components/EmptyState';
import { ErrorStateCard } from '@/components/ErrorStateCard';
import { ListScreenLayout } from '@/components/ListScreenLayout';
import { LoadingCard } from '@/components/LoadingCard';
import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useTranslation } from '@/i18n/hooks';
import { FlashList } from '@shopify/flash-list';
import React, { createContext, useContext } from 'react';
import type {
  PaginatedListContainerProps,
  PaginatedListContentProps,
  PaginatedListContextValue,
  PaginatedListEmptyStateProps,
  PaginatedListHeaderProps,
} from './types';

// Context for sharing query state between compound components
const PaginatedListContext = createContext<PaginatedListContextValue<any> | null>(null);

function usePaginatedListContext<T>() {
  const context = useContext(PaginatedListContext);
  if (!context) {
    throw new Error(
      'PaginatedList compound components must be used within PaginatedList.Container'
    );
  }
  return context as PaginatedListContextValue<T>;
}

/**
 * Main container component that handles layout and state management
 */
function Container<T>({
  query,
  title,
  testID,
  children,
  layoutComponent: LayoutComponent,
}: PaginatedListContainerProps<T>) {
  const contextValue: PaginatedListContextValue<T> = {
    query,
    title,
    testID,
  };

  // Use custom layout if provided, otherwise default to ListScreenLayout
  const content = (
    <VStack space="lg" className="flex-1">
      {children}
    </VStack>
  );

  return (
    <PaginatedListContext.Provider value={contextValue}>
      {LayoutComponent ? (
        <LayoutComponent title={title} testID={testID}>
          {content}
        </LayoutComponent>
      ) : (
        <ListScreenLayout title={`${title}`} testID={testID}>
          {content}
        </ListScreenLayout>
      )}
    </PaginatedListContext.Provider>
  );
}

/**
 * Header component that remains visible in all states (loading, error, success)
 */
function Header({ children }: PaginatedListHeaderProps) {
  return <>{children}</>;
}

/**
 * Content component that handles loading, error, and data states
 */
function Content<T>({
  loadingMessage,
  loadingTestID,
  errorTestID,
  footerLoadingMessage,
  footerLoadingTestID,
  retryLabel,
  ListEmptyComponent,
  ...flashListProps
}: PaginatedListContentProps<T>) {
  const { t } = useTranslation();
  const { query, testID } = usePaginatedListContext<T>();

  const {
    data,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    isRefetching,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = query;

  // Loading state
  if (isLoading) {
    return (
      <LoadingCard
        message={loadingMessage || t('common.loading')}
        testID={loadingTestID || `${testID}-loading`}
      />
    );
  }

  // Error state
  if (isError) {
    const errorMessage = error?.message || t('common.error');
    return (
      <ErrorStateCard
        title={t('common.error')}
        message={errorMessage}
        onRetry={() => refetch()}
        retryLabel={retryLabel || t('common.retry')}
        testID={errorTestID || `${testID}-error`}
      />
    );
  }

  // Footer component for loading more
  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <Box className="p-4 items-center">
          <VStack space="sm" className="items-center">
            <Spinner
              size="small"
              testID={footerLoadingTestID || `${testID}-load-more-spinner`}
            />
            <Text className="text-typography-500 text-sm">
              {footerLoadingMessage || t('common.loading')}
            </Text>
          </VStack>
        </Box>
      );
    }
    return null;
  };

  // Handle load more
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Success state with FlashList
  return (
    <FlashList
      data={data}
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={renderFooter}
      onRefresh={() => refetch()}
      refreshing={isRefetching}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      {...flashListProps}
    />
  );
}

/**
 * Pre-configured empty state component
 */
function Empty({ icon, title, description, testID }: PaginatedListEmptyStateProps) {
  return (
    <EmptyState icon={icon} title={title} description={description} testID={testID} />
  );
}

// Export as compound component
export const PaginatedList = {
  Container,
  Header,
  Content,
  Empty,
};
