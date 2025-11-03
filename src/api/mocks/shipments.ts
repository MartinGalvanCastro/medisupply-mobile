export type ShipmentStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export interface MockShipment {
  id: string;
  order_id: string;
  route_id: string;
  vehicle_plate: string;
  driver_name: string;
  status: ShipmentStatus;
  estimated_delivery: string;
  actual_delivery?: string;
}

const today = new Date();

const createEstimatedDelivery = (daysFromNow: number): string => {
  const date = new Date(today);
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
};

const createActualDelivery = (daysAgo: number): string => {
  const date = new Date(today);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

export const mockShipments: MockShipment[] = [
  {
    id: 'SHIP-001',
    order_id: 'ORD-001',
    route_id: 'RT-001',
    vehicle_plate: 'ABC-123',
    driver_name: 'Juan Pérez',
    status: 'completed',
    estimated_delivery: createEstimatedDelivery(-3),
    actual_delivery: createActualDelivery(3),
  },
  {
    id: 'SHIP-002',
    order_id: 'ORD-002',
    route_id: 'RT-002',
    vehicle_plate: 'DEF-456',
    driver_name: 'María González',
    status: 'in_progress',
    estimated_delivery: createEstimatedDelivery(0),
  },
  {
    id: 'SHIP-003',
    order_id: 'ORD-003',
    route_id: 'RT-003',
    vehicle_plate: 'GHI-789',
    driver_name: 'Carlos Ramírez',
    status: 'planned',
    estimated_delivery: createEstimatedDelivery(1),
  },
  {
    id: 'SHIP-004',
    order_id: 'ORD-004',
    route_id: 'RT-004',
    vehicle_plate: 'JKL-012',
    driver_name: 'Ana Martínez',
    status: 'completed',
    estimated_delivery: createEstimatedDelivery(-5),
    actual_delivery: createActualDelivery(5),
  },
  {
    id: 'SHIP-005',
    order_id: 'ORD-005',
    route_id: 'RT-005',
    vehicle_plate: 'MNO-345',
    driver_name: 'Luis Torres',
    status: 'in_progress',
    estimated_delivery: createEstimatedDelivery(0),
  },
  {
    id: 'SHIP-006',
    order_id: 'ORD-007',
    route_id: 'RT-006',
    vehicle_plate: 'PQR-678',
    driver_name: 'Patricia Silva',
    status: 'completed',
    estimated_delivery: createEstimatedDelivery(-6),
    actual_delivery: createActualDelivery(6),
  },
  {
    id: 'SHIP-007',
    order_id: 'ORD-008',
    route_id: 'RT-007',
    vehicle_plate: 'STU-901',
    driver_name: 'Roberto Díaz',
    status: 'completed',
    estimated_delivery: createEstimatedDelivery(-4),
    actual_delivery: createActualDelivery(4),
  },
  {
    id: 'SHIP-008',
    order_id: 'ORD-009',
    route_id: 'RT-008',
    vehicle_plate: 'VWX-234',
    driver_name: 'Sofía Castro',
    status: 'planned',
    estimated_delivery: createEstimatedDelivery(2),
  },
  {
    id: 'SHIP-009',
    order_id: 'ORD-011',
    route_id: 'RT-009',
    vehicle_plate: 'YZA-567',
    driver_name: 'Fernando López',
    status: 'completed',
    estimated_delivery: createEstimatedDelivery(-7),
    actual_delivery: createActualDelivery(7),
  },
  {
    id: 'SHIP-010',
    order_id: 'ORD-012',
    route_id: 'RT-010',
    vehicle_plate: 'BCD-890',
    driver_name: 'Valentina Ruiz',
    status: 'completed',
    estimated_delivery: createEstimatedDelivery(-3),
    actual_delivery: createActualDelivery(3),
  },
  {
    id: 'SHIP-011',
    order_id: 'ORD-013',
    route_id: 'RT-011',
    vehicle_plate: 'EFG-123',
    driver_name: 'Miguel Vargas',
    status: 'in_progress',
    estimated_delivery: createEstimatedDelivery(1),
  },
  {
    id: 'SHIP-012',
    order_id: 'ORD-014',
    route_id: 'RT-012',
    vehicle_plate: 'HIJ-456',
    driver_name: 'Isabella Morales',
    status: 'in_progress',
    estimated_delivery: createEstimatedDelivery(0),
  },
  {
    id: 'SHIP-013',
    order_id: 'ORD-015',
    route_id: 'RT-013',
    vehicle_plate: 'KLM-789',
    driver_name: 'Santiago Sánchez',
    status: 'completed',
    estimated_delivery: createEstimatedDelivery(-8),
    actual_delivery: createActualDelivery(8),
  },
  {
    id: 'SHIP-014',
    order_id: 'ORD-016',
    route_id: 'RT-014',
    vehicle_plate: 'NOP-012',
    driver_name: 'Carolina Mendoza',
    status: 'planned',
    estimated_delivery: createEstimatedDelivery(2),
  },
  {
    id: 'SHIP-015',
    order_id: 'ORD-017',
    route_id: 'RT-015',
    vehicle_plate: 'QRS-345',
    driver_name: 'Andrés Gómez',
    status: 'completed',
    estimated_delivery: createEstimatedDelivery(-4),
    actual_delivery: createActualDelivery(4),
  },
];
