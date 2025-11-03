/**
 * Clients Mock Handlers
 *
 * Custom Axios interceptor handlers for client endpoints.
 */

import type { AxiosRequestConfig } from 'axios';
import type { MockHandler, MockResponse } from './types';
import { mockClients } from '../clients';

/**
 * GET /bff/sellers-app/clients
 * List all clients with optional search filter
 */
const getClientsHandler: MockHandler = {
  method: 'GET',
  endpoint: '/bff/sellers-app/clients',
  description: 'List all clients with optional search filter',
  handler: async (config: AxiosRequestConfig): Promise<MockResponse> => {
    // Parse query parameters
    const params = config.params || {};
    const search = params.search?.toLowerCase() || '';

    // Filter clients by search term
    let filteredClients = mockClients;

    if (search) {
      filteredClients = mockClients.filter((client) => {
        return (
          client.name.toLowerCase().includes(search) ||
          client.institution_name.toLowerCase().includes(search) ||
          client.email.toLowerCase().includes(search) ||
          client.city.toLowerCase().includes(search)
        );
      });
    }

    // Map to API format (Spanish field names)
    const apiClients = filteredClients.map((client) => ({
      cliente_id: client.id,
      cognito_user_id: `user-${client.id}`,
      representante: client.name,
      nombre_institucion: client.institution_name,
      tipo_institucion: client.institution_type,
      nit: client.nit,
      direccion: client.address,
      ciudad: client.city,
      pais: client.country,
      telefono: client.phone,
      email: client.email,
      vendedor_asignado_id: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }));

    return {
      status: 200,
      data: {
        clients: apiClients,
        total: apiClients.length,
      },
    };
  },
};

/**
 * GET /bff/sellers-app/clients/:id
 * Get a single client by ID
 */
const getClientByIdHandler: MockHandler = {
  method: 'GET',
  endpoint: /\/bff\/sellers-app\/clients\/[^/]+$/,
  description: 'Get a single client by ID',
  handler: async (config: AxiosRequestConfig): Promise<MockResponse> => {
    // Extract client ID from URL
    const url = config.url || '';
    const clientId = url.split('/').pop();

    // Find client by ID
    const client = mockClients.find((c) => c.id === clientId);

    if (!client) {
      return {
        status: 404,
        data: {
          detail: 'Client not found',
          status: 404,
        },
      };
    }

    // Map to API format (Spanish field names)
    const apiClient = {
      cliente_id: client.id,
      cognito_user_id: `user-${client.id}`,
      representante: client.name,
      nombre_institucion: client.institution_name,
      tipo_institucion: client.institution_type,
      nit: client.nit,
      direccion: client.address,
      ciudad: client.city,
      pais: client.country,
      telefono: client.phone,
      email: client.email,
      vendedor_asignado_id: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    return {
      status: 200,
      data: apiClient,
    };
  },
};

/**
 * Export all client handlers
 */
export const clientHandlers: MockHandler[] = [
  getClientsHandler,
  getClientByIdHandler,
];
