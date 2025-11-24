import { Pressable, StyleSheet } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Divider } from '@/components/ui/divider';
import { InfoRow } from '@/components/InfoRow';
import { useTranslation } from '@/i18n/hooks';
import { formatDate } from '@/utils/formatDate';
import { formatCurrency } from '@/utils/formatCurrency';
import type { OrderResponse } from '@/api/generated/models';
import {
  Package,
  Calendar,
  Truck,
  ChevronDown,
  ChevronUp,
  MapPin,
  Hash,
} from 'lucide-react-native';
import { useState } from 'react';

interface OrderCardProps {
  order: OrderResponse;
}

const getOrderStatusBadgeAction = (
  deliveryDate: string | null | undefined
): 'info' | 'success' | 'warning' | 'error' | 'muted' => {
  if (!deliveryDate) return 'muted';

  const delivery = new Date(deliveryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  delivery.setHours(0, 0, 0, 0);

  const diffTime = delivery.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'muted'; // Past
  if (diffDays === 0) return 'warning'; // Today
  if (diffDays === 1) return 'info'; // Tomorrow
  return 'success'; // Future
};

const getShipmentStatusBadgeAction = (
  status: string
): 'info' | 'success' | 'warning' | 'error' | 'muted' => {
  const statusMap: Record<string, 'info' | 'success' | 'warning' | 'error' | 'muted'> = {
    planned: 'info',
    'in progress': 'warning',
    completed: 'success',
    cancelled: 'error',
  };
  return statusMap[status.toLowerCase()] || 'muted';
};

const getShipmentStatusLabel = (status: string, t: any): string => {
  const statusKey = status.toLowerCase().replace(/[_\s]/g, '');

  const statusMap: Record<string, string> = {
    'planned': t('orders.shipmentStatus.planned'),
    'inprogress': t('orders.shipmentStatus.inprogress'),
    'completed': t('orders.shipmentStatus.completed'),
    'cancelled': t('orders.shipmentStatus.cancelled'),
  };

  return statusMap[statusKey] || t('orders.shipmentStatus.unknown');
};

export const OrderCard = ({ order }: OrderCardProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Use shipment data from order or show as not available
  const hasShipment = !!order.shipment?.shipment_id;
  const shipment = order.shipment ? {
    shipmentId: order.shipment.shipment_id,
    vehiclePlate: order.shipment.vehicle_plate || 'N/A',
    status: order.shipment.shipment_status,
    driverName: order.shipment.driver_name || 'N/A',
  } : null;
  const deliveryDate = order.fecha_entrega_estimada
    ? new Date(order.fecha_entrega_estimada)
    : null;

  return (
    <Card variant="elevated" className="bg-white my-2" testID={`order-card-${order.id}`}>
      <Pressable
        onPress={() => setIsExpanded(!isExpanded)}
        testID={`order-card-pressable-${order.id}`}
        style={styles.pressable}
      >
        <VStack space="md" className="p-4">
          {/* Header */}
          <HStack className="justify-between items-start">
            <VStack space="xs" className="flex-1">
              <HStack space="xs" className="items-center">
                <Package size={16} color="#6b7280" />
                <Text className="font-semibold text-typography-900">
                  {t('orders.orderId')}: #{order.id.slice(0, 8).toUpperCase()}
                </Text>
              </HStack>
              <Text className="text-sm text-typography-600">
                {t('orders.orderDate')}: {formatDate(order.fecha_pedido)}
              </Text>
            </VStack>
            {isExpanded ? (
              <ChevronUp size={20} color="#6b7280" />
            ) : (
              <ChevronDown size={20} color="#6b7280" />
            )}
          </HStack>

          {/* Delivery Date & Total */}
          <HStack className="justify-between items-center">
            <HStack space="xs" className="items-center">
              <Calendar size={16} color="#6b7280" />
              <Text className="text-sm text-typography-700">
                {deliveryDate
                  ? formatDate(deliveryDate.toISOString())
                  : t('orders.noDeliveryDate')}
              </Text>
            </HStack>
            <Badge
              action={getOrderStatusBadgeAction(order.fecha_entrega_estimada)}
              variant="solid"
              size="sm"
            >
              <BadgeText>{formatCurrency(order.monto_total)}</BadgeText>
            </Badge>
          </HStack>

          {/* Expanded Section - Shipment Details */}
          {isExpanded && (
            <>
              <Divider className="my-2" />

              <VStack space="md">
                {hasShipment && shipment ? (
                  <>
                    <HStack className="justify-between items-center">
                      <Text className="text-sm font-semibold text-typography-700 uppercase tracking-wide">
                        {t('orders.shipmentInfo')}
                      </Text>
                      <Badge
                        action={getShipmentStatusBadgeAction(shipment.status)}
                        variant="solid"
                        size="sm"
                      >
                        <BadgeText className="capitalize">{getShipmentStatusLabel(shipment.status, t)}</BadgeText>
                      </Badge>
                    </HStack>

                    <InfoRow
                      icon={Hash}
                      label={t('orders.shipmentId')}
                      value={shipment.shipmentId}
                    />

                    <InfoRow
                      icon={Truck}
                      label={t('orders.vehiclePlate')}
                      value={shipment.vehiclePlate}
                    />

                    {shipment.driverName !== 'N/A' && (
                      <InfoRow
                        icon={Truck}
                        label={t('orders.driver')}
                        value={shipment.driverName}
                      />
                    )}
                  </>
                ) : (
                  <>
                    <Text className="text-sm font-semibold text-typography-700 uppercase tracking-wide">
                      {t('orders.shipmentInfo')}
                    </Text>
                    <Text className="text-sm text-typography-500">
                      {t('orders.noShipmentYet')}
                    </Text>
                  </>
                )}

                <InfoRow
                  icon={MapPin}
                  label={t('orders.deliveryAddress')}
                  value={`${order.direccion_entrega}, ${order.ciudad_entrega}`}
                />

                {/* Order Items */}
                <Divider className="my-2" />

                <Text className="text-sm font-semibold text-typography-700 uppercase tracking-wide">
                  {t('orders.items')} ({order.items.length})
                </Text>

                <VStack space="xs">
                  {order.items.map((item, index) => (
                    <VStack key={index} space="xs">
                      <HStack className="justify-between items-center py-1">
                        <Text className="text-sm text-typography-700 flex-1">
                          {item.product_name}
                        </Text>
                        <HStack space="md" className="items-center">
                          <Text className="text-sm text-typography-600">
                            x{item.cantidad}
                          </Text>
                          <Text className="text-sm font-medium text-typography-900 min-w-[80px] text-right">
                            {formatCurrency(item.precio_unitario * item.cantidad)}
                          </Text>
                        </HStack>
                      </HStack>
                      {index < order.items.length - 1 && <Divider />}
                    </VStack>
                  ))}
                </VStack>

                <Divider className="my-1" />

                <HStack className="justify-between items-center">
                  <Text className="font-semibold text-typography-900">
                    {t('orders.total')}
                  </Text>
                  <Text className="font-bold text-lg text-primary-600">
                    {formatCurrency(order.monto_total)}
                  </Text>
                </HStack>
              </VStack>
            </>
          )}
        </VStack>
      </Pressable>
    </Card>
  );
};

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
});
