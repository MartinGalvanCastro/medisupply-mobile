/**
 * Inventory Mock Handlers
 *
 * Custom Axios interceptor handlers for inventory endpoints.
 * Supports both sellers-app and client-app paths.
 */

import type { AxiosRequestConfig } from 'axios';
import type { MockHandler, MockResponse } from './types';
import { mockInventory } from '../inventory';

/**
 * GET /bff/sellers-app/inventories
 * List all inventory items with optional filters (sellers)
 */
const getSellersInventoriesHandler: MockHandler = {
  method: 'GET',
  endpoint: '/bff/sellers-app/inventories',
  description: 'List all inventory items with optional filters (sellers)',
  handler: async (config: AxiosRequestConfig): Promise<MockResponse> => {
    // Parse query parameters
    const params = config.params || {};
    const sku = params.sku?.toLowerCase() || '';
    const warehouseId = params.warehouse_id || '';
    const search = params.search?.toLowerCase() || '';

    // Filter inventory
    let filteredInventory = mockInventory;

    if (sku) {
      filteredInventory = filteredInventory.filter((item) => {
        return item.product.sku.toLowerCase().includes(sku);
      });
    }

    if (warehouseId) {
      filteredInventory = filteredInventory.filter((item) => {
        return item.warehouse_id === warehouseId;
      });
    }

    if (search) {
      filteredInventory = filteredInventory.filter((item) => {
        return (
          item.product.name.toLowerCase().includes(search) ||
          item.product.sku.toLowerCase().includes(search) ||
          item.warehouse_name.toLowerCase().includes(search) ||
          item.product.category.toLowerCase().includes(search)
        );
      });
    }

    return {
      status: 200,
      data: filteredInventory,
    };
  },
};

/**
 * GET /bff/client-app/inventories
 * List all inventory items with optional filters (clients)
 */
const getClientInventoriesHandler: MockHandler = {
  method: 'GET',
  endpoint: '/bff/client-app/inventories',
  description: 'List all inventory items with optional filters (clients)',
  handler: async (config: AxiosRequestConfig): Promise<MockResponse> => {
    // Parse query parameters
    const params = config.params || {};
    const sku = params.sku?.toLowerCase() || '';
    const warehouseId = params.warehouse_id || '';
    const search = params.search?.toLowerCase() || '';

    // Filter inventory (clients only see available items)
    let filteredInventory = mockInventory.filter((item) => item.available_quantity > 0);

    if (sku) {
      filteredInventory = filteredInventory.filter((item) => {
        return item.product.sku.toLowerCase().includes(sku);
      });
    }

    if (warehouseId) {
      filteredInventory = filteredInventory.filter((item) => {
        return item.warehouse_id === warehouseId;
      });
    }

    if (search) {
      filteredInventory = filteredInventory.filter((item) => {
        return (
          item.product.name.toLowerCase().includes(search) ||
          item.product.sku.toLowerCase().includes(search) ||
          item.warehouse_name.toLowerCase().includes(search) ||
          item.product.category.toLowerCase().includes(search)
        );
      });
    }

    return {
      status: 200,
      data: filteredInventory,
    };
  },
};

/**
 * Export all inventory handlers
 */
export const inventoryHandlers: MockHandler[] = [
  getSellersInventoriesHandler,
  getClientInventoriesHandler,
];
