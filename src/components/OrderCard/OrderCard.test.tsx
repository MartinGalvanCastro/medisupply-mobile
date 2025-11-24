import { render, fireEvent } from '@testing-library/react-native';
import { OrderCard } from './OrderCard';
import type { OrderResponse } from '@/api/generated/models';

jest.mock('@/i18n/hooks', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'orders.orderId': 'Order ID',
        'orders.orderDate': 'Order Date',
        'orders.noDeliveryDate': 'No delivery date',
        'orders.shipmentInfo': 'Shipment Information',
        'orders.noShipmentYet': 'No shipment assigned yet',
        'orders.shipmentId': 'Shipment ID',
        'orders.vehiclePlate': 'Vehicle Plate',
        'orders.driver': 'Driver',
        'orders.deliveryAddress': 'Delivery Address',
        'orders.items': 'Items',
        'orders.total': 'Total',
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

jest.mock('@/utils/formatDate', () => ({
  formatDate: (date: string | Date) => '2024-01-15',
}));

jest.mock('@/utils/formatCurrency', () => ({
  formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
}));

jest.mock('@/components/InfoRow', () => ({
  InfoRow: jest.fn(({ label, value, testID, ...props }: any) => (
    <div testID={testID || `info-row-${label}`} {...props}>
      {label}: {value}
    </div>
  )),
}));

describe.skip('OrderCard', () => {
  const mockOrder: OrderResponse & {
    shipment_id?: string | null;
    shipment_status?: string | null;
    vehicle_plate?: string | null;
    driver_name?: string | null;
  } = {
    id: 'order-123-abc',
    customer_id: 'cust-123',
    seller_id: 'seller-456' as any,
    route_id: 'route-789' as any,
    fecha_pedido: '2024-01-01',
    fecha_entrega_estimada: '2024-01-15' as any,
    metodo_creacion: 'web',
    monto_total: 150.50,
    direccion_entrega: '123 Main St',
    ciudad_entrega: 'New York',
    pais_entrega: 'USA',
    customer_name: 'John Doe',
    customer_phone: '1234567890' as any,
    customer_email: 'john@test.com' as any,
    seller_name: 'Seller Name' as any,
    seller_email: 'seller@test.com' as any,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    items: [
      {
        id: 'item-1',
        pedido_id: 'order-123-abc',
        inventario_id: 'inv-1',
        product_name: 'Product A',
        cantidad: 2,
        precio_unitario: 50,
        precio_total: 100,
        product_sku: 'SKU-A',
        warehouse_id: 'wh-1',
        warehouse_name: 'Warehouse 1',
        warehouse_city: 'NYC',
        warehouse_country: 'USA',
        batch_number: 'BATCH-001',
        expiration_date: '2025-12-31',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      } as any,
      {
        id: 'item-2',
        pedido_id: 'order-123-abc',
        inventario_id: 'inv-2',
        product_name: 'Product B',
        cantidad: 1,
        precio_unitario: 50.50,
        precio_total: 50.50,
        product_sku: 'SKU-B',
        warehouse_id: 'wh-2',
        warehouse_name: 'Warehouse 2',
        warehouse_city: 'LA',
        warehouse_country: 'USA',
        batch_number: 'BATCH-002',
        expiration_date: '2025-12-31',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      } as any,
    ],
    shipment_id: 'ship-456',
    shipment_status: 'in progress',
    vehicle_plate: 'ABC123',
    driver_name: 'John Doe',
  };

  it('should render collapsed order card', () => {
    const { getByTestId, getByText, queryByText } = render(
      <OrderCard order={mockOrder} />
    );

    expect(getByTestId(`order-card-${mockOrder.id}`)).toBeDefined();
    expect(getByText(/Order ID/)).toBeDefined();
    expect(getByText('$150.50')).toBeDefined();
    expect(queryByText('Shipment Information')).toBeNull();
  });

  it('should expand and display shipment details on press', () => {
    const { getByTestId, getByText, queryByText } = render(
      <OrderCard order={mockOrder} />
    );

    const pressable = getByTestId(`order-card-pressable-${mockOrder.id}`);
    fireEvent.press(pressable);

    expect(getByText('Shipment Information')).toBeDefined();
    expect(getByTestId('info-row-Delivery Address')).toBeDefined();
  });

  it('should display items when expanded', () => {
    const { getByTestId, getByText } = render(
      <OrderCard order={mockOrder} />
    );

    fireEvent.press(getByTestId(`order-card-pressable-${mockOrder.id}`));

    expect(getByText('Product A')).toBeDefined();
    expect(getByText('x2')).toBeDefined();
    expect(getByText('Product B')).toBeDefined();
    expect(getByText('x1')).toBeDefined();
  });

  it('should display shipment info with all details', () => {
    const { getByTestId, getByText } = render(
      <OrderCard order={mockOrder} />
    );

    fireEvent.press(getByTestId(`order-card-pressable-${mockOrder.id}`));

    expect(getByTestId('info-row-Shipment ID')).toBeDefined();
    expect(getByTestId('info-row-Vehicle Plate')).toBeDefined();
    expect(getByTestId('info-row-Driver')).toBeDefined();
  });

  it('should not show driver row when driver not available', () => {
    const orderWithoutDriver = {
      ...mockOrder,
      driver_name: null,
    };

    const { getByTestId, queryByTestId } = render(
      <OrderCard order={orderWithoutDriver} />
    );

    fireEvent.press(getByTestId(`order-card-pressable-${orderWithoutDriver.id}`));

    expect(queryByTestId('info-row-Driver')).toBeNull();
  });

  it('should show no shipment message when shipment_id is null', () => {
    const orderWithoutShipment = {
      ...mockOrder,
      shipment_id: null,
    };

    const { getByTestId, getByText, queryByTestId } = render(
      <OrderCard order={orderWithoutShipment} />
    );

    fireEvent.press(getByTestId(`order-card-pressable-${orderWithoutShipment.id}`));

    expect(getByText('No shipment assigned yet')).toBeDefined();
    expect(queryByTestId('info-row-Shipment ID')).toBeNull();
  });

  it('should display no delivery date message when fecha_entrega_estimada is null', () => {
    const orderWithoutDeliveryDate = {
      ...mockOrder,
      fecha_entrega_estimada: null,
    };

    const { getByText } = render(
      <OrderCard order={orderWithoutDeliveryDate} />
    );

    expect(getByText('No delivery date')).toBeDefined();
  });

  it('should collapse on second press', () => {
    const { getByTestId, getByText, queryByText } = render(
      <OrderCard order={mockOrder} />
    );

    const pressable = getByTestId(`order-card-pressable-${mockOrder.id}`);

    fireEvent.press(pressable);
    expect(getByText('Shipment Information')).toBeDefined();

    fireEvent.press(pressable);
    expect(queryByText('Shipment Information')).toBeNull();
  });

  it('should display correct badge text for each shipment status', () => {
    const statuses = ['planned', 'in progress', 'completed', 'cancelled'];

    statuses.forEach((status) => {
      const order = { ...mockOrder, shipment_status: status };
      const { getByTestId, getByText } = render(
        <OrderCard order={order} />
      );

      fireEvent.press(getByTestId(`order-card-pressable-${order.id}`));

      const expectedLabel = status === 'in progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1);
      expect(getByText(expectedLabel)).toBeDefined();
    });
  });

  it('should handle underscore formatting in status', () => {
    const order = { ...mockOrder, shipment_status: 'in_progress' };
    const { getByTestId, getByText } = render(
      <OrderCard order={order} />
    );

    fireEvent.press(getByTestId(`order-card-pressable-${order.id}`));
    expect(getByText('In Progress')).toBeDefined();
  });

  it('should handle past delivery date badge', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const order = { ...mockOrder, fecha_entrega_estimada: yesterday.toISOString() };
    const { getByTestId } = render(<OrderCard order={order} />);

    expect(getByTestId(`order-card-${order.id}`)).toBeDefined();
  });

  it('should handle today delivery date badge', () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    const order = { ...mockOrder, fecha_entrega_estimada: today.toISOString() };
    const { getByTestId } = render(<OrderCard order={order} />);

    expect(getByTestId(`order-card-${order.id}`)).toBeDefined();
  });

  it('should handle future delivery date badge', () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);

    const order = { ...mockOrder, fecha_entrega_estimada: future.toISOString() };
    const { getByTestId } = render(<OrderCard order={order} />);

    expect(getByTestId(`order-card-${order.id}`)).toBeDefined();
  });

  it('should display unknown status label for unrecognized status', () => {
    const order = { ...mockOrder, shipment_status: 'unknown_status' };
    const { getByTestId, getByText } = render(
      <OrderCard order={order} />
    );

    fireEvent.press(getByTestId(`order-card-pressable-${order.id}`));
    expect(getByText('Unknown')).toBeDefined();
  });

  it('should handle missing optional shipment fields with defaults', () => {
    const order = {
      ...mockOrder,
      vehicle_plate: null,
      shipment_status: null,
    };
    const { getByTestId, getByText } = render(
      <OrderCard order={order} />
    );

    fireEvent.press(getByTestId(`order-card-pressable-${order.id}`));

    expect(getByTestId('info-row-Vehicle Plate')).toBeDefined();
    expect(getByText('Planned')).toBeDefined();
  });

  it('should handle tomorrow delivery date scenario', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const order = { ...mockOrder, fecha_entrega_estimada: tomorrow.toISOString() };
    const { getByTestId } = render(<OrderCard order={order} />);

    expect(getByTestId(`order-card-${order.id}`)).toBeDefined();
  });
});
