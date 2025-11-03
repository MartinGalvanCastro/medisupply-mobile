import type { MockProduct } from './products';
import { mockProducts } from './products';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface MockOrderItem {
  id: string;
  product_id: string;
  product: MockProduct;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface MockOrder {
  id: string;
  client_id: string;
  order_date: string;
  delivery_date: string;
  status: OrderStatus;
  items: MockOrderItem[];
  total: number;
  route_id?: string;
}

const today = new Date();

const createOrderDate = (daysAgo: number): string => {
  const date = new Date(today);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

const createDeliveryDate = (orderDate: string, daysAfter: number): string => {
  const date = new Date(orderDate);
  date.setDate(date.getDate() + daysAfter);
  return date.toISOString();
};

export const mockOrders: MockOrder[] = [
  {
    id: 'ORD-001',
    client_id: '1',
    order_date: createOrderDate(5),
    delivery_date: createDeliveryDate(createOrderDate(5), 2),
    status: 'delivered',
    route_id: 'RT-001',
    items: [
      {
        id: 'ITEM-001',
        product_id: '1',
        product: mockProducts[0],
        quantity: 500,
        unit_price: 2500,
        subtotal: 1250000,
      },
      {
        id: 'ITEM-002',
        product_id: '3',
        product: mockProducts[2],
        quantity: 200,
        unit_price: 4500,
        subtotal: 900000,
      },
    ],
    total: 2150000,
  },
  {
    id: 'ORD-002',
    client_id: '1',
    order_date: createOrderDate(3),
    delivery_date: createDeliveryDate(createOrderDate(3), 2),
    status: 'shipped',
    route_id: 'RT-002',
    items: [
      {
        id: 'ITEM-003',
        product_id: '4',
        product: mockProducts[3],
        quantity: 300,
        unit_price: 8500,
        subtotal: 2550000,
      },
    ],
    total: 2550000,
  },
  {
    id: 'ORD-003',
    client_id: '1',
    order_date: createOrderDate(1),
    delivery_date: createDeliveryDate(createOrderDate(1), 1),
    status: 'confirmed',
    route_id: 'RT-003',
    items: [
      {
        id: 'ITEM-004',
        product_id: '6',
        product: mockProducts[5],
        quantity: 400,
        unit_price: 4200,
        subtotal: 1680000,
      },
      {
        id: 'ITEM-005',
        product_id: '8',
        product: mockProducts[7],
        quantity: 250,
        unit_price: 3800,
        subtotal: 950000,
      },
    ],
    total: 2630000,
  },
  {
    id: 'ORD-004',
    client_id: '2',
    order_date: createOrderDate(7),
    delivery_date: createDeliveryDate(createOrderDate(7), 2),
    status: 'delivered',
    route_id: 'RT-004',
    items: [
      {
        id: 'ITEM-006',
        product_id: '2',
        product: mockProducts[1],
        quantity: 350,
        unit_price: 3200,
        subtotal: 1120000,
      },
      {
        id: 'ITEM-007',
        product_id: '5',
        product: mockProducts[4],
        quantity: 180,
        unit_price: 6800,
        subtotal: 1224000,
      },
    ],
    total: 2344000,
  },
  {
    id: 'ORD-005',
    client_id: '3',
    order_date: createOrderDate(4),
    delivery_date: createDeliveryDate(createOrderDate(4), 1),
    status: 'shipped',
    route_id: 'RT-005',
    items: [
      {
        id: 'ITEM-008',
        product_id: '7',
        product: mockProducts[6],
        quantity: 150,
        unit_price: 15000,
        subtotal: 2250000,
      },
    ],
    total: 2250000,
  },
  {
    id: 'ORD-006',
    client_id: '3',
    order_date: createOrderDate(0),
    delivery_date: createDeliveryDate(createOrderDate(0), 2),
    status: 'pending',
    items: [
      {
        id: 'ITEM-009',
        product_id: '10',
        product: mockProducts[9],
        quantity: 200,
        unit_price: 18500,
        subtotal: 3700000,
      },
    ],
    total: 3700000,
  },
  {
    id: 'ORD-007',
    client_id: '4',
    order_date: createOrderDate(8),
    delivery_date: createDeliveryDate(createOrderDate(8), 2),
    status: 'delivered',
    route_id: 'RT-006',
    items: [
      {
        id: 'ITEM-010',
        product_id: '12',
        product: mockProducts[11],
        quantity: 280,
        unit_price: 5200,
        subtotal: 1456000,
      },
      {
        id: 'ITEM-011',
        product_id: '15',
        product: mockProducts[14],
        quantity: 320,
        unit_price: 4800,
        subtotal: 1536000,
      },
    ],
    total: 2992000,
  },
  {
    id: 'ORD-008',
    client_id: '5',
    order_date: createOrderDate(6),
    delivery_date: createDeliveryDate(createOrderDate(6), 1),
    status: 'delivered',
    route_id: 'RT-007',
    items: [
      {
        id: 'ITEM-012',
        product_id: '13',
        product: mockProducts[12],
        quantity: 220,
        unit_price: 7800,
        subtotal: 1716000,
      },
    ],
    total: 1716000,
  },
  {
    id: 'ORD-009',
    client_id: '6',
    order_date: createOrderDate(2),
    delivery_date: createDeliveryDate(createOrderDate(2), 2),
    status: 'confirmed',
    route_id: 'RT-008',
    items: [
      {
        id: 'ITEM-013',
        product_id: '14',
        product: mockProducts[13],
        quantity: 100,
        unit_price: 45000,
        subtotal: 4500000,
      },
      {
        id: 'ITEM-014',
        product_id: '16',
        product: mockProducts[15],
        quantity: 250,
        unit_price: 6500,
        subtotal: 1625000,
      },
    ],
    total: 6125000,
  },
  {
    id: 'ORD-010',
    client_id: '7',
    order_date: createOrderDate(3),
    delivery_date: createDeliveryDate(createOrderDate(3), 1),
    status: 'cancelled',
    items: [
      {
        id: 'ITEM-015',
        product_id: '17',
        product: mockProducts[16],
        quantity: 150,
        unit_price: 11500,
        subtotal: 1725000,
      },
    ],
    total: 1725000,
  },
  {
    id: 'ORD-011',
    client_id: '8',
    order_date: createOrderDate(9),
    delivery_date: createDeliveryDate(createOrderDate(9), 2),
    status: 'delivered',
    route_id: 'RT-009',
    items: [
      {
        id: 'ITEM-016',
        product_id: '18',
        product: mockProducts[17],
        quantity: 180,
        unit_price: 8900,
        subtotal: 1602000,
      },
      {
        id: 'ITEM-017',
        product_id: '20',
        product: mockProducts[19],
        quantity: 300,
        unit_price: 3500,
        subtotal: 1050000,
      },
    ],
    total: 2652000,
  },
  {
    id: 'ORD-012',
    client_id: '9',
    order_date: createOrderDate(5),
    delivery_date: createDeliveryDate(createOrderDate(5), 2),
    status: 'delivered',
    route_id: 'RT-010',
    items: [
      {
        id: 'ITEM-018',
        product_id: '22',
        product: mockProducts[21],
        quantity: 400,
        unit_price: 5800,
        subtotal: 2320000,
      },
    ],
    total: 2320000,
  },
  {
    id: 'ORD-013',
    client_id: '10',
    order_date: createOrderDate(1),
    delivery_date: createDeliveryDate(createOrderDate(1), 2),
    status: 'shipped',
    route_id: 'RT-011',
    items: [
      {
        id: 'ITEM-019',
        product_id: '23',
        product: mockProducts[22],
        quantity: 200,
        unit_price: 14500,
        subtotal: 2900000,
      },
      {
        id: 'ITEM-020',
        product_id: '25',
        product: mockProducts[24],
        quantity: 280,
        unit_price: 4500,
        subtotal: 1260000,
      },
    ],
    total: 4160000,
  },
  {
    id: 'ORD-014',
    client_id: '11',
    order_date: createOrderDate(4),
    delivery_date: createDeliveryDate(createOrderDate(4), 1),
    status: 'shipped',
    route_id: 'RT-012',
    items: [
      {
        id: 'ITEM-021',
        product_id: '9',
        product: mockProducts[8],
        quantity: 150,
        unit_price: 12500,
        subtotal: 1875000,
      },
    ],
    total: 1875000,
  },
  {
    id: 'ORD-015',
    client_id: '12',
    order_date: createOrderDate(10),
    delivery_date: createDeliveryDate(createOrderDate(10), 2),
    status: 'delivered',
    route_id: 'RT-013',
    items: [
      {
        id: 'ITEM-022',
        product_id: '19',
        product: mockProducts[18],
        quantity: 500,
        unit_price: 15000,
        subtotal: 7500000,
      },
    ],
    total: 7500000,
  },
  {
    id: 'ORD-016',
    client_id: '13',
    order_date: createOrderDate(2),
    delivery_date: createDeliveryDate(createOrderDate(2), 2),
    status: 'confirmed',
    route_id: 'RT-014',
    items: [
      {
        id: 'ITEM-023',
        product_id: '21',
        product: mockProducts[20],
        quantity: 180,
        unit_price: 6200,
        subtotal: 1116000,
      },
      {
        id: 'ITEM-024',
        product_id: '11',
        product: mockProducts[10],
        quantity: 90,
        unit_price: 9500,
        subtotal: 855000,
      },
    ],
    total: 1971000,
  },
  {
    id: 'ORD-017',
    client_id: '14',
    order_date: createOrderDate(6),
    delivery_date: createDeliveryDate(createOrderDate(6), 1),
    status: 'delivered',
    route_id: 'RT-015',
    items: [
      {
        id: 'ITEM-025',
        product_id: '24',
        product: mockProducts[23],
        quantity: 50,
        unit_price: 125000,
        subtotal: 6250000,
      },
    ],
    total: 6250000,
  },
  {
    id: 'ORD-018',
    client_id: '15',
    order_date: createOrderDate(1),
    delivery_date: createDeliveryDate(createOrderDate(1), 1),
    status: 'confirmed',
    route_id: 'RT-016',
    items: [
      {
        id: 'ITEM-026',
        product_id: '1',
        product: mockProducts[0],
        quantity: 600,
        unit_price: 2500,
        subtotal: 1500000,
      },
      {
        id: 'ITEM-027',
        product_id: '2',
        product: mockProducts[1],
        quantity: 400,
        unit_price: 3200,
        subtotal: 1280000,
      },
    ],
    total: 2780000,
  },
  {
    id: 'ORD-019',
    client_id: '1',
    order_date: createOrderDate(11),
    delivery_date: createDeliveryDate(createOrderDate(11), 2),
    status: 'delivered',
    route_id: 'RT-017',
    items: [
      {
        id: 'ITEM-028',
        product_id: '5',
        product: mockProducts[4],
        quantity: 250,
        unit_price: 6800,
        subtotal: 1700000,
      },
    ],
    total: 1700000,
  },
  {
    id: 'ORD-020',
    client_id: '3',
    order_date: createOrderDate(0),
    delivery_date: createDeliveryDate(createOrderDate(0), 1),
    status: 'pending',
    items: [
      {
        id: 'ITEM-029',
        product_id: '7',
        product: mockProducts[6],
        quantity: 120,
        unit_price: 15000,
        subtotal: 1800000,
      },
      {
        id: 'ITEM-030',
        product_id: '8',
        product: mockProducts[7],
        quantity: 300,
        unit_price: 3800,
        subtotal: 1140000,
      },
    ],
    total: 2940000,
  },
];
