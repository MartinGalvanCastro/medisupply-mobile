import { useState, useCallback } from 'react';
import { StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { OrderCard } from '@/components/OrderCard';
import { useTranslation } from '@/i18n/hooks';
import { useListMyOrdersBffClientAppMyOrdersGet } from '@/api/generated/client-app/client-app';
import { Filter } from 'lucide-react-native';
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

  // Fetch orders from API
  const { data, isLoading, error, refetch } = useListMyOrdersBffClientAppMyOrdersGet(
    undefined,
    {
      query: {
        staleTime: 30 * 1000, // 30 seconds
      },
    }
  );

  // Filter orders based on delivery date
  const allOrders = (data?.items || []) as ExtendedOrderResponse[];
  const orders = allOrders.filter((order) => {
    if (showPastOrders) {
      return true; // Show all orders
    }
    // Show only upcoming orders (delivery date >= today)
    const deliveryDate = order.fecha_entrega_estimada
      ? new Date(order.fecha_entrega_estimada)
      : null;
    if (!deliveryDate) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deliveryDate.setHours(0, 0, 0, 0);

    return deliveryDate >= today;
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

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <Box className="flex-1 justify-center items-center p-8">
          <Text className="text-typography-600 text-center">{t('orders.loadingOrders')}</Text>
        </Box>
      );
    }

    if (error) {
      return (
        <Box className="flex-1 justify-center items-center p-8">
          <Text className="text-typography-600 text-center">{t('common.error')}</Text>
        </Box>
      );
    }

    return (
      <Box className="flex-1 justify-center items-center p-8">
        <Text className="text-typography-900 text-lg font-semibold mb-2">
          {t('orders.emptyState')}
        </Text>
        <Text className="text-typography-600 text-center">
          {showPastOrders ? t('orders.emptyStatePastOrders') : t('orders.emptyStateUpcomingOrders')}
        </Text>
      </Box>
    );
  };

  return (
    <SafeAreaView testID="orders-screen" style={styles.container}>
      <VStack space="lg" className="flex-1 px-4 py-2">
        {/* Header */}
        <VStack space="md">
          <Heading size="2xl" className="text-typography-900">
            {t('orders.title')}
          </Heading>

          {/* Filter Button */}
          <HStack space="sm" className="items-center">
            <Button
              size="sm"
              variant={showPastOrders ? 'solid' : 'outline'}
              action="secondary"
              onPress={handleToggleFilter}
              testID="orders-filter-button"
            >
              <Filter size={16} color={showPastOrders ? '#ffffff' : '#6B7280'} />
              <ButtonText className="ml-2">
                {showPastOrders ? t('orders.showingPastOrders') : t('orders.showPastOrders')}
              </ButtonText>
            </Button>

            {!isLoading && orders.length > 0 && (
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
            ListEmptyComponent={renderEmpty}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={onRefresh}
                testID="orders-refresh-control"
              />
            }
            testID="orders-list"
          />
        </Box>
      </VStack>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
});
