import type { MockClient } from './clients';
import { mockClients } from './clients';

export type VisitStatus = 'pending' | 'programada' | 'completed' | 'completada' | 'cancelled' | 'cancelada';

export interface MockVisit {
  id: string;
  client_id: string;
  client: MockClient;
  fecha_visita: string;
  notas_visita: string;
  status: VisitStatus;
  location: string;
  recomendaciones?: string;
  archivos_evidencia?: string[];
}

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);

export const mockVisits: MockVisit[] = [
  {
    id: 'VIS-001',
    client_id: '1',
    client: mockClients[0],
    fecha_visita: new Date(today.setHours(9, 0, 0, 0)).toISOString(),
    notas_visita: 'Reunión inicial para revisión de inventario y pedidos del trimestre',
    status: 'pending',
    location: 'Calle 45 #23-10, Bogotá',
  },
  {
    id: 'VIS-002',
    client_id: '2',
    client: mockClients[1],
    fecha_visita: new Date(today.setHours(11, 30, 0, 0)).toISOString(),
    notas_visita: 'Presentación de nuevos productos y promociones',
    status: 'pending',
    location: 'Avenida 19 #102-35, Medellín',
  },
  {
    id: 'VIS-003',
    client_id: '3',
    client: mockClients[2],
    fecha_visita: new Date(today.setHours(14, 0, 0, 0)).toISOString(),
    notas_visita: 'Seguimiento de pedido anterior y resolución de dudas',
    status: 'pending',
    location: 'Carrera 7 #32-16, Bogotá',
  },
  {
    id: 'VIS-004',
    client_id: '4',
    client: mockClients[3],
    fecha_visita: new Date(yesterday.setHours(10, 0, 0, 0)).toISOString(),
    notas_visita: 'Visita completada. Cliente satisfecho con el servicio y realizó pedido de 50 unidades de Paracetamol.',
    status: 'completed',
    location: 'Calle 5 #36-08, Cali',
    recomendaciones: 'Mantener stock de analgésicos. Cliente interesado en productos de categoría Respiratorios.',
    archivos_evidencia: ['evidence_001.jpg', 'evidence_002.jpg'],
  },
  {
    id: 'VIS-005',
    client_id: '5',
    client: mockClients[4],
    fecha_visita: new Date(yesterday.setHours(15, 30, 0, 0)).toISOString(),
    notas_visita: 'Se realizó capacitación sobre nuevos productos cardiovasculares.',
    status: 'completed',
    location: 'Avenida 68 #75-23, Barranquilla',
    recomendaciones: 'Programar visita de seguimiento en 2 semanas. Cliente interesado en Atorvastatina y Losartán.',
  },
  {
    id: 'VIS-006',
    client_id: '6',
    client: mockClients[5],
    fecha_visita: new Date(tomorrow.setHours(9, 30, 0, 0)).toISOString(),
    notas_visita: 'Revisión de necesidades para el próximo mes',
    status: 'pending',
    location: 'Carrera 51B #79-160, Barranquilla',
  },
  {
    id: 'VIS-007',
    client_id: '7',
    client: mockClients[6],
    fecha_visita: new Date(tomorrow.setHours(13, 0, 0, 0)).toISOString(),
    notas_visita: 'Negociación de precios para compras al por mayor',
    status: 'pending',
    location: 'Calle 53 #48-64, Medellín',
  },
  {
    id: 'VIS-008',
    client_id: '8',
    client: mockClients[7],
    fecha_visita: new Date(yesterday.setHours(9, 0, 0, 0)).toISOString(),
    notas_visita: 'Cliente canceló la visita debido a emergencia interna.',
    status: 'cancelled',
    location: 'Carrera 42 #5-65, Cali',
  },
  {
    id: 'VIS-009',
    client_id: '9',
    client: mockClients[8],
    fecha_visita: new Date(today.setHours(16, 30, 0, 0)).toISOString(),
    notas_visita: 'Revisión de facturación y pedidos pendientes',
    status: 'pending',
    location: 'Avenida Jiménez #10-32, Bogotá',
  },
  {
    id: 'VIS-010',
    client_id: '10',
    client: mockClients[9],
    fecha_visita: new Date(nextWeek.setHours(10, 0, 0, 0)).toISOString(),
    notas_visita: 'Presentación de nuevos productos y servicios',
    status: 'pending',
    location: 'Calle 2 Sur #46-55, Medellín',
  },
  {
    id: 'VIS-011',
    client_id: '11',
    client: mockClients[10],
    fecha_visita: new Date(yesterday.setHours(11, 30, 0, 0)).toISOString(),
    notas_visita: 'Visita exitosa. Cliente realizó pedido importante de medicamentos gastrointestinales.',
    status: 'completed',
    location: 'Calle 26 #68D-35, Bogotá',
    recomendaciones: 'Cliente requiere entregas quincenales. Interesado en descuentos por volumen.',
    archivos_evidencia: ['evidence_003.jpg'],
  },
  {
    id: 'VIS-012',
    client_id: '12',
    client: mockClients[11],
    fecha_visita: new Date(nextWeek.setHours(14, 30, 0, 0)).toISOString(),
    notas_visita: 'Evaluación de necesidades para laboratorio',
    status: 'pending',
    location: 'Carrera 100 #11-60, Cali',
  },
  {
    id: 'VIS-013',
    client_id: '13',
    client: mockClients[12],
    fecha_visita: new Date(today.setHours(8, 30, 0, 0)).toISOString(),
    notas_visita: 'Primera visita a nuevo cliente',
    status: 'pending',
    location: 'Calle 64 #51D-154, Medellín',
  },
  {
    id: 'VIS-014',
    client_id: '14',
    client: mockClients[13],
    fecha_visita: new Date(yesterday.setHours(16, 0, 0, 0)).toISOString(),
    notas_visita: 'Seguimiento de servicios y atención al cliente.',
    status: 'completed',
    location: 'Calle 17 Norte #5N-12, Cali',
    recomendaciones: 'Excelente relación comercial. Mantener comunicación constante.',
  },
  {
    id: 'VIS-015',
    client_id: '15',
    client: mockClients[14],
    fecha_visita: new Date(tomorrow.setHours(15, 30, 0, 0)).toISOString(),
    notas_visita: 'Capacitación sobre productos hormonales',
    status: 'pending',
    location: 'Avenida Caracas #63-66, Bogotá',
  },
  {
    id: 'VIS-016',
    client_id: '1',
    client: mockClients[0],
    fecha_visita: new Date(nextWeek.setHours(11, 0, 0, 0)).toISOString(),
    notas_visita: 'Seguimiento trimestral - revisión de indicadores',
    status: 'pending',
    location: 'Calle 45 #23-10, Bogotá',
  },
  {
    id: 'VIS-017',
    client_id: '3',
    client: mockClients[2],
    fecha_visita: new Date(nextWeek.setHours(9, 30, 0, 0)).toISOString(),
    notas_visita: 'Negociación de contrato anual',
    status: 'pending',
    location: 'Carrera 7 #32-16, Bogotá',
  },
  {
    id: 'VIS-018',
    client_id: '5',
    client: mockClients[4],
    fecha_visita: new Date(yesterday.setHours(13, 0, 0, 0)).toISOString(),
    notas_visita: 'Cliente no disponible en el momento de la visita.',
    status: 'cancelled',
    location: 'Avenida 68 #75-23, Barranquilla',
  },
  {
    id: 'VIS-019',
    client_id: '7',
    client: mockClients[6],
    fecha_visita: new Date(nextWeek.setHours(16, 0, 0, 0)).toISOString(),
    notas_visita: 'Revisión de inventario y rotación de productos',
    status: 'pending',
    location: 'Calle 53 #48-64, Medellín',
  },
  {
    id: 'VIS-020',
    client_id: '9',
    client: mockClients[8],
    fecha_visita: new Date(yesterday.setHours(14, 30, 0, 0)).toISOString(),
    notas_visita: 'Entrega de muestras médicas y material promocional. Cliente muy receptivo.',
    status: 'completed',
    location: 'Avenida Jiménez #10-32, Bogotá',
    recomendaciones: 'Programar visita mensual. Cliente solicita información sobre nuevos lanzamientos.',
    archivos_evidencia: ['evidence_004.jpg', 'evidence_005.jpg', 'evidence_006.jpg'],
  },
];
