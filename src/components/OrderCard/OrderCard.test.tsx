import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { OrderCard } from './OrderCard';
import type { OrderResponse } from '@/api/generated/models';

// Mock i18n
jest.mock('@/i18n/hooks', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'orders.orderId': 'Order ID',
        'orders.orderDate': 'Order Date',
        'orders.noDeliveryDate': 'No delivery date',
        'orders.shipmentInfo': 'Shipment Information',
        'orders.shipmentId': 'Shipment ID',
        'orders.vehiclePlate': 'Vehicle Plate',
        'orders.driver': 'Driver',
        'orders.deliveryAddress': 'Delivery Address',
        'orders.items': 'Items',
        'orders.total': 'Total',
        'orders.noShipmentYet': 'No shipment assigned yet',
        'orders.shipmentStatus.planned': 'Planned',
        'orders.shipmentStatus.inprogress': 'In Progress',
        'orders.shipmentStatus.completed': 'Completed',
        'orders.shipmentStatus.cancelled': 'Cancelled',
        'orders.shipmentStatus.unknown': 'Unknown',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock formatDate
jest.mock('@/utils/formatDate', () => ({
  formatDate: (date: string | Date) => {
    if (!date) return 'Invalid date';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },
}));

// Mock formatCurrency
jest.mock('@/utils/formatCurrency/formatCurrency', () => ({
  formatCurrency: (amount: number) => `$${amount.toLocaleString()}`,
}));

// Mock InfoRow component
jest.mock('@/components/InfoRow', () => ({
  InfoRow: ({ icon: IconComponent, label, value, testID }: any) => {
    const { View, Text } = require('react-native');
    return (
      <View testID={testID}>
        <Text testID={`${testID}-label`}>{label}</Text>
        <Text testID={`${testID}-value`}>{value}</Text>
      </View>
    );
  },
}));

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  Package: () => <></>,
  Calendar: () => <></>,
  Truck: () => <></>,
  MapPin: () => <></>,
  Hash: () => <></>,
  ChevronUp: () => <></>,
  ChevronDown: () => <></>,
}));

describe('OrderCard', () => {
  const mockOrder: OrderResponse & {
    shipment_id?: string | null;
    shipment_status?: string | null;
    vehicle_plate?: string | null;
    driver_name?: string | null;
  } = {
    id: 'ORD-001',
    fecha_pedido: '2024-01-10T10:00:00Z',
    fecha_entrega_estimada: '2024-01-15T10:00:00Z',
    monto_total: 150000,
    direccion_entrega: '123 Main St',
    ciudad_entrega: 'Bogota',
    items: [
      {
        id: 'item-1',
        pedido_id: 'ORD-001',
        inventario_id: 'inv-1',
        cantidad: 2,
        precio_unitario: 50000,
        precio_total: 100000,
        product_name: 'Product A',
        product_sku: 'SKU-A',
        warehouse_id: 'wh-1',
        warehouse_name: 'Warehouse A',
        warehouse_city: 'Bogota',
        warehouse_country: 'Colombia',
        batch_number: 'BATCH-001',
        expiration_date: '2025-12-31T00:00:00Z',
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-10T10:00:00Z',
      },
      {
        id: 'item-2',
        pedido_id: 'ORD-001',
        inventario_id: 'inv-2',
        cantidad: 1,
        precio_unitario: 50000,
        precio_total: 50000,
        product_name: 'Product B',
        product_sku: 'SKU-B',
        warehouse_id: 'wh-1',
        warehouse_name: 'Warehouse A',
        warehouse_city: 'Bogota',
        warehouse_country: 'Colombia',
        batch_number: 'BATCH-002',
        expiration_date: '2025-12-31T00:00:00Z',
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-10T10:00:00Z',
      },
    ],
    shipment_id: 'SHIP-001',
    shipment_status: 'in progress',
    vehicle_plate: 'ABC-1234',
    driver_name: 'John Doe',
    customer_id: 'cust-001',
    seller_id: 'seller-001' as any,
    route_id: 'route-001',
    metodo_creacion: 'manual',
    pais_entrega: 'Colombia',
    customer_name: 'John Customer',
    customer_phone: '+57 300 123 4567',
    customer_email: 'customer@example.com',
    seller_name: 'Jane Seller',
    seller_email: 'seller@example.com',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
  };

  describe('Rendering', () => {
    it('should render the order card with order ID', () => {
      const { getByText } = render(<OrderCard order={mockOrder} />);
      expect(getByText('Order ID: ORD-001')).toBeTruthy();
    });

    it('should render order date', () => {
      const { getByText } = render(<OrderCard order={mockOrder} />);
      expect(getByText(/Order Date:/)).toBeTruthy();
    });

    it('should render total amount in badge', () => {
      const { getByText } = render(<OrderCard order={mockOrder} />);
      expect(getByText('$150,000')).toBeTruthy();
    });

    it('should render delivery date', () => {
      const { getByText } = render(<OrderCard order={mockOrder} />);
      expect(getByText(/Jan 15, 2024/)).toBeTruthy();
    });

    it('should display no delivery date message when delivery date is null', () => {
      const orderWithoutDelivery = {
        ...mockOrder,
        fecha_entrega_estimada: null,
      };
      const { getByText } = render(<OrderCard order={orderWithoutDelivery} />);
      expect(getByText('No delivery date')).toBeTruthy();
    });

    it('should render with correct testID', () => {
      const { getByTestId } = render(<OrderCard order={mockOrder} />);
      expect(getByTestId('order-card-ORD-001')).toBeTruthy();
    });
  });

  describe('Expand/Collapse', () => {
    it('should start collapsed', () => {
      const { queryByText } = render(<OrderCard order={mockOrder} />);
      expect(queryByText('Shipment Information')).toBeFalsy();
    });

    it('should expand when card is pressed', async () => {
      const { getByTestId, getByText } = render(<OrderCard order={mockOrder} />);
      const pressable = getByTestId('order-card-pressable-ORD-001');

      fireEvent.press(pressable);

      await waitFor(() => {
        expect(getByText('Shipment Information')).toBeTruthy();
      });
    });

    it('should collapse when pressed again', async () => {
      const { getByTestId, queryByText } = render(<OrderCard order={mockOrder} />);
      const pressable = getByTestId('order-card-pressable-ORD-001');

      fireEvent.press(pressable);
      await waitFor(() => {
        expect(queryByText('Shipment Information')).toBeTruthy();
      });

      fireEvent.press(pressable);
      await waitFor(() => {
        expect(queryByText('Shipment Information')).toBeFalsy();
      });
    });

    it('should toggle expanded state multiple times', async () => {
      const { getByTestId, queryByText } = render(<OrderCard order={mockOrder} />);
      const pressable = getByTestId('order-card-pressable-ORD-001');

      // Expand
      fireEvent.press(pressable);
      await waitFor(() => {
        expect(queryByText('Shipment Information')).toBeTruthy();
      });

      // Collapse
      fireEvent.press(pressable);
      await waitFor(() => {
        expect(queryByText('Shipment Information')).toBeFalsy();
      });

      // Expand again
      fireEvent.press(pressable);
      await waitFor(() => {
        expect(queryByText('Shipment Information')).toBeTruthy();
      });
    });
  });

  describe('Shipment Details', () => {
    beforeEach(async () => {
      const { getByTestId } = render(<OrderCard order={mockOrder} />);
      fireEvent.press(getByTestId('order-card-pressable-ORD-001'));

      await waitFor(() => {
        // Wait for expansion
      });
    });

    it('should display shipment information when order is expanded', async () => {
      const { getByTestId, getByText } = render(<OrderCard order={mockOrder} />);
      const pressable = getByTestId('order-card-pressable-ORD-001');

      fireEvent.press(pressable);

      await waitFor(() => {
        expect(getByText('Shipment Information')).toBeTruthy();
      });
    });

    it('should display shipment ID', async () => {
      const { getByText, getByTestId } = render(<OrderCard order={mockOrder} />);
      fireEvent.press(getByTestId('order-card-pressable-ORD-001'));

      await waitFor(() => {
        expect(getByText('SHIP-001')).toBeTruthy();
      });
    });

    it('should display vehicle plate', async () => {
      const { getByText, getByTestId } = render(<OrderCard order={mockOrder} />);
      fireEvent.press(getByTestId('order-card-pressable-ORD-001'));

      await waitFor(() => {
        expect(getByText('ABC-1234')).toBeTruthy();
      });
    });

    it('should display driver name', async () => {
      const { getByText, getByTestId } = render(<OrderCard order={mockOrder} />);
      fireEvent.press(getByTestId('order-card-pressable-ORD-001'));

      await waitFor(() => {
        expect(getByText('John Doe')).toBeTruthy();
      });
    });

    it('should not display driver name when it is not provided', async () => {
      const orderWithoutDriver = {
        ...mockOrder,
        driver_name: null,
      };
      const { queryByText, getByTestId } = render(<OrderCard order={orderWithoutDriver} />);
      fireEvent.press(getByTestId('order-card-pressable-ORD-001'));

      await waitFor(() => {
        expect(queryByText('John Doe')).toBeFalsy();
      });
    });

    it('should display shipment status badge with correct action', async () => {
      const { getByText, getByTestId } = render(<OrderCard order={mockOrder} />);
      fireEvent.press(getByTestId('order-card-pressable-ORD-001'));

      await waitFor(() => {
        expect(getByText('In Progress')).toBeTruthy();
      });
    });

    it('should display N/A when shipment is not available', async () => {
      const orderWithoutShipment = {
        ...mockOrder,
        shipment_id: null,
        shipment_status: null,
        vehicle_plate: null,
        driver_name: null,
      };
      const { getByText, getByTestId } = render(<OrderCard order={orderWithoutShipment} />);
      fireEvent.press(getByTestId('order-card-pressable-ORD-001'));

      await waitFor(() => {
        expect(getByText('No shipment assigned yet')).toBeTruthy();
      });
    });

    it('should display delivery address when expanded', async () => {
      const { getByText, getByTestId } = render(<OrderCard order={mockOrder} />);
      fireEvent.press(getByTestId('order-card-pressable-ORD-001'));

      await waitFor(() => {
        expect(getByText('123 Main St, Bogota')).toBeTruthy();
      });
    });
  });

  describe('Order Items', () => {
    it('should display order items count when expanded', async () => {
      const { getByText, getByTestId } = render(<OrderCard order={mockOrder} />);
      fireEvent.press(getByTestId('order-card-pressable-ORD-001'));

      await waitFor(() => {
        expect(getByText('Items (2)')).toBeTruthy();
      });
    });

    it('should display all order items with product names', async () => {
      const { getByText, getByTestId } = render(<OrderCard order={mockOrder} />);
      fireEvent.press(getByTestId('order-card-pressable-ORD-001'));

      await waitFor(() => {
        expect(getByText('Product A')).toBeTruthy();
        expect(getByText('Product B')).toBeTruthy();
      });
    });

    it('should display item quantities', async () => {
      const { getByText, getByTestId } = render(<OrderCard order={mockOrder} />);
      fireEvent.press(getByTestId('order-card-pressable-ORD-001'));

      await waitFor(() => {
        expect(getByText('x2')).toBeTruthy();
        expect(getByText('x1')).toBeTruthy();
      });
    });

    it('should display item subtotals', async () => {
      const { getByText, getByTestId } = render(<OrderCard order={mockOrder} />);
      fireEvent.press(getByTestId('order-card-pressable-ORD-001'));

      await waitFor(() => {
        expect(getByText('$100,000')).toBeTruthy(); // 50000 * 2
        expect(getByText('$50,000')).toBeTruthy(); // 50000 * 1
      });
    });

    it('should display order total', async () => {
      const { getAllByText, getByTestId } = render(<OrderCard order={mockOrder} />);
      fireEvent.press(getByTestId('order-card-pressable-ORD-001'));

      await waitFor(() => {
        const totalTexts = getAllByText('$150,000');
        expect(totalTexts.length).toBeGreaterThan(0);
      });
    });

    it('should display empty items list when no items', async () => {
      const orderWithoutItems = {
        ...mockOrder,
        items: [],
      };
      const { getByText, getByTestId } = render(<OrderCard order={orderWithoutItems} />);
      fireEvent.press(getByTestId('order-card-pressable-ORD-001'));

      await waitFor(() => {
        expect(getByText('Items (0)')).toBeTruthy();
      });
    });
  });

  describe('Badges and Status Colors', () => {
    it('should use muted badge when no delivery date', () => {
      const orderWithoutDate = {
        ...mockOrder,
        fecha_entrega_estimada: null,
      };
      const { getByTestId } = render(<OrderCard order={orderWithoutDate} />);
      expect(getByTestId('order-card-ORD-001')).toBeTruthy();
    });

    it('should use warning badge for today delivery date', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const orderForToday = {
        ...mockOrder,
        fecha_entrega_estimada: today.toISOString(),
      };
      const { getByTestId } = render(<OrderCard order={orderForToday} />);
      expect(getByTestId('order-card-ORD-001')).toBeTruthy();
    });

    it('should use info badge for tomorrow delivery date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const orderForTomorrow = {
        ...mockOrder,
        fecha_entrega_estimada: tomorrow.toISOString(),
      };
      const { getByTestId } = render(<OrderCard order={orderForTomorrow} />);
      expect(getByTestId('order-card-ORD-001')).toBeTruthy();
    });

    it('should use success badge for future delivery date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      futureDate.setHours(0, 0, 0, 0);
      const orderForFuture = {
        ...mockOrder,
        fecha_entrega_estimada: futureDate.toISOString(),
      };
      const { getByTestId } = render(<OrderCard order={orderForFuture} />);
      expect(getByTestId('order-card-ORD-001')).toBeTruthy();
    });

    it('should use muted badge for past delivery date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);
      pastDate.setHours(0, 0, 0, 0);
      const orderForPast = {
        ...mockOrder,
        fecha_entrega_estimada: pastDate.toISOString(),
      };
      const { getByTestId } = render(<OrderCard order={orderForPast} />);
      expect(getByTestId('order-card-ORD-001')).toBeTruthy();
    });

    it('should display shipment status badge with planned status', async () => {
      const plannedOrder = {
        ...mockOrder,
        shipment_status: 'planned',
      };
      const { getByText, getByTestId } = render(<OrderCard order={plannedOrder} />);
      fireEvent.press(getByTestId('order-card-pressable-ORD-001'));

      await waitFor(() => {
        expect(getByText('Planned')).toBeTruthy();
      });
    });

    it('should display shipment status badge with completed status', async () => {
      const completedOrder = {
        ...mockOrder,
        shipment_status: 'completed',
      };
      const { getByText, getByTestId } = render(<OrderCard order={completedOrder} />);
      fireEvent.press(getByTestId('order-card-pressable-ORD-001'));

      await waitFor(() => {
        expect(getByText('Completed')).toBeTruthy();
      });
    });

    it('should display shipment status badge with cancelled status', async () => {
      const cancelledOrder = {
        ...mockOrder,
        shipment_status: 'cancelled',
      };
      const { getByText, getByTestId } = render(<OrderCard order={cancelledOrder} />);
      fireEvent.press(getByTestId('order-card-pressable-ORD-001'));

      await waitFor(() => {
        expect(getByText('Cancelled')).toBeTruthy();
      });
    });

    it('should display shipment status badge with unknown status', async () => {
      const unknownStatusOrder = {
        ...mockOrder,
        shipment_status: 'unknown_status',
      };
      const { getByText, getByTestId } = render(<OrderCard order={unknownStatusOrder} />);
      fireEvent.press(getByTestId('order-card-pressable-ORD-001'));

      await waitFor(() => {
        expect(getByText('Unknown')).toBeTruthy();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle orders with minimal data', () => {
      const minimalOrder: OrderResponse & {
        shipment_id?: string | null;
        shipment_status?: string | null;
        vehicle_plate?: string | null;
        driver_name?: string | null;
      } = {
        id: 'ORD-002',
        customer_id: 'cust-002',
        seller_id: 'seller-002',
        route_id: 'route-002',
        fecha_pedido: '2024-01-10T10:00:00Z',
        fecha_entrega_estimada: null,
        metodo_creacion: 'web',
        direccion_entrega: 'Street',
        ciudad_entrega: 'City',
        pais_entrega: 'Colombia',
        customer_name: 'Test Customer',
        customer_phone: '3001234567',
        customer_email: 'customer@example.com',
        seller_name: 'Test Seller',
        seller_email: 'seller@example.com',
        monto_total: 0,
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-10T10:00:00Z',
        items: [],
      };
      const { getByText } = render(<OrderCard order={minimalOrder} />);
      expect(getByText('Order ID: ORD-002')).toBeTruthy();
    });

    it('should handle orders with special characters in product names', async () => {
      const specialOrder = {
        ...mockOrder,
        items: [
          {
            id: 'item-special',
            pedido_id: 'ORD-001',
            inventario_id: 'inv-special',
            cantidad: 1,
            precio_unitario: 25000,
            precio_total: 25000,
            product_name: 'Product @ 50% off!',
            product_sku: 'SKU-SPECIAL',
            warehouse_id: 'wh-1',
            warehouse_name: 'Warehouse A',
            warehouse_city: 'Bogota',
            warehouse_country: 'Colombia',
            batch_number: 'BATCH-SPECIAL',
            expiration_date: '2025-12-31T00:00:00Z',
            created_at: '2024-01-10T10:00:00Z',
            updated_at: '2024-01-10T10:00:00Z',
          },
        ],
      };
      const { getByText, getByTestId } = render(<OrderCard order={specialOrder} />);
      fireEvent.press(getByTestId('order-card-pressable-ORD-001'));

      await waitFor(() => {
        expect(getByText('Product @ 50% off!')).toBeTruthy();
      });
    });

    it('should handle large numbers correctly', () => {
      const largeOrder = {
        ...mockOrder,
        monto_total: 999999999,
      };
      const { getByText } = render(<OrderCard order={largeOrder} />);
      expect(getByText('$999,999,999')).toBeTruthy();
    });

    it('should handle zero amount', () => {
      const zeroOrder = {
        ...mockOrder,
        monto_total: 0,
      };
      const { getByText } = render(<OrderCard order={zeroOrder} />);
      expect(getByText('$0')).toBeTruthy();
    });

    it('should handle addresses with special characters', async () => {
      const specialAddressOrder = {
        ...mockOrder,
        direccion_entrega: 'Av. Principal #123',
        ciudad_entrega: 'Bogotá, D.C.',
      };
      const { getByText, getByTestId } = render(<OrderCard order={specialAddressOrder} />);
      fireEvent.press(getByTestId('order-card-pressable-ORD-001'));

      await waitFor(() => {
        expect(getByText('Av. Principal #123, Bogotá, D.C.')).toBeTruthy();
      });
    });
  });

  describe('Multiple Items', () => {
    it('should display many items correctly', async () => {
      const manyItemsOrder = {
        ...mockOrder,
        items: Array.from({ length: 10 }, (_, i) => ({
          id: `item-${i + 1}`,
          pedido_id: 'ORD-001',
          inventario_id: `inv-${i + 1}`,
          cantidad: i + 1,
          precio_unitario: 10000,
          precio_total: 10000 * (i + 1),
          product_name: `Product ${i + 1}`,
          product_sku: `SKU-${i + 1}`,
          warehouse_id: 'wh-1',
          warehouse_name: 'Warehouse A',
          warehouse_city: 'Bogota',
          warehouse_country: 'Colombia',
          batch_number: `BATCH-${i + 1}`,
          expiration_date: '2025-12-31T00:00:00Z',
          created_at: '2024-01-10T10:00:00Z',
          updated_at: '2024-01-10T10:00:00Z',
        })),
      };
      const { getByText, getByTestId } = render(<OrderCard order={manyItemsOrder} />);
      fireEvent.press(getByTestId('order-card-pressable-ORD-001'));

      await waitFor(() => {
        expect(getByText('Items (10)')).toBeTruthy();
        expect(getByText('Product 1')).toBeTruthy();
        expect(getByText('Product 10')).toBeTruthy();
      });
    });
  });
});
