import { useState, useCallback, useMemo } from 'react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { OrderCard } from '@/components/OrderCard';
import { PaginatedList } from '@/components/PaginatedList';
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
  const query = useInfinitePaginatedQuery({
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

  // Filter orders based on delivery date (client-side filtering)
  const filteredOrders = useMemo(() => {
    const ordersArray = Array.isArray(query.data) ? query.data : [];
    return (ordersArray as ExtendedOrderResponse[]).filter((order) => {
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
  }, [query.data, showPastOrders]);

  // Create a modified query object with filtered data
  const filteredQuery = useMemo(
    () => ({
      ...query,
      data: filteredOrders,
    }),
    [query, filteredOrders]
  );

  const handleToggleFilter = () => {
    setShowPastOrders(!showPastOrders);
  };

  const renderOrder = ({ item }: { item: ExtendedOrderResponse }) => {
    return <OrderCard order={item} />;
  };

  return (
    <PaginatedList.Container
      query={filteredQuery}
      testID="orders-screen"
      layoutComponent={ScreenContainer}
    >
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
                {showPastOrders
                  ? t('orders.showingPastOrders')
                  : t('orders.showPastOrders')}
              </ButtonText>
            </Button>

            {filteredOrders.length > 0 && (
              <Text size="sm" className="text-typography-500">
                {t('orders.totalOrders', { count: filteredOrders.length })}
              </Text>
            )}
          </HStack>
        </VStack>

        {/* Orders List */}
        <Box className="flex-1">
          <PaginatedList.Content
            renderItem={renderOrder}
            keyExtractor={(item) => item.id}
            testID="orders-list"
            loadingMessage={t('orders.loadingOrders')}
            loadingTestID="orders-loading"
            errorTestID="orders-error"
            footerLoadingMessage={t('orders.loadingMore') || 'Loading more...'}
            footerLoadingTestID="orders-load-more-spinner"
            ListEmptyComponent={
              <PaginatedList.Empty
                icon={Package}
                title={t('orders.emptyState')}
                description={
                  showPastOrders
                    ? t('orders.emptyStatePastOrders')
                    : t('orders.emptyStateUpcomingOrders')
                }
                testID="orders-empty-state"
              />
            }
            estimatedItemSize={150}
          />
        </Box>
      </VStack>
    </PaginatedList.Container>
  );
};
