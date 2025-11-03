/**
 * Visits Mock Handlers
 *
 * Custom Axios interceptor handlers for visit endpoints.
 */

import type { AxiosRequestConfig } from 'axios';
import type { MockHandler, MockResponse } from './types';
import { mockVisits, type MockVisit, type VisitStatus } from '../visits';
import { mockClients } from '../clients';

/**
 * GET /bff/sellers-app/visits
 * List all visits with optional filters
 */
const getVisitsHandler: MockHandler = {
  method: 'GET',
  endpoint: '/bff/sellers-app/visits',
  description: 'List all visits with optional filters',
  handler: async (config: AxiosRequestConfig): Promise<MockResponse> => {
    // Parse query parameters
    const params = config.params || {};
    const clientId = params.client_id || '';
    const status = params.status as VisitStatus | undefined;
    const dateFrom = params.date_from ? new Date(params.date_from) : null;
    const dateTo = params.date_to ? new Date(params.date_to) : null;

    // Filter visits
    let filteredVisits = [...mockVisits];

    if (clientId) {
      filteredVisits = filteredVisits.filter((visit) => {
        return visit.client_id === clientId;
      });
    }

    if (status) {
      filteredVisits = filteredVisits.filter((visit) => {
        return visit.status === status;
      });
    }

    if (dateFrom) {
      filteredVisits = filteredVisits.filter((visit) => {
        return new Date(visit.fecha_visita) >= dateFrom;
      });
    }

    if (dateTo) {
      filteredVisits = filteredVisits.filter((visit) => {
        return new Date(visit.fecha_visita) <= dateTo;
      });
    }

    // Sort by date (ascending - chronological)
    filteredVisits.sort((a, b) => {
      return new Date(a.fecha_visita).getTime() - new Date(b.fecha_visita).getTime();
    });

    // Transform to BFF response format
    const transformedVisits = filteredVisits.map((visit) => ({
      id: visit.id,
      seller_id: 'seller-1',
      client_id: visit.client_id,
      fecha_visita: visit.fecha_visita,
      status: visit.status,
      notas_visita: visit.notas_visita,
      recomendaciones: visit.recomendaciones || null,
      archivos_evidencia: visit.archivos_evidencia || [],
      client_representante: visit.client.name,
      client_nombre_institucion: visit.client.institution_name,
      client_direccion: visit.client.address,
      client_ciudad: visit.client.city,
      client_pais: visit.client.country,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    return {
      status: 200,
      data: {
        visits: transformedVisits,
        count: transformedVisits.length,
      },
    };
  },
};

/**
 * GET /bff/sellers-app/visits/:id
 * Get a single visit by ID
 */
const getVisitByIdHandler: MockHandler = {
  method: 'GET',
  endpoint: /\/bff\/sellers-app\/visits\/[^/]+$/,
  description: 'Get a single visit by ID',
  handler: async (config: AxiosRequestConfig): Promise<MockResponse> => {
    // Extract visit ID from URL
    const url = config.url || '';
    const segments = url.split('/');
    const visitId = segments[segments.length - 1];

    // Find visit by ID
    const visit = mockVisits.find((v) => v.id === visitId);

    if (!visit) {
      return {
        status: 404,
        data: {
          detail: 'Visit not found',
          status: 404,
        },
      };
    }

    // Transform to BFF response format
    const transformedVisit = {
      id: visit.id,
      seller_id: 'seller-1',
      client_id: visit.client_id,
      fecha_visita: visit.fecha_visita,
      status: visit.status,
      notas_visita: visit.notas_visita,
      recomendaciones: visit.recomendaciones || null,
      archivos_evidencia: visit.archivos_evidencia || [],
      client_representante: visit.client.name,
      client_nombre_institucion: visit.client.institution_name,
      client_direccion: visit.client.address,
      client_ciudad: visit.client.city,
      client_pais: visit.client.country,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return {
      status: 200,
      data: transformedVisit,
    };
  },
};

/**
 * POST /bff/sellers-app/visits
 * Create a new visit
 */
const createVisitHandler: MockHandler = {
  method: 'POST',
  endpoint: '/bff/sellers-app/visits',
  description: 'Create a new visit',
  handler: async (config: AxiosRequestConfig): Promise<MockResponse> => {
    // Parse request body
    const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {};

    // Validate required fields
    if (!body.client_id || !body.fecha_visita) {
      return {
        status: 422,
        data: {
          detail: 'Missing required fields: client_id, fecha_visita',
          status: 422,
        },
      };
    }

    // Validate client exists
    const client = mockClients.find((c) => c.id === body.client_id);
    if (!client) {
      return {
        status: 404,
        data: {
          detail: 'Client not found',
          status: 404,
        },
      };
    }

    // Validate date is not in the past or today
    const visitDate = new Date(body.fecha_visita);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (visitDate <= today) {
      return {
        status: 400,
        data: {
          detail: 'Visit date must be in the future',
          status: 400,
        },
      };
    }

    // Create new visit
    const newVisit: MockVisit = {
      id: `VIS-${String(mockVisits.length + 1).padStart(3, '0')}`,
      client_id: body.client_id,
      client: client,
      fecha_visita: body.fecha_visita,
      notas_visita: body.notas_visita || '',
      status: 'programada',
      location: client.address || 'N/A',
    };

    // Add to mock data (in-memory)
    mockVisits.push(newVisit);

    return {
      status: 201,
      data: newVisit,
    };
  },
};

/**
 * PATCH /bff/sellers-app/visits/:id/status
 * Update visit status
 */
const updateVisitStatusHandler: MockHandler = {
  method: 'PATCH',
  endpoint: /\/bff\/sellers-app\/visits\/[^/]+\/status$/,
  description: 'Update visit status',
  handler: async (config: AxiosRequestConfig): Promise<MockResponse> => {
    // Extract visit ID from URL
    const url = config.url || '';
    const segments = url.split('/');
    const visitId = segments[segments.length - 2];

    // Find visit by ID
    const visitIndex = mockVisits.findIndex((v) => v.id === visitId);

    if (visitIndex === -1) {
      return {
        status: 404,
        data: {
          detail: 'Visit not found',
          status: 404,
        },
      };
    }

    // Parse request body
    const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {};

    // Validate required fields
    if (!body.status) {
      return {
        status: 422,
        data: {
          detail: 'Missing required field: status',
          status: 422,
        },
      };
    }

    // Validate status value
    const validStatuses: VisitStatus[] = ['pending', 'programada', 'completed', 'completada', 'cancelled', 'cancelada'];
    if (!validStatuses.includes(body.status)) {
      return {
        status: 400,
        data: {
          detail: 'Invalid status value',
          status: 400,
        },
      };
    }

    // Update visit
    const updatedVisit = {
      ...mockVisits[visitIndex],
      status: body.status,
      notas_visita: body.notas_visita || mockVisits[visitIndex].notas_visita,
      recomendaciones: body.recomendaciones || mockVisits[visitIndex].recomendaciones,
    };

    mockVisits[visitIndex] = updatedVisit;

    return {
      status: 200,
      data: updatedVisit,
    };
  },
};

/**
 * Export all visit handlers
 */
export const visitHandlers: MockHandler[] = [
  getVisitsHandler,
  getVisitByIdHandler,
  createVisitHandler,
  updateVisitStatusHandler,
];
