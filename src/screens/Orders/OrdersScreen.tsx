import { useState, useCallback } from 'react';
import { FlashList } from '@shopify/flash-list';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { Button, ButtonText } from '@/components/ui/button';
import { OrderCard } from '@/components/OrderCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorStateCard } from '@/components/ErrorStateCard';
import { LoadingCard } from '@/components/LoadingCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useTranslation } from '@/i18n/hooks';
import { useInfinitePaginatedQuery } from '@/hooks';
import { listMyOrdersBffClientAppMyOrdersGet } from '@/api/generated/client-app/client-app';
import { Filter, Package } from 'lucide-react-native';
import type { OrderResponse } from '@/api/generated/models';

type ExtendedOrderResponse = OrderResponse & {
  shipment_id?: string | null;
  shipment_status?: string | null;
  vehicle_plate?: string | null;
  driver_name?: string | null;
};

export const OrdersScreen = () => {
  const { t } = useTranslation();
  const [showPastOrders, setShowPastOrders] = useState(false);

  // Use infinite pagination hook
  const {
    data: allOrders,
    total,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    isRefetching,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfinitePaginatedQuery({
    queryKey: ['orders', { showPast: showPastOrders }],
    queryFn: ({ offset, limit }) =>
      listMyOrdersBffClientAppMyOrdersGet({
        offset,
        limit,
      }),
    extractItems: (response) => response.items,
    extractTotal: (response) => response.total,
    hasNextPage: (response) => response.has_next ?? false,
    pageSize: 20,
    staleTime: 30 * 1000,
  });

  // Filter orders based on delivery date
  const orders = (allOrders as ExtendedOrderResponse[]).filter((order) => {
    const deliveryDate = order.fecha_entrega_estimada
      ? new Date(order.fecha_entrega_estimada)
      : null;
    if (!deliveryDate) return !showPastOrders; // No date: show in upcoming only

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deliveryDate.setHours(0, 0, 0, 0);

    if (showPastOrders) {
      // Show only past orders (delivery date < today)
      return deliveryDate < today;
    } else {
      // Show only upcoming orders (delivery date >= today)
      return deliveryDate >= today;
    }
  });

  const handleToggleFilter = () => {
    setShowPastOrders(!showPastOrders);
  };

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const renderOrder = ({ item }: { item: ExtendedOrderResponse }) => {
    return <OrderCard order={item} />;
  };

  // Handle load more (automatic on scroll)
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Footer component for loading indicator
  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <Box className="p-4 items-center">
          <VStack space="sm" className="items-center">
            <Spinner size="small" testID="orders-load-more-spinner" />
            <Text className="text-typography-500 text-sm">
              {t('orders.loadingMore') || 'Loading more...'}
            </Text>
          </VStack>
        </Box>
      );
    }
    return null;
  };

  // Early returns for loading/error states
  if (isLoading) {
    return (
      <ScreenContainer testID="orders-screen">
        <VStack space="lg" className="flex-1 px-4 py-2">
          <Text className="text-typography-900 text-3xl font-bold">
            {t('orders.title')}
          </Text>
          <LoadingCard
            message={t('orders.loadingOrders')}
            testID="orders-loading"
          />
        </VStack>
      </ScreenContainer>
    );
  }

  if (isError) {
    const errorMessage = error?.message || 'Failed to load orders';
    return (
      <ScreenContainer testID="orders-screen">
        <VStack space="lg" className="flex-1 px-4 py-2">
          <Text className="text-typography-900 text-3xl font-bold">
            {t('orders.title')}
          </Text>
          <ErrorStateCard
            title={t('common.error')}
            message={errorMessage}
            onRetry={() => refetch()}
            retryLabel={t('common.retry') || 'Retry'}
            testID="orders-error"
          />
        </VStack>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer testID="orders-screen">
      <VStack space="lg" className="flex-1 px-4 py-2">
        {/* Header */}
        <VStack space="md">
          <Text className="text-typography-900 text-3xl font-bold">
            {t('orders.title')}
          </Text>

          {/* Filter Button */}
          <HStack space="sm" className="items-center">
            <Button
              size="sm"
              variant={showPastOrders ? 'solid' : 'outline'}
              action="secondary"
              onPress={handleToggleFilter}
              testID="orders-filter-button"
              className={showPastOrders ? '' : 'border-outline-500'}
            >
              <Filter size={16} color={showPastOrders ? '#ffffff' : '#6B7280'} />
              <ButtonText className="ml-2">
                {showPastOrders ? t('orders.showingPastOrders') : t('orders.showPastOrders')}
              </ButtonText>
            </Button>

            {orders.length > 0 && (
              <Text size="sm" className="text-typography-500">
                {t('orders.totalOrders', { count: orders.length })}
              </Text>
            )}
          </HStack>
        </VStack>

        {/* Orders List */}
        <Box className="flex-1">
          <FlashList
            data={orders}
            renderItem={renderOrder}
            ListEmptyComponent={
              <EmptyState
                icon={Package}
                title={t('orders.emptyState')}
                description={showPastOrders ? t('orders.emptyStatePastOrders') : t('orders.emptyStateUpcomingOrders')}
                testID="orders-empty-state"
              />
            }
            ListFooterComponent={renderFooter}
            keyExtractor={(item) => item.id}
            onRefresh={onRefresh}
            refreshing={isRefetching}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            testID="orders-list"
          />
        </Box>
      </VStack>
    </ScreenContainer>
  );
};
